"use client";

import { useState, useEffect } from 'react';
import { useRatingsProgram } from '../ratings/hooks/useRatingsProgram';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Star } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  onRatingSubmitted?: () => void;
  userHasRated?: boolean;
  existingRating?: number;
}

export function RatingModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName, 
  onRatingSubmitted,
  userHasRated = false,
  existingRating = 0
}: RatingModalProps) {
  const { connected, submitRating } = useRatingsProgram();
  const [selectedRating, setSelectedRating] = useState<number>(existingRating || 0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Update selected rating when existingRating changes
  useEffect(() => {
    if (existingRating > 0) {
      setSelectedRating(existingRating);
    }
  }, [existingRating]);

  const handleSubmitRating = async () => {
    if (!connected) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (selectedRating === 0) {
      setMessage('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      console.log('🟢 [RatingModal] Submitting rating:', {
        projectId,
        selectedRating,
        reviewText: reviewText.trim() || undefined,
      });
      
      // Submit rating and optional review text together
      await submitRating(projectId, selectedRating, reviewText.trim() || undefined);
      
      console.log('🟢 [RatingModal] Submission successful!');
      setMessage(`Rating ${selectedRating}${reviewText.trim() ? ' and review' : ''} submitted successfully!`);
      onRatingSubmitted?.();
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        setMessage('');
        setSelectedRating(0); // Reset to no rating
        setReviewText(''); // Reset review text
      }, 2000);
    } catch (error: unknown) {
      console.error('🔴 [RatingModal] Error caught:', error);
      console.error('🔴 [RatingModal] Error type:', typeof error);
      console.error('🔴 [RatingModal] Error instanceof Error:', error instanceof Error);
      
      if (error instanceof Error) {
        console.error('🔴 [RatingModal] Error message:', error.message);
        console.error('🔴 [RatingModal] Error stack:', error.stack);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔴 [RatingModal] Final error message:', errorMessage);
      setMessage(`Failed to submit: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setMessage('');
    setSelectedRating(0); // Reset to no rating
    setReviewText(''); // Reset review text
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetModal();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{userHasRated ? 'Update Your Rating' : 'Rate Project'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              
            </Button>
          </DialogTitle>
          <DialogDescription>
            {userHasRated ? (
              <>Update your rating for <strong>{projectName}</strong>. Your current rating is {existingRating}★.</>
            ) : (
              <>Share your experience with <strong>{projectName}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating Selector */}
          <div className="space-y-3 text-center">
            <label className="text-sm font-medium">Select your rating:</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSelectedRating(rating)}
                  className="cursor-pointer hover:scale-110 transition-transform p-1"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 ${
                      selectedRating > 0 && rating <= selectedRating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text Review Input */}
          <div className="space-y-2">
            <Label htmlFor="review-text" className="text-sm font-medium">
              Write a Review (Optional)
            </Label>
            <Textarea
              id="review-text"
              placeholder="Share your thoughts about this project..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Maximum 500 characters</span>
              <span>{reviewText.length}/500</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmitRating}
            disabled={!connected || isSubmitting || selectedRating === 0}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : selectedRating > 0 ? (
              userHasRated 
                ? `Update Rating${reviewText.trim() ? ' & Review' : ''}`
                : `Submit Rating${reviewText.trim() ? ' & Review' : ''}`
            ) : (
              'Select a Rating'
            )}
          </Button>

          {/* Status Message */}
          {message && (
            <div className={`p-3 rounded-md text-sm text-center ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {!connected && (
            <p className="text-sm text-gray-500 text-center">
              Connect your wallet to submit ratings
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
