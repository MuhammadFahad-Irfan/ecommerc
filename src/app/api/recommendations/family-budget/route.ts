import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { getFamilyBudget } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

const familySchema = z.object({
  budget: z.number().positive(),
  members: z
    .array(
      z.object({
        type: z.enum(['mother', 'kid']),
        age: z.number().int().min(0).max(18).optional(),
      })
    )
    .min(1, 'At least one family member is required'),
});

/**
 * POST /api/recommendations/family-budget
 * Splits the budget across the family (mother 50%, kids share 50%) and
 * returns curated picks per member.
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const result = familySchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((i) => {
      errors[i.path.join('.')] = i.message;
    });
    throw new ApiError('Invalid request', 400, errors);
  }

  const recs = await getFamilyBudget(result.data.budget, result.data.members);
  return successResponse({ recommendations: recs });
});
