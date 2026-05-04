import { NextResponse } from 'next/server';

/**
 * Custom API error class for consistent error handling
 */
export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string>;

  constructor(message: string, statusCode = 500, errors?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Standard JSON success response
 */
export function successResponse<T>(
  data: T,
  message = 'Success',
  status = 200
): NextResponse {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

/**
 * Standard JSON error response
 */
export function errorResponse(
  message: string,
  status = 500,
  errors?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { success: false, message, errors: errors || undefined },
    { status }
  );
}

/**
 * Centralized error handler for API routes.
 * Wrap any handler with this to get consistent error responses.
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.errors);
  }

  // Mongoose validation error
  if (error && typeof error === 'object' && 'name' in error) {
    const err = error as { name: string; errors?: Record<string, { message: string }>; code?: number; message?: string };

    if (err.name === 'ValidationError' && err.errors) {
      const errors: Record<string, string> = {};
      for (const key in err.errors) {
        errors[key] = err.errors[key].message;
      }
      return errorResponse('Validation failed', 400, errors);
    }

    if (err.name === 'CastError') {
      return errorResponse('Invalid ID format', 400);
    }

    // Duplicate key
    if (err.code === 11000) {
      return errorResponse('Duplicate entry detected', 409);
    }
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  return errorResponse(message, 500);
}

/**
 * Wrapper to automatically catch errors in async API handlers
 */
export function asyncHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
