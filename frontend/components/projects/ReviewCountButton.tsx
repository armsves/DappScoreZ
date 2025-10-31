"use client";

import { useState, useEffect } from 'react';
import { useRatingsProgram } from '../ratings/hooks/useRatingsProgram';
import { Button } from '../ui/button';
import { MessageSquare } from 'lucide-react';

interface ReviewCountButtonProps {
  projectId: number;
  projectName: string;
  onClick: () => void;
}

export function ReviewCountButton({ projectId, onClick }: ReviewCountButtonProps) {
  const { getProjectRating } = useRatingsProgram();
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewCount = async () => {
      setLoading(true);
      try {
        const data = await getProjectRating(projectId);
        setReviewCount(data.reviewCount || 0);
      } catch {
        // If account doesn't exist, review count is 0
        setReviewCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewCount();
  }, [projectId, getProjectRating]);

  if (loading) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-gray-400 hover:text-gray-600"
        disabled
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        <span className="text-xs">...</span>
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      title="View reviews"
    >
      <MessageSquare className="w-4 h-4 mr-1" />
      <span className="text-xs font-medium">{reviewCount}</span>
    </Button>
  );
}

