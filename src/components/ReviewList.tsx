'use client';

import { formatDate } from '@/lib/utils';
import StarRating from './StarRating';
import type { IReview } from '@/types';

interface ReviewListProps {
  reviews: IReview[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, idx) => (
        <div
          key={review._id || idx}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
            <div>
              <p className="font-semibold text-gray-900">{review.name}</p>
              <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
