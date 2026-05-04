import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';
import { z } from 'zod';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/orders/[id]
 * Public: customer can fetch their order using the ID (kept simple
 * since there's no login). For real production, consider adding a
 * short-lived signed token in the success URL instead.
 */
export const GET = asyncHandler(async (_req: NextRequest, { params }: RouteParams) => {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid order ID', 400);
  }

  const order = await Order.findById(params.id).lean();
  if (!order) throw new ApiError('Order not found', 404);

  return successResponse(order);
});

const updateOrderSchema = z.object({
  orderStatus: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().optional(),
});

/**
 * PATCH /api/orders/[id] — admin only: update order status
 */
export const PATCH = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  requireAdmin(req);
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new ApiError('Invalid order ID', 400);
  }

  const body = await req.json();
  const result = updateOrderSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError('Invalid update data', 400);
  }

  const order = await Order.findByIdAndUpdate(params.id, result.data, {
    new: true,
  });

  if (!order) throw new ApiError('Order not found', 404);

  return successResponse(order, 'Order updated successfully');
});
