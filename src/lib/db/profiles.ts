// ============================================
// Profiles Database Access Layer
// Reusable functions for profile operations
// ============================================

import { createServerClient } from '@/lib/supabase'
import { Profile, ProfileInsert, ProfileUpdate } from '@/types/database'
import { ProfileWithStats } from '@/types/database'

/**
 * Get profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Get profile with extended stats (leaderboard, achievements, friends count)
 */
export async function getProfileWithStats(
  userId: string
): Promise<ProfileWithStats | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      leaderboard (*),
      achievements (*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile with stats:', error)
    return null
  }

  // Get friends count
  const { count } = await supabase
    .from('friends')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted')

  return {
    ...data,
    friends_count: count || 0,
    leaderboard: data.leaderboard?.[0] || undefined,
    achievements: data.achievements || []
  } as ProfileWithStats
}

/**
 * Get profile by username
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile by username:', error)
    return null
  }

  return data
}

/**
 * Create or update profile
 */
export async function upsertProfile(
  profile: ProfileInsert
): Promise<Profile | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Error upserting profile:', error)
    return null
  }

  return data
}

/**
 * Update profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

/**
 * Search profiles by username or display name
 */
export async function searchProfiles(
  query: string,
  limit: number = 10
): Promise<Profile[]> {
  const supabase = createServerClient()
  
  const searchTerm = `%${query}%`
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
    .limit(limit)

  if (error) {
    console.error('Error searching profiles:', error)
    return []
  }

  return data || []
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = createServerClient()
  
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}

