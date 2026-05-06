import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { productSchema } from '@/lib/validators';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/products/[id] — public product detail
 */
export const GET = asyncHandler(async (_req: NextRequest, { params }: RouteParams) => {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid product ID', 400);
  }

  const product = await Product.findById(params.id)
    .select('-reviews.ipAddress')
    .lean();

  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  return successResponse(product);
});

/**
 * PUT /api/products/[id] — admin only: update product
 */
export const PUT = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  requireAdmin(req);
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid product ID', 400);
  }

  const body = await req.json();
  // Allow partial updates
  console.log('Received PUT /api/products/[id] with body:', body);
  const result = productSchema.partial().safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    throw new ApiError('Validation failed', 400, errors);
  }

  const product = await Product.findByIdAndUpdate(params.id, result.data, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  return successResponse(product, 'Product updated successfully');
});

/**
 * DELETE /api/products/[id] — admin only: delete product
 */
export const DELETE = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  requireAdmin(req);
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid product ID', 400);
  }

  const product = await Product.findByIdAndDelete(params.id);

  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  return successResponse(null, 'Product deleted successfully');
});
