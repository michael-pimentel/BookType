// ============================================
// Leaderboard Database Access Layer
// Reusable functions for leaderboard operations
// ============================================

import { createServerClient } from '@/lib/supabase'
import { Leaderboard, LeaderboardInsert, LeaderboardUpdate } from '@/types/database'
import { LeaderboardWithProfile } from '@/types/database'

/**
 * Get leaderboard entry for a user
 */
export async function getLeaderboardEntry(
  userId: string
): Promise<Leaderboard | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Entry doesn't exist, create it
      const entry: LeaderboardInsert = { user_id: userId }
      const { data: newData, error: insertError } = await supabase
        .from('leaderboard')
        .insert(entry)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating leaderboard entry:', insertError)
        return null
      }

      return newData
    }
    
    console.error('Error fetching leaderboard entry:', error)
    return null
  }

  return data
}

/**
 * Update leaderboard entry
 */
export async function updateLeaderboardEntry(
  userId: string,
  updates: LeaderboardUpdate
): Promise<Leaderboard | null> {
  const supabase = createServerClient()
  
  // Get existing entry to merge updates
  const existing = await getLeaderboardEntry(userId)
  
  if (!existing) {
    // Create new entry if it doesn't exist
    const newEntry: LeaderboardInsert = {
      user_id: userId,
      ...updates
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .insert(newEntry)
      .select()
      .single()

    if (error) {
      console.error('Error creating leaderboard entry:', error)
      return null
    }

    return data
  }

  // Merge updates (for averaging WPM, incrementing counts, etc.)
  const mergedUpdates: LeaderboardUpdate = {
    books_completed: updates.books_completed ?? existing.books_completed,
    average_wpm: updates.average_wpm ?? existing.average_wpm,
    total_chars_typed: updates.total_chars_typed ?? existing.total_chars_typed,
    total_time_seconds: updates.total_time_seconds ?? existing.total_time_seconds
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .update(mergedUpdates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating leaderboard entry:', error)
    return null
  }

  return data
}

/**
 * Get top users by books completed
 */
export async function getTopUsersByBooks(
  limit: number = 10,
  offset: number = 0
): Promise<LeaderboardWithProfile[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles!leaderboard_user_id_fkey(*)
    `)
    .order('books_completed', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching top users by books:', error)
    return []
  }

  return (data || []).map((entry, index) => ({
    ...entry,
    rank: offset + index + 1,
    profile: entry.profile
  })) as LeaderboardWithProfile[]
}

/**
 * Get top users by WPM
 */
export async function getTopUsersByWpm(
  limit: number = 10,
  offset: number = 0
): Promise<LeaderboardWithProfile[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles!leaderboard_user_id_fkey(*)
    `)
    .order('average_wpm', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching top users by WPM:', error)
    return []
  }

  return (data || []).map((entry, index) => ({
    ...entry,
    rank: offset + index + 1,
    profile: entry.profile
  })) as LeaderboardWithProfile[]
}

/**
 * Get top users by overall score
 */
export async function getTopUsersByOverall(
  limit: number = 10,
  offset: number = 0
): Promise<LeaderboardWithProfile[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles!leaderboard_user_id_fkey(*)
    `)
    .order('overall_score', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching top users by overall:', error)
    return []
  }

  return (data || []).map((entry, index) => ({
    ...entry,
    rank: offset + index + 1,
    profile: entry.profile
  })) as LeaderboardWithProfile[]
}

/**
 * Get user rank by overall score
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .rpc('get_user_rank', { p_user_id: userId })

  if (error) {
    console.error('Error getting user rank:', error)
    return null
  }

  return data as number
}

/**
 * Update leaderboard after completing a book
 */
export async function updateLeaderboardAfterCompletion(
  userId: string,
  sessionWpm: number,
  charsTyped: number,
  durationSeconds: number
): Promise<Leaderboard | null> {
  const supabase = createServerClient()
  
  // Get current entry
  const current = await getLeaderboardEntry(userId)
  
  if (!current) {
    throw new Error('Leaderboard entry not found')
  }

  // Calculate new average WPM
  const totalSessions = current.books_completed + 1
  const newAverageWpm = ((current.average_wpm * current.books_completed) + sessionWpm) / totalSessions

  // Update entry
  const updates: LeaderboardUpdate = {
    books_completed: current.books_completed + 1,
    average_wpm: Math.round(newAverageWpm * 100) / 100, // Round to 2 decimals
    total_chars_typed: current.total_chars_typed + charsTyped,
    total_time_seconds: current.total_time_seconds + durationSeconds
  }

  return updateLeaderboardEntry(userId, updates)
}

/**
 * Get friends leaderboard (filtered to only friends)
 */
export async function getFriendsLeaderboard(
  userId: string,
  type: 'books' | 'wpm' | 'overall',
  limit: number = 10
): Promise<LeaderboardWithProfile[]> {
  const supabase = createServerClient()
  
  // First get user's friends
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('user_id, friend_id')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (friendsError) {
    console.error('Error fetching friends:', friendsError)
    return []
  }

  // Extract friend IDs
  const friendIds = (friends || []).map(f => 
    f.user_id === userId ? f.friend_id : f.user_id
  )
  
  if (friendIds.length === 0) {
    return []
  }

  // Get leaderboard entries for friends
  let orderBy: string
  switch (type) {
    case 'books':
      orderBy = 'books_completed'
      break
    case 'wpm':
      orderBy = 'average_wpm'
      break
    case 'overall':
      orderBy = 'overall_score'
      break
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles!leaderboard_user_id_fkey(*)
    `)
    .in('user_id', friendIds)
    .order(orderBy, { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching friends leaderboard:', error)
    return []
  }

  return (data || []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
    profile: entry.profile
  })) as LeaderboardWithProfile[]
}

