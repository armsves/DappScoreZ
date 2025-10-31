"use client";

import { useState } from 'react';
import { useRatingsProgram } from './hooks/useRatingsProgram';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Star } from 'lucide-react';

interface RatingButtonsProps {
  projectId: number;
  onRatingSubmitted?: () => void;
}

export function RatingButtons({ projectId, onRatingSubmitted }: RatingButtonsProps) {
  const { connected, submitRating } = useRatingsProgram();
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmitRating = async (rating: number) => {
    if (!connected) {
      setMessage('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const tx = await submitRating(projectId, rating);
      setMessage(`Rating ${rating} submitted successfully! TX: ${tx?.slice(0, 8)}...`);
      onRatingSubmitted?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Failed to submit rating: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Quick Rating Test</CardTitle>
        <CardDescription>
          Project ID: {projectId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Rating:</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setSelectedRating(rating)}
                className="cursor-pointer hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    rating <= selectedRating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Selected: {selectedRating} stars</p>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={() => handleSubmitRating(selectedRating)}
          disabled={!connected || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : `Submit ${selectedRating} Star Rating`}
        </Button>

        {/* Quick Rating Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Submit:</p>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                size="sm"
                variant="outline"
                onClick={() => handleSubmitRating(rating)}
                disabled={!connected || isSubmitting}
                className="flex-1"
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-md text-sm ${
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
      </CardContent>
    </Card>
  );
}
