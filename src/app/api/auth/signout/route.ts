// ============================================
// Sign Out API Route
// POST /api/auth/signout
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { ApiResponse } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult // Return error response
    }

    const supabase = createServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: error.message,
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
    console.error('Sign out error:', error)
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

