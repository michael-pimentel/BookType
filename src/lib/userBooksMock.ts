// Mock data for user's books (completed and in progress)
// TODO: Replace with Supabase queries later

export interface UserBook {
  id: string
  title: string
  author: string
  completionPercentage: number
  isCompleted: boolean
  startedAt?: string
  completedAt?: string
  wordsTyped?: number
  totalWords?: number
  currentWPM?: number
}

export const mockCompletedBooks: UserBook[] = [
  {
    id: '1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    completionPercentage: 100,
    isCompleted: true,
    startedAt: '2024-01-20',
    completedAt: '2024-02-15',
    wordsTyped: 95000,
    totalWords: 95000,
    currentWPM: 125,
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    completionPercentage: 100,
    isCompleted: true,
    startedAt: '2024-02-20',
    completedAt: '2024-03-10',
    wordsTyped: 89000,
    totalWords: 89000,
    currentWPM: 118,
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    completionPercentage: 100,
    isCompleted: true,
    startedAt: '2024-03-15',
    completedAt: '2024-04-05',
    wordsTyped: 120000,
    totalWords: 120000,
    currentWPM: 112,
  },
  {
    id: '4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    completionPercentage: 100,
    isCompleted: true,
    startedAt: '2024-04-10',
    completedAt: '2024-04-25',
    wordsTyped: 47000,
    totalWords: 47000,
    currentWPM: 132,
  },
  {
    id: '5',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    completionPercentage: 100,
    isCompleted: true,
    startedAt: '2024-05-01',
    completedAt: '2024-05-20',
    wordsTyped: 100000,
    totalWords: 100000,
    currentWPM: 128,
  },
]

export const mockInProgressBooks: UserBook[] = [
  {
    id: '6',
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    completionPercentage: 45,
    isCompleted: false,
    startedAt: '2024-06-01',
    wordsTyped: 270000,
    totalWords: 600000,
    currentWPM: 115,
  },
  {
    id: '7',
    title: 'Dune',
    author: 'Frank Herbert',
    completionPercentage: 78,
    isCompleted: false,
    startedAt: '2024-07-10',
    wordsTyped: 185000,
    totalWords: 238000,
    currentWPM: 122,
  },
  {
    id: '8',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    completionPercentage: 12,
    isCompleted: false,
    startedAt: '2024-08-05',
    wordsTyped: 14000,
    totalWords: 120000,
    currentWPM: 105,
  },
]

