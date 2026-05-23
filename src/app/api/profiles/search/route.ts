// ============================================
// Search Users API Route
// GET /api/profiles/search?query=username
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, SearchUsersResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { searchProfiles } from '@/lib/db/profiles'
import { getFriendship } from '@/lib/db/friends'
import { validatePagination } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const currentUserId = authResult.id
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json<ApiResponse<SearchUsersResponse>>(
        {
          success: false,
          error: 'Query must be at least 2 characters',
          data: null
        },
        { status: 400 }
      )
    }

    const { limit: validatedLimit } = validatePagination(limit)

    // Search profiles
    const profiles = await searchProfiles(query, validatedLimit)

    // Get friendship status for each user
    const usersWithFriendshipStatus = await Promise.all(
      profiles
        .filter(p => p.id !== currentUserId) // Exclude current user
        .map(async (profile) => {
          const friendship = await getFriendship(currentUserId, profile.id)
          
          return {
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url,
            isFriend: friendship?.status === 'accepted' || false,
            friendshipStatus: friendship?.status || null
          }
        })
    )

    const response: SearchUsersResponse = {
      users: usersWithFriendshipStatus
    }

    return NextResponse.json<ApiResponse<SearchUsersResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Search users error:', error)
    return NextResponse.json<ApiResponse<SearchUsersResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

