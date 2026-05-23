// ============================================
// Update Leaderboard API Route
// POST /api/leaderboard/update
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, UpdateLeaderboardRequest } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { updateLeaderboardEntry } from '@/lib/db/leaderboard'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const body: UpdateLeaderboardRequest = await request.json()

    // Prepare updates
    const updates: any = {}
    
    if (body.booksCompleted !== undefined) {
      updates.books_completed = body.booksCompleted
    }
    
    if (body.averageWpm !== undefined) {
      updates.average_wpm = body.averageWpm
    }
    
    if (body.totalCharsTyped !== undefined) {
      updates.total_chars_typed = body.totalCharsTyped
    }
    
    if (body.totalTimeSeconds !== undefined) {
      updates.total_time_seconds = body.totalTimeSeconds
    }

    // Update leaderboard
    const updated = await updateLeaderboardEntry(userId, updates)

    if (!updated) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to update leaderboard',
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
    console.error('Update leaderboard error:', error)
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

