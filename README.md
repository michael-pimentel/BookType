# BookType

Type out your favorite books. A typing practice app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## What it does

- Browse and manage a library of books
- Real-time typing practice with live WPM, accuracy, and progress tracking
- Auto-save progress as you type
- Leaderboard and friends system
- User authentication with email/password and Google OAuth

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes + Supabase (PostgreSQL, Auth, RLS)
- **UI**: shadcn/ui, Lucide React

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 2. Clone and install

```bash
git clone https://github.com/michael-pimentel/BookType.git
cd BookType
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key (keep secret) |

### 4. Run the database migration

1. Open your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Optionally run `supabase/migrations/002_seed_data.sql` to populate sample books

This creates all tables (books, progress, profiles, friends, leaderboard, achievements, typing_sessions), RLS policies, triggers, and helper functions.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Utility scripts

```bash
# Verify database connection and table setup
npx tsx scripts/test-supabase-connection.ts

# Seed sample data (requires existing users)
npx tsx scripts/seed-database.ts
```

---

## Database Schema

Seven tables — all protected by Row Level Security:

| Table | Purpose |
|---|---|
| `books` | Book content for typing practice |
| `progress` | Per-user, per-book typing progress |
| `profiles` | Extended user profile info |
| `friends` | Friend relationships (pending/accepted/blocked) |
| `leaderboard` | Per-user scores (WPM, books completed, overall) |
| `achievements` | Unlockable badges |
| `typing_sessions` | Individual session stats for detailed analytics |

New users automatically get a `profiles` row and a `leaderboard` row via database triggers on signup.

---

## Deployment

1. Push to GitHub. Connect to [Vercel](https://vercel.com) for automatic deploys.
2. Add the same three environment variables in Vercel → Project → Settings → Environment Variables.
3. Ensure your Supabase project's **Auth → URL Configuration** includes your production domain in the redirect URLs (needed for Google OAuth and magic links).

---

## Roadmap

- [ ] Wire friends/leaderboard/profile pages to real API (currently uses mock data)
- [ ] Fix OAuth callback route (`src/app/auth/callback/route.ts`) to use `@supabase/ssr`
- [ ] Text highlighting for typing errors
- [ ] Mobile-optimized layout
- [ ] Advanced typing analytics
