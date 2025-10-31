'use client'

import { useEffect, useState } from 'react'
import { Github, Globe, X, Calendar } from 'lucide-react'

interface FreshnessIndicatorProps {
  type: 'github' | 'website' | 'social'
  url?: string | null
  className?: string
}

interface FreshnessData {
  status: 'green' | 'yellow' | 'red' | 'gray'
  lastUpdate?: string
  isActive?: boolean
}

export function FreshnessIndicator({ type, url, className }: FreshnessIndicatorProps) {
  const [freshness, setFreshness] = useState<FreshnessData>({ status: 'gray' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) {
      setFreshness({ status: 'gray' })
      return
    }

    const checkFreshness = async (): Promise<FreshnessData> => {
      try {
        // Build the URL for the API endpoint
        let apiUrl = url
        
        // For social (Twitter/X), convert username to full URL if needed
        if (type === 'social') {
          if (!url.includes('x.com') && !url.includes('twitter.com')) {
            // It's just a username, convert to full URL
            apiUrl = `https://x.com/${url.replace('@', '')}`
          }
        }
        
        const response = await fetch(`/api/freshness?type=${type}&url=${encodeURIComponent(apiUrl)}`)
        
        if (!response.ok) {
          console.error(`Failed to check ${type} freshness:`, response.statusText)
          return { status: 'red' }
        }

        const data = await response.json()
        return data as FreshnessData
      } catch (error) {
        console.error(`Error checking ${type} freshness:`, error)
        return { status: 'red' }
      }
    }

    setLoading(true)
    checkFreshness().then(data => {
      setFreshness(data)
      setLoading(false)
    })
  }, [type, url])

  const getIcon = () => {
    const iconColor = getIconColor(freshness.status)
    switch (type) {
      case 'github':
        return <Github className={`w-3 h-3 ${iconColor}`} />
      case 'website':
        return <Globe className={`w-3 h-3 ${iconColor}`} />
      case 'social':
        return <X className={`w-3 h-3 ${iconColor}`} />
      default:
        return <Calendar className={`w-3 h-3 ${iconColor}`} />
    }
  }

  const getIconColor = (status: string) => {
    if (!url) return 'text-gray-400'
    if (loading) return 'text-gray-400'
    
    switch (status) {
      case 'green':
        return 'text-green-600'
      case 'yellow':
        return 'text-yellow-600'
      case 'red':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = () => {
    if (!url) return 'N/A'
    if (loading) return '...'
    
    switch (type) {
      case 'github':
        if (freshness.status === 'green') return 'Fresh'
        if (freshness.status === 'yellow') return 'Stale'
        if (freshness.status === 'red') return 'Old'
        return 'Unknown'
      case 'website':
        return freshness.isActive ? 'Live' : 'Down'
      case 'social':
        if (freshness.status === 'green') return 'Active'
        if (freshness.status === 'yellow') return 'Quiet'
        if (freshness.status === 'red') return 'Silent'
        return 'Unknown'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-full bg-gray-50">
          {getIcon()}
        </div>
        <span className="text-xs font-medium text-gray-700 capitalize">
          {type === 'social' ? 'Social' : type}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 truncate max-w-16">
          {getStatusText()}
        </span>
      </div>
    </div>
  )
}

interface FreshnessDashboardProps {
  githubUrl?: string | null
  websiteUrl?: string | null
  socialUrl?: string | null
  className?: string
}

export function FreshnessDashboard({ 
  githubUrl, 
  websiteUrl, 
  socialUrl, 
  className 
}: FreshnessDashboardProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100">
          <FreshnessIndicator type="github" url={githubUrl} />
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100">
          <FreshnessIndicator type="website" url={websiteUrl} />
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100">
          <FreshnessIndicator type="social" url={socialUrl} />
        </div>
      </div>
    </div>
  )
}
