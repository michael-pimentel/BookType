# Quick Start: Migration Checklist

## ✅ Pre-Migration Status

**Backend (Complete):**
- ✅ Database schema created (`supabase/migrations/001_initial_schema.sql`)
- ✅ TypeScript types defined (`src/types/database.ts`, `src/types/api.ts`)
- ✅ Database access layer (`src/lib/db/*.ts`)
- ✅ API routes (`src/app/api/**/*.ts`)
- ✅ Auth middleware (`src/lib/middleware/auth.ts`)
- ✅ Validation utilities (`src/lib/utils/validation.ts`)

**New Files Created:**
- ✅ `src/lib/api-client.ts` - API client utility
- ✅ `src/hooks/useProgressSave.ts` - Debounced progress saving hook
- ✅ `src/app/api/progress/route.ts` - Progress API endpoint

---

## 📋 Step-by-Step Migration

### Step 1: Database Setup (5 minutes)

1. **Open Supabase Dashboard** → SQL Editor
2. **Run Migration:**
   ```sql
   -- Copy and paste contents of:
   supabase/migrations/001_initial_schema.sql
   ```
3. **Verify Tables Created:**
   - Go to Table Editor
   - Check: `profiles`, `friends`, `leaderboard`, `achievements`, `typing_sessions`
4. **Verify RLS Enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('profiles', 'friends', 'leaderboard');
   ```

### Step 2: Install Dependencies (1 minute)

```bash
npm install lodash
npm install --save-dev @types/lodash
```

**Note**: Only if using lodash debounce (alternative to custom hook)

### Step 3: Update Frontend Files (Follow MIGRATION_PLAN.md)

**Priority Order:**

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Replace Supabase auth calls with API client
   - Add username parameter to signUp

2. **Library Page** (`src/app/library/page.tsx`)
   - Keep existing UI, just update data fetching

3. **Typing Page** (`src/app/type/[bookId]/page.tsx`)
   - Replace `saveProgress` with `useProgressSave` hook
   - Use `saveImmediate` on completion

4. **Friends Page** (`src/app/friends/page.tsx`)
   - Replace all mock imports with API calls
   - Add error handling

5. **Leaderboard Page** (`src/app/leaderboard/page.tsx`)
   - Replace mock data with API calls

6. **Profile Page** (`src/app/profile/[username]/page.tsx`)
   - Fetch from API
   - Transform API response to match UI

### Step 4: Test Each Feature

**Test Checklist:**

```bash
# 1. Test Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "username": "testuser"
  }'

# 2. Get Auth Token (from response above)
TOKEN="your_access_token"

# 3. Test Profile Fetch
curl http://localhost:3000/api/profiles/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Test Leaderboard
curl "http://localhost:3000/api/leaderboard?type=overall" \
  -H "Authorization: Bearer $TOKEN"

# 5. Test Friends
curl "http://localhost:3000/api/friends?status=accepted" \
  -H "Authorization: Bearer $TOKEN"

# 6. Test Progress Save
curl -X POST http://localhost:3000/api/progress \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "book-uuid",
    "charsTyped": 1000,
    "completed": false
  }'
```

### Step 5: Remove Mock Files (After All Tests Pass)

**Delete:**
- `src/lib/friendsMock.ts`
- `src/lib/leaderboardMock.ts`
- `src/lib/userProfileMock.ts`
- `src/lib/userBooksMock.ts`

**Remove from imports:**
- Search for `from '@/lib/*Mock'` and remove

---

## 🔍 Verification Steps

### Verify Database

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';

-- Test as anonymous user (should fail)
SET ROLE anon;
SELECT * FROM profiles; -- Should error or return empty
RESET ROLE;
```

### Verify API Endpoints

```bash
# Test all endpoints return proper format
# All should return: { success: boolean, data: T | null, error: string | null }
```

### Verify Frontend

- [ ] Sign up works
- [ ] Sign in works
- [ ] Profile loads
- [ ] Books load in library
- [ ] Typing saves progress (wait 5 seconds)
- [ ] Completion saves immediately
- [ ] Friend requests work
- [ ] Leaderboard loads

---

## 🐛 Common Issues

### Issue: "Unauthorized" errors

**Solution:**
- Check auth token is sent in headers
- Verify token hasn't expired
- Check `api-client.ts` is getting session correctly

### Issue: Progress not saving

**Solution:**
- Wait 5 seconds for debounced save
- Check browser console for errors
- Verify `/api/progress` endpoint works
- Check network tab for failed requests

### Issue: Leaderboard empty

**Solution:**
- Verify users have leaderboard entries
- Check `overall_score` is calculated (trigger should handle this)
- Verify RLS allows reading leaderboard

### Issue: Friend requests fail

**Solution:**
- Check both users exist
- Verify friendship doesn't already exist
- Check friend status enum is correct

---

## 📚 Additional Resources

- **Full Migration Plan**: See `MIGRATION_PLAN.md`
- **Backend Docs**: See `BACKEND_README.md`
- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md`

---

## ⚡ Quick Commands Reference

```bash
# Start dev server
npm run dev

# Run seed script (optional)
npx tsx scripts/seed-database.ts

# Test API endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123","username":"test"}'

# Check for mock file imports
grep -r "Mock" src/app/
```

---

## ✅ Final Checklist

Before going to production:

- [ ] All migrations run successfully
- [ ] RLS policies verified
- [ ] All API endpoints tested
- [ ] All frontend pages migrated
- [ ] Mock files removed
- [ ] Error handling tested
- [ ] Loading states added
- [ ] Toast notifications working
- [ ] Progress saving debounced correctly
- [ ] Completion saves immediately
- [ ] Leaderboard updates on completion

---

**Next Steps**: Follow `MIGRATION_PLAN.md` for detailed file-by-file changes.

