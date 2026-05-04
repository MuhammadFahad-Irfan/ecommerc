'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 'md',
  showValue = false,
  reviewCount,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((star) => {
          const filled = star <= Math.round(rating);
          const StarComponent = (
            <Star
              key={star}
              className={`${sizeClasses[size]} ${
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              } ${interactive ? 'cursor-pointer hover:scale-110 transition' : ''}`}
            />
          );

          if (interactive && onChange) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                aria-label={`Rate ${star} stars`}
              >
                {StarComponent}
              </button>
            );
          }
          return StarComponent;
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
