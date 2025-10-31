'use client'

import { useEffect, useState } from 'react'

interface FreshnessData {
  status: 'green' | 'yellow' | 'red' | 'gray'
  lastUpdate?: string
  isActive?: boolean
}

export function useFreshness(type: 'github' | 'website' | 'social', url?: string | null) {
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

  return {
    status: freshness.status,
    loading,
    iconColor: getIconColor(freshness.status)
  }
}
