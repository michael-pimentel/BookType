// ============================================
// Get Current User Profile API Route
// GET /api/profiles/me
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, ProfileResponse, UpdateProfileRequest } from '@/types/api'
import { requireAuth } from '@/lib/middleware/auth'
import { getProfileWithStats, updateProfile, getProfileByUsername } from '@/lib/db/profiles'
import { validateUsername, sanitizeString } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id

    // Get profile with stats
    const profile = await getProfileWithStats(userId)

    if (!profile) {
      return NextResponse.json<ApiResponse<ProfileResponse>>(
        {
          success: false,
          error: 'Profile not found',
          data: null
        },
        { status: 404 }
      )
    }

    // Format response
    const response: ProfileResponse = {
      ...profile,
      friendsCount: profile.friends_count,
      isFriend: false,
      friendshipStatus: null
    }

    return NextResponse.json<ApiResponse<ProfileResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json<ApiResponse<ProfileResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

// ============================================
// Update Current User Profile API Route
// PATCH /api/profiles/me
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const userId = authResult.id
    const body: UpdateProfileRequest = await request.json()

    const updates: any = {}

    // Validate and update username if provided
    if (body.username !== undefined) {
      const usernameValidation = validateUsername(body.username)
      if (!usernameValidation.valid) {
        return NextResponse.json<ApiResponse<ProfileResponse>>(
          {
            success: false,
            error: usernameValidation.error || 'Invalid username',
            data: null
          },
          { status: 400 }
        )
      }

      // Check if username is taken
      const existing = await getProfileByUsername(body.username)
      if (existing && existing.id !== userId) {
        return NextResponse.json<ApiResponse<ProfileResponse>>(
          {
            success: false,
            error: 'Username is already taken',
            data: null
          },
          { status: 409 }
        )
      }

      updates.username = body.username
    }

    // Update display name
    if (body.displayName !== undefined) {
      updates.display_name = sanitizeString(body.displayName) || null
    }

    // Update avatar URL
    if (body.avatarUrl !== undefined) {
      updates.avatar_url = body.avatarUrl || null
    }

    // Update bio
    if (body.bio !== undefined) {
      updates.bio = sanitizeString(body.bio) || null
    }

    // Apply updates
    const updatedProfile = await updateProfile(userId, updates)

    if (!updatedProfile) {
      return NextResponse.json<ApiResponse<ProfileResponse>>(
        {
          success: false,
          error: 'Failed to update profile',
          data: null
        },
        { status: 400 }
      )
    }

    const response: ProfileResponse = {
      ...updatedProfile,
      isFriend: false,
      friendshipStatus: null
    }

    return NextResponse.json<ApiResponse<ProfileResponse>>(
      {
        success: true,
        error: null,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json<ApiResponse<ProfileResponse>>(
      {
        success: false,
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    )
  }
}

