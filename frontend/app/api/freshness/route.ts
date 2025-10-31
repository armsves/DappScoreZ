import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: unknown; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache

// Rate limit tracking
let lastGitHubRequest = 0
const GITHUB_REQUEST_DELAY = 1000 // 1 second delay between GitHub API requests

// RapidAPI Twitter API rate limit tracking
let lastTwitterRequest = 0
const TWITTER_REQUEST_DELAY = 3000 // 3 seconds delay between RapidAPI requests to avoid rate limits (increased to reduce rate limit errors)
const MAX_RETRIES = 2 // Maximum number of retries for rate limit errors

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
    'User-Agent': 'DappScoreZ',
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

// Helper function to check and wait for RapidAPI Twitter rate limits
async function checkTwitterRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastTwitterRequest
  
  if (timeSinceLastRequest < TWITTER_REQUEST_DELAY) {
    const waitTime = TWITTER_REQUEST_DELAY - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  lastTwitterRequest = Date.now()
}

// Helper function to make RapidAPI Twitter API request with rate limit handling
async function twitterApiRequest(url: string, retryCount = 0): Promise<Response> {
  await checkTwitterRateLimit()
  
  const apiKey = process.env.X_API_KEY
  
  if (!apiKey) {
    throw new Error('RapidAPI key not configured. Please set X_API_KEY environment variable.')
  }
  
  const headers: HeadersInit = {
    'x-rapidapi-host': 'twitter241.p.rapidapi.com',
    'x-rapidapi-key': apiKey,
  }
  
  console.log(`🔵 [Twitter API] Making request to: ${url.split('?')[0]}... (retry: ${retryCount})`)
  
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(10000)
  })
  
  // Check for rate limit errors
  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after') || response.headers.get('Retry-After')
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining') || response.headers.get('X-RateLimit-Remaining')
    const rateLimitReset = response.headers.get('x-ratelimit-reset') || response.headers.get('X-RateLimit-Reset')
    
    console.warn('🔴 [Twitter API] Rate limit exceeded', {
      retryAfter,
      rateLimitRemaining,
      rateLimitReset,
      status: response.status,
      statusText: response.statusText,
      retryCount,
      maxRetries: MAX_RETRIES,
    })
    
    // Don't retry more than MAX_RETRIES times
    if (retryCount >= MAX_RETRIES) {
      console.error('🔴 [Twitter API] Max retries exceeded, giving up')
      throw new Error('Twitter API rate limit exceeded. Please try again later.')
    }
    
    // Wait before retrying (Retry-After header is in seconds)
    if (retryAfter) {
      const waitTime = parseInt(retryAfter) * 1000
      if (waitTime > 0 && waitTime < 60000) { // Don't wait more than 1 minute
        console.log(`⏳ [Twitter API] Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        // Retry once after waiting
        return twitterApiRequest(url, retryCount + 1)
      }
    }
    
    // If rate limit reset time is provided, wait until then
    if (rateLimitReset) {
      const resetTimestamp = parseInt(rateLimitReset) * 1000
      const waitTime = Math.max(0, resetTimestamp - Date.now())
      if (waitTime > 0 && waitTime < 60000) { // Don't wait more than 1 minute
        console.log(`⏳ [Twitter API] Waiting until rate limit resets (${waitTime}ms)...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        return twitterApiRequest(url, retryCount + 1)
      }
    }
    
    // If no retry info, wait a default amount and retry once
    const defaultWaitTime = 10000 // 10 seconds default wait
    console.log(`⏳ [Twitter API] No retry-after header, waiting ${defaultWaitTime}ms before retry...`)
    await new Promise(resolve => setTimeout(resolve, defaultWaitTime))
    return twitterApiRequest(url, retryCount + 1)
  }
  
  // Log successful response
  if (response.ok) {
    console.log(`✅ [Twitter API] Request successful (${response.status})`)
  } else {
    console.warn(`⚠️ [Twitter API] Request failed (${response.status}): ${response.statusText}`)
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

      // Remove @ if present
      username = username.replace('@', '')

      try {
        // Check if RapidAPI key is configured
        const apiKey = process.env.X_API_KEY
        if (!apiKey) {
          console.warn('RapidAPI key not configured. Falling back to profile check.')
          // Fallback: check if profile exists
          const profileUrl = `https://x.com/${username}`
          const profileResponse = await fetch(profileUrl, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(5000)
          })
          
          if (!profileResponse.ok) {
            return NextResponse.json({ status: 'red' })
          }
          
          // Can't determine last tweet without API, assume active
          const result = { status: 'green' as const }
          cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
          return NextResponse.json(result)
        }

        // Step 1: Get user info from RapidAPI Twitter API
        const userLookupUrl = `https://twitter241.p.rapidapi.com/user?username=${encodeURIComponent(username)}`
        let userResponse: Response
        
        try {
          userResponse = await twitterApiRequest(userLookupUrl)
        } catch (error) {
          console.error('Error fetching Twitter user:', error)
          return NextResponse.json({ status: 'red' })
        }

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.error(`Twitter API error (${userResponse.status}):`, errorData)
          
          // If user not found, return red
          if (userResponse.status === 404) {
            return NextResponse.json({ status: 'red' })
          }
          
          // For other errors, return red
          return NextResponse.json({ status: 'red' })
        }

        const userData = await userResponse.json()
        // RapidAPI returns user ID at result.data.user.result.rest_id or user.result.rest_id
        const userId = userData?.result?.data?.user?.result?.rest_id || 
                       userData?.user?.result?.rest_id || 
                       userData?.user?.result?.id || 
                       userData?.result?.rest_id || 
                       userData?.id

        console.log('🔵 [Twitter] User ID extraction:', {
          rawData: userData,
          extractedUserId: userId,
          path1: userData?.result?.data?.user?.result?.rest_id,
          path2: userData?.user?.result?.rest_id,
          path3: userData?.user?.result?.id,
          path4: userData?.result?.rest_id,
          path5: userData?.id,
        })

        if (!userId) {
          console.error('Twitter user ID not found in response:', JSON.stringify(userData, null, 2))
          return NextResponse.json({ status: 'red' })
        }

        console.log('✅ [Twitter] Successfully extracted user ID:', userId)

        // Step 2: Get latest tweets using RapidAPI Twitter API
        const tweetsUrl = `https://twitter241.p.rapidapi.com/user-tweets?user=${encodeURIComponent(userId)}&count=1`
        let tweetsResponse: Response
        
        try {
          tweetsResponse = await twitterApiRequest(tweetsUrl)
        } catch (error) {
          console.error('Error fetching Twitter tweets:', error)
          return NextResponse.json({ status: 'red' })
        }

        if (!tweetsResponse.ok) {
          const errorData = await tweetsResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.error(`Twitter API error (${tweetsResponse.status}):`, errorData)
          
          // If user has no tweets, account exists but no tweets - assume active
          if (tweetsResponse.status === 404) {
            const result = { status: 'green' as const }
            cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
            return NextResponse.json(result)
          }
          
          return NextResponse.json({ status: 'red' })
        }

        const tweetsData = await tweetsResponse.json()
        
        // RapidAPI returns tweets in a nested structure: result.timeline.instructions[].entries[]
        // We need to find entries with entryType "TimelineTimelineItem" and extract tweet data
        interface TweetLegacy {
          created_at: string
          retweeted_status_result?: unknown
        }
        
        let latestTweet: TweetLegacy | null = null
        
        try {
          const instructions = tweetsData?.result?.timeline?.instructions || []
          
          // Find entries that contain tweets
          for (const instruction of instructions) {
            if (instruction.entries && Array.isArray(instruction.entries)) {
              for (const entry of instruction.entries) {
                // Skip non-tweet entries
                if (entry.content?.entryType !== 'TimelineTimelineItem') {
                  continue
                }
                
                const tweetResult = entry.content?.itemContent?.tweet_results?.result
                if (tweetResult && tweetResult.legacy) {
                  const tweet = tweetResult.legacy as TweetLegacy
                  // Check if this is a real tweet (not a retweet or reply without original tweet)
                  if (tweet.created_at && !tweet.retweeted_status_result) {
                    // Parse date to compare properly
                    const tweetDate = new Date(tweet.created_at)
                    if (!isNaN(tweetDate.getTime())) {
                      if (!latestTweet) {
                        latestTweet = tweet
                      } else {
                        const latestDate = new Date(latestTweet.created_at)
                        if (tweetDate > latestDate) {
                          latestTweet = tweet
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing tweets response:', parseError)
        }

        // If no tweets found, account might be new or private
        if (!latestTweet || !latestTweet.created_at) {
          const result = { status: 'green' as const }
          cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
          return NextResponse.json(result)
        }

        // Parse the created_at date (format: "Tue Jun 06 19:31:02 +0000 2023")
        const createdAt = latestTweet.created_at
        const lastTweetDate = new Date(createdAt)

        if (isNaN(lastTweetDate.getTime())) {
          console.error('Invalid date format:', createdAt)
          const result = { status: 'green' as const }
          cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL })
          return NextResponse.json(result)
        }

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

