// Mock data for User Profile page development
// TODO: Replace with Supabase queries later

export interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  bio: string
  location?: string
  joinDate: string
  genres: string[]
  stats: {
    booksCompleted: number
    avgWPM: number
    totalMinutes: number
    rank: number | null
    totalWords: number
  }
}

export const mockUserProfile: UserProfile = {
  id: 'current',
  username: 'michaelp',
  displayName: 'Michael Pimentel',
  email: 'michael@example.com',
  bio: 'Lover of literature and fast fingers on the keyboard. Always typing through the next great novel.',
  location: 'San Francisco, CA',
  joinDate: '2024-01-15',
  genres: ['Fantasy', 'Sci-Fi', 'Philosophy', 'Classic Literature'],
  stats: {
    booksCompleted: 32,
    avgWPM: 118,
    totalMinutes: 4520,
    rank: 4,
    totalWords: 1250000,
  },
}

