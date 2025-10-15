'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddBookModal } from '@/contexts/AddBookModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { BookOpen, Plus, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Book {
  id: string
  title: string
  author: string
  content: string
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ProgressData {
  id: string
  user_id: string
  book_id: string
  chars_typed: number
  completed: boolean
  created_at: string
  updated_at: string
}

interface BookWithProgress extends Book {
  progress: ProgressData | null
}

export default function LibraryPage() {
  const [books, setBooks] = useState<BookWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user])

  const fetchBooks = async () => {
    if (!user) return

    try {
      console.log('Fetching books for user:', user.id)
      
      // First get all books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')

      if (booksError) {
        console.error('Books error:', booksError)
        throw booksError
      }

      console.log('Books data:', booksData)

      // Then get user's progress for all books
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)

      if (progressError) {
        console.error('Progress error:', progressError)
        throw progressError
      }

      console.log('Progress data:', progressData)

      // Combine books with their progress
      const booksWithProgress: BookWithProgress[] = (booksData || []).map(book => ({
        ...book,
        progress: progressData?.find((p: ProgressData) => p.book_id === book.id) || null
      }))

      console.log('Books with progress:', booksWithProgress)
      setBooks(booksWithProgress)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAdded = () => {
    fetchBooks() // Refresh the list
  }

  const getProgressPercentage = (book: BookWithProgress) => {
    if (!book.progress) return 0
    return Math.min((book.progress.chars_typed / book.content.length) * 100, 100)
  }

  const getBookStatus = (book: BookWithProgress) => {
    if (book.progress?.completed) return 'completed'
    if (book.progress?.chars_typed && book.progress.chars_typed > 0) return 'in-progress'
    return 'not-started'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your library
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">BookType</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Book</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Library</h1>
          <p className="text-gray-600">
            Choose a book to start typing, or add your own book to the collection.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No books yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first book to begin your typing journey.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const progress = getProgressPercentage(book)
              const status = getBookStatus(book)
              
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 line-clamp-2">
                            {book.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            by {book.author}
                          </CardDescription>
                        </div>
                        {status === 'completed' && (
                          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                        )}
                        {status === 'in-progress' && (
                          <Clock className="h-6 w-6 text-blue-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {book.content.substring(0, 150)}...
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300 ease-out"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: `hsl(${progress * 1.2}, 80%, 50%)`
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={
                            status === 'completed' ? 'default' :
                            status === 'in-progress' ? 'secondary' : 'outline'
                          }
                        >
                          {status === 'completed' ? 'Completed' :
                           status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </Badge>
                        
                        <Link href={`/type/${book.id}`}>
                          <Button size="sm">
                            {status === 'completed' ? 'Review' : 'Start Typing'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <AddBookModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onBookAdded={handleBookAdded}
      />
    </div>
  )
}