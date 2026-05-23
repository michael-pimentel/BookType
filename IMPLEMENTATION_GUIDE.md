# Backend Implementation Guide

## Quick Start

### 1. Database Migration

Run the database migration to create all tables:

```sql
-- In Supabase SQL Editor, run:
supabase/migrations/001_initial_schema.sql
```

This will create:
- ✅ `profiles` table
- ✅ `friends` table
- ✅ `leaderboard` table
- ✅ `achievements` table
- ✅ `typing_sessions` table
- ✅ All RLS policies
- ✅ Helper functions and triggers

### 2. Environment Setup

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Testing the API

#### Sign Up a User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "username": "testuser",
    "displayName": "Test User"
  }'
```

#### Get Profile

```bash
curl http://localhost:3000/api/profiles/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## File Structure Summary

```
Backend Structure:
├── supabase/migrations/
│   ├── 001_initial_schema.sql    # Complete database schema
│   └── 002_seed_data.sql         # Seed data template
│
├── src/
│   ├── lib/
│   │   ├── db/                   # Database access layer
│   │   │   ├── profiles.ts      # Profile operations
│   │   │   ├── friends.ts        # Friend operations
│   │   │   └── leaderboard.ts    # Leaderboard operations
│   │   ├── middleware/
│   │   │   └── auth.ts           # Authentication middleware
│   │   └── utils/
│   │       └── validation.ts    # Input validation
│   │
│   ├── app/api/                  # API routes
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   ├── signin/route.ts
│   │   │   └── signout/route.ts
│   │   ├── profiles/
│   │   │   ├── me/route.ts       # GET, PATCH
│   │   │   ├── [userId]/route.ts # GET
│   │   │   └── search/route.ts   # GET
│   │   ├── friends/
│   │   │   ├── route.ts          # GET
│   │   │   ├── requests/route.ts # GET, POST
│   │   │   ├── requests/[id]/accept/route.ts
│   │   │   ├── requests/[id]/decline/route.ts
│   │   │   └── [friendId]/route.ts # DELETE
│   │   └── leaderboard/
│   │       ├── route.ts          # GET
│   │       └── update/route.ts   # POST
│   │
│   └── types/
│       ├── database.ts          # Database types
│       └── api.ts                # API types
│
└── scripts/
    └── seed-database.ts         # Seed script
```

---

## Key Features Implemented

### ✅ Authentication
- User signup with email/password
- User signin
- User signout
- Automatic profile creation on signup
- Automatic leaderboard entry creation

### ✅ Profiles
- Get current user profile
- Update profile (username, display name, avatar, bio)
- Get user profile by ID
- Search users by username/display name
- Profile includes stats (leaderboard, achievements, friends count)

### ✅ Friends
- Send friend requests
- Accept/decline friend requests
- Get all friends
- Get incoming/outgoing friend requests
- Remove friends (unfriend)
- Block users (future: unblock)

### ✅ Leaderboard
- Get top users by books completed
- Get top users by WPM
- Get top users by overall score
- Get friends-only leaderboard
- Update leaderboard after book completion
- Get user rank

### ✅ Security
- Row Level Security (RLS) on all tables
- Input validation on all endpoints
- Authentication required for most endpoints
- SQL injection protection via parameterized queries

---

## Usage Examples

### Frontend Integration

```typescript
// Sign up
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    username: 'johndoe',
    displayName: 'John Doe'
  })
})

const { data, error } = await response.json()

// Get leaderboard
const leaderboardResponse = await fetch(
  '/api/leaderboard?type=overall&limit=10',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
)

const { data: leaderboard } = await leaderboardResponse.json()

// Send friend request
await fetch('/api/friends/requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    friendId: 'user-uuid'
  })
})
```

---

## Next Steps

1. **Run Migration**: Execute `001_initial_schema.sql` in Supabase
2. **Test Signup**: Create a test user via the API
3. **Update Frontend**: Connect your existing frontend to use these API routes
4. **Optional Seed**: Run `scripts/seed-database.ts` for sample data

---

## Common Issues

### "Unauthorized" errors
- Ensure you're passing the access token in the Authorization header
- Check that the token hasn't expired

### "Username already taken"
- Usernames must be unique
- Username validation: 3-30 chars, alphanumeric and underscore only

### Database errors
- Ensure all migrations have been run
- Check RLS policies are enabled
- Verify foreign key constraints are working

---

For detailed API documentation, see `BACKEND_README.md`.

