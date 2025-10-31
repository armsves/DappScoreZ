"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRatingsProgram } from '../ratings/hooks/useRatingsProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { RatingModal } from './RatingModal';
import { Star, CheckCircle2 } from 'lucide-react';

interface ProjectRatingProps {
  projectId: number;
  projectName: string;
  className?: string;
  showStars?: boolean;
  showText?: boolean;
}

interface ProjectRating {
  projectId: number;
  totalRating: number;
  totalVotes: number;
  averageRating: number;
}

interface UserRating {
  user: string;
  projectId: number;
  rating: number;
  hasRated: boolean;
  timestamp: number;
}

export function ProjectRating({ 
  projectId, 
  projectName,
  className = "",
  showStars = true,
  showText = true 
}: ProjectRatingProps) {
  const { getProjectRating, getUserRating, publicKey } = useRatingsProgram();
  const { connected } = useWallet();
  const [rating, setRating] = useState<ProjectRating | null>(null);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRating = useCallback(async () => {
    setLoading(true);
    setError('');

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
        setError('');
        setRating(null);
      } else {
        setError('Failed to load rating');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, getProjectRating]);

  const fetchUserRating = useCallback(async () => {
    if (!publicKey || !connected) {
      setUserRating(null);
      return;
    }

    try {
      const userRatingData = await getUserRating(publicKey, projectId);
      setUserRating(userRatingData);
    } catch {
      // User hasn't rated yet - this is fine
      setUserRating(null);
    }
  }, [projectId, publicKey, connected, getUserRating]);

  useEffect(() => {
    fetchRating();
    fetchUserRating();
  }, [fetchRating, fetchUserRating]);

  const handleRatingSubmitted = () => {
    // Refresh rating data after submission
    fetchRating();
    fetchUserRating();
  };

  const handleClick = () => {
    // Only allow opening modal if wallet is connected
    if (!connected) {
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 cursor-pointer hover:opacity-80 transition-opacity ${className}`} onClick={handleClick}>
        {showStars && <Star className="w-4 h-4 animate-pulse" />}
        {showText && <span className="text-sm">...</span>}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-1 text-red-400 cursor-pointer hover:opacity-80 transition-opacity ${className}`} onClick={handleClick}>
        {showStars && <Star className="w-4 h-4" />}
        {showText && <span className="text-sm">Error</span>}
      </div>
    );
  }

  const hasUserRated = userRating?.hasRated ?? false;
  const userRatingValue = userRating?.rating ?? 0;

  if (!rating || rating.totalVotes === 0) {
    return (
      <>
        <div className={`flex items-center gap-1 ${hasUserRated ? 'text-green-500' : connected ? 'text-gray-400 cursor-pointer hover:opacity-80 transition-opacity' : 'text-gray-400'} ${className}`} onClick={handleClick}>
          {showStars && (
            <div className="flex items-center gap-1">
              {hasUserRated && <CheckCircle2 className="w-3 h-3" />}
              <Star className="w-4 h-4" />
            </div>
          )}
          {showText && (
            <span className="text-sm">
              {hasUserRated ? `You rated ${userRatingValue}★` : 'No ratings yet'}
            </span>
          )}
        </div>
        {connected && (
          <RatingModal
            projectId={projectId}
            projectName={projectName}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onRatingSubmitted={handleRatingSubmitted}
            userHasRated={hasUserRated}
            existingRating={userRatingValue}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-1 ${hasUserRated ? 'text-green-500' : 'text-yellow-500'} ${connected && !hasUserRated ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`} onClick={handleClick}>
        {showStars && (
          <div className="flex items-center gap-1">
            {hasUserRated && <CheckCircle2 className="w-3 h-3" />}
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}
        {showText && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              {rating.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({rating.totalVotes})
            </span>
            {hasUserRated && (
              <span className="text-xs text-green-600 ml-1">
                • You: {userRatingValue}★
              </span>
            )}
          </div>
        )}
      </div>
      {connected && (
        <RatingModal
          projectId={projectId}
          projectName={projectName}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRatingSubmitted={handleRatingSubmitted}
          userHasRated={hasUserRated}
          existingRating={userRatingValue}
        />
      )}
    </>
  );
}
