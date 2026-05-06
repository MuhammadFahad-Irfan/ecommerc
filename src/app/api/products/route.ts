import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { productSchema } from '@/lib/validators';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Public endpoint with filtering, search, sort, and pagination.
 *
 * Query params:
 *   - search: full-text search on name/description
 *   - category: filter by category
 *   - minPrice, maxPrice: price range
 *   - minRating: minimum average rating
 *   - sort: newest | price-asc | price-desc | rating | featured
 *   - page, limit: pagination
 *   - featured: 'true' to fetch only featured products
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  console.log('Received GET /api/products with params:', searchParams.toString());
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');
  const minRating = parseFloat(searchParams.get('minRating') || '0');
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') === 'true';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

  // Build filter
  const filter: Record<string, unknown> = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = { $regex: escaped, $options: 'i' };
    const orClauses: Record<string, unknown>[] = [
      { name: rx },
      { description: rx },
      { category: rx },
      { slug: rx },
      { 'reviews.name': rx },
      { 'reviews.comment': rx },
    ];
    const asNumber = Number(search);
    if (!Number.isNaN(asNumber) && search.trim() !== '') {
      orClauses.push({ price: asNumber });
      orClauses.push({ stock: asNumber });
      orClauses.push({ averageRating: asNumber });
    }
    filter.$or = orClauses;
  }
  if (category) filter.category = category;
  if (featured) filter.isFeatured = true;
  if (minPrice > 0 || maxPrice > 0) {
    const priceFilter: Record<string, number> = {};
    if (minPrice > 0) priceFilter.$gte = minPrice;
    if (maxPrice > 0) priceFilter.$lte = maxPrice;
    filter.price = priceFilter;
  }
  if (minRating > 0) filter.averageRating = { $gte: minRating };

  // Build sort
  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case 'price-asc':
      sortOption = { price: 1 };
      break;
    case 'price-desc':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { averageRating: -1, numReviews: -1 };
      break;
    case 'featured':
      sortOption = { isFeatured: -1, createdAt: -1 };
      break;
  }

  const skip = (page - 1) * limit;

  console.log('Constructed filter:', filter);
  const [
    products,
    total,
    totalAll,
    totalFeatured,
    totalInStock,
    totalOutOfStock,
    byCategoryRaw,
  ] = await Promise.all([
    Product.find(filter)
      .select('-reviews.ipAddress')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
    Product.countDocuments({}),
    Product.countDocuments({ isFeatured: true }),
    Product.countDocuments({ stock: { $gt: 0 } }),
    Product.countDocuments({ stock: 0 }),
    Product.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const byCategory = byCategoryRaw.reduce<Record<string, number>>((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return successResponse({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    counts: {
      total: totalAll,
      featured: totalFeatured,
      inStock: totalInStock,
      outOfStock: totalOutOfStock,
      byCategory,
    },
  });
});

/**
 * POST /api/products
 * Admin-only: create a new product
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  requireAdmin(req);
  await dbConnect();

  const body = await req.json();
  console.log('Received POST /api/products with body:', body);
  const result = productSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    throw new ApiError('Validation failed', 400, errors);
  }

  const product = await Product.create(result.data);
  return successResponse(product, 'Product created successfully', 201);
});

/**
 * DELETE /api/products
 * Admin-only: delete multiple products by ID, processing each one at a time.
 * Body: { ids: string[] }
 * Returns a per-ID result so the caller can see which deletions succeeded.
 */
export const DELETE = asyncHandler(async (req: NextRequest) => {
  requireAdmin(req);
  await dbConnect();

  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError('Provide a non-empty "ids" array', 400);
  }
  if (ids.length > 100) {
    throw new ApiError('Cannot delete more than 100 products in one request', 400);
  }

  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  for (const raw of ids) {
    const id = String(raw);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      results.push({ id, success: false, error: 'Invalid ID' });
      continue;
    }

    const deleted = await Product.findByIdAndDelete(id);
    results.push(
      deleted
        ? { id, success: true }
        : { id, success: false, error: 'Not found' }
    );
  }

  const deletedCount = results.filter((r) => r.success).length;

  return successResponse(
    { deletedCount, results },
    `Deleted ${deletedCount} of ${ids.length} product(s)`
  );
});
