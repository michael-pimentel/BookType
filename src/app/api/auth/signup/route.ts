// ============================================
// Sign Up API Route
// POST /api/auth/signup
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { SignUpRequest, ApiResponse, AuthResponse } from '@/types/api'
import { validateUsername, isValidEmail, isValidPassword } from '@/lib/utils/validation'
import { upsertProfile } from '@/lib/db/profiles'

export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json()
    const { email, password, username, displayName } = body

    // Validation
    if (!email || !password || !username) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: 'Email, password, and username are required',
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

    if (!isValidPassword(password)) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
          data: null
        },
        { status: 400 }
      )
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: usernameValidation.error || 'Invalid username',
          data: null
        },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const supabase = createServerClient()
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingProfile) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: 'Username is already taken',
          data: null
        },
        { status: 409 }
      )
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username
        }
      }
    })

    if (authError || !authData.user) {
      return NextResponse.json<ApiResponse<AuthResponse>>(
        {
          success: false,
          error: authError?.message || 'Failed to create user',
          data: null
        },
        { status: 400 }
      )
    }

    // Create profile (trigger should handle this, but we ensure it exists)
    await upsertProfile({
      id: authData.user.id,
      username,
      display_name: displayName || username
    })

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
            access_token: authData.session?.access_token || '',
            refresh_token: authData.session?.refresh_token || ''
          }
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sign up error:', error)
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

