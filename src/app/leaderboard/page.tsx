'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Zap,
  Award,
  Trophy,
  Clock,
  User,
  Share2,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

type LeaderboardType = 'books' | 'wpm' | 'overall'
type ViewMode = 'global' | 'friends'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  booksCompleted: number
  averageWpm: number
  overallScore: number
}

const podiumConfig = [
  { position: 2, class: 'order-2 lg:order-1' },
  { position: 1, class: 'order-1 lg:order-2' },
  { position: 3, class: 'order-3 lg:order-3' },
]

const podiumColors = [
  { bg: 'from-gray-300 to-slate-400', border: 'border-gray-400', icon: '🥈' },
  { bg: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', icon: '🥇' },
  { bg: 'from-orange-400 to-amber-600', border: 'border-orange-400', icon: '🥉' },
]

const podiumHeights = ['h-32', 'h-40', 'h-28']

function getUserInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getDisplayName(entry: LeaderboardEntry) {
  return entry.displayName || entry.username
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('global')
  const [activeTab, setActiveTab] = useState<LeaderboardType>('books')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchLeaderboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, viewMode, user])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: activeTab,
        friendsOnly: String(viewMode === 'friends'),
        limit: '50',
      })
      const res = await fetch(`/api/leaderboard?${params}`)
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        setEntries(json.data.entries)
        setCurrentUserRank(json.data.currentUserRank || null)
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e)
    } finally {
      setLoading(false)
    }
  }

  const currentUserEntry = useMemo(
    () => entries.find((e) => e.userId === user?.id) || null,
    [entries, user]
  )

  const topThree = entries.slice(0, 3)
  const remainingUsers = entries.slice(3)

  const getTabValue = (entry: LeaderboardEntry): number => {
    switch (activeTab) {
      case 'books': return entry.booksCompleted
      case 'wpm': return Math.round(entry.averageWpm)
      case 'overall': return Math.round(entry.overallScore)
    }
  }

  const getTabUnit = (): string => {
    switch (activeTab) {
      case 'books': return 'books'
      case 'wpm': return 'WPM'
      case 'overall': return 'score'
    }
  }

  const TabIcon = activeTab === 'books' ? BookOpen : activeTab === 'wpm' ? Zap : Award

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

  const renderPodium = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }
    if (topThree.length < 3) {
      return (
        <p className="text-center text-muted-foreground py-8">
          {viewMode === 'friends' ? 'Not enough friends on the leaderboard yet.' : 'Not enough users yet.'}
        </p>
      )
    }
    return (
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-center">Top 3 Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
            {podiumConfig.map((config, index) => {
              const entry = topThree[config.position - 1]
              const podium = podiumColors[config.position - 1]
              const height = podiumHeights[config.position - 1]
              const name = getDisplayName(entry)
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={config.class}
                >
                  <Card className={`bg-gradient-to-b ${podium.bg} border-2 ${podium.border} shadow-lg hover:shadow-xl transition-all ${height} flex flex-col justify-end min-h-[280px] sm:min-h-[320px]`}>
                    <CardContent className="p-4 pb-6 text-center flex flex-col justify-end h-full">
                      <div className="text-3xl mb-3">{podium.icon}</div>
                      <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-background shadow-md">
                        <AvatarImage src={entry.avatarUrl || undefined} alt={name} />
                        <AvatarFallback className="bg-background/20 text-background font-bold">
                          {getUserInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-bold text-background text-sm truncate mb-1">{name}</p>
                      <p className="text-background/90 text-xs mb-2">@{entry.username}</p>
                      <div className="bg-background/20 rounded-lg px-3 py-1">
                        <p className="text-2xl font-bold text-background">{getTabValue(entry)}</p>
                        <p className="text-xs text-background/90">{getTabUnit()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTable = (columns: { label: string; render: (e: LeaderboardEntry) => React.ReactNode }[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }
    if (remainingUsers.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No additional users to show.</p>
    }
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>User</TableHead>
              {columns.map((c) => (
                <TableHead key={c.label} className="text-right">{c.label}</TableHead>
              ))}
              <TableHead className="text-right">Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remainingUsers.map((entry, index) => {
              const rank = index + 4
              const isCurrentUser = entry.userId === user?.id
              const name = getDisplayName(entry)
              return (
                <TableRow
                  key={entry.userId}
                  className={isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''}
                >
                  <TableCell className="font-semibold">#{rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatarUrl || undefined} alt={name} />
                        <AvatarFallback>{getUserInitials(name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">@{entry.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.label} className="text-right">{c.render(entry)}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Link href={`/profile/${entry.username}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-gray-600">Compete with other BookType users and track your progress</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={viewMode === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('global')}
            >
              Global
            </Button>
            <Button
              variant={viewMode === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('friends')}
            >
              Friends
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {/* Your Stats */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Rank</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {loading ? '—' : currentUserRank ? `#${currentUserRank}` : '—'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Books</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {loading ? '—' : currentUserEntry?.booksCompleted ?? '—'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Avg WPM</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {loading ? '—' : currentUserEntry ? Math.round(currentUserEntry.averageWpm) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="mb-2">Leaderboard Rankings</CardTitle>
                <CardDescription>Top performers across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeaderboardType)}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="books" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Most Books</span>
                      <span className="sm:hidden">Books</span>
                    </TabsTrigger>
                    <TabsTrigger value="wpm" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Fastest Typers</span>
                      <span className="sm:hidden">Speed</span>
                    </TabsTrigger>
                    <TabsTrigger value="overall" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span className="hidden sm:inline">Top Overall</span>
                      <span className="sm:hidden">Overall</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="books" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div key="books" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
                        {renderPodium()}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Full Rankings</CardTitle>
                            <CardDescription>Complete leaderboard rankings</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {renderTable([
                              { label: 'Books', render: (e) => <span className="font-semibold">{e.booksCompleted}</span> },
                              { label: 'WPM', render: (e) => <Badge variant="secondary">{Math.round(e.averageWpm)} WPM</Badge> },
                            ])}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="wpm" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div key="wpm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
                        {renderPodium()}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Full Rankings</CardTitle>
                            <CardDescription>Complete leaderboard rankings</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {renderTable([
                              { label: 'WPM', render: (e) => <Badge variant="secondary" className="font-semibold">{Math.round(e.averageWpm)} WPM</Badge> },
                              { label: 'Books', render: (e) => <span className="font-semibold">{e.booksCompleted}</span> },
                            ])}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="overall" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div key="overall" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
                        {renderPodium()}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Full Rankings</CardTitle>
                            <CardDescription>Complete leaderboard rankings</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {renderTable([
                              { label: 'Score', render: (e) => <Badge variant="default" className="font-semibold">{Math.round(e.overallScore)}</Badge> },
                              { label: 'Books', render: (e) => <span className="font-semibold">{e.booksCompleted}</span> },
                              { label: 'WPM', render: (e) => <Badge variant="secondary">{Math.round(e.averageWpm)} WPM</Badge> },
                            ])}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">📚 Most Books</p>
                  <p>Ranked by total books completed.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">⚡ Fastest Typers</p>
                  <p>Ranked by average words per minute.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">🥇 Top Overall</p>
                  <p>Combined score: (Books × 10) + (WPM ÷ 2)</p>
                </div>
              </CardContent>
            </Card>

            {currentUserRank && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/profile/${user?.email?.split('@')[0]}`
                      )
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Profile Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
