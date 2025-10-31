"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Import the wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // Configure wallets - these will be available for users to connect
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  // Use multiple RPC endpoints to avoid rate limiting
  const endpoint = useMemo(() => {
    // List of devnet RPC endpoints to try
    const devnetEndpoints = [
      'https://api.devnet.solana.com',
      clusterApiUrl(network), // Fallback to default
    ];
    
    // You can also use environment variable for custom RPC
    const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (customEndpoint) {
      return customEndpoint;
    }
    
    // For now, use the first endpoint
    // In production, you might want to implement endpoint rotation
    return devnetEndpoints[0];
  }, [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
