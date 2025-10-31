"use client";

import { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Activity, Zap } from 'lucide-react';

export function RpcTester() {
  const { connection } = useConnection();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRpcCall = async (testName: string, testFn: () => Promise<unknown>) => {
    addResult(`🧪 Starting ${testName}...`);
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      addResult(`✅ ${testName} completed in ${duration}ms`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addResult(`❌ ${testName} failed: ${errorMessage}`);
    }
  };

  const runBasicTests = async () => {
    setTesting(true);
    addResult('🚀 Starting RPC test suite...');

    // Test 1: Get latest blockhash
    await testRpcCall('Get Latest Blockhash', async () => {
      await connection.getLatestBlockhash();
    });

    // Test 2: Get slot
    await testRpcCall('Get Slot', async () => {
      await connection.getSlot();
    });

    // Test 3: Get epoch info
    await testRpcCall('Get Epoch Info', async () => {
      await connection.getEpochInfo();
    });

    // Test 4: Get version
    await testRpcCall('Get Version', async () => {
      await connection.getVersion();
    });

    addResult('🏁 Test suite completed');
    setTesting(false);
  };

  const runStressTest = async () => {
    setTesting(true);
    addResult('⚡ Starting stress test (10 rapid calls)...');

    const promises = Array.from({ length: 10 }, (_, i) =>
      testRpcCall(`Stress Call ${i + 1}`, async () => {
        await connection.getLatestBlockhash();
      })
    );

    await Promise.allSettled(promises);
    addResult('💪 Stress test completed');
    setTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>RPC Connection Tester</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={runBasicTests}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            <Activity className="w-4 h-4 mr-1" />
            Basic Tests
          </Button>
          <Button
            onClick={runStressTest}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            Stress Test
          </Button>
          <Button
            onClick={clearResults}
            disabled={testing}
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 max-h-64 overflow-y-auto">
            <div className="text-xs font-medium text-gray-600 mb-2">Test Results:</div>
            {results.map((result, index) => (
              <div
                key={index}
                className={`text-xs font-mono ${
                  result.includes('✅') ? 'text-green-600' :
                  result.includes('❌') ? 'text-red-600' :
                  result.includes('🧪') ? 'text-blue-600' :
                  'text-gray-600'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Purpose:</strong> Test RPC connection reliability and retry mechanisms.</p>
          <p><strong>Basic Tests:</strong> Sequential calls to verify connection stability.</p>
          <p><strong>Stress Test:</strong> Concurrent calls to test rate limiting behavior.</p>
        </div>
      </CardContent>
    </Card>
  );
}
