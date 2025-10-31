import { Connection } from '@solana/web3.js';

// RPC endpoint configuration
export const RPC_ENDPOINTS = {
  devnet: [
    'https://api.devnet.solana.com',
    'https://devnet.genesysgo.net',
    'https://rpc-devnet.hellomoon.io',
  ].filter(Boolean), // Remove any undefined values
  mainnet: [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
  ],
};

// Rate limiting configuration
const RATE_LIMIT_DELAY = 500;   // Reduced from 1000ms
const MAX_RETRIES = 5;          // Increased from 3
const RETRY_DELAY = 1000;       // Reduced from 2000ms

let lastRequestTime = 0;
let currentEndpointIndex = 0;

// Simple delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get next endpoint in rotation
export const getNextEndpoint = (network: 'devnet' | 'mainnet' = 'devnet'): string => {
  const endpoints = RPC_ENDPOINTS[network];
  const endpoint = endpoints[currentEndpointIndex];
  currentEndpointIndex = (currentEndpointIndex + 1) % endpoints.length;
  return endpoint as string; // We know it's a string due to filter(Boolean)
};

// Create connection with retry logic
export const createConnectionWithRetry = (network: 'devnet' | 'mainnet' = 'devnet') => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || getNextEndpoint(network);
  return new Connection(endpoint, {
    commitment: 'confirmed',
    wsEndpoint: undefined, // Disable websocket to reduce connections
  });
};

// Wrapper for RPC calls with rate limiting and retry logic
export const withRpcRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> => {
  // Rate limiting: ensure minimum time between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error as Error;
      
      // Check if it's a rate limit error
      const errorMessage = lastError?.message || '';
      const errorCode = (lastError as { code?: number })?.code;
      const isRateLimit = errorMessage.includes('429') || 
                         errorMessage.includes('Too many requests') ||
                         errorCode === 429;

      // Don't retry account not found errors (account doesn't exist)
      const isAccountNotFound = errorMessage.includes('Account does not exist') || 
                               errorMessage.includes('Invalid account discriminator') ||
                               errorMessage.includes('AccountNotFound');

      if (isAccountNotFound) {
        // Don't retry account not found errors, throw immediately
        throw lastError;
      }

      if (isRateLimit && attempt < maxRetries) {
        console.warn(`Rate limit hit, retrying in ${RETRY_DELAY}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
        continue;
      }

      // If it's the last attempt or not a rate limit error, throw
      if (attempt === maxRetries) {
        break;
      }

      // For other errors, wait a bit before retrying
      await delay(1000);
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

// Connection pool to reuse connections
const connectionPool = new Map<string, Connection>();

export const getConnection = (endpoint?: string): Connection => {
  const rpcEndpoint = endpoint || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || getNextEndpoint('devnet');
  
  // Ensure we have a valid string endpoint
  if (!rpcEndpoint || typeof rpcEndpoint !== 'string') {
    throw new Error('No valid RPC endpoint available');
  }
  
  if (!connectionPool.has(rpcEndpoint)) {
    connectionPool.set(rpcEndpoint, new Connection(rpcEndpoint, {
      commitment: 'confirmed',
      wsEndpoint: undefined,
    }));
  }
  
  return connectionPool.get(rpcEndpoint)!;
};
