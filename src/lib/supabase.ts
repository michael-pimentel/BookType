// ============================================
// Supabase Client Configuration
// Provides clients for both client-side and server-side usage
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing env.NEXT_PUBLIC_SUPABASE_URL. Please add it to your .env.local file.\n' +
    'Get your URL from: https://supabase.com/dashboard/project/_/settings/api'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY. Please add it to your .env.local file.\n' +
    'Get your key from: https://supabase.com/dashboard/project/_/settings/api'
  )
}

/**
 * Client-side Supabase client
 * Use this in React components and client-side code
 * Respects Row Level Security (RLS) policies
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-side Supabase client
 * Use this in API routes and server components
 * Respects Row Level Security (RLS) policies
 */
export const createServerClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  })
}

/**
 * Service role Supabase client (admin access)
 * Use this ONLY in secure server-side contexts (API routes, scripts)
 * Bypasses Row Level Security (RLS) - use with caution!
 * 
 * ⚠️ NEVER expose this client to the browser
 */
export const createServiceRoleClient = (): SupabaseClient => {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Missing env.SUPABASE_SERVICE_ROLE_KEY. This is required for admin operations.\n' +
      'Get your service role key from: https://supabase.com/dashboard/project/_/settings/api\n' +
      '⚠️ Keep this key secret and never commit it to version control!'
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
