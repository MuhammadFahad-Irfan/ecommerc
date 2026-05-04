'use client';

import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { apiPost } from '@/lib/api';
import StarRating from './StarRating';
import type { IReview } from '@/types';

interface ReviewFormProps {
  productId: string;
  onReviewAdded: (data: { review: IReview; averageRating: number; numReviews: number }) => void;
}

export default function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (comment.trim().length < 5) {
      toast.error('Review must be at least 5 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiPost<{
        review: IReview;
        averageRating: number;
        numReviews: number;
      }>(`/products/${productId}/reviews`, {
        name: name.trim(),
        comment: comment.trim(),
        rating,
      });

      toast.success('Thank you for your review!');
      onReviewAdded(response);
      setName('');
      setComment('');
      setRating(5);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div>
        <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          id="reviewer-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
          className="input-field"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="reviewer-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="reviewer-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          required
          className="input-field"
          placeholder="Share your experience with this product..."
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
