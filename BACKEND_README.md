# Backend Documentation

Complete backend architecture and API documentation for BookType.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Supabase Configuration](#supabase-configuration)
3. [Database Schema](#database-schema)
4. [API Routes](#api-routes)
5. [Database Access Layer](#database-access-layer)
6. [Testing](#testing)
7. [Frontend Integration](#frontend-integration)

---

## Architecture Overview

### Technology Stack

- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes (App Router)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS)
- **Language**: TypeScript

### Project Structure

```
src/
├── lib/
│   ├── supabase.ts              # Supabase client configuration
│   ├── api-client.ts            # Frontend API client utility
│   ├── db/                      # Database access layer
│   │   ├── profiles.ts
│   │   ├── friends.ts
│   │   └── leaderboard.ts
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   └── utils/
│       └── validation.ts        # Input validation utilities
├── app/
│   └── api/                     # API routes
│       ├── auth/
│       ├── profiles/
│       ├── friends/
│       ├── leaderboard/
│       └── progress/
├── types/
│   ├── database.ts              # Database types
│   └── api.ts                   # API request/response types
└── hooks/
    └── useProgressSave.ts       # Debounced progress saving hook
```

### Key Principles

1. **Separation of Concerns**: Database logic separated from API routes
2. **Type Safety**: Full TypeScript coverage
3. **Security First**: RLS policies on all tables
4. **API Abstraction**: Frontend calls API routes, not Supabase directly
5. **Reusability**: Database functions used across routes

---

## Supabase Configuration

### Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

See `.env.local.example` for details.

### Client Usage

**Client-side (React components):**
```typescript
import { supabase } from '@/lib/supabase'
```

**Server-side (API routes):**
```typescript
import { createServerClient } from '@/lib/supabase'
const supabase = createServerClient()
```

**Admin operations (scripts, seed data):**
```typescript
import { createServiceRoleClient } from '@/lib/supabase'
const supabase = createServiceRoleClient() // Bypasses RLS
```

See `SUPABASE_SETUP.md` for complete setup instructions.

---

## Database Schema

### Tables

#### `books`
Stores book content for typing practice.

```sql
- id (UUID, PK)
- title (TEXT)
- author (TEXT)
- content (TEXT)
- created_by (UUID, FK → auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `progress`
Tracks user progress on books.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- book_id (UUID, FK → books)
- chars_typed (INTEGER)
- completed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(user_id, book_id)
```

#### `profiles`
Extended user profile information.

```sql
- id (UUID, PK, FK → auth.users)
- username (TEXT, UNIQUE)
- display_name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

#### `friends`
Friend relationships with status tracking.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- friend_id (UUID, FK → auth.users)
- status (ENUM: 'pending', 'accepted', 'blocked')
- requested_by (UUID, FK → auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(user_id, friend_id)
```

#### `leaderboard`
User scores and rankings.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users, UNIQUE)
- books_completed (INTEGER)
- average_wpm (NUMERIC)
- total_chars_typed (BIGINT)
- total_time_seconds (INTEGER)
- overall_score (NUMERIC) -- Calculated: (Books × 10) + (WPM ÷ 2)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_score_update (TIMESTAMP)
```

#### `achievements`
User achievements (for future expansion).

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- achievement_type (ENUM)
- unlocked_at (TIMESTAMP)
- UNIQUE(user_id, achievement_type)
```

#### `typing_sessions`
Individual typing sessions (for detailed stats).

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- book_id (UUID, FK → books)
- wpm (NUMERIC)
- accuracy (NUMERIC)
- chars_typed (INTEGER)
- errors (INTEGER)
- duration_seconds (INTEGER)
- started_at (TIMESTAMP)
- completed_at (TIMESTAMP)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow public read access where appropriate (profiles, leaderboard, books)
- Restrict writes to authenticated users only
- Ensure users can only modify their own data

See `supabase/migrations/001_initial_schema.sql` for complete policy definitions.

---

## API Routes

### Authentication

#### `POST /api/auth/signup`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "displayName": "John Doe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "token",
      "refresh_token": "token"
    }
  },
  "error": null
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "username": "testuser"
  }'
```

#### `POST /api/auth/signin`

Sign in an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "session": { "access_token": "token", "refresh_token": "token" }
  },
  "error": null
}
```

#### `POST /api/auth/signout`

Sign out the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### Profiles

#### `GET /api/profiles/me`

Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Bio text",
    "leaderboard": { ... },
    "achievements": [ ... ],
    "friendsCount": 5
  },
  "error": null
}
```

#### `PATCH /api/profiles/me`

Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "newusername", // optional
  "displayName": "New Name", // optional
  "avatarUrl": "https://...", // optional
  "bio": "Updated bio" // optional
}
```

#### `GET /api/profiles/[userId]`

Get a user's profile by ID.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/profiles/search?query=username`

Search for users by username or display name.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `query` (required): Search term
- `limit` (optional): Max results (default: 10)

---

### Friends

#### `GET /api/friends?status=accepted`

Get user's friends.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: `'pending' | 'accepted' | 'blocked'` (default: `'accepted'`)

**Response:**
```json
{
  "success": true,
  "data": {
    "friends": [
      {
        "id": "uuid",
        "username": "friendusername",
        "displayName": "Friend Name",
        "avatarUrl": "https://...",
        "status": "accepted"
      }
    ]
  },
  "error": null
}
```

#### `GET /api/friends/requests`

Get incoming and outgoing friend requests.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "incoming": [ ... ],
    "outgoing": [ ... ]
  },
  "error": null
}
```

#### `POST /api/friends/requests`

Send a friend request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "friendId": "user-uuid"
}
```

