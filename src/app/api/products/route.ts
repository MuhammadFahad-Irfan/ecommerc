import { NextRequest } from 'next/server';
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
  if (search) filter.$text = { $search: search };
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

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews.ipAddress')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return successResponse({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
