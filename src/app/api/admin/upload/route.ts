import { NextRequest } from 'next/server';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { requireAdmin } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/admin/upload
 * Admin-only image upload to Cloudinary.
 * Accepts JSON: { image: "data:image/...;base64,..." }
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  requireAdmin(req);

  const body = await req.json();
  const { image } = body;

  if (!image || typeof image !== 'string') {
    throw new ApiError('Image data is required', 400);
  }

  if (!image.startsWith('data:image/')) {
    throw new ApiError('Invalid image format', 400);
  }

  // Basic size check (~5MB after base64 overhead)
  if (image.length > 7 * 1024 * 1024) {
    throw new ApiError('Image is too large. Max size is 5MB', 400);
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new ApiError(
      'Image upload is not configured. Please set Cloudinary env vars.',
      500
    );
  }

  const url = await uploadToCloudinary(image);
  return successResponse({ url }, 'Image uploaded successfully');
});
