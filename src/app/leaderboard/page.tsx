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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  TrendingUp,
  Clock,
  User,
  Share2,
  ArrowLeft,
} from 'lucide-react'
import {
  mockLeaderboardUsers,
  getUsersByBooks,
  getUsersByWPM,
  getUsersByOverall,
  type LeaderboardUser,
} from '@/lib/leaderboardMock'

type TimeRange = 'week' | 'month' | 'allTime'
type LeaderboardType = 'books' | 'wpm' | 'overall'
type ViewMode = 'global' | 'friends'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('allTime')
  const [viewMode, setViewMode] = useState<ViewMode>('global')
  const [activeTab, setActiveTab] = useState<LeaderboardType>('books')

  // Get current user's data (mock - in real app, fetch from Supabase)
  const currentUserData: LeaderboardUser | null = useMemo(() => {
    if (!user) return null
    // Find or create mock data for current user
    const found = mockLeaderboardUsers.find((u) => u.id === user.id)
    if (found) return found
    // Return a placeholder if user not in mock data
    return {
      id: user.id,
      name: user.email?.split('@')[0] || 'You',
      username: user.email?.split('@')[0] || 'you',
      booksTyped: 5,
      wpm: 95,
      overallScore: 5 * 10 + 95 / 2,
      totalTimeHours: 12,
    }
  }, [user])

  // Get sorted users based on active tab
  const sortedUsers = useMemo(() => {
    // TODO: Replace with Supabase query filtered by timeRange
    let users = [...mockLeaderboardUsers]

    switch (activeTab) {
      case 'books':
        return getUsersByBooks(users)
      case 'wpm':
        return getUsersByWPM(users)
      case 'overall':
        return getUsersByOverall(users)
      default:
        return users
    }
  }, [activeTab, timeRange])

  // Get top 3 for podium
  const topThree = useMemo(() => {
    return sortedUsers.slice(0, 3)
  }, [sortedUsers])

  // Get remaining users (rank 4+)
  const remainingUsers = useMemo(() => {
    return sortedUsers.slice(3)
  }, [sortedUsers])

  // Get current user's rank
  const currentUserRank = useMemo(() => {
    if (!currentUserData) return null
    const index = sortedUsers.findIndex((u) => u.id === currentUserData.id)
    return index >= 0 ? index + 1 : null
  }, [sortedUsers, currentUserData])

  // Get value for current tab
  const getValue = (user: LeaderboardUser): number => {
    switch (activeTab) {
      case 'books':
        return user.booksTyped
      case 'wpm':
        return user.wpm
      case 'overall':
        return Math.round(user.overallScore)
      default:
        return 0
    }
  }

  // Get label for current tab
  const getValueLabel = (): string => {
    switch (activeTab) {
      case 'books':
        return 'Books'
      case 'wpm':
        return 'WPM'
      case 'overall':
        return 'Score'
      default:
        return ''
    }
  }

  // Get icon for current tab
  const getIcon = () => {
    switch (activeTab) {
      case 'books':
        return BookOpen
      case 'wpm':
        return Zap
      case 'overall':
        return Award
      default:
        return Trophy
    }
  }

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Podium configuration
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const TabIcon = getIcon()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-gray-600">
              Compete with other BookType users and track your progress
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
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
          {/* Main Leaderboard - Left Side (3 columns) */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {/* User Stats Panel */}
            {currentUserData && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Rank</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {currentUserRank ? `#${currentUserRank}` : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Books</span>
                      </div>
                      <p className="text-2xl font-bold">{currentUserData.booksTyped}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">WPM</span>
                      </div>
                      <p className="text-2xl font-bold">{currentUserData.wpm}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Hours</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {currentUserData.totalTimeHours || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard Tabs */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="mb-2">Leaderboard Rankings</CardTitle>
                <CardDescription>
                  Top performers across different categories
                </CardDescription>
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

                  {/* Most Books Typed Tab */}
                  <TabsContent value="books" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="books"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {/* Podium */}
                        {topThree.length >= 3 && (
                          <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-xl font-semibold text-center">
                                Top 3 Performers
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
                              {podiumConfig.map((config, index) => {
                                const user = topThree[config.position - 1]
                                const podium = podiumColors[config.position - 1]
                                const height = podiumHeights[config.position - 1]

                                return (
                                  <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className={config.class}
                                  >
                                    <Card
                                      className={`bg-gradient-to-b ${podium.bg} border-2 ${podium.border} shadow-lg hover:shadow-xl transition-all ${height} flex flex-col justify-end min-h-[280px] sm:min-h-[320px]`}
                                    >
                                      <CardContent className="p-4 pb-6 text-center flex flex-col justify-end h-full">
                                        <div className="text-3xl mb-3">{podium.icon}</div>
                                        <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-background shadow-md">
                                          <AvatarImage src={user.avatar} alt={user.name} />
                                          <AvatarFallback className="bg-background/20 text-background font-bold">
                                            {getUserInitials(user.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <p className="font-bold text-background text-sm truncate mb-1">
                                          {user.name}
                                        </p>
                                        <p className="text-background/90 text-xs mb-2">
                                          @{user.username}
                                        </p>
                                        <div className="bg-background/20 rounded-lg px-3 py-1">
                                          <p className="text-2xl font-bold text-background">
                                            {user.booksTyped}
                                          </p>
                                          <p className="text-xs text-background/90">books</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Full Rankings Table */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Full Rankings</CardTitle>
                            <CardDescription>
                              Complete leaderboard rankings
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-lg border bg-card overflow-hidden">
                              <Table>
                                <TableHeader>
                                <TableRow>
                                  <TableHead className="w-16">Rank</TableHead>
                                  <TableHead>User</TableHead>
                                  <TableHead className="text-right">Books</TableHead>
                                  <TableHead className="text-right">WPM</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {remainingUsers.map((user, index) => {
                                  const rank = index + 4
                                  const isCurrentUser = user.id === currentUserData?.id

                                  return (
                                    <motion.tr
                                      key={user.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <TableRow
                                        className={
                                          isCurrentUser
                                            ? 'bg-primary/10 border-l-4 border-l-primary'
                                            : ''
                                        }
                                      >
                                        <TableCell className="font-semibold">
                                          #{rank}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage src={user.avatar} alt={user.name} />
                                              <AvatarFallback>
                                                {getUserInitials(user.name)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium text-sm">{user.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                @{user.username}
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {user.booksTyped}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge variant="secondary">{user.wpm} WPM</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Link href={`/profile/${user.id}`}>
                                            <Button variant="ghost" size="sm">
                                              View
                                            </Button>
                                          </Link>
                                        </TableCell>
                                      </TableRow>
                                    </motion.tr>
                                  )
                                })}
                              </TableBody>
                            </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  {/* Fastest Typers Tab */}
                  <TabsContent value="wpm" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="wpm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {/* Podium */}
                        {topThree.length >= 3 && (
                          <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2 mb-8">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-xl font-semibold text-center">
                                Top 3 Performers
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
                              {podiumConfig.map((config, index) => {
                                const user = topThree[config.position - 1]
                                const podium = podiumColors[config.position - 1]
                                const height = podiumHeights[config.position - 1]

                                return (
                                  <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className={config.class}
                                  >
                                    <Card
                                      className={`bg-gradient-to-b ${podium.bg} border-2 ${podium.border} shadow-lg hover:shadow-xl transition-all ${height} flex flex-col justify-end min-h-[280px] sm:min-h-[320px]`}
                                    >
                                      <CardContent className="p-4 pb-6 text-center flex flex-col justify-end h-full">
                                        <div className="text-3xl mb-3">{podium.icon}</div>
                                        <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-background shadow-md">
                                          <AvatarImage src={user.avatar} alt={user.name} />
                                          <AvatarFallback className="bg-background/20 text-background font-bold">
                                            {getUserInitials(user.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <p className="font-bold text-background text-sm truncate mb-1">
                                          {user.name}
                                        </p>
                                        <p className="text-background/90 text-xs mb-2">
                                          @{user.username}
                                        </p>
                                        <div className="bg-background/20 rounded-lg px-3 py-1">
                                          <p className="text-2xl font-bold text-background">
                                            {user.wpm}
                                          </p>
                                          <p className="text-xs text-background/90">WPM</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Full Rankings Table */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Full Rankings</CardTitle>
                            <CardDescription>
                              Complete leaderboard rankings
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-lg border bg-card overflow-hidden">
                              <Table>
                                <TableHeader>
                                <TableRow>
                                  <TableHead className="w-16">Rank</TableHead>
                                  <TableHead>User</TableHead>
                                  <TableHead className="text-right">WPM</TableHead>
                                  <TableHead className="text-right">Books</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {remainingUsers.map((user, index) => {
                                  const rank = index + 4
                                  const isCurrentUser = user.id === currentUserData?.id

                                  return (
                                    <motion.tr
                                      key={user.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <TableRow
                                        className={
                                          isCurrentUser
                                            ? 'bg-primary/10 border-l-4 border-l-primary'
                                            : ''
                                        }
                                      >
                                        <TableCell className="font-semibold">
                                          #{rank}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage src={user.avatar} alt={user.name} />
                                              <AvatarFallback>
                                                {getUserInitials(user.name)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium text-sm">{user.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                @{user.username}
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge variant="secondary" className="font-semibold">
                                            {user.wpm} WPM
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {user.booksTyped}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Link href={`/profile/${user.id}`}>
                                            <Button variant="ghost" size="sm">
                                              View
                                            </Button>
                                          </Link>
                                        </TableCell>
                                      </TableRow>
                                    </motion.tr>
                                  )
                                })}
                              </TableBody>
                            </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  {/* Top Overall Tab */}
                  <TabsContent value="overall" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="overall"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {/* Podium */}
                        {topThree.length >= 3 && (
                          <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2 mb-8">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-xl font-semibold text-center">
                                Top 3 Performers
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
                              {podiumConfig.map((config, index) => {
                                const user = topThree[config.position - 1]
                                const podium = podiumColors[config.position - 1]
                                const height = podiumHeights[config.position - 1]

                                return (
                                  <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className={config.class}
                                  >
                                    <Card
                                      className={`bg-gradient-to-b ${podium.bg} border-2 ${podium.border} shadow-lg hover:shadow-xl transition-all ${height} flex flex-col justify-end min-h-[280px] sm:min-h-[320px]`}
                                    >
                                      <CardContent className="p-4 pb-6 text-center flex flex-col justify-end h-full">
                                        <div className="text-3xl mb-3">{podium.icon}</div>
                                        <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-background shadow-md">
                                          <AvatarImage src={user.avatar} alt={user.name} />
                                          <AvatarFallback className="bg-background/20 text-background font-bold">
                                            {getUserInitials(user.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <p className="font-bold text-background text-sm truncate mb-1">
                                          {user.name}
                                        </p>
                                        <p className="text-background/90 text-xs mb-2">
                                          @{user.username}
                                        </p>
                                        <div className="bg-background/20 rounded-lg px-3 py-1">
                                          <p className="text-2xl font-bold text-background">
                                            {Math.round(user.overallScore)}
                                          </p>
                                          <p className="text-xs text-background/90">score</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Full Rankings Table */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Full Rankings</CardTitle>
                            <CardDescription>
                              Complete leaderboard rankings
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-lg border bg-card overflow-hidden">
                              <Table>
                                <TableHeader>
                                <TableRow>
                                  <TableHead className="w-16">Rank</TableHead>
                                  <TableHead>User</TableHead>
                                  <TableHead className="text-right">Score</TableHead>
                                  <TableHead className="text-right">Books</TableHead>
                                  <TableHead className="text-right">WPM</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {remainingUsers.map((user, index) => {
                                  const rank = index + 4
                                  const isCurrentUser = user.id === currentUserData?.id

                                  return (
                                    <motion.tr
                                      key={user.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <TableRow
                                        className={
                                          isCurrentUser
                                            ? 'bg-primary/10 border-l-4 border-l-primary'
                                            : ''
                                        }
                                      >
                                        <TableCell className="font-semibold">
                                          #{rank}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage src={user.avatar} alt={user.name} />
                                              <AvatarFallback>
                                                {getUserInitials(user.name)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium text-sm">{user.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                @{user.username}
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge variant="default" className="font-semibold">
                                            {Math.round(user.overallScore)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {user.booksTyped}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge variant="secondary">{user.wpm} WPM</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Link href={`/profile/${user.id}`}>
                                            <Button variant="ghost" size="sm">
                                              View
                                            </Button>
                                          </Link>
                                        </TableCell>
                                      </TableRow>
                                    </motion.tr>
                                  )
                                })}
                              </TableBody>
                            </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Additional Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* How It Works */}
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

            {/* Share Section */}
            {currentUserData && currentUserRank && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement share functionality
                      navigator.clipboard.writeText(
                        `${window.location.origin}/leaderboard?highlight=${user.id}`
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

