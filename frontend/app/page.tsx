'use client'

import { useState } from 'react'
import { ProjectGrid } from "@/components/projects/ProjectGrid"
import { ProjectSubmissionForm } from "@/components/projects/ProjectSubmissionForm"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Zap, TrendingUp } from 'lucide-react'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProjectSubmitted = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      {/* Navbar */}
      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 text-transparent bg-clip-text">
            DappScoreZ
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Discover, Rate & Submit the Best Solana Projects
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>On-chain Ratings</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Community Driven</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="projects" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Projects
            </TabsTrigger>
            <TabsTrigger value="submit" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Submit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Featured Solana Projects</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Explore the most innovative and highly-rated projects in the Solana ecosystem. 
                Ratings are fetched directly from on-chain data for transparency.
              </p>
            </div>
            <div key={refreshKey}>
              <ProjectGrid showOnlyActivated={true} />
            </div>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Submit Your Project</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Add your Solana project to our directory. Projects are reviewed by admins before going live.
              </p>
            </div>
            <ProjectSubmissionForm onProjectSubmitted={handleProjectSubmitted} />
          </TabsContent>
        </Tabs>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Built on Solana for maximum speed and minimum fees</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">On-Chain Ratings</h3>
              <p className="text-gray-400">Transparent ratings stored directly on the blockchain</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700 text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Community Driven</h3>
              <p className="text-gray-400">Projects are submitted and rated by the community</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>Powered by Anchor, Prisma, Next.js, and Shadcn UI</p>
          <p className="mt-2">Building the future of Solana project discovery</p>
        </footer>
      </div>
    </div>
  )
}
