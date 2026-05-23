// ============================================
// Database Type Definitions
// Complete TypeScript types for all tables
// ============================================

export interface Database {
  public: {
    Tables: {
      // Existing tables
      books: {
        Row: {
          id: string
          title: string
          author: string
          content: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          content: string
          created_by: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          content?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          chars_typed: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          chars_typed?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          chars_typed?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      
      // New tables
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          requested_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          requested_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          requested_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          books_completed: number
          average_wpm: number
          total_chars_typed: number
          total_time_seconds: number
          overall_score: number
          created_at: string
          updated_at: string
          last_score_update: string
        }
        Insert: {
          id?: string
          user_id: string
          books_completed?: number
          average_wpm?: number
          total_chars_typed?: number
          total_time_seconds?: number
          overall_score?: number
          created_at?: string
          updated_at?: string
          last_score_update?: string
        }
        Update: {
          id?: string
          user_id?: string
          books_completed?: number
          average_wpm?: number
          total_chars_typed?: number
          total_time_seconds?: number
          overall_score?: number
          created_at?: string
          updated_at?: string
          last_score_update?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: 'first_book' | 'speed_demon' | 'bookworm' | 'perfect_typer' | 'streak_master' | 'social_butterfly'
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: 'first_book' | 'speed_demon' | 'bookworm' | 'perfect_typer' | 'streak_master' | 'social_butterfly'
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: 'first_book' | 'speed_demon' | 'bookworm' | 'perfect_typer' | 'streak_master' | 'social_butterfly'
          unlocked_at?: string
        }
      }
      typing_sessions: {
        Row: {
          id: string
          user_id: string
          book_id: string | null
          wpm: number | null
          accuracy: number | null
          chars_typed: number | null
          errors: number | null
          duration_seconds: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id?: string | null
          wpm?: number | null
          accuracy?: number | null
          chars_typed?: number | null
          errors?: number | null
          duration_seconds?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string | null
          wpm?: number | null
          accuracy?: number | null
          chars_typed?: number | null
          errors?: number | null
          duration_seconds?: number | null
          started_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_rank: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      are_friends: {
        Args: {
          p_user_id: string
          p_friend_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      friend_status: 'pending' | 'accepted' | 'blocked'
      achievement_type: 'first_book' | 'speed_demon' | 'bookworm' | 'perfect_typer' | 'streak_master' | 'social_butterfly'
    }
  }
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Friend = Database['public']['Tables']['friends']['Row']
export type FriendInsert = Database['public']['Tables']['friends']['Insert']
export type FriendUpdate = Database['public']['Tables']['friends']['Update']

export type Leaderboard = Database['public']['Tables']['leaderboard']['Row']
export type LeaderboardInsert = Database['public']['Tables']['leaderboard']['Insert']
export type LeaderboardUpdate = Database['public']['Tables']['leaderboard']['Update']

export type Achievement = Database['public']['Tables']['achievements']['Row']
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert']

export type TypingSession = Database['public']['Tables']['typing_sessions']['Row']
export type TypingSessionInsert = Database['public']['Tables']['typing_sessions']['Insert']

export type Book = Database['public']['Tables']['books']['Row']
export type BookInsert = Database['public']['Tables']['books']['Insert']
export type BookUpdate = Database['public']['Tables']['books']['Update']

export type Progress = Database['public']['Tables']['progress']['Row']
export type ProgressInsert = Database['public']['Tables']['progress']['Insert']
export type ProgressUpdate = Database['public']['Tables']['progress']['Update']

// Extended types with relationships
export interface ProfileWithStats extends Profile {
  leaderboard?: Leaderboard
  achievements?: Achievement[]
  friends_count?: number
}

export interface LeaderboardWithProfile extends Leaderboard {
  profile: Profile
  rank?: number
}

export interface FriendWithProfile extends Friend {
  friend_profile: Profile
  user_profile: Profile
}
