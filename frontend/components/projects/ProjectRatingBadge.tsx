"use client";

import { useState, useEffect } from 'react';
import { useRatingsProgram } from '../ratings/hooks/useRatingsProgram';

interface ProjectRatingBadgeProps {
  projectId: number;
  className?: string;
}

interface ProjectRating {
  projectId: number;
  totalRating: number;
  totalVotes: number;
  averageRating: number;
  reviewCount?: number;
}

export function ProjectRatingBadge({ projectId, className = "" }: ProjectRatingBadgeProps) {
  const { getProjectRating } = useRatingsProgram();
  const [rating, setRating] = useState<ProjectRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);

      try {
        const data = await getProjectRating(projectId);
        setRating(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        // Check if it's an account not found error (project not initialized)
        if (errorMessage.includes('Account does not exist') || 
            errorMessage.includes('Invalid account discriminator') ||
            errorMessage.includes('AccountNotFound')) {
          // Not an error - just no ratings yet
          setRating(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [projectId, getProjectRating]);

  // Determine color based on rating
  const getColor = (averageRating: number) => {
    if (averageRating >= 4.5) return "#00C853" // Excellent - Green
    if (averageRating >= 3.5) return "#FFC107" // Good - Yellow/Amber
    if (averageRating >= 2.5) return "#FF9800" // Fair - Orange
    if (averageRating >= 1.5) return "#FF5722" // Poor - Deep Orange
    return "#F44336" // Very Poor - Red
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  if (!rating || rating.totalVotes === 0) {
    return (
      <div className={`flex items-center gap-1 text-white ${className}`}>
        <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          {/* Shield outline in gray for no rating */}
          <path d="M32 2 L60 14 V32 C60 46 48 58 32 62 C16 58 4 46 4 32 V14 Z" 
                fill="#9CA3AF" 
                stroke="rgba(255,255,255,0.3)" 
                strokeWidth="1"/>
          
          {/* Question mark for no rating */}
          <text x="32" y="40" textAnchor="middle" 
                fill="white" fontSize="20" fontFamily="Arial, sans-serif" fontWeight="bold">
            ?
          </text>
        </svg>
        <span className="text-xs font-medium text-gray-500">No Rating</span>
      </div>
    );
  }

  const color = getColor(rating.averageRating);
  const displayRating = Math.round(rating.averageRating * 10) / 10; // Round to 1 decimal

  return (
    <div className={`flex items-center gap-1 text-white ${className}`}>
      <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        {/* Shield outline with rating-based color */}
        <path d="M32 2 L60 14 V32 C60 46 48 58 32 62 C16 58 4 46 4 32 V14 Z" 
              fill={color} 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="1"/>
        
        {/* Star in center */}
        <path d="M32 12 L35 25 L48 25 L38 33 L41 46 L32 38 L23 46 L26 33 L16 25 L29 25 Z" 
              fill="white" 
              opacity="0.9"/>
      </svg>
      <div className="flex flex-col">
        <span className="text-xs font-bold leading-none">{displayRating}</span>
        <span className="text-xs leading-none opacity-75">({rating.totalVotes})</span>
      </div>
    </div>
  );
}
