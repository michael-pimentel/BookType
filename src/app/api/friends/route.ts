// ============================================
// Get Friends API Route
// GET /api/friends
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, GetFriendsResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { getFriends } from '@/lib/db/friends'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const searchParams = request.nextUrl.searchParams
    const status = (searchParams.get('status') as 'pending' | 'accepted' | 'blocked') || 'accepted'

    // Get friends
    const friends = await getFriends(userId, status)

    // Format response
    const response: GetFriendsResponse = {
      friends: friends.map(f => ({
        id: f.id,
        username: f.friend_profile.username,
        displayName: f.friend_profile.display_name,
        avatarUrl: f.friend_profile.avatar_url,
        status: f.status,
        isOnline: false, // TODO: Implement online status tracking
        lastSeen: null // TODO: Implement last seen tracking
      }))
    }

    return NextResponse.json<ApiResponse<GetFriendsResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json<ApiResponse<GetFriendsResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

