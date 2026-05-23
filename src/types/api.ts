// ============================================
// API Request/Response Types
// TypeScript types for all API endpoints
// ============================================

import { Profile, Friend, Leaderboard, Achievement, TypingSession } from './database'

// ============================================
// Common API Types
// ============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

// ============================================
// Authentication Types
// ============================================

export interface SignUpRequest {
  email: string
  password: string
  username: string
  displayName?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
  }
  session: {
    access_token: string
    refresh_token: string
  }
}

// ============================================
// Profile Types
// ============================================

export interface UpdateProfileRequest {
  username?: string
  displayName?: string
  avatarUrl?: string
  bio?: string
}

export interface ProfileResponse extends Profile {
  leaderboard?: Leaderboard
  achievements?: Achievement[]
  friendsCount?: number
  isFriend?: boolean
  friendshipStatus?: 'pending' | 'accepted' | 'blocked' | null
}

export interface SearchUsersRequest {
  query: string
  limit?: number
}

export interface SearchUsersResponse {
  users: Array<{
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    isFriend?: boolean
    friendshipStatus?: 'pending' | 'accepted' | 'blocked' | null
  }>
}

// ============================================
// Friends Types
// ============================================

export interface FriendRequestRequest {
  friendId: string
}

export interface FriendRequestResponse {
  friendRequest: Friend
}

export interface AcceptFriendRequestRequest {
  friendRequestId: string
}

export interface GetFriendsResponse {
  friends: Array<{
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    status: 'pending' | 'accepted' | 'blocked'
    isOnline?: boolean
    lastSeen?: string
  }>
}

export interface GetFriendRequestsResponse {
  incoming: Array<{
    id: string
    fromUserId: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    createdAt: string
  }>
  outgoing: Array<{
    id: string
    toUserId: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    createdAt: string
  }>
}

// ============================================
// Leaderboard Types
// ============================================

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  booksCompleted: number
  averageWpm: number
  overallScore: number
}

export interface GetLeaderboardRequest {
  type?: 'books' | 'wpm' | 'overall'
  timeRange?: 'week' | 'month' | 'allTime'
  limit?: number
  offset?: number
  friendsOnly?: boolean
}

export interface GetLeaderboardResponse {
  entries: LeaderboardEntry[]
  currentUserRank?: number
  total: number
}

export interface UpdateLeaderboardRequest {
  booksCompleted?: number
  averageWpm?: number
  totalCharsTyped?: number
  totalTimeSeconds?: number
}

// ============================================
// Typing Session Types
// ============================================

export interface CreateTypingSessionRequest {
  bookId?: string
  startedAt?: string
}

export interface UpdateTypingSessionRequest {
  wpm?: number
  accuracy?: number
  charsTyped?: number
  errors?: number
  durationSeconds?: number
  completed?: boolean
}

export interface TypingSessionResponse extends TypingSession {
  bookTitle?: string
}

// ============================================
// Achievement Types
// ============================================

export interface UnlockAchievementRequest {
  achievementType: Achievement['achievement_type']
}

export interface GetAchievementsResponse {
  achievements: Achievement[]
}

