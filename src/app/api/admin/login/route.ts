import { NextRequest, NextResponse } from 'next/server';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { adminLoginSchema } from '@/lib/validators';
import { generateAdminToken, validateAdminCredentials } from '@/lib/auth';

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const result = adminLoginSchema.safeParse(body);

  if (!result.success) {
    throw new ApiError('Invalid email or password', 400);
  }

  console.log('Admin login attempt:', result.data.email);
  const { email, password } = result.data;

  if (!validateAdminCredentials(email, password)) {
    throw new ApiError('Invalid credentials', 401);
  }

  const token = generateAdminToken(email);

  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
    data: { email, token },
  });

  // Set HTTP-only cookie for browser; token is also returned for mobile clients
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
});
