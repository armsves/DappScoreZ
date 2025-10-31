"use client";

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wallet on server
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors text-white">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-colors" />
    </div>
  );
}
