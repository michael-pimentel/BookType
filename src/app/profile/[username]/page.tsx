'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Zap,
  Clock,
  Trophy,
  Edit,
  Save,
  X,
  Calendar,
  Award,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from 'lucide-react'

interface ProfileData {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

interface LeaderboardData {
  books_completed: number
  average_wpm: number
  total_chars_typed: number
  total_time_seconds: number
  overall_score: number
}

interface BookWithProgress {
  id: string
  title: string
  author: string
  contentLength: number
  charsTyped: number
  completed: boolean
}

function getUserInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatJoinDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatTotalTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${minutes} min`
}

export default function ProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const username = params.username as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [books, setBooks] = useState<BookWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeBookTab, setActiveBookTab] = useState<'completed' | 'inProgress'>('completed')

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !profileData) {
        setNotFound(true)
        return
      }

      setProfile(profileData)
      setEditedBio(profileData.bio || '')

      const [{ data: leaderboardData }, { data: progressData }] = await Promise.all([
        supabase.from('leaderboard').select('*').eq('user_id', profileData.id).single(),
        supabase.from('progress').select('*, books(id, title, author, content)').eq('user_id', profileData.id),
      ])

      setLeaderboard(leaderboardData || null)

      const booksWithProgress: BookWithProgress[] = ((progressData || []) as any[])
        .filter((p) => p.books)
        .map((p) => ({
          id: p.books.id,
          title: p.books.title,
          author: p.books.author,
          contentLength: p.books.content?.length || 0,
          charsTyped: p.chars_typed,
          completed: p.completed,
        }))

      setBooks(booksWithProgress)
    } catch (e) {
      console.error('Error fetching profile:', e)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !profile || user.id !== profile.id) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: editedBio })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev) => prev ? { ...prev, bio: editedBio } : null)
      toast({ title: 'Profile updated!', description: 'Your changes have been saved.' })
      setIsEditing(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedBio(profile?.bio || '')
    setIsEditing(false)
  }

  const isOwnProfile = !!user && !!profile && user.id === profile.id
  const completedBooks = books.filter((b) => b.completed)
  const inProgressBooks = books.filter((b) => !b.completed && b.charsTyped > 0)

  const stats = {
    booksCompleted: leaderboard?.books_completed ?? 0,
    avgWPM: Math.round(leaderboard?.average_wpm ?? 0),
    totalSeconds: leaderboard?.total_time_seconds ?? 0,
    totalChars: leaderboard?.total_chars_typed ?? 0,
    rank: null as number | null,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button className="w-full">Go to Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>No user found with username &quot;{username}&quot;</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button className="w-full">Go to Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = profile.display_name || profile.username

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {getUserInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      variant="secondary"
                      onClick={() => toast({ title: 'Coming soon', description: 'Profile picture upload will be available soon.' })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{displayName}</h1>
                    {isOwnProfile && (
                      <Badge variant="secondary" className="hidden sm:inline-flex">You</Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">@{profile.username}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatJoinDate(profile.created_at)}</span>
                  </div>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? 'outline' : 'default'}
                      className="w-full sm:w-auto"
                    >
                      {isEditing ? (
                        <><X className="h-4 w-4 mr-2" />Cancel</>
                      ) : (
                        <><Edit className="h-4 w-4 mr-2" />Edit Profile</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Bio */}
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        className="mt-2 min-h-[120px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                        {isSaving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.bio || 'No bio yet.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Typing performance and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: BookOpen, value: stats.booksCompleted, label: 'Books Completed' },
                    { icon: Zap, value: stats.avgWPM || '—', label: 'Avg WPM' },
                    { icon: Clock, value: formatTotalTime(stats.totalSeconds), label: 'Typing Time' },
                  ].map(({ icon: Icon, value, label }) => (
                    <motion.div key={label} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Card className="text-center">
                        <CardContent className="p-4">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-sm text-muted-foreground">{label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Books */}
            <Card>
              <CardHeader>
                <CardTitle>Books</CardTitle>
                <CardDescription>Books you&apos;ve completed and are currently typing</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeBookTab} onValueChange={(v) => setActiveBookTab(v as 'completed' | 'inProgress')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="completed">Completed ({completedBooks.length})</TabsTrigger>
                    <TabsTrigger value="inProgress">In Progress ({inProgressBooks.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="completed" className="mt-0">
                    {completedBooks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No completed books yet.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {completedBooks.map((book) => (
                          <motion.div key={book.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <Card className="h-full hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-base mb-1 line-clamp-2">{book.title}</CardTitle>
                                    <CardDescription>by {book.author}</CardDescription>
                                  </div>
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">100%</span>
                                  </div>
                                  <Progress value={100} className="h-2" />
                                </div>
                                <Link href={`/type/${book.id}`}>
                                  <Button variant="outline" size="sm" className="w-full">Review</Button>
                                </Link>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inProgress" className="mt-0">
                    {inProgressBooks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No books in progress.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {inProgressBooks.map((book) => {
                          const pct = book.contentLength > 0
                            ? Math.min(Math.round((book.charsTyped / book.contentLength) * 100), 99)
                            : 0
                          return (
                            <motion.div key={book.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                              <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <CardTitle className="text-base mb-1 line-clamp-2">{book.title}</CardTitle>
                                      <CardDescription>by {book.author}</CardDescription>
                                    </div>
                                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-muted-foreground">Progress</span>
                                      <span className="font-medium">{pct}%</span>
                                    </div>
                                    <Progress value={pct} className="h-2" />
                                  </div>
                                  <Link href={`/type/${book.id}`}>
                                    <Button size="sm" className="w-full">Continue Typing</Button>
                                  </Link>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader><CardTitle className="text-lg">Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Characters Typed</p>
                  <p className="text-2xl font-bold">{stats.totalChars.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Books In Progress</p>
                  <p className="text-2xl font-bold">{inProgressBooks.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {books.length > 0
                      ? `${Math.round((completedBooks.length / books.length) * 100)}%`
                      : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