#### `POST /api/friends/requests/[requestId]/accept`

Accept a friend request.

**Headers:** `Authorization: Bearer <token>`

#### `POST /api/friends/requests/[requestId]/decline`

Decline a friend request.

**Headers:** `Authorization: Bearer <token>`

#### `DELETE /api/friends/[friendId]`

Remove a friend (unfriend).

**Headers:** `Authorization: Bearer <token>`

---

### Leaderboard

#### `GET /api/leaderboard`

Get leaderboard entries.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type`: `'books' | 'wpm' | 'overall'` (default: `'overall'`)
- `timeRange`: `'week' | 'month' | 'allTime'` (default: `'allTime'`)
- `friendsOnly`: `'true' | 'false'` (default: `'false'`)
- `limit`: number (default: `10`)
- `offset`: number (default: `0`)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "johndoe",
        "displayName": "John Doe",
        "avatarUrl": "https://...",
        "booksCompleted": 15,
        "averageWpm": 95,
        "overallScore": 197.5
      }
    ],
    "currentUserRank": 5,
    "total": 100
  },
  "error": null
}
```

**Example:**
```bash
curl "http://localhost:3000/api/leaderboard?type=overall&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### `POST /api/leaderboard/update`

Update leaderboard entry (typically called after completing a book).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "booksCompleted": 5, // optional
  "averageWpm": 85.5, // optional
  "totalCharsTyped": 50000, // optional
  "totalTimeSeconds": 3600 // optional
}
```

---

### Progress

#### `POST /api/progress`

Upsert user progress for a book (debounced saves recommended).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "bookId": "book-uuid",
  "charsTyped": 5000,
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "book_id": "uuid",
    "chars_typed": 5000,
    "completed": false
  },
  "error": null
}
```

---

## Database Access Layer

The `src/lib/db/` directory contains reusable database functions:

### `profiles.ts`

```typescript
import { getProfile, getProfileWithStats, updateProfile } from '@/lib/db/profiles'

// Get profile
const profile = await getProfile(userId)

// Get profile with extended stats
const profileWithStats = await getProfileWithStats(userId)

// Update profile
const updated = await updateProfile(userId, { bio: 'New bio' })
```

### `friends.ts`

```typescript
import { 
  getFriends, 
  sendFriendRequest, 
  acceptFriendRequest 
} from '@/lib/db/friends'

// Get friends
const friends = await getFriends(userId, 'accepted')

// Send friend request
await sendFriendRequest(userId, friendId)

// Accept friend request
await acceptFriendRequest(requestId, userId)
```

### `leaderboard.ts`

```typescript
import { 
  getTopUsersByOverall,
  getUserRank,
  updateLeaderboardAfterCompletion 
} from '@/lib/db/leaderboard'

// Get top users
const topUsers = await getTopUsersByOverall(10, 0)

// Get user rank
const rank = await getUserRank(userId)

// Update after book completion
await updateLeaderboardAfterCompletion(
  userId, 
  sessionWpm, 
  charsTyped, 
  durationSeconds
)
```

---

## Testing

### Run Connection Test

```bash
npx tsx scripts/test-supabase-connection.ts
```

### Test API Endpoints

See examples in each API route section above, or use:

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123","username":"test"}'

# Get profile (replace TOKEN with actual token)
curl http://localhost:3000/api/profiles/me \
  -H "Authorization: Bearer TOKEN"

# Get leaderboard
curl "http://localhost:3000/api/leaderboard?type=overall" \
  -H "Authorization: Bearer TOKEN"
```

### Seed Database

```bash
npx tsx scripts/seed-database.ts
```

---

## Frontend Integration

### Using the API Client

```typescript
import { apiClient } from '@/lib/api-client'

// GET request
const response = await apiClient.get('/profiles/me')
if (response.success) {
  console.log(response.data)
}

// POST request
const response = await apiClient.post('/friends/requests', {
  friendId: 'user-uuid'
})
```

### Progress Saving (Debounced)

```typescript
import { useProgressSave } from '@/hooks/useProgressSave'

const { saveProgress, saveImmediate } = useProgressSave()

// Debounced save (waits 5 seconds)
saveProgress(userId, bookId, charsTyped, false)

// Immediate save (for completion)
saveImmediate(userId, bookId, charsTyped, true)
```

### Frontend Components to Update

- [ ] `src/contexts/AuthContext.tsx` - Use API routes for auth
- [ ] `src/app/library/page.tsx` - Fetch books from API
- [ ] `src/app/type/[bookId]/page.tsx` - Use `useProgressSave` hook
- [ ] `src/app/leaderboard/page.tsx` - Fetch from `/api/leaderboard`
- [ ] `src/app/friends/page.tsx` - Fetch from `/api/friends`
- [ ] `src/app/profile/[username]/page.tsx` - Fetch from `/api/profiles`

See `MIGRATION_PLAN.md` for detailed frontend migration steps.

---

## Security

- ✅ Row Level Security enabled on all tables
- ✅ Input validation on all endpoints
- ✅ Authentication required for protected routes
- ✅ SQL injection protection (parameterized queries)
- ✅ Password strength validation
- ✅ Username format validation

---

## Deployment

1. **Set environment variables** in your hosting platform
2. **Run migration** in production Supabase project
3. **Verify RLS** is enabled
4. **Test endpoints** with production URLs

See `SUPABASE_SETUP.md` for deployment checklist.

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Backend is production-ready!** ✅
