// ============================================
// Remove Friend API Route
// DELETE /api/friends/[friendId]
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { removeFriend } from '@/lib/db/friends'
import { isValidUUID } from '@/lib/utils/validation'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { friendId: string } }
) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const { friendId } = params

    // Validation
    if (!isValidUUID(friendId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid friend ID format',
          data: null
        },
        { status: 400 }
      )
    }

    // Remove friend
    const success = await removeFriend(userId, friendId)

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to remove friend',
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
  } catch (error) {
    console.error('Remove friend error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

