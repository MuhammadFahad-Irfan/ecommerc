import crypto from 'crypto';

/**
 * Easypaisa payment integration helper.
 *
 * Easypaisa offers two integration types:
 *   1. Hosted Checkout — redirect users to Easypaisa portal
 *   2. Direct API — direct mobile account / OTP based
 *
 * This implementation uses the Hosted Checkout approach.
 * If MOCK_PAYMENT=true (in .env), all calls work in mock mode for local testing.
 */

const MERCHANT_ID = process.env.EASYPAISA_MERCHANT_ID || '';
const STORE_ID = process.env.EASYPAISA_STORE_ID || '';
const HASH_KEY = process.env.EASYPAISA_HASH_KEY || '';
const EASYPAISA_URL =
  process.env.EASYPAISA_API_URL || 'https://easypaisa.com.pk/easypay/Index.jsf';
const RETURN_URL =
  process.env.EASYPAISA_RETURN_URL ||
  'http://localhost:3000/api/payment/easypaisa/callback';

export const IS_MOCK_PAYMENT = process.env.MOCK_PAYMENT === 'true';

export interface EasypaisaInitParams {
  orderId: string;
  amount: number;
  customerEmail?: string;
}

export interface EasypaisaInitResult {
  success: boolean;
  redirectUrl: string;
  transactionId: string;
}

/**
 * Generate Easypaisa secure hash.
 * Easypaisa uses HMAC-SHA256 to verify request integrity.
 */
function generateSecureHash(data: Record<string, string | number>): string {
  // Sort keys alphabetically as required by Easypaisa
  const sortedKeys = Object.keys(data).sort();
  const dataString = sortedKeys.map((key) => `${key}=${data[key]}`).join('&');

  return crypto
    .createHmac('sha256', HASH_KEY)
    .update(dataString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Initiate an Easypaisa payment session.
 * Returns a redirect URL that takes the user to the Easypaisa portal.
 */
export async function initiateEasypaisaPayment(
  params: EasypaisaInitParams
): Promise<EasypaisaInitResult> {
  const { orderId, amount, customerEmail } = params;

  // Generate a unique transaction reference
  const transactionId = `TXN-${orderId}-${Date.now()}`;

  // ----- MOCK MODE -----
  // When MOCK_PAYMENT=true we skip the real gateway and return our own mock URL.
  // This lets you fully test the payment flow without an Easypaisa account.
  if (IS_MOCK_PAYMENT) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/payment/mock?orderId=${orderId}&txnId=${transactionId}&amount=${amount}`;

    return {
      success: true,
      redirectUrl,
      transactionId,
    };
  }

  // ----- LIVE MODE -----
  // Build payload according to Easypaisa Hosted Checkout spec
  const payload = {
    storeId: STORE_ID,
    merchantId: MERCHANT_ID,
    orderRefNum: transactionId,
    transactionAmount: amount.toFixed(2),
    transactionType: 'InitialRequest',
    postBackURL: RETURN_URL,
    mobileAccountNo: '',
    emailAddress: customerEmail || '',
    expiryDate: getExpiryDate(),
  };

  const secureHash = generateSecureHash(payload);

  // Build the redirect URL with all query params
  const params_qs = new URLSearchParams({
    ...payload,
    merchantHashedReq: secureHash,
  }).toString();

  return {
    success: true,
    redirectUrl: `${EASYPAISA_URL}?${params_qs}`,
    transactionId,
  };
}

/**
 * Verify an Easypaisa payment callback.
 * Called when the gateway redirects user back to our site after payment.
 */
export interface EasypaisaCallbackData {
  orderId: string;
  transactionId: string;
  status: string;
  amount?: string;
  hash?: string;
}

export interface EasypaisaVerifyResult {
  success: boolean;
  status: 'paid' | 'failed' | 'pending';
  message: string;
}

export async function verifyEasypaisaPayment(
  data: EasypaisaCallbackData
): Promise<EasypaisaVerifyResult> {
  // Mock mode: just trust the status param
  if (IS_MOCK_PAYMENT) {
    if (data.status === 'success' || data.status === 'paid') {
      return { success: true, status: 'paid', message: 'Payment successful (mock)' };
    }
    return { success: false, status: 'failed', message: 'Payment failed (mock)' };
  }

  // Live mode: verify the hash
  if (data.hash) {
    const { hash, ...rest } = data;
    const expectedHash = generateSecureHash(rest as Record<string, string>);
    if (expectedHash !== hash) {
      return { success: false, status: 'failed', message: 'Hash verification failed' };
    }
  }

  // Easypaisa returns "0000" for successful transactions
  const isSuccess = data.status === '0000' || data.status === 'success';

  return {
    success: isSuccess,
    status: isSuccess ? 'paid' : 'failed',
    message: isSuccess ? 'Payment verified successfully' : 'Payment verification failed',
  };
}

/**
 * Generate ISO timestamp for tx expiry (1 hour ahead).
 */
function getExpiryDate(): string {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return date.toISOString().slice(0, 19);
}
