// ============================================
// Leaderboard API Route
// GET /api/leaderboard
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, GetLeaderboardResponse, GetLeaderboardRequest } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import {
  getTopUsersByBooks,
  getTopUsersByWpm,
  getTopUsersByOverall,
  getUserRank,
  getFriendsLeaderboard
} from '@/lib/db/leaderboard'
import { validatePagination } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const searchParams = request.nextUrl.searchParams
    
    const type = (searchParams.get('type') as 'books' | 'wpm' | 'overall') || 'overall'
    const timeRange = (searchParams.get('timeRange') as 'week' | 'month' | 'allTime') || 'allTime'
    const friendsOnly = searchParams.get('friendsOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { limit: validatedLimit, offset: validatedOffset } = validatePagination(limit, offset)

    // Get leaderboard entries
    let entries: any[]

    if (friendsOnly) {
      // Get friends-only leaderboard
      entries = await getFriendsLeaderboard(userId, type, validatedLimit)
    } else {
      // Get global leaderboard
      switch (type) {
        case 'books':
          entries = await getTopUsersByBooks(validatedLimit, validatedOffset)
          break
        case 'wpm':
          entries = await getTopUsersByWpm(validatedLimit, validatedOffset)
          break
        case 'overall':
        default:
          entries = await getTopUsersByOverall(validatedLimit, validatedOffset)
          break
      }
    }

    // Format response
    const formattedEntries = entries.map(entry => ({
      rank: entry.rank || 0,
      userId: entry.user_id,
      username: entry.profile.username,
      displayName: entry.profile.display_name,
      avatarUrl: entry.profile.avatar_url,
      booksCompleted: entry.books_completed,
      averageWpm: parseFloat(entry.average_wpm.toString()),
      overallScore: parseFloat(entry.overall_score.toString())
    }))

    // Get current user's rank
    const currentUserRank = await getUserRank(userId)

    // TODO: Filter by timeRange (week/month) - this would require additional queries
    // For now, we return all-time data

    const response: GetLeaderboardResponse = {
      entries: formattedEntries,
      currentUserRank: currentUserRank || undefined,
      total: formattedEntries.length
    }

    return NextResponse.json<ApiResponse<GetLeaderboardResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json<ApiResponse<GetLeaderboardResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

