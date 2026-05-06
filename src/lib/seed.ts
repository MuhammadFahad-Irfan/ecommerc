/**
 * Database seeding script.
 * Run with: npm run seed
 *
 * Populates the database with sample products for development.
 * Each product carries the metadata used by the guided-shopping engine
 * (productType, occasions, tags, suitableFor, ageGroup) so the
 * recommendation APIs and Shop-by-Goal page work out of the box.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product';

const MONGODB_URI = process.env.MONGODB_URI;

const placeholder = (seed: string, n = 1) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/800`);

/**
 * `_matches` is *not* a DB field — it's only used by the seeder to wire up
 * matchingItems by product name in a second pass (after IDs exist).
 */
interface SeedProduct {
  name: string;
  description: string;
  price: number;
  category: 'Child' | 'Women' | 'Islamic';
  productType?: 'abaya' | 'hijab' | 'cap' | 'frock' | 'set' | 'other';
  occasions?: Array<'daily' | 'wedding' | 'eid' | 'prayer' | 'school' | 'gift' | 'travel'>;
  tags?: string[];
  suitableFor?: Array<'women' | 'kids'>;
  ageGroup?: string[];
  stock: number;
  isFeatured: boolean;
  images: string[];
  _matches?: string[];
}

const sampleProducts: SeedProduct[] = [
  {
    name: 'Elegant Black Abaya with Embroidery',
    description:
      'A stunning black abaya featuring intricate embroidery work along the sleeves and front. Made from premium nidha fabric, this abaya offers a perfect blend of modesty and elegance. Suitable for everyday wear, special occasions, and prayer.',
    price: 4500,
    category: 'Islamic',
    productType: 'abaya',
    occasions: ['wedding', 'prayer', 'eid', 'daily'],
    tags: ['black', 'embroidered', 'premium'],
    suitableFor: ['women'],
    stock: 25,
    isFeatured: true,
    images: placeholder('abaya', 2),
    _matches: ['Plain Soft Hijab', 'Cotton Hijab Under-cap'],
  },
  {
    name: 'Premium Burkha with Hijab Set',
    description:
      'Complete burkha set including matching hijab. Light and breathable fabric perfect for daily wear. Features convenient front zipper and adjustable cuffs. Available in classic black with subtle stitching details.',
    price: 3800,
    category: 'Islamic',
    productType: 'set',
    occasions: ['daily', 'prayer'],
    tags: ['black', 'simple'],
    suitableFor: ['women'],
    stock: 40,
    isFeatured: true,
    images: placeholder('burkha'),
    _matches: ['Cotton Hijab Under-cap'],
  },
  {
    name: "Women's Embroidered Lawn Suit",
    description:
      "Beautiful 3-piece lawn suit with intricate embroidery. Includes shirt, trouser, and dupatta. Perfect for summer wear. Soft and comfortable fabric that's gentle on skin.",
    price: 3200,
    category: 'Women',
    productType: 'set',
    occasions: ['daily', 'eid'],
    tags: ['embroidered', 'pastel'],
    suitableFor: ['women'],
    stock: 30,
    isFeatured: true,
    images: placeholder('lawn-suit'),
  },
  {
    name: 'Designer Chiffon Party Wear',
    description:
      'Stunning chiffon dress perfect for weddings and formal events. Features delicate hand-work and elegant draping. Comes with matching dupatta and inner lining.',
    price: 8500,
    category: 'Women',
    productType: 'other',
    occasions: ['wedding'],
    tags: ['heavy', 'embroidered', 'premium'],
    suitableFor: ['women'],
    stock: 15,
    isFeatured: true,
    images: placeholder('chiffon-party'),
    _matches: ['Plain Soft Hijab'],
  },
  {
    name: 'Casual Cotton Kurti',
    description:
      'Comfortable everyday cotton kurti with side slits. Perfect for office, college, or casual outings. Easy to maintain and machine washable.',
    price: 1800,
    category: 'Women',
    productType: 'other',
    occasions: ['daily', 'travel'],
    tags: ['simple', 'lightweight'],
    suitableFor: ['women'],
    stock: 50,
    isFeatured: false,
    images: placeholder('cotton-kurti'),
  },
  {
    name: "Girls' Princess Frock",
    description:
      'Adorable princess-style frock for little girls. Features tulle skirt, satin bodice, and bow detail. Perfect for birthdays, parties, and special occasions. Available for ages 2-8 years.',
    price: 2500,
    category: 'Child',
    productType: 'frock',
    occasions: ['wedding', 'eid', 'gift'],
    tags: ['pastel', 'premium'],
    suitableFor: ['kids'],
    ageGroup: ['3-5', '6-10'],
    stock: 35,
    isFeatured: true,
    images: placeholder('princess-frock'),
  },
  {
    name: "Boys' Casual Outfit Set",
    description:
      "Stylish 2-piece outfit for boys including t-shirt and jeans. Comfortable cotton fabric. Perfect for school, playtime, and casual outings. Available in multiple sizes.",
    price: 1600,
    category: 'Child',
    productType: 'set',
    occasions: ['school', 'daily'],
    tags: ['simple', 'lightweight'],
    suitableFor: ['kids'],
    ageGroup: ['6-10'],
    stock: 45,
    isFeatured: false,
    images: placeholder('boys-outfit'),
  },
  {
    name: 'Kids Eid Special Dress',
    description:
      'Beautiful traditional dress for Eid celebrations. Features hand-embroidered details, comfortable fit, and matching accessories. Suitable for ages 3-10 years.',
    price: 3500,
    category: 'Child',
    productType: 'frock',
    occasions: ['eid', 'gift'],
    tags: ['embroidered', 'premium'],
    suitableFor: ['kids'],
    ageGroup: ['3-5', '6-10'],
    stock: 20,
    isFeatured: true,
    images: placeholder('kids-eid'),
  },
  {
    name: 'Modest Maxi Dress',
    description:
      'Elegant full-length maxi dress with long sleeves. Perfect for modest fashion enthusiasts. Made from soft, flowing fabric that drapes beautifully.',
    price: 4200,
    category: 'Women',
    productType: 'other',
    occasions: ['daily', 'prayer', 'travel'],
    tags: ['simple', 'lightweight'],
    suitableFor: ['women'],
    stock: 28,
    isFeatured: false,
    images: placeholder('maxi-dress'),
    _matches: ['Plain Soft Hijab', 'Cotton Hijab Under-cap'],
  },
  {
    name: 'Hijab Collection - Set of 5',
    description:
      'Premium quality hijab collection in 5 versatile colors. Made from breathable fabric. Includes matching pins. Perfect for daily wear and gifting.',
    price: 2800,
    category: 'Islamic',
    productType: 'hijab',
    occasions: ['daily', 'prayer', 'gift'],
    tags: ['pastel', 'premium'],
    suitableFor: ['women'],
    stock: 60,
    isFeatured: false,
    images: placeholder('hijab-set'),
  },
  {
    name: "Children's Modest Eid Suit",
    description:
      'Traditional modest outfit for boys. Includes shalwar kameez with intricate detailing. Perfect for Eid, weddings, and other formal events.',
    price: 2200,
    category: 'Child',
    productType: 'set',
    occasions: ['eid', 'prayer'],
    tags: ['embroidered'],
    suitableFor: ['kids'],
    ageGroup: ['6-10', '11-14'],
    stock: 30,
    isFeatured: false,
    images: placeholder('modest-eid-suit'),
  },
  {
    name: 'Premium Wedding Lehenga',
    description:
      'Stunning bridal lehenga with heavy embroidery, sequins, and zardozi work. Includes lehenga, choli, and dupatta. A timeless piece for your special day.',
    price: 25000,
    category: 'Women',
    productType: 'other',
    occasions: ['wedding'],
    tags: ['embroidered', 'heavy', 'premium'],
    suitableFor: ['women'],
    stock: 8,
    isFeatured: true,
    images: placeholder('wedding-lehenga', 2),
    _matches: ['Plain Soft Hijab', 'Hijab Collection - Set of 5'],
  },
  // Accessory anchors below — these power the budget bundler so anchor
  // items (abaya/frock/set) can be paired with a hijab + cap under budget.
  {
    name: 'Plain Soft Hijab',
    description:
      'Everyday lightweight hijab in soft, breathable fabric. Easy to drape and gentle on the skin. Available in classic black.',
    price: 800,
    category: 'Islamic',
    productType: 'hijab',
    occasions: ['daily', 'prayer'],
    tags: ['simple', 'lightweight', 'black'],
    suitableFor: ['women'],
    stock: 100,
    isFeatured: false,
    images: placeholder('plain-hijab'),
  },
  {
    name: 'Cotton Hijab Under-cap',
    description:
      'Comfortable cotton under-cap that keeps your hijab in place all day. Stretchy fit, breathable, and easy to wash.',
    price: 300,
    category: 'Islamic',
    productType: 'cap',
    occasions: ['daily', 'prayer'],
    tags: ['simple', 'lightweight'],
    suitableFor: ['women'],
    stock: 150,
    isFeatured: false,
    images: placeholder('hijab-cap'),
  },
];

