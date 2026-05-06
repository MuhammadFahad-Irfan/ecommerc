import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyEasypaisaPayment } from '@/lib/easypaisa';
import { handleApiError } from '@/lib/apiHelpers';

/**
 * Easypaisa Callback Handler
 *
 * Easypaisa redirects users back here after payment. We:
 *   1. Verify the callback signature (in live mode)
 *   2. Update the order status
 *   3. Decrement stock if successful
 *   4. Redirect user to success/failure page
 *
 * Easypaisa sends data via either GET query params or POST body
 * depending on the integration mode, so we accept both.
 */

async function processCallback(req: NextRequest, params: Record<string, string>) {
  await dbConnect();
console.log("process.env.NEXT_PUBLIC_APP_URL ",process.env.NEXT_PUBLIC_APP_URL )
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
  // Map Easypaisa params (or our mock equivalents)
  const transactionId =
    params.orderRefNum || params.transactionId || params.txnId;
  const status = params.status || params.responseCode || params.transactionStatus;
  const amount = params.amount || params.transactionAmount;
  const hash = params.merchantHashedReq || params.hash;

  if (!transactionId) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=missing_txn`);
  }

  // Find the order by its stored transactionId
  const order = await Order.findOne({ transactionId });
  if (!order) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=order_not_found`);
  }

  // Verify with helper
  const verification = await verifyEasypaisaPayment({
    orderId: order.id,
    transactionId,
    status: status || '',
    amount,
    hash,
  });

  if (verification.success) {
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    await order.save();

    // Decrement stock now that payment is confirmed
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.redirect(`${baseUrl}/payment/success?orderId=${order.id}`);
  } else {
    order.paymentStatus = 'failed';
    await order.save();

    return NextResponse.redirect(
      `${baseUrl}/payment/failed?orderId=${order.id}&reason=${encodeURIComponent(verification.message)}`
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return await processCallback(req, params);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let params: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      params = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
    }

    return await processCallback(req, params);
  } catch (error) {
    return handleApiError(error);
  }
}
