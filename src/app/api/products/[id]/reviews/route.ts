import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product, { IReviewDocument } from '@/models/Product';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { reviewSchema } from '@/lib/validators';
import { getClientIp } from '@/lib/utils';
import mongoose from 'mongoose';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/products/[id]/reviews — list all reviews for a product
 */
export const GET = asyncHandler(async (_req: NextRequest, { params }: RouteParams) => {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid product ID', 400);
  }

  const product = await Product.findById(params.id)
    .select('reviews averageRating numReviews -_id')
    .lean();

  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  // Sort reviews newest first
  const sortedReviews = [...product.reviews].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return successResponse({
    reviews: sortedReviews,
    averageRating: product.averageRating,
    numReviews: product.numReviews,
  });
});

/**
 * POST /api/products/[id]/reviews
 * Guest users can submit reviews. Spam protection:
 *   1. Same IP cannot review same product twice within 24 hours
 *   2. Same name cannot review same product twice within 1 hour
 *   3. Basic rate limiting on the input
 */
export const POST = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid product ID', 400);
  }

  const body = await req.json();
  const result = reviewSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    throw new ApiError('Validation failed', 400, errors);
  }

  const product = await Product.findById(params.id);
  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  const ipAddress = getClientIp(req);
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  // Spam protection — IP-based (24 hours)
  const ipDuplicate = product.reviews.find((r) => {
    const age = now - new Date(r.createdAt).getTime();
    return r.ipAddress === ipAddress && age < ONE_DAY;
  });
  if (ipDuplicate) {
    throw new ApiError(
      'You have already reviewed this product. Please try again later.',
      429
    );
  }

  // Spam protection — name-based (1 hour)
  const nameDuplicate = product.reviews.find((r) => {
    const age = now - new Date(r.createdAt).getTime();
    return (
      r.name.toLowerCase().trim() === result.data.name.toLowerCase().trim() &&
      age < ONE_HOUR
    );
  });
  if (nameDuplicate) {
    throw new ApiError(
      'A review with this name was just submitted. Please wait a moment.',
      429
    );
  }

  // Add review (Mongoose will run pre-save and recalc averageRating)
  product.reviews.push({
    name: result.data.name,
    comment: result.data.comment,
    rating: result.data.rating,
    ipAddress,
    createdAt: new Date(),
  });

  await product.save();

  // Return latest review without IP
  const lastReview = product.reviews[product.reviews.length - 1] as IReviewDocument &
    mongoose.Types.Subdocument;
  const latest = lastReview.toObject() as IReviewDocument;
  // eslint-disable-next-line no-unused-vars
  const { ipAddress: _ip, ...latestReview } = latest;

  return successResponse(
    {
      review: latestReview,
      averageRating: product.averageRating,
      numReviews: product.numReviews,
    },
    'Review added successfully',
    201
  );
});
