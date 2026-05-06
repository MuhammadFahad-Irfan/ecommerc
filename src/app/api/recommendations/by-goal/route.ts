import { NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { successResponse, asyncHandler, ApiError } from '@/lib/apiHelpers';
import { getByGoal } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

const byGoalSchema = z.object({
  goal: z.string().trim().min(1),
  answers: z
    .object({
      color: z.string().optional(),
      style: z.string().optional(),
      ageGroup: z.string().optional(),
      gender: z.string().optional(),
      durability: z.string().optional(),
    })
    .optional(),
  budget: z.number().positive().optional(),
});

/**
 * POST /api/recommendations/by-goal
 * Returns up to 6 curated outfit bundles for a shopping intent + answers.
 */
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const result = byGoalSchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((i) => {
      errors[i.path.join('.')] = i.message;
    });
    throw new ApiError('Invalid request', 400, errors);
  }

  const bundles = await getByGoal(result.data);
  return successResponse({ bundles, count: bundles.length });
});
