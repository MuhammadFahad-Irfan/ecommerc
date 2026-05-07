/**
 * Recommendation engine for the guided shopping experience.
 *
 * Two pure functions, each returning curated results (≤6) based on:
 *  - getByGoal:        intent + contextual answers + optional budget
 *  - getBudgetBundles: bundles that fit a hard price ceiling
 *
 * Filters are applied softly when product metadata is missing — i.e. an
 * unclassified product is preferred over an empty result set, so the engine
 * still returns something useful before all admin data is filled in.
 */

import Product from '@/models/Product';
import type { IProductDocument, Occasion, SuitableFor } from '@/models/Product';
import type { FilterQuery } from 'mongoose';

const MAX_RESULTS = 6;

const GOAL_TO_OCCASIONS: Record<string, Occasion[]> = {
  'Everyday modest wear': ['daily'],
  'Wedding / special event': ['wedding'],
  'Prayer & religious gatherings': ['prayer'],
  'School / kids daily wear': ['school', 'daily'],
  'Gift for someone': ['gift', 'wedding', 'eid'],
  'Travel-friendly outfits': ['travel', 'daily'],
  'Eid shopping': ['eid'],
};

const GOAL_AUDIENCE: Record<string, SuitableFor[]> = {
  'School / kids daily wear': ['kids'],
  'Everyday modest wear': ['women'],
  'Prayer & religious gatherings': ['women', 'kids'],
  'Wedding / special event': ['women', 'kids'],
  'Eid shopping': ['women', 'kids'],
  'Gift for someone': ['women', 'kids'],
  'Travel-friendly outfits': ['women'],
};

export interface GoalAnswers {
  color?: string;
  style?: string;
  ageGroup?: string;
  gender?: string;
  durability?: string;
}

export interface ByGoalInput {
  goal: string;
  answers?: GoalAnswers;
  budget?: number;
}

export interface OutfitBundle {
  main: IProductDocument;
  matching: IProductDocument[];
  total: number;
}

/**
 * Build a Mongo filter from a goal + answers, with soft fallbacks so the
 * engine still returns results when products lack the new metadata.
 */
function buildGoalFilter(input: ByGoalInput): FilterQuery<IProductDocument> {
  const { goal, answers = {}, budget } = input;
  const filter: FilterQuery<IProductDocument> = {};

  const occasions = GOAL_TO_OCCASIONS[goal];
  if (occasions?.length) {
    filter.$or = [
      { occasions: { $in: occasions } },
      { occasions: { $size: 0 } }, // unclassified — keep visible
    ];
  }

  const audience = GOAL_AUDIENCE[goal];
  if (audience?.length) {
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { suitableFor: { $in: audience } },
          { suitableFor: { $size: 0 } },
        ],
      },
    ];
  }

  if (budget && budget > 0) filter.price = { $lte: budget };
  if (answers.ageGroup) filter.ageGroup = { $in: [answers.ageGroup] };

  // Style + color are matched as tags. Treat them as soft AND so a "black
  // embroidered" search beats a "black" or "embroidered" alone.
  const tagTerms = [answers.color, answers.style, answers.durability]
    .filter((v): v is string => !!v && v.toLowerCase() !== 'custom')
    .map((v) => v.toLowerCase());
  if (tagTerms.length) {
    filter.$and = [
      ...(filter.$and || []),
      ...tagTerms.map((tag) => ({
        $or: [{ tags: tag }, { tags: { $size: 0 } }],
      })),
    ];
  }

  return filter;
}

export async function getByGoal(input: ByGoalInput): Promise<OutfitBundle[]> {
  const filter = buildGoalFilter(input);
  const mains = await Product.find(filter)
    .select('-reviews.ipAddress')
    .sort({ isFeatured: -1, averageRating: -1, createdAt: -1 })
    .limit(MAX_RESULTS)
    .lean<IProductDocument[]>();

  if (mains.length === 0) return [];

  // Hydrate matchingItems (cross-sell) for each main product.
  const allMatchingIds = mains.flatMap((p) => p.matchingItems || []);
  const matchingDocs = allMatchingIds.length
    ? await Product.find({ _id: { $in: allMatchingIds } })
        .select('-reviews.ipAddress')
        .lean<IProductDocument[]>()
    : [];
  const matchingMap = new Map<string, IProductDocument>(
    matchingDocs.map((d) => [String(d._id), d])
  );

  return mains.map((main) => {
    const matching = (main.matchingItems || [])
      .map((id) => matchingMap.get(String(id)))
      .filter((d): d is IProductDocument => !!d);
    const total = main.price + matching.reduce((s, m) => s + m.price, 0);
    return { main, matching, total };
  });
}

export interface BudgetBundle {
  title: string;
  items: Array<{ type: string; product: IProductDocument; price: number }>;
  total: number;
}

/**
 * Assemble outfit bundles that respect a hard budget.
 * Picks an anchor item (abaya / frock / set / kids garment) and adds a hijab
 * and cap from what's left, while keeping the bundle under budget.
 */
export async function getBudgetBundles(budget: number): Promise<BudgetBundle[]> {
  if (!budget || budget <= 0) return [];

  // Anchor candidates: anything that's a "main outfit" and leaves room for
  // accessories. Reserve ~25% of the budget for hijab + cap.
  const anchorCeiling = budget * 0.8;
  const anchors = await Product.find({
    price: { $lte: anchorCeiling },
    productType: { $in: ['abaya', 'frock', 'set'] },
  })
    .select('-reviews.ipAddress')
    .sort({ price: -1, isFeatured: -1 })
    .limit(MAX_RESULTS)
    .lean<IProductDocument[]>();

  // Bulk-fetch candidate accessories once.
  const [hijabs, caps] = await Promise.all([
    Product.find({ productType: 'hijab', price: { $lte: budget } })
      .select('-reviews.ipAddress')
      .sort({ price: 1 })
      .lean<IProductDocument[]>(),
    Product.find({ productType: 'cap', price: { $lte: budget } })
      .select('-reviews.ipAddress')
      .sort({ price: 1 })
      .lean<IProductDocument[]>(),
  ]);

  const bundles: BudgetBundle[] = [];
  for (const anchor of anchors) {
    let remaining = budget - anchor.price;
    if (remaining < 0) continue;

    const items: BudgetBundle['items'] = [
      { type: anchor.productType || 'main', product: anchor, price: anchor.price },
    ];

    const hijab = hijabs.find((h) => h.price <= remaining);
    if (hijab) {
      items.push({ type: 'hijab', product: hijab, price: hijab.price });
      remaining -= hijab.price;
    }

    const cap = caps.find((c) => c.price <= remaining);
    if (cap) {
      items.push({ type: 'cap', product: cap, price: cap.price });
      remaining -= cap.price;
    }

    const total = items.reduce((s, i) => s + i.price, 0);
    bundles.push({
      title: `Full modest look under Rs ${budget.toLocaleString('en-PK')}`,
      items,
      total,
    });
  }

  return bundles.slice(0, 3);
}
