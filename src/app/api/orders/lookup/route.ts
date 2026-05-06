import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/lookup?orderNumber=ORD-XYZ&phone=...
 * Public: customer fetches their order using the order number plus the phone
 * number they checked out with. Phone is required as a second factor to keep
 * order numbers (which are short and human-readable) from being enumerable.
 *
 * Both "wrong order number" and "wrong phone" return the same 404 so the
 * response can't be used to confirm whether an order number exists.
 */
const normalizePhone = (p: string) => p.replace(/\D/g, '');

export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const orderNumber = (searchParams.get('orderNumber') || '').trim();
  const phone = (searchParams.get('phone') || '').trim();

  if (!orderNumber || !phone) {
    throw new ApiError('orderNumber and phone are required', 400);
  }

  const order = await Order.findOne({ orderNumber }).lean();
  if (!order || normalizePhone(order.phone) !== normalizePhone(phone)) {
    throw new ApiError('Order not found', 404);
  }

  return successResponse(order);
});
