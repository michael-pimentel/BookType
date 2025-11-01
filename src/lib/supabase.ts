import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

// For client-side operations
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
