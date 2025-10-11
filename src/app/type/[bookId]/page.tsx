'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Book, Progress as ProgressType } from '@/types/database'
import { ArrowLeft, CheckCircle, Clock, Target, Zap } from 'lucide-react'
import Link from 'next/link'

interface TypingStats {
  wpm: number
  accuracy: number
  charsTyped: number
  errors: number
  startTime: number | null
}

export default function TypingPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.bookId as string
  
  const [book, setBook] = useState<Book | null>(null)
  const [userInput, setUserInput] = useState('')
  const [currentProgress, setCurrentProgress] = useState<ProgressType | null>(null)
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    charsTyped: 0,
    errors: 0,
    startTime: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const { user } = useAuth()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user && bookId) {
      fetchBookAndProgress()
    }
  }, [user, bookId])

  useEffect(() => {
    if (stats.startTime && !isCompleted) {
      intervalRef.current = setInterval(calculateStats, 1000)
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [stats.startTime, isCompleted])

  const fetchBookAndProgress = async () => {
    try {
      // Fetch book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (bookError) throw bookError
      setBook(bookData)

      // Fetch user progress
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .eq('book_id', bookId)
          .eq('user_id', user.id)
          .single()

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError
        }

        if (progressData) {
          setCurrentProgress(progressData)
          setUserInput(bookData.content.substring(0, progressData.chars_typed))
          setIsCompleted(progressData.completed)
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    if (!book || !stats.startTime) return

    const timeElapsed = (Date.now() - stats.startTime) / 1000 / 60 // minutes
    const wordsTyped = userInput.trim().split(/\s+/).length
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0

    // Calculate accuracy
    const correctChars = userInput.split('').reduce((count, char, index) => {
      return count + (char === book.content[index] ? 1 : 0)
    }, 0)
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100

    // Count errors
    const errors = userInput.split('').reduce((count, char, index) => {
      return count + (char !== book.content[index] ? 1 : 0)
    }, 0)

    setStats(prev => ({
      ...prev,
      wpm,
      accuracy,
      charsTyped: userInput.length,
      errors
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value
    
    // Don't allow typing beyond the book content
    if (newInput.length > book!.content.length) {
      return
    }

    setUserInput(newInput)

    // Start timer on first keystroke
    if (!stats.startTime && newInput.length > 0) {
      setStats(prev => ({ ...prev, startTime: Date.now() }))
    }

    // Check if completed
    if (newInput.length === book!.content.length) {
      setIsCompleted(true)
      saveProgress(newInput.length, true)
    } else {
      // Auto-save progress every 100 characters
      if (newInput.length % 100 === 0) {
        saveProgress(newInput.length, false)
      }
    }
  }

  const saveProgress = async (charsTyped: number, completed: boolean) => {
    if (!user || !book) return

    setSaving(true)
    try {
      const progressData = {
        user_id: user.id,
        book_id: book.id,
        chars_typed: charsTyped,
        completed: completed
      }

      if (currentProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('progress')
          .update(progressData)
          .eq('id', currentProgress.id)

        if (error) throw error
      } else {
        // Create new progress
        const { error } = await supabase
          .from('progress')
          .insert(progressData)

        if (error) throw error
      }

      setCurrentProgress(prev => ({
        ...prev!,
        chars_typed: charsTyped,
        completed: completed
      }))
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const getProgressPercentage = () => {
    if (!book) return 0
    return Math.min((userInput.length / book.content.length) * 100, 100)
  }

  const getTextToDisplay = () => {
    if (!book) return ''
    
    const remainingText = book.content.substring(userInput.length)
    const displayLength = Math.min(remainingText.length, 2000) // Show next 2000 chars
    
    return remainingText.substring(0, displayLength)
  }

  const renderTextWithHighlighting = () => {
    if (!book) return null

    const text = getTextToDisplay()
    const userText = userInput
    const correctText = book.content.substring(0, userText.length)
    
    return (
      <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
        {/* Show already typed text with highlighting */}
        {userText.split('').map((char, index) => {
          const isCorrect = char === correctText[index]
          return (
            <span
              key={index}
              className={isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            >
              {char}
            </span>
          )
        })}
        
        {/* Show remaining text */}
        <span className="text-gray-700">{text}</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access typing practice
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading book...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Book Not Found</CardTitle>
            <CardDescription>
              The book you're looking for doesn't exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/library">
              <Button className="w-full">Back to Library</Button>
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
          <div className="flex items-center space-x-4">
            <Link href="/library">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{book.title}</h1>
              <p className="text-sm text-gray-600">by {book.author}</p>
            </div>
          </div>
          
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Typing Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Typing Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-2xl font-bold text-blue-600">{stats.wpm}</span>
                  </div>
                  <p className="text-sm text-gray-600">Words per minute</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-2xl font-bold text-green-600">{stats.accuracy}%</span>
                  </div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>

                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-900">{stats.errors}</span>
                  <p className="text-sm text-gray-600">Errors</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                </div>

                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.charsTyped.toLocaleString()} / {book.content.length.toLocaleString()}
                  </span>
                  <p className="text-sm text-gray-600">Characters typed</p>
                </div>

                {saving && (
                  <div className="text-center text-sm text-blue-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Saving progress...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Typing Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Type the text below</CardTitle>
                <CardDescription>
                  Start typing to begin. Your progress will be saved automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Text Display */}
                  <div className="bg-gray-50 p-6 rounded-lg min-h-[400px] max-h-[500px] overflow-y-auto">
                    {renderTextWithHighlighting()}
                  </div>

                  {/* Typing Input */}
                  <div className="space-y-4">
                    <label htmlFor="typing-input" className="text-sm font-medium text-gray-700">
                      Your input:
                    </label>
                    <textarea
                      ref={textareaRef}
                      id="typing-input"
                      value={userInput}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-lg font-mono text-lg leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={8}
                      placeholder="Start typing here..."
                      autoFocus
                    />
                  </div>

                  {isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-800 mb-2">
                        Congratulations!
                      </h3>
                      <p className="text-green-700 mb-4">
                        You've successfully completed "{book.title}"!
                      </p>
                      <Link href="/library">
                        <Button>
                          Back to Library
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
