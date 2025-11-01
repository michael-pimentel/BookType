// Mock data for Friends page development
// TODO: Replace with Supabase queries later

export interface Friend {
  id: string
  username: string
  displayName: string
  email: string
  avatarUrl?: string
  isOnline: boolean
  lastSeen?: string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  username: string
  displayName: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface SearchUser {
  id: string
  username: string
  displayName: string
  email: string
  avatarUrl?: string
}

// Mock friends data
export const mockFriends: Friend[] = [
  {
    id: '1',
    username: 'jane_doe',
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    isOnline: true,
    lastSeen: 'Just now',
  },
  {
    id: '2',
    username: 'john_smith',
    displayName: 'John Smith',
    email: 'john@example.com',
    isOnline: false,
    lastSeen: '2 hours ago',
  },
  {
    id: '3',
    username: 'booklover123',
    displayName: 'Sarah Johnson',
    email: 'sarah@example.com',
    isOnline: true,
    lastSeen: 'Just now',
  },
  {
    id: '4',
    username: 'typingmaster',
    displayName: 'Mike Chen',
    email: 'mike@example.com',
    isOnline: false,
    lastSeen: '1 day ago',
  },
]

// Mock incoming friend requests
export const mockIncomingRequests: FriendRequest[] = [
  {
    id: 'req1',
    fromUserId: '5',
    toUserId: 'current',
    username: 'newfriend',
    displayName: 'Alex Taylor',
    email: 'alex@example.com',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'req2',
    fromUserId: '6',
    toUserId: 'current',
    username: 'bookworm',
    displayName: 'Emma Wilson',
    email: 'emma@example.com',
    createdAt: '2025-01-14T15:20:00Z',
  },
]

// Mock outgoing friend requests
export const mockOutgoingRequests: FriendRequest[] = [
  {
    id: 'req3',
    fromUserId: 'current',
    toUserId: '7',
    username: 'reader2025',
    displayName: 'Chris Brown',
    email: 'chris@example.com',
    createdAt: '2025-01-13T09:15:00Z',
  },
]

// Mock search results
export const mockSearchUsers: SearchUser[] = [
  {
    id: '8',
    username: 'bookfanatic',
    displayName: 'Lisa Anderson',
    email: 'lisa@example.com',
  },
  {
    id: '9',
    username: 'page_turner',
    displayName: 'David Lee',
    email: 'david@example.com',
  },
  {
    id: '10',
    username: 'literature_lover',
    displayName: 'Rachel Green',
    email: 'rachel@example.com',
  },
]

