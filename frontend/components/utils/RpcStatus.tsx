"use client";

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

export function RpcStatus() {
  const { connection } = useConnection();
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [endpoint, setEndpoint] = useState<string>('');

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    setError('');
    
    try {
      const startTime = Date.now();
      
      // Get the RPC endpoint
      const rpcEndpoint = connection.rpcEndpoint || 'Unknown';
      setEndpoint(rpcEndpoint);
      
      // Test connection with a simple call
      await connection.getLatestBlockhash();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      setLatency(responseTime);
      setStatus('connected');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      setLatency(null);
    }
  }, [connection]);

  useEffect(() => {
    checkConnection();
  }, [connection, checkConnection]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-600" />;
      case 'error': return <WifiOff className="w-5 h-5 text-red-600" />;
      case 'checking': return <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const isRateLimited = error.includes('429') || error.includes('Too many requests');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>RPC Connection Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status:</span>
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {status === 'checking' ? 'Checking...' : 
               status === 'connected' ? 'Connected' : 'Error'}
            </span>
          </div>
          
          {latency && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Latency:</span>
              <span className={`text-sm ${latency > 2000 ? 'text-red-600' : latency > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                {latency}ms
              </span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 break-all">
            <strong>Endpoint:</strong> {endpoint}
          </div>
        </div>

        {error && (
          <div className={`p-3 rounded-md text-sm ${
            isRateLimited 
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {isRateLimited && (
              <div className="flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <strong>Rate Limited!</strong>
              </div>
            )}
            <div className="break-words">{error}</div>
            {isRateLimited && (
              <div className="mt-2 text-xs">
                Try using a different RPC endpoint or wait a moment before retrying.
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={checkConnection}
            disabled={status === 'checking'}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${status === 'checking' ? 'animate-spin' : ''}`} />
            Recheck
          </Button>
        </div>

        {status === 'error' && (
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Troubleshooting:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Try a different RPC endpoint</li>
              <li>Wait a moment if rate limited</li>
              <li>Check if the Solana network is operational</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
