import { unstable_cache } from 'next/cache'
import { createAnonSupabase, getServerUser } from '@/lib/supabase-server'
import LibraryClient from './LibraryClient'

// Public book list — cached for 5 min, shared across all users
const getPopularBooks = unstable_cache(
  async () => {
    const db = createAnonSupabase()
    const [{ data: books }, { count }] = await Promise.all([
      db
        .from('books')
        .select('id, title, author, created_by, created_at, updated_at')
        .order('title')
        .limit(24),
      db.from('books').select('*', { count: 'exact', head: true }),
    ])
    return { books: books ?? [], count: count ?? 0 }
  },
  ['popular-books'],
  { revalidate: 300 }
)

export default async function LibraryPage() {
  // Fetch auth + public books in parallel — no sequential waterfalls
  const [{ supabase, user }, { books: popularBooks, count: totalCount }] = await Promise.all([
    getServerUser(),
    getPopularBooks(),
  ])

  // User progress is personal — fetch only when authenticated
  const { data: progressData } = user
    ? await supabase
        .from('progress')
        .select('book_id, chars_typed, completed')
        .eq('user_id', user.id)
    : { data: [] }

  return (
    <LibraryClient
      initialBooks={popularBooks}
      initialProgress={progressData ?? []}
      totalCount={totalCount}
      userId={user?.id ?? null}
    />
  )
}
