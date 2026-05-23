// ============================================
// Sign In API Route
// POST /api/auth/signin
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { SignInRequest, ApiResponse, AuthResponse } from '@/types/api'
import { isValidEmail } from '@/lib/utils/validation'
import { updateLastLogin } from '@/lib/db/profiles'

export async function POST(request: NextRequest) {
  try {
    const body: SignInRequest = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: 'Email and password are required',
          data: null
        },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: 'Invalid email format',
          data: null
        },
        { status: 400 }
      )
    }

    // Sign in user
    const supabase = createServerClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: authError?.message || 'Invalid credentials',
          data: null
        },
        { status: 401 }
      )
    }

    // Update last login
    await updateLastLogin(authData.user.id)

    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        error: null,
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email || ''
          },
          session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token
          }
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

