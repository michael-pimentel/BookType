// ============================================
// Friend Requests API Routes
// GET /api/friends/requests - Get all requests
// POST /api/friends/requests - Send friend request
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, GetFriendRequestsResponse, FriendRequestRequest, FriendRequestResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { getIncomingFriendRequests, getOutgoingFriendRequests, sendFriendRequest } from '@/lib/db/friends'
import { isValidUUID } from '@/lib/utils/validation'

// GET - Get all friend requests
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id

    // Get incoming and outgoing requests
    const [incoming, outgoing] = await Promise.all([
      getIncomingFriendRequests(userId),
      getOutgoingFriendRequests(userId)
    ])

    // Format response
    const response: GetFriendRequestsResponse = {
      incoming: incoming.map(req => ({
        id: req.id,
        fromUserId: req.user_id,
        username: req.user_profile.username,
        displayName: req.user_profile.display_name,
        avatarUrl: req.user_profile.avatar_url,
        createdAt: req.created_at
      })),
      outgoing: outgoing.map(req => ({
        id: req.id,
        toUserId: req.friend_id,
        username: req.friend_profile.username,
        displayName: req.friend_profile.display_name,
        avatarUrl: req.friend_profile.avatar_url,
        createdAt: req.created_at
      }))
    }

    return NextResponse.json<ApiResponse<GetFriendRequestsResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get friend requests error:', error)
    return NextResponse.json<ApiResponse<GetFriendRequestsResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

// POST - Send friend request
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const body: FriendRequestRequest = await request.json()
    const { friendId } = body

    // Validation
    if (!friendId) {
      return NextResponse.json<ApiResponse<FriendRequestResponse>>(
        {
          success: false,
          error: 'Friend ID is required',
          data: null
        },
        { status: 400 }
      )
    }

    if (!isValidUUID(friendId)) {
      return NextResponse.json<ApiResponse<FriendRequestResponse>>(
        {
          success: false,
          error: 'Invalid friend ID format',
          data: null
        },
        { status: 400 }
      )
    }

    if (userId === friendId) {
      return NextResponse.json<ApiResponse<FriendRequestResponse>>(
        {
          success: false,
          error: 'Cannot send friend request to yourself',
          data: null
        },
        { status: 400 }
      )
    }

    // Send friend request
    const friendRequest = await sendFriendRequest(userId, friendId)

    if (!friendRequest) {
      return NextResponse.json<ApiResponse<FriendRequestResponse>>(
        {
          success: false,
          error: 'Failed to send friend request. It may already exist.',
          data: null
        },
        { status: 400 }
      )
    }

    const response: FriendRequestResponse = {
      friendRequest
    }

    return NextResponse.json<ApiResponse<FriendRequestResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Send friend request error:', error)
    return NextResponse.json<ApiResponse<FriendRequestResponse>>(
      {
        success: false,
        error: error.message || 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

