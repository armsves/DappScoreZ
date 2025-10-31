"use client";

import { useState } from 'react';
import { useRatingsProgram } from './hooks/useRatingsProgram';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { StarIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { WalletButton } from '../ui/WalletButton';
import { RatingButtons } from './RatingButtons';
import { ProjectRatingDisplay } from './ProjectRatingDisplay';

export function RatingsTestPage() {
  const {
    connected,
    publicKey,
    initializeProjectRating,
  } = useRatingsProgram();

  const [projectId, setProjectId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInitializeProject = async () => {
    if (!connected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Initializing project rating...');

    try {
      const tx = await initializeProjectRating(projectId);
      setStatus(`Project initialized! TX: ${tx}`);
      // Trigger refresh of displays
      setRefreshTrigger(prev => prev + 1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to initialize project: ${errorMessage}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = () => {
    setStatus('Rating submitted successfully!');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StarIcon className="w-6 h-6 text-yellow-500" />
            <span>Solana Ratings Program Test</span>
          </CardTitle>
          <CardDescription>
            Test the on-chain ratings functionality for projects. This page allows you to initialize projects, submit ratings, and view rating data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {connected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-700">
                    Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-700">Wallet not connected</span>
                </>
              )}
            </div>
            <WalletButton />
          </div>

          {/* Project ID Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">Project ID</label>
                  <input
                    type="number"
                    value={projectId}
                    onChange={(e) => setProjectId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project ID"
                    min="1"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={handleInitializeProject} 
                    disabled={loading || !connected}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Initialize Project
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Instructions:</strong></p>
                <ol className="list-decimal list-inside space-y-1 mt-1">
                  <li>Connect your wallet</li>
                  <li>Choose a project ID (any number)</li>
                  <li>Initialize the project (only needed once per project)</li>
                  <li>Submit ratings and view the data update in real-time</li>
                </ol>
              </div>
            </CardContent>
          </Card>
          {/* Status Messages */}
          {status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{status}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Main Test Interface */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Rating Submission */}
            <RatingButtons 
              projectId={projectId} 
              onRatingSubmitted={handleRatingSubmitted}
            />

            {/* Rating Display */}
            <ProjectRatingDisplay 
              projectId={projectId}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Usage Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Testing Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">🚀 Getting Started</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Make sure you&apos;re on Solana devnet</li>
                    <li>• Connect a wallet with some devnet SOL</li>
                    <li>• Start with project ID 1 for testing</li>
                    <li>• Initialize the project first</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⭐ Testing Ratings</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Submit different ratings (1-5 stars)</li>
                    <li>• Watch the average update in real-time</li>
                    <li>• Try submitting multiple ratings</li>
                    <li>• Test with different project IDs</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Each wallet can only submit one rating per project. 
                  Submitting a new rating will update your previous rating for that project.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
