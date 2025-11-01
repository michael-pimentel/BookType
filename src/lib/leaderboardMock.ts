// Mock data for Leaderboard page development
// TODO: Replace with Supabase queries later

export interface LeaderboardUser {
  id: string
  name: string
  username: string
  avatar?: string
  booksTyped: number
  wpm: number
  overallScore: number
  totalTimeHours?: number
}

// Mock leaderboard data - 20 users for realistic rendering
export const mockLeaderboardUsers: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Alex Master',
    username: 'alexmaster',
    booksTyped: 47,
    wpm: 145,
    overallScore: 0, // Will be calculated
    totalTimeHours: 234,
  },
  {
    id: '2',
    name: 'Sarah Speedster',
    username: 'sarahspeed',
    booksTyped: 42,
    wpm: 162,
    overallScore: 0,
    totalTimeHours: 189,
  },
  {
    id: '3',
    name: 'Mike Bookworm',
    username: 'mikebook',
    booksTyped: 51,
    wpm: 128,
    overallScore: 0,
    totalTimeHours: 312,
  },
  {
    id: '4',
    name: 'Emma Typist',
    username: 'emmatypist',
    booksTyped: 38,
    wpm: 138,
    overallScore: 0,
    totalTimeHours: 201,
  },
  {
    id: '5',
    name: 'David Writer',
    username: 'davidwriter',
    booksTyped: 35,
    wpm: 151,
    overallScore: 0,
    totalTimeHours: 178,
  },
  {
    id: '6',
    name: 'Lisa Reader',
    username: 'lisareader',
    booksTyped: 44,
    wpm: 134,
    overallScore: 0,
    totalTimeHours: 267,
  },
  {
    id: '7',
    name: 'Chris BookLover',
    username: 'chrisbook',
    booksTyped: 33,
    wpm: 142,
    overallScore: 0,
    totalTimeHours: 156,
  },
  {
    id: '8',
    name: 'Anna Swift',
    username: 'annaswift',
    booksTyped: 29,
    wpm: 168,
    overallScore: 0,
    totalTimeHours: 134,
  },
  {
    id: '9',
    name: 'Tom Typing',
    username: 'tomtyping',
    booksTyped: 31,
    wpm: 125,
    overallScore: 0,
    totalTimeHours: 198,
  },
  {
    id: '10',
    name: 'Jessica Page',
    username: 'jessicapage',
    booksTyped: 27,
    wpm: 139,
    overallScore: 0,
    totalTimeHours: 145,
  },
  {
    id: '11',
    name: 'Ryan Speed',
    username: 'ryanspeed',
    booksTyped: 25,
    wpm: 155,
    overallScore: 0,
    totalTimeHours: 123,
  },
  {
    id: '12',
    name: 'Olivia Book',
    username: 'oliviabook',
    booksTyped: 23,
    wpm: 132,
    overallScore: 0,
    totalTimeHours: 167,
  },
  {
    id: '13',
    name: 'James Writer',
    username: 'jameswriter',
    booksTyped: 21,
    wpm: 148,
    overallScore: 0,
    totalTimeHours: 112,
  },
  {
    id: '14',
    name: 'Sophia Type',
    username: 'sophiatype',
    booksTyped: 19,
    wpm: 126,
    overallScore: 0,
    totalTimeHours: 134,
  },
  {
    id: '15',
    name: 'William Fast',
    username: 'williamfast',
    booksTyped: 17,
    wpm: 141,
    overallScore: 0,
    totalTimeHours: 98,
  },
  {
    id: '16',
    name: 'Isabella Read',
    username: 'isabellaread',
    booksTyped: 15,
    wpm: 118,
    overallScore: 0,
    totalTimeHours: 112,
  },
  {
    id: '17',
    name: 'Benjamin Quick',
    username: 'benjaminquick',
    booksTyped: 13,
    wpm: 129,
    overallScore: 0,
    totalTimeHours: 89,
  },
  {
    id: '18',
    name: 'Charlotte Book',
    username: 'charlottebook',
    booksTyped: 11,
    wpm: 122,
    overallScore: 0,
    totalTimeHours: 76,
  },
  {
    id: '19',
    name: 'Lucas Type',
    username: 'lucastype',
    booksTyped: 9,
    wpm: 135,
    overallScore: 0,
    totalTimeHours: 67,
  },
  {
    id: '20',
    name: 'Mia Reader',
    username: 'miareader',
    booksTyped: 7,
    wpm: 116,
    overallScore: 0,
    totalTimeHours: 54,
  },
]

// Calculate overall scores for all users
mockLeaderboardUsers.forEach((user) => {
  user.overallScore = user.booksTyped * 10 + user.wpm / 2
})

// Helper function to get sorted users by metric
export const getUsersByBooks = (users: LeaderboardUser[]): LeaderboardUser[] => {
  return [...users].sort((a, b) => b.booksTyped - a.booksTyped)
}

export const getUsersByWPM = (users: LeaderboardUser[]): LeaderboardUser[] => {
  return [...users].sort((a, b) => b.wpm - a.wpm)
}

export const getUsersByOverall = (users: LeaderboardUser[]): LeaderboardUser[] => {
  return [...users].sort((a, b) => b.overallScore - a.overallScore)
}

