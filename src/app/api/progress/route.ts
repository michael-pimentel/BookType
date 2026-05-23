// ============================================
// Progress API Route
// POST /api/progress - Upsert user progress for a book
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { createServerClient } from '@/lib/supabase'

interface ProgressRequest {
  bookId: string
  charsTyped: number
  completed: boolean
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const body: ProgressRequest = await request.json()

    // Validation
    if (!body.bookId || typeof body.charsTyped !== 'number' || typeof body.completed !== 'boolean') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid request body. Expected: {bookId: string, charsTyped: number, completed: boolean}',
          data: null
        },
        { status: 400 }
      )
    }

    if (body.charsTyped < 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'charsTyped must be non-negative',
          data: null
        },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Upsert progress
    const { data, error } = await supabase
      .from('progress')
      .upsert({
        user_id: userId,
        book_id: body.bookId,
        chars_typed: body.charsTyped,
        completed: body.completed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,book_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Progress upsert error:', error)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: error.message,
          data: null
        },
        { status: 400 }
      )
    }

    // If completed, update leaderboard
    if (body.completed) {
      // Get current leaderboard entry
      const { data: leaderboard } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (leaderboard) {
        // Increment books completed
        const newBooksCompleted = (leaderboard.books_completed || 0) + 1

        // Update leaderboard (trigger will recalculate overall_score)
        const { error: leaderboardError } = await supabase
          .from('leaderboard')
          .update({
            books_completed: newBooksCompleted,
            // Note: WPM calculation would ideally come from typing_sessions
            // For now, we only increment books_completed
          })
          .eq('user_id', userId)

        if (leaderboardError) {
          console.error('Error updating leaderboard:', leaderboardError)
          // Don't fail the request if leaderboard update fails
        }
      } else {
        // Create leaderboard entry if it doesn't exist
        await supabase
          .from('leaderboard')
          .insert({
            user_id: userId,
            books_completed: 1
          })
      }
    }

    return NextResponse.json<ApiResponse<any>>(
      {
        success: true,
        error: null,
        data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Progress save error:', error)
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

