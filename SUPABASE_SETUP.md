# Supabase Setup Guide

Complete guide for setting up and configuring Supabase for the BookType application.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Getting Your API Keys](#getting-your-api-keys)
3. [Environment Configuration](#environment-configuration)
4. [Running Database Migrations](#running-database-migrations)
5. [Verifying Setup](#verifying-setup)
6. [Testing Database Connection](#testing-database-connection)
7. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `BookType` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

### Step 2: Wait for Project to Be Ready

You'll see a progress indicator. Once complete, you'll have:
- ✅ PostgreSQL database
- ✅ Authentication service
- ✅ API endpoints
- ✅ Storage buckets (optional)

---

## Getting Your API Keys

### Step 1: Navigate to API Settings

1. In your Supabase dashboard, go to **Settings** (gear icon)
2. Click **"API"** in the left sidebar

### Step 2: Copy Your Keys

You'll see three important values:

#### 1. Project URL
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```
- This is your project's base URL
- Safe to expose publicly (used in client-side code)

#### 2. anon public Key
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Public API key for client-side operations
- Safe to expose (Row Level Security protects data)
- Used in browser and API routes

#### 3. service_role secret Key
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- ⚠️ **SECRET** - Never commit to version control!
- ⚠️ Bypasses Row Level Security (admin access)
- Only use in secure server-side code
- Required for seed scripts and admin operations

---

## Environment Configuration

### Step 1: Create `.env.local` File

In your project root, create `.env.local`:

```bash
# Copy the example file
cp .env.local.example .env.local
```

### Step 2: Add Your Keys

Open `.env.local` and paste your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Verify File is Ignored

Ensure `.env.local` is in your `.gitignore`:

```gitignore
# Environment variables
.env.local
.env*.local
```

**⚠️ Never commit `.env.local` to version control!**

---

## Running Database Migrations

### Step 1: Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**

### Step 2: Run Migration

1. Open `supabase/migrations/001_initial_schema.sql` in your code editor
2. Copy the **entire contents** of the file
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)

### Step 3: Verify Migration Success

You should see:
```
Success. No rows returned
```

### Step 4: Verify Tables Were Created

1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ `books`
   - ✅ `progress`
   - ✅ `profiles`
   - ✅ `friends`
   - ✅ `leaderboard`
   - ✅ `achievements`
   - ✅ `typing_sessions`

### Step 5: Verify RLS is Enabled

In SQL Editor, run:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('books', 'progress', 'profiles', 'friends', 'leaderboard', 'achievements', 'typing_sessions');
```

All should show `rowsecurity = true`.

---

## Verifying Setup

### Option 1: Use Verification Script

Run the connection test script:

```bash
npx tsx scripts/test-supabase-connection.ts
```

You should see:
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJ...
✅ Server client working - Found X profiles
✅ Leaderboard query working
✅ Books query working
✅ All tables exist
```

### Option 2: Manual Verification

#### Test 1: Check Tables Exist

In Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Should return: `books`, `progress`, `profiles`, `friends`, `leaderboard`, `achievements`, `typing_sessions`

#### Test 2: Check RLS Policies

```sql
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show policies for all tables.

#### Test 3: Check Triggers

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

Should show triggers for `updated_at` columns.

---

## Testing Database Connection

### Local Testing

1. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

2. **Test signup endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123",
       "username": "testuser"
     }'
   ```

3. **Check Supabase dashboard:**
   - Go to **Authentication** → **Users**
   - Should see the new user
   - Go to **Table Editor** → **profiles**
   - Should see profile was created automatically

### Production Testing

1. Deploy your Next.js app with environment variables set
2. Use the same curl commands with your production URL
3. Verify data appears in production Supabase project

---

## Troubleshooting

### Issue: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Solution:**
- Ensure `.env.local` exists in project root
- Check file has correct variable names (no typos)
- Restart Next.js dev server after adding env vars

### Issue: "Table does not exist"

**Solution:**
- Run migration SQL in Supabase SQL Editor
- Verify migration ran successfully (check for errors)
- Check Table Editor to see if tables were created

### Issue: "Row Level Security policy violation"

**Solution:**
- Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'profiles';`
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
- Ensure you're authenticated when making requests
- Verify user ID matches RLS policy conditions

### Issue: "Invalid API key"

**Solution:**
- Double-check keys in `.env.local` match Supabase dashboard
- Ensure no extra spaces or quotes
- Verify you're using the correct project's keys

### Issue: "Service role key missing" (in seed script)

**Solution:**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Get key from Supabase dashboard → Settings → API
- Restart terminal/script after adding

### Issue: Connection timeout

**Solution:**
- Check internet connection
- Verify Supabase project is not paused (free tier pauses after inactivity)
- Check Supabase status page: https://status.supabase.com

---

## Next Steps

After setup is complete:

1. **Seed your database** (optional):
   ```bash
   npx tsx scripts/seed-database.ts
   ```

2. **Start developing:**
   ```bash
   npm run dev
   ```

3. **Test API endpoints:**
   - See `BACKEND_README.md` for API documentation
   - Use curl commands in `QUICK_START.md`

4. **Connect your frontend:**
   - Update frontend components to use `/api/*` routes
   - See `MIGRATION_PLAN.md` for frontend updates

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never committed service role key
- [ ] RLS is enabled on all tables
- [ ] API keys are kept secret
- [ ] Database password is strong and saved securely

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

**Setup complete!** ✅ Your Supabase backend is now ready to use.

