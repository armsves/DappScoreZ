'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectRatingBadge } from './ProjectRatingBadge'
import { ProjectRating } from './ProjectRating'
import { ReviewsModal } from './ReviewsModal'
import { ReviewCountButton } from './ReviewCountButton'
import { useFreshness } from './useFreshness'
import { Github, Twitter, Globe, Zap } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string | null
  category: string | null
  icon: string | null
  website: string | null
  x: string | null
  github: string | null
  programId: string | null
  activated: boolean
  created_at: string
  blockchain: string
}

interface ProjectGridProps {
  showOnlyActivated?: boolean | undefined
  isAdminView?: boolean
  onProjectUpdate?: () => void
}

export function ProjectGrid({ 
  showOnlyActivated = true, 
  isAdminView = false,
  onProjectUpdate 
}: ProjectGridProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectForReviews, setSelectedProjectForReviews] = useState<{ id: number; name: string } | null>(null)
  const { publicKey } = useWallet()

  // Component for colored social icons
  const ColoredSocialIcon = ({ type, url, children }: { 
    type: 'github' | 'website' | 'social', 
    url: string, 
    children: React.ReactNode 
  }) => {
    const { iconColor } = useFreshness(type, url)
    
    return (
      <Button size="sm" variant="outline" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <div className={iconColor}>
            {children}
          </div>
        </a>
      </Button>
    )
  }

  const fetchProjects = useCallback(async () => {
    try {
      let url = '/api/projects'
      if (showOnlyActivated === true) {
        url += '?activated=true'
      } else if (showOnlyActivated === false) {
        url += '?activated=false'
      }
      // If showOnlyActivated is undefined, fetch all projects (no query param)
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [showOnlyActivated])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleProjectAction = async (projectId: number, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      // Use connected wallet address for admin actions
      const walletAddress = publicKey?.toString() || ''
      
      if (!walletAddress) {
        console.error('No wallet connected')
        return
      }
      
      if (action === 'delete') {
        const response = await fetch(`/api/projects/${projectId}?wallet=${walletAddress}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await fetchProjects()
          onProjectUpdate?.()
        }
      } else {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activated: action === 'activate',
            walletAddress 
          })
        })
        if (response.ok) {
          await fetchProjects()
          onProjectUpdate?.()
        }
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className={`group hover:shadow-lg transition-all duration-300 border-l-4 relative ${
            project.activated 
              ? 'border-l-green-500 hover:border-l-green-600' 
              : 'border-l-orange-500 hover:border-l-orange-600'
          }`}
        >
          {/* DappScoreZ Rating Badge in top right corner */}
          <div className="absolute top-2 right-2 z-10">
            <ProjectRatingBadge projectId={project.id} />
          </div>
          
          <CardHeader className="pb-2">{}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {project.icon ? (
                  <Image 
                    src={project.icon} 
                    alt={project.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-purple-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                    {project.category && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-100 text-purple-700 border-purple-200">
                        {project.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <CardDescription className="text-sm leading-relaxed line-clamp-3">
              {project.description}
            </CardDescription>
            
            {project.programId && (
              <div className="text-sm text-gray-600">
                <span>Program ID: </span>
                <a 
                  href={`https://explorer.solana.com/address/${project.programId}?cluster=devnet`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {project.programId.slice(0, 3)}...{project.programId.slice(-4)}
                </a>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {project.website && (
                  <ColoredSocialIcon type="website" url={project.website}>
                    <Globe className="w-4 h-4" />
                  </ColoredSocialIcon>
                )}
                {project.github && (
                  <ColoredSocialIcon type="github" url={project.github}>
                    <Github className="w-4 h-4" />
                  </ColoredSocialIcon>
                )}
                {project.x && (
                  <ColoredSocialIcon type="social" url={`https://x.com/${project.x}`}>
                    <Twitter className="w-4 h-4" />
                  </ColoredSocialIcon>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <ProjectRating projectId={project.id} projectName={project.name} />
                <ReviewCountButton 
                  projectId={project.id} 
                  projectName={project.name}
                  onClick={() => setSelectedProjectForReviews({ id: project.id, name: project.name })}
                />
              </div>
            </div>
            
            {isAdminView && (
              <div className="flex gap-2 pt-3 border-t">
                {!project.activated ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleProjectAction(project.id, 'activate')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Activate
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleProjectAction(project.id, 'deactivate')}
                  >
                    Deactivate
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleProjectAction(project.id, 'delete')}
                >
                  Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {projects.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">
            {showOnlyActivated 
              ? "No activated projects to display yet." 
              : "No projects have been submitted yet."}
          </p>
        </div>
      )}
      
      {/* Reviews Modal */}
      {selectedProjectForReviews && (
        <ReviewsModal
          isOpen={!!selectedProjectForReviews}
          onClose={() => setSelectedProjectForReviews(null)}
          projectId={selectedProjectForReviews.id}
          projectName={selectedProjectForReviews.name}
        />
      )}
    </div>
  )
}
