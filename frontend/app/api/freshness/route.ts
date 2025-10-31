import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: unknown; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache

// Rate limit tracking
let lastGitHubRequest = 0
const GITHUB_REQUEST_DELAY = 1000 // 1 second delay between GitHub API requests

// Helper function to check and wait for rate limits
async function checkRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastGitHubRequest
  
  if (timeSinceLastRequest < GITHUB_REQUEST_DELAY) {
    const waitTime = GITHUB_REQUEST_DELAY - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  lastGitHubRequest = Date.now()
}

// Helper function to make GitHub API request with rate limit handling
async function githubApiRequest(url: string): Promise<Response> {
  await checkRateLimit()
  
  const githubToken = process.env.GITHUB_TOKEN
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'DappScore',
  }
  
  // Add authentication if token is available (increases rate limit from 60 to 5000/hour)
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`
  }
  
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(10000)
  })
  
  // Check for rate limit errors
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')
    const resetTime = response.headers.get('X-RateLimit-Reset')
    
    console.warn('GitHub API rate limit exceeded', {
      retryAfter,
      resetTime,
      remaining: response.headers.get('X-RateLimit-Remaining')
    })
    
    // Wait until rate limit resets (or use Retry-After header)
    if (resetTime) {
      const resetTimestamp = parseInt(resetTime) * 1000
      const waitTime = Math.max(0, resetTimestamp - Date.now())
      if (waitTime > 0 && waitTime < 3600000) { // Don't wait more than 1 hour
        await new Promise(resolve => setTimeout(resolve, waitTime))
        // Retry once after waiting
        return githubApiRequest(url)
      }
    }
    
    throw new Error('GitHub API rate limit exceeded. Please try again later.')
  }
  
  return response
}

// Check website status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const type = searchParams.get('type') // 'website', 'github', 'social'

  if (!url || !type) {
    return NextResponse.json({ error: 'Missing url or type parameter' }, { status: 400 })
  }

  // Check cache first
  const cacheKey = `${type}:${url}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data)
  }

  try {
    if (type === 'website') {
      // Check if website loads
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
      })
      
      const isActive = response.ok
      const result = {
        status: isActive ? 'green' : 'red',
        isActive
      }
      
      // Cache the result
      cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
      
      return NextResponse.json(result)
    }

    if (type === 'github') {
      // Extract owner and optional repo from GitHub URL
      // Supports: https://github.com/owner, https://github.com/owner/repo, https://github.com/owner/repo/tree/main
      const match = url.match(/github\.com\/([^\/]+)(?:\/([^\/]+))?/)
      if (!match) {
        console.error('Invalid GitHub URL format:', url)
        return NextResponse.json({ error: 'Invalid GitHub URL format' }, { status: 400 })
      }

      const [, owner, repo] = match
      
      // Log the parsed values for debugging
      console.log('GitHub URL parsed:', { url, owner, repo })
      
      // If no repo specified, or repo is a common non-repo path, check organization's repos
      if (!repo || ['blog', 'docs', 'website', 'www'].includes(repo.toLowerCase())) {
        try {
          const orgReposResponse = await githubApiRequest(`https://api.github.com/orgs/${owner}/repos?sort=updated&per_page=1`)
          
          if (!orgReposResponse.ok) {
            const errorText = await orgReposResponse.text()
            console.error(`GitHub API error (${orgReposResponse.status}):`, errorText)
            
            // If organization doesn't exist, try as user
            if (orgReposResponse.status === 404) {
              try {
                const userReposResponse = await githubApiRequest(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=1`)
                if (userReposResponse.ok) {
                  const repos = await userReposResponse.json()
                  if (repos && repos.length > 0) {
                    const lastUpdate = new Date(repos[0].updated_at)
                    const now = new Date()
                    const monthsDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                    
                    let status: 'green' | 'yellow' | 'red'
                    if (monthsDiff < 3) {
                      status = 'green'
                    } else if (monthsDiff < 12) {
                      status = 'yellow'
                    } else {
                      status = 'red'
                    }
                    
                    const result = {
                      status,
                      lastUpdate: lastUpdate.toISOString(),
                      monthsAgo: Math.round(monthsDiff * 10) / 10
                    }
                    
                    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
                    return NextResponse.json(result)
                  }
                }
              } catch (userError) {
                console.error('Error fetching user repos:', userError)
              }
            }
            
            return NextResponse.json({ status: 'red' })
          }
          
          const repos = await orgReposResponse.json()
          if (repos && repos.length > 0) {
            const lastUpdate = new Date(repos[0].updated_at)
            const now = new Date()
            const monthsDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30)
            
            let status: 'green' | 'yellow' | 'red'
            if (monthsDiff < 3) {
              status = 'green'
            } else if (monthsDiff < 12) {
              status = 'yellow'
            } else {
              status = 'red'
            }
            
            const result = {
              status,
              lastUpdate: lastUpdate.toISOString(),
              monthsAgo: Math.round(monthsDiff * 10) / 10
            }
            
            cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
            return NextResponse.json(result)
          }
        } catch (error) {
          console.error('Error fetching org repos:', error)
          return NextResponse.json({ status: 'red' })
        }
      }
      
      // If repo is specified, get last commit date from that specific repo
      let githubResponse: Response
      try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`
        console.log('Fetching GitHub commits from:', apiUrl)
        githubResponse = await githubApiRequest(apiUrl)
      } catch (error) {
        console.error('Error fetching GitHub commits:', error)
        return NextResponse.json({ status: 'red' })
      }

      if (!githubResponse.ok) {
        const errorText = await githubResponse.text()
        console.error(`GitHub API error (${githubResponse.status}):`, errorText)
        
        // If repo doesn't exist, try checking organization's repos as fallback
        try {
          const orgReposResponse = await githubApiRequest(`https://api.github.com/orgs/${owner}/repos?sort=updated&per_page=1`)
          
          if (orgReposResponse.ok) {
            const repos = await orgReposResponse.json()
            if (repos && repos.length > 0) {
              const lastUpdate = new Date(repos[0].updated_at)
              const now = new Date()
              const monthsDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30)
              
              let status: 'green' | 'yellow' | 'red'
              if (monthsDiff < 3) {
                status = 'green'
              } else if (monthsDiff < 12) {
                status = 'yellow'
              } else {
                status = 'red'
              }
              
              const result = {
                status,
                lastUpdate: lastUpdate.toISOString(),
                monthsAgo: Math.round(monthsDiff * 10) / 10
              }
              
              cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
              return NextResponse.json(result)
            }
          }
        } catch (error) {
          console.error('Error fetching org repos fallback:', error)
        }
        
        return NextResponse.json({ status: 'red' })
      }

      const commits = await githubResponse.json()
      if (!commits || commits.length === 0) {
        return NextResponse.json({ status: 'red' })
      }

      const lastCommitDate = new Date(commits[0].commit.committer.date)
      const now = new Date()
      const monthsDiff = (now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

      let status: 'green' | 'yellow' | 'red'
      if (monthsDiff < 3) {
        status = 'green'
      } else if (monthsDiff < 12) {
        status = 'yellow'
      } else {
        status = 'red'
      }

      const result = {
        status,
        lastUpdate: lastCommitDate.toISOString(),
        monthsAgo: Math.round(monthsDiff * 10) / 10
      }
      
      cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
      return NextResponse.json(result)
    }

    if (type === 'social') {
      // Extract username from X/Twitter URL
      let username = url
      if (url.includes('x.com/')) {
        username = url.split('x.com/')[1].split('/')[0].split('?')[0]
      } else if (url.includes('twitter.com/')) {
        username = url.split('twitter.com/')[1].split('/')[0].split('?')[0]
      } else if (url.startsWith('@')) {
        username = url.substring(1)
      }

      const profileUrl = `https://x.com/${username}`
      
      try {
        // Check if profile exists
        const profileResponse = await fetch(profileUrl, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000)
        })

        if (!profileResponse.ok) {
          return NextResponse.json({ status: 'red' })
        }

        // Try to scrape the profile page for last tweet timestamp
        // Twitter/X embeds timestamps in the HTML
        const htmlResponse = await fetch(profileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: AbortSignal.timeout(10000)
        })

        if (!htmlResponse.ok) {
          // Profile exists but can't scrape - default to green
          return NextResponse.json({ status: 'green' })
        }

        const html = await htmlResponse.text()
        
        // Try multiple patterns to find last tweet timestamp
        // Twitter/X uses various formats in their HTML
        const patterns = [
          /datetime="([^"]+)"/,
          /"created_at":"([^"]+)"/,
          /time.*datetime="([^"]+)"/,
          /data-time="([^"]+)"/,
        ]
        
        let lastTweetDate: Date | null = null
        
        for (const pattern of patterns) {
          const match = html.match(pattern)
          if (match) {
            try {
              lastTweetDate = new Date(match[1])
              if (!isNaN(lastTweetDate.getTime())) {
                break
              }
            } catch {
              // Try next pattern
            }
          }
        }
        
        if (lastTweetDate) {
          const now = new Date()
          const monthsDiff = (now.getTime() - lastTweetDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

          let status: 'green' | 'yellow' | 'red'
          if (monthsDiff < 3) {
            status = 'green'
          } else if (monthsDiff < 12) {
            status = 'yellow'
          } else {
            status = 'red'
          }

          const result = {
            status,
            lastUpdate: lastTweetDate.toISOString(),
            monthsAgo: Math.round(monthsDiff * 10) / 10
          }
          
          // Cache the result
          cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
          
          return NextResponse.json(result)
        }

        // If we can't find timestamp but profile exists, assume it's active
        const result = { status: 'green' as const }
        
        // Cache the result
        cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
        
        return NextResponse.json(result)
      } catch (error) {
        console.error('Error checking Twitter/X freshness:', error)
        // On error, return red to be safe
        return NextResponse.json({ status: 'red' })
      }
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error checking ${type} freshness:`, errorMessage)
    return NextResponse.json({ 
      status: 'red',
      error: errorMessage 
    })
  }
}

