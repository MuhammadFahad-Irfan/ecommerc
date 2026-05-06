import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/lookup?orderNumber=ORD-XYZ
 * Public: customer can fetch their order details using the human-readable
 * order number printed on the receipt / confirmation page.
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const orderNumber = (searchParams.get('orderNumber') || '').trim();

  if (!orderNumber) {
    throw new ApiError('orderNumber is required', 400);
  }

  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  return successResponse(order);
});
