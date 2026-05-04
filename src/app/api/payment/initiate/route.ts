import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { initiateEasypaisaPayment } from '@/lib/easypaisa';
import mongoose from 'mongoose';
import { z } from 'zod';

const initiateSchema = z.object({
  orderId: z.string().min(1),
});

/**
 * POST /api/payment/initiate
 * Initiates payment for an existing order and returns the gateway redirect URL.
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const body = await req.json();
  const result = initiateSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError('Order ID is required', 400);
  }

  const { orderId } = result.data;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError('Invalid order ID', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError('Order is already paid', 400);
  }

  if (order.paymentMethod === 'cod') {
    // For COD, no gateway call is needed — order stays in pending payment status
    return successResponse({
      paymentMethod: 'cod',
      orderId: order.id,
      message: 'Order placed. Payment will be collected on delivery.',
    });
  }

  // Initiate Easypaisa session
  const paymentResult = await initiateEasypaisaPayment({
    orderId: order.id,
    amount: order.totalAmount,
    customerEmail: order.email,
  });

  // Save the transaction ID to the order for later verification
  order.transactionId = paymentResult.transactionId;
  await order.save();

  return successResponse({
    redirectUrl: paymentResult.redirectUrl,
    transactionId: paymentResult.transactionId,
    orderId: order.id,
  });
});
