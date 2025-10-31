"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRatingsProgram } from '../ratings/hooks/useRatingsProgram';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MessageSquare, Loader2, User } from 'lucide-react';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
}

interface TextReview {
  user: string;
  projectId: number;
  reviewText: string;
  timestamp: number;
}

export function ReviewsModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName 
}: ReviewsModalProps) {
  const { getTextReviews } = useRatingsProgram();
  const [reviews, setReviews] = useState<TextReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedReviews = await getTextReviews(projectId);
      setReviews(fetchedReviews);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load reviews: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [projectId, getTextReviews]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    } else {
      // Reset state when modal closes
      setReviews([]);
      setError('');
    }
  }, [isOpen, fetchReviews]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>Reviews for {projectName}</span>
          </DialogTitle>
          <DialogDescription>
            All text reviews submitted by users for this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Loading reviews...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No reviews yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to review this project!</p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 font-mono">
                        {truncateAddress(review.user)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {review.reviewText}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

