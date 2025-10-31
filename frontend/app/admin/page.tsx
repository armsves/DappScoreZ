'use client'

import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/layout/Navbar"
import { AdminPanel } from "@/components/projects/AdminPanel"

export default function AdminPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()

  // Check if connected wallet is admin wallet
  const isAdminWallet = () => {
    if (!connected || !publicKey) return false
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET || 'YOUR_ADMIN_WALLET_ADDRESS_HERE'
    return publicKey.toString() === adminWallet
  }

  // Redirect if not authorized
  useEffect(() => {
    if (!connected || !publicKey) {
      router.push('/')
      return
    }
    
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET || 'YOUR_ADMIN_WALLET_ADDRESS_HERE'
    if (publicKey.toString() !== adminWallet) {
      router.push('/')
    }
  }, [connected, publicKey, router])

  // Show access denied if not connected or not admin
  if (!connected || !isAdminWallet()) {
    return null // Don't show anything, just let useEffect handle redirect
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      {/* Navbar */}
      <Navbar showAdminButton={false} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-transparent bg-clip-text">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Manage and review submitted projects
          </p>
        </div>

        {/* Admin Panel */}
        <AdminPanel isAdmin={true} />

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>Powered by Anchor, Prisma, Next.js, and Shadcn UI</p>
          <p className="mt-2">Building the future of Solana project discovery</p>
        </footer>
      </div>
    </div>
  )
}
