-- ============================================
-- BookType Database Schema
-- Complete schema for users, profiles, friends, leaderboard
-- ============================================
-- 
-- This migration creates all tables, indexes, RLS policies,
-- triggers, and helper functions needed for the BookType application.
--
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================

-- ============================================
-- BOOKS TABLE
-- Stores book content for typing practice
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for books table
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- ============================================
-- PROGRESS TABLE
-- Tracks user progress on books
-- ============================================
CREATE TABLE IF NOT EXISTS progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chars_typed INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one progress entry per user per book
    CONSTRAINT unique_user_book_progress UNIQUE (user_id, book_id)
);

-- Create indexes for progress table
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_book_id ON progress(book_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON progress(completed);

-- ============================================
-- PROFILES TABLE
-- Extended user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- ============================================
-- FRIENDS TABLE
-- Friend relationships with status tracking
-- ============================================
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE IF NOT EXISTS friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status friend_status DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique friend relationships (bidirectional constraint handled by check)
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT no_self_friend CHECK (user_id != friend_id),
    
    -- Ensure requested_by is one of the two users
    CONSTRAINT valid_requestor CHECK (
        requested_by = user_id OR requested_by = friend_id
    )
);

-- Create index for efficient friend queries
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- ============================================
-- LEADERBOARD TABLE
-- Track user scores and rankings
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Scoring metrics
    books_completed INTEGER DEFAULT 0,
    average_wpm NUMERIC(5, 2) DEFAULT 0,
    total_chars_typed BIGINT DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    
    -- Calculated overall score (computed or stored)
    overall_score NUMERIC(10, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_score_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one entry per user
    CONSTRAINT unique_user_leaderboard UNIQUE (user_id),
    
    -- Ensure non-negative values
    CONSTRAINT non_negative_books CHECK (books_completed >= 0),
    CONSTRAINT non_negative_wpm CHECK (average_wpm >= 0),
    CONSTRAINT non_negative_chars CHECK (total_chars_typed >= 0),
    CONSTRAINT non_negative_time CHECK (total_time_seconds >= 0)
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_books ON leaderboard(books_completed DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_wpm ON leaderboard(average_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_overall ON leaderboard(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_updated ON leaderboard(last_score_update DESC);

-- ============================================
-- ACHIEVEMENTS TABLE (for future expansion)
-- ============================================
CREATE TYPE achievement_type AS ENUM (
    'first_book', 'speed_demon', 'bookworm', 
    'perfect_typer', 'streak_master', 'social_butterfly'
);

CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type achievement_type NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- ============================================
-- TYPING SESSIONS TABLE (for detailed stats)
-- Track individual typing sessions
-- ============================================
CREATE TABLE IF NOT EXISTS typing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    wpm NUMERIC(5, 2),
    accuracy NUMERIC(5, 2),
    chars_typed INTEGER,
    errors INTEGER,
    duration_seconds INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_typing_sessions_user_id ON typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_book_id ON typing_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_started ON typing_sessions(started_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOOKS POLICIES
-- ============================================
-- Anyone can view all books
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
CREATE POLICY "Books are viewable by everyone" ON books
    FOR SELECT USING (true);

-- Users can insert their own books
DROP POLICY IF EXISTS "Users can insert their own books" ON books;
CREATE POLICY "Users can insert their own books" ON books
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own books
DROP POLICY IF EXISTS "Users can update their own books" ON books;
CREATE POLICY "Users can update their own books" ON books
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own books
DROP POLICY IF EXISTS "Users can delete their own books" ON books;
CREATE POLICY "Users can delete their own books" ON books
    FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- PROGRESS POLICIES
-- ============================================
-- Users can view their own progress
DROP POLICY IF EXISTS "Users can view their own progress" ON progress;
CREATE POLICY "Users can view their own progress" ON progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
DROP POLICY IF EXISTS "Users can insert their own progress" ON progress;
CREATE POLICY "Users can insert their own progress" ON progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
DROP POLICY IF EXISTS "Users can update their own progress" ON progress;
CREATE POLICY "Users can update their own progress" ON progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own progress
DROP POLICY IF EXISTS "Users can delete their own progress" ON progress;
CREATE POLICY "Users can delete their own progress" ON progress
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Anyone can view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FRIENDS POLICIES
-- ============================================
-- Users can view their own friend relationships
DROP POLICY IF EXISTS "Users can view their own friendships" ON friends;
CREATE POLICY "Users can view their own friendships" ON friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friend requests
DROP POLICY IF EXISTS "Users can create friend requests" ON friends;
CREATE POLICY "Users can create friend requests" ON friends
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can update friend requests they're involved in
DROP POLICY IF EXISTS "Users can update their friendships" ON friends;
CREATE POLICY "Users can update their friendships" ON friends
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete their own friend relationships
DROP POLICY IF EXISTS "Users can delete their friendships" ON friends;
CREATE POLICY "Users can delete their friendships" ON friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================
-- LEADERBOARD POLICIES
-- ============================================
-- Anyone can view leaderboard
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON leaderboard;
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard
    FOR SELECT USING (true);

-- Users can insert their own leaderboard entry
DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON leaderboard;
CREATE POLICY "Users can insert their own leaderboard entry" ON leaderboard
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own leaderboard entry
DROP POLICY IF EXISTS "Users can update their own leaderboard entry" ON leaderboard;
CREATE POLICY "Users can update their own leaderboard entry" ON leaderboard
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- ACHIEVEMENTS POLICIES
-- ============================================
-- Users can view all achievements
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone" ON achievements
    FOR SELECT USING (true);

-- Users can insert their own achievements
DROP POLICY IF EXISTS "Users can insert their own achievements" ON achievements;
CREATE POLICY "Users can insert their own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TYPING SESSIONS POLICIES
-- ============================================
-- Users can view their own typing sessions
DROP POLICY IF EXISTS "Users can view their own typing sessions" ON typing_sessions;
CREATE POLICY "Users can view their own typing sessions" ON typing_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own typing sessions
DROP POLICY IF EXISTS "Users can insert their own typing sessions" ON typing_sessions;
CREATE POLICY "Users can insert their own typing sessions" ON typing_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own typing sessions
DROP POLICY IF EXISTS "Users can update their own typing sessions" ON typing_sessions;
CREATE POLICY "Users can update their own typing sessions" ON typing_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update last_login in profiles
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET last_login = NOW() 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate overall_score
CREATE OR REPLACE FUNCTION calculate_overall_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Formula: (Books × 10) + (WPM ÷ 2)
    NEW.overall_score := (NEW.books_completed * 10) + (NEW.average_wpm / 2);
    NEW.last_score_update = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create leaderboard entry on profile creation
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO leaderboard (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- Update triggers for updated_at
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_progress_updated_at ON progress;
CREATE TRIGGER update_progress_updated_at 
    BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friends_updated_at ON friends;
CREATE TRIGGER update_friends_updated_at 
    BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at 
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate overall_score before insert/update
DROP TRIGGER IF EXISTS calculate_leaderboard_score ON leaderboard;
CREATE TRIGGER calculate_leaderboard_score
    BEFORE INSERT OR UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION calculate_overall_score();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user rank by overall score
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_rank INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO v_rank
    FROM leaderboard
    WHERE overall_score > (
        SELECT overall_score 
        FROM leaderboard 
        WHERE user_id = p_user_id
    );
    RETURN v_rank;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(p_user_id UUID, p_friend_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM friends
        WHERE ((user_id = p_user_id AND friend_id = p_friend_id)
            OR (user_id = p_friend_id AND friend_id = p_user_id))
        AND status = 'accepted'
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

