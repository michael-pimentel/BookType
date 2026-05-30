import { getServerUser } from '@/lib/supabase-server'
import { getTopUsersByOverall, getUserRank } from '@/lib/db/leaderboard'
import LeaderboardClient from './LeaderboardClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LeaderboardPage() {
  const { user } = await getServerUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button className="w-full">Go to Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch initial data (overall tab) and user rank in parallel
  const [initialEntries, currentUserRank] = await Promise.all([
    getTopUsersByOverall(50, 0),
    getUserRank(user.id),
  ])

  const formattedEntries = initialEntries.map((entry) => ({
    rank: entry.rank ?? 0,
    userId: entry.user_id,
    username: (entry.profile as any)?.username ?? '',
    displayName: (entry.profile as any)?.display_name ?? null,
    avatarUrl: (entry.profile as any)?.avatar_url ?? null,
    booksCompleted: entry.books_completed,
    averageWpm: parseFloat(String(entry.average_wpm ?? 0)),
    overallScore: parseFloat(String(entry.overall_score ?? 0)),
  }))

  return (
    <LeaderboardClient
      initialEntries={formattedEntries}
      initialTab="overall"
      currentUserId={user.id}
      currentUserRank={currentUserRank ?? null}
    />
  )
}
