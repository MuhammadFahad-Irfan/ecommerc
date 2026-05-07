import { z } from 'zod';

export const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  comment: z.string().trim().min(5, 'Comment must be at least 5 characters').max(1000),
  rating: z.number().int().min(1).max(5),
});

const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{6,}/i;

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10),
  price: z.number().min(0),
  images: z.array(z.string().url()).optional().default([]),
  videoUrl: z
    .string()
    .trim()
    .regex(youtubeUrlPattern, 'Must be a YouTube URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  category: z.enum(['Child', 'Women', 'Islamic', 'Jewellery', 'Shoes', 'Bags']),
  productType: z
    .enum(['abaya', 'hijab', 'cap', 'frock', 'set', 'jewellery', 'shoes', 'bag', 'other'])
    .optional(),
  occasions: z
    .array(z.enum(['daily', 'wedding', 'eid', 'prayer', 'school', 'gift', 'travel']))
    .optional()
    .default([]),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  suitableFor: z.array(z.enum(['women', 'kids'])).optional().default([]),
  ageGroup: z.array(z.string().trim()).optional().default([]),
  matchingItems: z.array(z.string()).optional().default([]),
  stock: z.number().int().min(0),
  isFeatured: z.boolean().optional().default(false),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number'),
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  products: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'Order must have at least one product'),
  paymentMethod: z.enum(['easypaisa', 'cod']).default('easypaisa'),
  notes: z.string().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
