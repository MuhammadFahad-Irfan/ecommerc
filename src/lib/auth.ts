import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { ApiError } from './apiHelpers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface AdminTokenPayload {
  email: string;
  role: 'admin';
}

/**
 * Generate JWT token for admin
 */
export function generateAdminToken(email: string): string {
  return jwt.sign({ email, role: 'admin' }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Verify JWT token
 */
export function verifyAdminToken(token: string): AdminTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    throw new ApiError('Invalid or expired token', 401);
  }
}

/**
 * Extract admin from request (cookie or Authorization header)
 */
export function requireAdmin(req: NextRequest): AdminTokenPayload {
  // Check cookie first
  const cookieToken = req.cookies.get('admin_token')?.value;

  // Fallback to Authorization header (useful for mobile app later)
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = cookieToken || headerToken;

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  return verifyAdminToken(token);
}

/**
 * Validate admin credentials against environment variables
 */
export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment');
    return false;
  }

  return email === adminEmail && password === adminPassword;
}