const sampleReviews = [
  { name: 'Aisha K.', rating: 5, comment: 'Absolutely loved the quality! Fits perfectly and the fabric is very comfortable.' },
  { name: 'Sara M.', rating: 4, comment: 'Beautiful product, delivered on time. Highly recommend!' },
  { name: 'Fatima R.', rating: 5, comment: 'Excellent stitching and elegant design. Worth every rupee!' },
  { name: 'Hina A.', rating: 4, comment: 'Good quality. Color is exactly as shown in pictures.' },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('✅ Connected');

  console.log('🗑️  Clearing existing products...');
  await Product.deleteMany({});

  console.log('📦 Inserting sample products...');

  const idByName = new Map<string, mongoose.Types.ObjectId>();

  // Pass 1: insert every product without matchingItems.
  for (const { _matches, ...productData } of sampleProducts) {
    void _matches; // referenced in pass 2
    const product = new Product(productData);

    const reviewCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < reviewCount; i++) {
      const review = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
      product.reviews.push({
        ...review,
        ipAddress: '127.0.0.1',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    await product.save();
    idByName.set(product.name, product._id as mongoose.Types.ObjectId);
    console.log(`  ✓ ${product.name}`);
  }

  // Pass 2: resolve _matches names → ObjectIds and persist matchingItems.
  console.log('\n🔗 Linking matching items...');
  let linkCount = 0;
  for (const seed of sampleProducts) {
    if (!seed._matches?.length) continue;
    const ownId = idByName.get(seed.name);
    if (!ownId) continue;

    const matchingIds = seed._matches
      .map((name) => idByName.get(name))
      .filter((id): id is mongoose.Types.ObjectId => !!id);

    if (matchingIds.length === 0) continue;

    await Product.updateOne(
      { _id: ownId },
      { $set: { matchingItems: matchingIds } }
    );
    linkCount += matchingIds.length;
    console.log(
      `  ✓ ${seed.name} → ${seed._matches
        .filter((n) => idByName.has(n))
        .join(', ')}`
    );
  }

  console.log(
    `\n✅ Seeded ${sampleProducts.length} products and ${linkCount} cross-sell links.`
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
