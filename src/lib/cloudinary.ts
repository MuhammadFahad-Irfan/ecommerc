import { v2 as cloudinary } from 'cloudinary';

console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file (base64 string or buffer) to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(
  fileData: string,
  folder = 'ecommerce/products'
): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_* env vars.');
  }

  console.log('Uploading to Cloudinary...', { folder }, fileData.substring(0, 30) + '...');
  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}

/**
 * Delete an image from Cloudinary using its public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Extract the public_id from a Cloudinary URL.
 */
export function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z]+$/i);
  return match ? match[1] : null;
}

export default cloudinary;
