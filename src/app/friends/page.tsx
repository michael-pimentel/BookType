'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  UserPlus,
  UserMinus,
  Check,
  X,
  Circle,
  Users,
} from 'lucide-react'
import {
  mockFriends,
  mockIncomingRequests,
  mockOutgoingRequests,
  mockSearchUsers,
  type Friend,
  type FriendRequest,
  type SearchUser,
} from '@/lib/friendsMock'

export default function FriendsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [friends, setFriends] = useState<Friend[]>([])
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch friends on mount
  useEffect(() => {
    fetchFriends()
    fetchRequests()
  }, [])

  // Filter friends based on search query
  useEffect(() => {
    if (!friendSearchQuery.trim()) {
      setFilteredFriends(friends)
    } else {
      const query = friendSearchQuery.toLowerCase()
      setFilteredFriends(
        friends.filter(
          (friend) =>
            friend.displayName.toLowerCase().includes(query) ||
            friend.username.toLowerCase().includes(query)
        )
      )
    }
  }, [friendSearchQuery, friends])

  // TODO: Connect to Supabase later
  const fetchFriends = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    setFriends(mockFriends)
  }

  // TODO: Connect to Supabase later
  const fetchRequests = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    setIncomingRequests(mockIncomingRequests)
    setOutgoingRequests(mockOutgoingRequests)
  }

  // TODO: Connect to Supabase later
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const filtered = mockSearchUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(filtered)
    setIsSearching(false)
  }

  // TODO: Connect to Supabase later
  const sendFriendRequest = async (userId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    toast({
      title: 'Friend request sent!',
      description: 'Your friend request has been sent successfully.',
    })
    
    // Refresh search results to remove the user
    setSearchResults((prev) => prev.filter((u) => u.id !== userId))
  }

  // TODO: Connect to Supabase later
  const acceptFriendRequest = async (requestId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const request = incomingRequests.find((r) => r.id === requestId)
    if (request) {
      // Add to friends list
      const newFriend: Friend = {
        id: request.fromUserId,
        username: request.username,
        displayName: request.displayName,
        email: request.email,
        avatarUrl: request.avatarUrl,
        isOnline: false,
      }
      setFriends((prev) => [...prev, newFriend])
      
      // Remove from incoming requests
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
      
      toast({
        title: 'Friend request accepted!',
        description: `You are now friends with ${request.displayName}.`,
      })
    }
  }

  // TODO: Connect to Supabase later
  const declineFriendRequest = async (requestId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const request = incomingRequests.find((r) => r.id === requestId)
    setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
    
    if (request) {
      toast({
        title: 'Friend request declined',
        description: `You declined ${request.displayName}'s friend request.`,
        variant: 'default',
      })
    }
  }

  // TODO: Connect to Supabase later
  const cancelFriendRequest = async (requestId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const request = outgoingRequests.find((r) => r.id === requestId)
    setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId))
    
    if (request) {
      toast({
        title: 'Friend request cancelled',
        description: `You cancelled the friend request to ${request.displayName}.`,
      })
    }
  }

  // TODO: Connect to Supabase later
  const removeFriend = async (friendId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const friend = friends.find((f) => f.id === friendId)
    setFriends((prev) => prev.filter((f) => f.id !== friendId))
    
    if (friend) {
      toast({
        title: 'Friend removed',
        description: `You removed ${friend.displayName} from your friends list.`,
        variant: 'default',
      })
    }
  }

  // Get online friends
  const onlineFriends = friends.filter((friend) => friend.isOnline)

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your friends
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">
            Connect with other BookType users and share your typing progress
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Friends List Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" aria-hidden="true" />
                  Friends ({friends.length})
                </CardTitle>
                <CardDescription>
                  Manage your friends and see their activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search friends by name or username..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="pl-9"
                    aria-label="Search friends"
                  />
                </div>

                {/* Friends List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredFriends.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {friendSearchQuery ? (
                        <p>No friends found matching your search.</p>
                      ) : (
                        <>
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No friends yet</p>
                          <p className="text-sm mt-2">
                            Start by searching for users above!
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredFriends.map((friend) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage
                                      src={friend.avatarUrl}
                                      alt={friend.displayName}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {getUserInitials(friend.displayName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {friend.isOnline && (
                                    <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {friend.displayName}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    @{friend.username}
                                  </p>
                                  {!friend.isOnline && friend.lastSeen && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Last seen {friend.lastSeen}
                                    </p>
                                  )}
                                </div>
                                {friend.isOnline && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Online
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFriend(friend.id)}
                                className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                                aria-label={`Remove ${friend.displayName} from friends`}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Friend Requests Section */}
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests</CardTitle>
                <CardDescription>
                  Manage your incoming and outgoing friend requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="incoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="incoming">
                      Incoming ({incomingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="outgoing">
                      Outgoing ({outgoingRequests.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Incoming Requests */}
                  <TabsContent value="incoming" className="mt-4">
                    <div className="space-y-3">
                      {incomingRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No pending requests</p>
                        </div>
                      ) : (
                        incomingRequests.map((request) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 flex-1">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        src={request.avatarUrl}
                                        alt={request.displayName}
                                      />
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {getUserInitials(request.displayName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">
                                        {request.displayName}
                                      </p>
                                      <p className="text-sm text-muted-foreground truncate">
                                        @{request.username}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      size="sm"
                                      onClick={() => acceptFriendRequest(request.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                      aria-label={`Accept friend request from ${request.displayName}`}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => declineFriendRequest(request.id)}
                                      aria-label={`Decline friend request from ${request.displayName}`}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Outgoing Requests */}
                  <TabsContent value="outgoing" className="mt-4">
                    <div className="space-y-3">
                      {outgoingRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No outgoing requests</p>
                        </div>
                      ) : (
                        outgoingRequests.map((request) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 flex-1">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        src={request.avatarUrl}
                                        alt={request.displayName}
                                      />
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {getUserInitials(request.displayName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">
                                        {request.displayName}
                                      </p>
                                      <p className="text-sm text-muted-foreground truncate">
                                        @{request.username}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => cancelFriendRequest(request.id)}
                                    className="ml-4"
                                    aria-label={`Cancel friend request to ${request.displayName}`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Add Friends Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                  Add Friends
                </CardTitle>
                <CardDescription>
                  Search for users by username or email to send friend requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by username or email..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                      }}
                      className="pl-9"
                      aria-label="Search for users"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Searching...</p>
                  </div>
                )}

                {!isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No users found</p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={user.avatarUrl}
                                    alt={user.displayName}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getUserInitials(user.displayName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {user.displayName}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    @{user.username}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => sendFriendRequest(user.id)}
                                className="ml-4"
                                aria-label={`Send friend request to ${user.displayName}`}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Send Request
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!searchQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Enter a username or email to search for users</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Online Now */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                  Online Now ({onlineFriends.length})
                </CardTitle>
                <CardDescription>
                  Friends who are currently active
                </CardDescription>
              </CardHeader>
              <CardContent>
                {onlineFriends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No friends online</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onlineFriends.map((friend) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={friend.avatarUrl}
                                alt={friend.displayName}
                              />
                              <AvatarFallback className="bg-green-100 text-green-800">
                                {getUserInitials(friend.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {friend.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{friend.username}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

