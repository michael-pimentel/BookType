// ============================================
// Friends Database Access Layer
// Reusable functions for friend operations
// ============================================

import { createServerClient } from '@/lib/supabase'
import { Friend, FriendInsert, FriendUpdate } from '@/types/database'
import { Profile } from '@/types/database'

/**
 * Check if two users are friends
 */
export async function areFriends(
  userId: string,
  friendId: string
): Promise<boolean> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .rpc('are_friends', {
      p_user_id: userId,
      p_friend_id: friendId
    })

  if (error) {
    console.error('Error checking friendship:', error)
    return false
  }

  return data === true
}

/**
 * Get friend relationship between two users
 */
export async function getFriendship(
  userId: string,
  friendId: string
): Promise<Friend | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No friendship found
      return null
    }
    console.error('Error fetching friendship:', error)
    return null
  }

  return data
}

/**
 * Get all friends for a user
 */
export async function getFriends(
  userId: string,
  status: 'pending' | 'accepted' | 'blocked' = 'accepted'
): Promise<Array<Friend & { friend_profile: Profile }>> {
  const supabase = createServerClient()
  
  // Get friends where user is user_id
  const { data: friendsAsUser, error: error1 } = await supabase
    .from('friends')
    .select(`
      *,
      friend_profile:profiles!friends_friend_id_fkey(*)
    `)
    .eq('user_id', userId)
    .eq('status', status)

  // Get friends where user is friend_id
  const { data: friendsAsFriend, error: error2 } = await supabase
    .from('friends')
    .select(`
      *,
      user_profile:profiles!friends_user_id_fkey(*)
    `)
    .eq('friend_id', userId)
    .eq('status', status)

  if (error1 || error2) {
    console.error('Error fetching friends:', error1 || error2)
    return []
  }

  // Combine and normalize
  const allFriends = [
    ...(friendsAsUser || []).map(f => ({
      ...f,
      friend_profile: f.friend_profile
    })),
    ...(friendsAsFriend || []).map(f => ({
      ...f,
      friend_profile: f.user_profile
    }))
  ]

  return allFriends as Array<Friend & { friend_profile: Profile }>
}

/**
 * Get incoming friend requests
 */
export async function getIncomingFriendRequests(
  userId: string
): Promise<Array<Friend & { user_profile: Profile }>> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      user_profile:profiles!friends_user_id_fkey(*)
    `)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .eq('requested_by', 'user_id') // Only requests where user is the recipient

  if (error) {
    console.error('Error fetching incoming friend requests:', error)
    return []
  }

  return (data || []) as Array<Friend & { user_profile: Profile }>
}

/**
 * Get outgoing friend requests
 */
export async function getOutgoingFriendRequests(
  userId: string
): Promise<Array<Friend & { friend_profile: Profile }>> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend_profile:profiles!friends_friend_id_fkey(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .eq('requested_by', userId) // Only requests initiated by user

  if (error) {
    console.error('Error fetching outgoing friend requests:', error)
    return []
  }

  return (data || []) as Array<Friend & { friend_profile: Profile }>
}

/**
 * Send friend request
 */
export async function sendFriendRequest(
  userId: string,
  friendId: string
): Promise<Friend | null> {
  const supabase = createServerClient()
  
  // Check if friendship already exists
  const existing = await getFriendship(userId, friendId)
  if (existing) {
    throw new Error('Friendship already exists')
  }

  const friendRequest: FriendInsert = {
    user_id: userId,
    friend_id: friendId,
    status: 'pending',
    requested_by: userId
  }

  const { data, error } = await supabase
    .from('friends')
    .insert(friendRequest)
    .select()
    .single()

  if (error) {
    console.error('Error sending friend request:', error)
    return null
  }

  return data
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(
  friendshipId: string,
  userId: string
): Promise<Friend | null> {
  const supabase = createServerClient()
  
  // Verify the request exists and user is the recipient
  const friendship = await supabase
    .from('friends')
    .select('*')
    .eq('id', friendshipId)
    .single()

  if (friendship.error || !friendship.data) {
    throw new Error('Friend request not found')
  }

  const friendData = friendship.data
  const isRecipient = friendData.friend_id === userId || friendData.user_id === userId
  
  if (!isRecipient) {
    throw new Error('Unauthorized to accept this request')
  }

  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .select()
    .single()

  if (error) {
    console.error('Error accepting friend request:', error)
    return null
  }

  return data
}

/**
 * Decline or cancel friend request
 */
export async function removeFriendRequest(
  friendshipId: string,
  userId: string
): Promise<boolean> {
  const supabase = createServerClient()
  
  // Verify user is involved in the friendship
  const friendship = await supabase
    .from('friends')
    .select('*')
    .eq('id', friendshipId)
    .single()

  if (friendship.error || !friendship.data) {
    throw new Error('Friend request not found')
  }

  const friendData = friendship.data
  const isInvolved = friendData.user_id === userId || friendData.friend_id === userId
  
  if (!isInvolved) {
    throw new Error('Unauthorized to remove this friendship')
  }

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendshipId)

  if (error) {
    console.error('Error removing friend request:', error)
    return false
  }

  return true
}

/**
 * Remove friend (unfriend)
 */
export async function removeFriend(
  userId: string,
  friendId: string
): Promise<boolean> {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)

  if (error) {
    console.error('Error removing friend:', error)
    return false
  }

  return true
}

/**
 * Block user
 */
export async function blockUser(
  userId: string,
  blockUserId: string
): Promise<Friend | null> {
  const supabase = createServerClient()
  
  // Check if relationship exists
  const existing = await getFriendship(userId, blockUserId)
  
  if (existing) {
    // Update existing relationship to blocked
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'blocked' })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error blocking user:', error)
      return null
    }

    return data
  } else {
    // Create new blocked relationship
    const block: FriendInsert = {
      user_id: userId,
      friend_id: blockUserId,
      status: 'blocked',
      requested_by: userId
    }

    const { data, error } = await supabase
      .from('friends')
      .insert(block)
      .select()
      .single()

    if (error) {
      console.error('Error blocking user:', error)
      return null
    }

    return data
  }
}

