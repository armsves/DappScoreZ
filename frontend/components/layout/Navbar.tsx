'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WalletButton } from '@/components/ui/WalletButton'
import { Button } from '@/components/ui/button'
import { Zap, Settings, TestTube } from 'lucide-react'

interface NavbarProps {
  showAdminButton?: boolean
}

export function Navbar({ showAdminButton = true }: NavbarProps) {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if connected wallet is admin wallet
  const isAdminWallet = () => {
    if (!connected || !publicKey) return false
    
    // Get admin wallet from environment or use default for testing
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET || 'YOUR_ADMIN_WALLET_ADDRESS_HERE'
    return publicKey.toString() === adminWallet
  }

  const handleAdminClick = () => {
    if (isAdminWallet()) {
      router.push('/admin')
    }
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              DappScore
            </h1>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {/* Ratings Test Link - only show to admins after mount to prevent hydration issues */}
            {mounted && connected && isAdminWallet() && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/ratings-test')}
                className="gap-2 text-gray-300 hover:text-white"
              >
                <TestTube className="w-4 h-4" />
                Ratings Test
              </Button>
            )}

            {/* Admin Button - only show after mount to prevent hydration issues */}
            {mounted && showAdminButton && connected && isAdminWallet() && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdminClick}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            )}

            {/* Wallet Connection */}
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
