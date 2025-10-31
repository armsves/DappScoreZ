"use client";

import { useState, useEffect } from 'react';
import { useRatingsProgram } from './hooks/useRatingsProgram';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Star, RefreshCw } from 'lucide-react';

interface ProjectRatingDisplayProps {
  projectId: number;
  refreshTrigger?: number;
}

interface ProjectRating {
  projectId: number;
  totalRating: number;
  totalVotes: number;
  averageRating: number;
}

export function ProjectRatingDisplay({ projectId, refreshTrigger = 0 }: ProjectRatingDisplayProps) {
  const { getProjectRating } = useRatingsProgram();
  const [rating, setRating] = useState<ProjectRating | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchRating = async () => {
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
          setError('Project not initialized yet. Please initialize the project first.');
        } else {
          setError(`Failed to fetch rating: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [projectId, refreshTrigger, getProjectRating]);

  const handleRefresh = async () => {
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
        setError('Project not initialized yet. Please initialize the project first.');
      } else {
        setError(`Failed to fetch rating: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const StarDisplay = ({ rating, total = 5 }: { rating: number; total?: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: total }, (_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(2)} / {total}
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Project Rating</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-500">
          Project ID: {projectId}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading rating data...</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && rating && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Average Rating:</label>
              <StarDisplay rating={rating.averageRating} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-700">Total Votes:</label>
                <p className="text-lg font-semibold text-blue-600">{rating.totalVotes}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Total Points:</label>
                <p className="text-lg font-semibold text-green-600">{rating.totalRating}</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t pt-2">
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {!loading && !error && !rating && (
          <div className="text-center py-4">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No rating data found</p>
            <p className="text-xs text-gray-400">Project may not be initialized yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
