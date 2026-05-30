// ============================================
// Get User Profile by ID API Route
// GET /api/profiles/[userId]
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, ProfileResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { getProfileWithStats } from '@/lib/db/profiles'
import { getFriendship } from '@/lib/db/friends'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const currentUserId = authResult.id
    const { userId } = await params

    // Get profile
    const profile = await getProfileWithStats(userId)

    if (!profile) {
      return NextResponse.json<ApiResponse<ProfileResponse>>(
        {
          success: false,
          error: 'Profile not found',
          data: null
        },
        { status: 404 }
      )
    }

    // Get friendship status if not viewing own profile
    let isFriend = false
    let friendshipStatus: 'pending' | 'accepted' | 'blocked' | null = null

    if (currentUserId !== userId) {
      const friendship = await getFriendship(currentUserId, userId)
      if (friendship) {
        isFriend = friendship.status === 'accepted'
        friendshipStatus = friendship.status
      }
    }

    const response: ProfileResponse = {
      ...profile,
      friendsCount: profile.friends_count,
      isFriend,
      friendshipStatus
    }

    return NextResponse.json<ApiResponse<ProfileResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json<ApiResponse<ProfileResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

