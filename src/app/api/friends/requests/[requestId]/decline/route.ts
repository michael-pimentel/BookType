// ============================================
// Decline Friend Request API Route
// POST /api/friends/requests/[requestId]/decline
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { removeFriendRequest } from '@/lib/db/friends'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const { requestId } = await params

    // Decline friend request
    const success = await removeFriendRequest(requestId, userId)

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to decline friend request',
          data: null
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
        error: null,
        data: null
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Decline friend request error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error.message || 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

