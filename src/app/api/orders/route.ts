import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { orderSchema } from '@/lib/validators';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders — admin only: list all orders with pagination/filtering
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  requireAdmin(req);
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const orderStatus = searchParams.get('orderStatus');
  const paymentStatus = searchParams.get('paymentStatus');

  const filter: Record<string, unknown> = {};
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return successResponse({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/orders
 * Public: place an order without login.
 *
 * Workflow:
 *   1. Validate input
 *   2. Verify each product exists & has enough stock
 *   3. Recalculate total on server (never trust client price)
 *   4. Create the order with paymentStatus=pending
 *   5. Return the order — frontend then calls /api/payment/initiate
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const body = await req.json();
  console.log('Received order:', body);
  const result = orderSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    throw new ApiError('Validation failed', 400, errors);
  }

  const { products: orderProducts, ...orderData } = result.data;

  // Validate IDs
  for (const item of orderProducts) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new ApiError(`Invalid product ID: ${item.productId}`, 400);
    }
  }

  // Fetch all products at once
  const productIds = orderProducts.map((p) => p.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  if (dbProducts.length !== orderProducts.length) {
    throw new ApiError('One or more products were not found', 400);
  }

  // Build order line items with server-side prices
  const orderLineItems = orderProducts.map((item) => {
    const product = dbProducts.find((p) => p.id === item.productId);
    if (!product) throw new ApiError(`Product not found: ${item.productId}`, 400);

    if (product.stock < item.quantity) {
      throw new ApiError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        400
      );
    }
    console.log('Product found:', product);
    //update product stock
    product.stock -= item.quantity;
     product.save();

    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      // image: product.images[0],
    }
  });

  const totalAmount = orderLineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Create order — note: stock is decremented on payment success, not here.
  // This avoids stock loss on abandoned orders.
  const order = await Order.create({
    ...orderData,
    products: orderLineItems,
    totalAmount,
    paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: 'pending',
  });

  return successResponse(order, 'Order created successfully', 201);
});
