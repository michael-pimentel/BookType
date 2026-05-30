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
import { apiClient } from '@/lib/api-client'
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

interface Friend {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  isOnline: boolean
  lastSeen: string | null
}

interface FriendRequest {
  id: string
  fromUserId?: string
  toUserId?: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
}

interface SearchUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  isFriend: boolean
  friendshipStatus: string | null
}

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

  useEffect(() => {
    if (user) {
      fetchFriends()
      fetchRequests()
    }
  }, [user])

  useEffect(() => {
    if (!friendSearchQuery.trim()) {
      setFilteredFriends(friends)
    } else {
      const query = friendSearchQuery.toLowerCase()
      setFilteredFriends(
        friends.filter(
          (friend) =>
            (friend.displayName || friend.username).toLowerCase().includes(query) ||
            friend.username.toLowerCase().includes(query)
        )
      )
    }
  }, [friendSearchQuery, friends])

  const fetchFriends = async () => {
    const res = await apiClient.get<{ friends: Friend[] }>('/friends?status=accepted')
    if (res.success && res.data) {
      setFriends(res.data.friends)
    }
  }

  const fetchRequests = async () => {
    const res = await apiClient.get<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>('/friends/requests')
    if (res.success && res.data) {
      setIncomingRequests(res.data.incoming)
      setOutgoingRequests(res.data.outgoing)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const res = await apiClient.get<{ users: SearchUser[] }>(`/profiles/search?query=${encodeURIComponent(query)}`)
    if (res.success && res.data) {
      setSearchResults(res.data.users)
    } else {
      setSearchResults([])
    }
    setIsSearching(false)
  }

  const sendFriendRequest = async (userId: string) => {
    const res = await apiClient.post('/friends/requests', { friendId: userId })
    if (res.success) {
      toast({
        title: 'Friend request sent!',
        description: 'Your friend request has been sent successfully.',
      })
      setSearchResults((prev) => prev.filter((u) => u.id !== userId))
    } else {
      toast({
        title: 'Failed to send request',
        description: res.error || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  const acceptFriendRequest = async (requestId: string) => {
    const res = await apiClient.post(`/friends/requests/${requestId}/accept`)
    if (res.success) {
      const request = incomingRequests.find((r) => r.id === requestId)
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
      await fetchFriends()
      toast({
        title: 'Friend request accepted!',
        description: request ? `You are now friends with ${request.displayName || request.username}.` : 'Friend added.',
      })
    } else {
      toast({
        title: 'Failed to accept request',
        description: res.error || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  const declineFriendRequest = async (requestId: string) => {
    const request = incomingRequests.find((r) => r.id === requestId)
    const res = await apiClient.post(`/friends/requests/${requestId}/decline`)
    if (res.success) {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (request) {
        toast({
          title: 'Friend request declined',
          description: `You declined ${request.displayName || request.username}'s friend request.`,
        })
      }
    } else {
      toast({
        title: 'Failed to decline request',
        description: res.error || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  const cancelFriendRequest = async (requestId: string) => {
    const request = outgoingRequests.find((r) => r.id === requestId)
    const res = await apiClient.post(`/friends/requests/${requestId}/decline`)
    if (res.success) {
      setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (request) {
        toast({
          title: 'Friend request cancelled',
          description: `You cancelled the friend request to ${request.displayName || request.username}.`,
        })
      }
    } else {
      toast({
        title: 'Failed to cancel request',
        description: res.error || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  const removeFriend = async (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId)
    const res = await apiClient.delete(`/friends/${friendId}`)
    if (res.success) {
      setFriends((prev) => prev.filter((f) => f.id !== friendId))
      if (friend) {
        toast({
          title: 'Friend removed',
          description: `You removed ${friend.displayName || friend.username} from your friends list.`,
        })
      }
    } else {
      toast({
        title: 'Failed to remove friend',
        description: res.error || 'Something went wrong.',
        variant: 'destructive',
      })
    }
  }

  const onlineFriends = friends.filter((friend) => friend.isOnline)

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
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">
            Connect with other BookType users and share your typing progress
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Friends List */}
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

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredFriends.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {friendSearchQuery ? (
                        <p>No friends found matching your search.</p>
                      ) : (
                        <>
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No friends yet</p>
                          <p className="text-sm mt-2">Start by searching for users below!</p>
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
                                    <AvatarImage src={friend.avatarUrl || undefined} alt={friend.displayName || friend.username} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {getUserInitials(friend.displayName || friend.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {friend.isOnline && (
                                    <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {friend.displayName || friend.username}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    @{friend.username}
                                  </p>
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
                                aria-label={`Remove ${friend.displayName || friend.username} from friends`}
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

            {/* Friend Requests */}
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
                                      <AvatarImage src={request.avatarUrl || undefined} alt={request.displayName || request.username} />
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {getUserInitials(request.displayName || request.username)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">
                                        {request.displayName || request.username}
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
                                      aria-label={`Accept friend request from ${request.displayName || request.username}`}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => declineFriendRequest(request.id)}
                                      aria-label={`Decline friend request from ${request.displayName || request.username}`}
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
                                      <AvatarImage src={request.avatarUrl || undefined} alt={request.displayName || request.username} />
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {getUserInitials(request.displayName || request.username)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">
                                        {request.displayName || request.username}
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
                                    aria-label={`Cancel friend request to ${request.displayName || request.username}`}
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

            {/* Add Friends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                  Add Friends
                </CardTitle>
                <CardDescription>
                  Search for users by username to send friend requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    className="pl-9"
                    aria-label="Search for users"
                  />
                </div>

                {isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Searching...</p>
                  </div>
                )}

                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No users found</p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={result.avatarUrl || undefined} alt={result.displayName || result.username} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getUserInitials(result.displayName || result.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {result.displayName || result.username}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    @{result.username}
                                  </p>
                                </div>
                              </div>
                              {result.isFriend ? (
                                <Badge variant="secondary" className="ml-4">Already friends</Badge>
                              ) : result.friendshipStatus === 'pending' ? (
                                <Badge variant="outline" className="ml-4">Request sent</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => sendFriendRequest(result.id)}
                                  className="ml-4"
                                  aria-label={`Send friend request to ${result.displayName || result.username}`}
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Send Request
                                </Button>
                              )}
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
                    <p>Enter a username to search for users</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Online Now Sidebar */}
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
                              <AvatarImage src={friend.avatarUrl || undefined} alt={friend.displayName || friend.username} />
                              <AvatarFallback className="bg-green-100 text-green-800">
                                {getUserInitials(friend.displayName || friend.username)}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {friend.displayName || friend.username}
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
