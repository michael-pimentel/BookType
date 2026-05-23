// ============================================
// Authentication Middleware
// Utilities for handling authentication in API routes
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient as createSSRClient } from '@supabase/ssr'

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Create Supabase client with SSR support
    const supabase = createSSRClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options?: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options?: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Require authentication middleware
 * Returns 401 response if user is not authenticated
 * Returns user object if authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false, data: null },
      { status: 401 }
    )
  }

  return user
}

/**
 * Create authenticated Supabase client from request
 */
export async function getAuthenticatedClient(request: NextRequest) {
  const cookieStore = await cookies()
  
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options?: any) {
          cookieStore.delete(name)
        },
      },
    }
  )
}

