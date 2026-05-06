import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { getBudgetBundles } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

const budgetSchema = z.object({
  budget: z.number().positive(),
});

/**
 * POST /api/recommendations/budget
 * Returns assembled outfit bundles that fit under a hard budget ceiling.
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const result = budgetSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError('budget (number > 0) is required', 400);
  }

  const bundles = await getBudgetBundles(result.data.budget);
  return successResponse({ bundles, count: bundles.length });
});
