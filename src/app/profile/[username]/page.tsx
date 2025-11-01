'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { motion } from 'framer-motion'
import {
  BookOpen,
  Zap,
  Clock,
  Trophy,
  Edit,
  Save,
  X,
  MapPin,
  Calendar,
  Award,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import { mockUserProfile, type UserProfile } from '@/lib/userProfileMock'
import {
  mockCompletedBooks,
  mockInProgressBooks,
  type UserBook,
} from '@/lib/userBooksMock'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const username = params.username as string

  const [isEditing, setIsEditing] = useState(false)
  const [editedBio, setEditedBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // TODO: Replace mockUserProfile with Supabase query for user data
  // Fetch user profile by username from Supabase
  const profileData: UserProfile = useMemo(() => {
    // In real app: query Supabase for user with this username
    // For now, use mock data if username matches, otherwise return empty profile
    if (username === mockUserProfile.username || username === user?.id) {
      return mockUserProfile
    }
    return mockUserProfile // Fallback to mock
  }, [username, user])

  // Check if viewing own profile
  const isOwnProfile = useMemo(() => {
    return (
      user?.id === profileData.id ||
      username === mockUserProfile.username ||
      user?.email?.split('@')[0] === username
    )
  }, [user, username, profileData])

  // Initialize edited bio with current bio
  useEffect(() => {
    if (profileData.bio) {
      setEditedBio(profileData.bio)
    }
  }, [profileData.bio])

  // Get books based on tab
  const [activeBookTab, setActiveBookTab] = useState<'completed' | 'inProgress'>('completed')

  // TODO: Implement updateProfile() for saving new bio and avatar
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // In real app: Call Supabase to update profile
      // await supabase.from('profiles').update({ bio: editedBio }).eq('id', user.id)
      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved successfully.',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedBio(profileData.bio)
    setIsEditing(false)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view profiles
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData.avatar} alt={profileData.displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {getUserInitials(profileData.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                      variant="secondary"
                      onClick={() => {
                        // TODO: Implement profile picture upload
                        toast({
                          title: 'Coming soon',
                          description: 'Profile picture upload will be available soon.',
                        })
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {profileData.displayName}
                    </h1>
                    {isOwnProfile && (
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">
                    @{profileData.username}
                  </p>
                  {profileData.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatJoinDate(profileData.joinDate)}</span>
                  </div>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? 'outline' : 'default'}
                      className="w-full sm:w-auto"
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
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
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          'Saving...'
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      {profileData.bio || 'No bio available.'}
                    </p>
                    {profileData.genres.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Favorite Genres:</p>
                        <div className="flex flex-wrap gap-2">
                          {profileData.genres.map((genre) => (
                            <Badge key={genre} variant="secondary">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Section */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>
                  Your typing performance and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{profileData.stats.booksCompleted}</p>
                        <p className="text-sm text-muted-foreground">Books Completed</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{profileData.stats.avgWPM}</p>
                        <p className="text-sm text-muted-foreground">Avg WPM</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">
                          {formatTotalTime(profileData.stats.totalMinutes)}
                        </p>
                        <p className="text-sm text-muted-foreground">Typing Time</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">
                          {profileData.stats.rank ? `#${profileData.stats.rank}` : '—'}
                        </p>
                        <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Books Section */}
            <Card>
              <CardHeader>
                <CardTitle>Books</CardTitle>
                <CardDescription>
                  Books you've completed and are currently typing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeBookTab}
                  onValueChange={(v) => setActiveBookTab(v as 'completed' | 'inProgress')}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="completed">
                      Completed ({mockCompletedBooks.length})
                    </TabsTrigger>
                    <TabsTrigger value="inProgress">
                      In Progress ({mockInProgressBooks.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Completed Books */}
                  <TabsContent value="completed" className="mt-0">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {mockCompletedBooks.map((book) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="h-full hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-1">{book.title}</CardTitle>
                                  <CardDescription className="text-sm">
                                    by {book.author}
                                  </CardDescription>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">100%</span>
                                </div>
                                <Progress value={100} className="h-2" />
                              </div>
                              {book.currentWPM && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Zap className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Average: {book.currentWPM} WPM
                                  </span>
                                </div>
                              )}
                              <Link href={`/type/${book.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  Review
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* In Progress Books */}
                  <TabsContent value="inProgress" className="mt-0">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {mockInProgressBooks.map((book) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="h-full hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-1">{book.title}</CardTitle>
                                  <CardDescription className="text-sm">
                                    by {book.author}
                                  </CardDescription>
                                </div>
                                <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">
                                    {Math.round(book.completionPercentage)}%
                                  </span>
                                </div>
                                <Progress value={book.completionPercentage} className="h-2" />
                              </div>
                              {book.currentWPM && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Zap className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Current: {book.currentWPM} WPM
                                  </span>
                                </div>
                              )}
                              <Link href={`/type/${book.id}`}>
                                <Button size="sm" className="w-full">
                                  Continue Typing
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Achievements Section (Bonus) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Milestones and badges earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: '50 Books Club', earned: false, description: 'Complete 50 books' },
                    { name: '1000 WPM Peak', earned: false, description: 'Reach 1000 WPM' },
                    {
                      name: 'Speed Demon',
                      earned: true,
                      description: 'Average 150+ WPM',
                    },
                    {
                      name: 'Marathon Reader',
                      earned: true,
                      description: 'Type for 100+ hours',
                    },
                  ].map((achievement, index) => (
                    <motion.div
                      key={achievement.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className={
                          achievement.earned
                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                            : 'opacity-60'
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                achievement.earned
                                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                                  : 'bg-muted'
                              }`}
                            >
                              <Award
                                className={`h-6 w-6 ${
                                  achievement.earned ? 'text-white' : 'text-muted-foreground'
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{achievement.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            {achievement.earned && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Words</p>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalWords.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Session</p>
                  <p className="text-2xl font-bold">
                    {Math.round(profileData.stats.totalMinutes / profileData.stats.booksCompleted)}
                    {' '}min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (profileData.stats.booksCompleted /
                        (profileData.stats.booksCompleted + mockInProgressBooks.length)) *
                        100
                    )}
                    %
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

