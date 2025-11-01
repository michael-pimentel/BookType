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
  const [keystrokes, setKeystrokes] = useState<{ timestamp: number }[]>([])
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user && bookId) {
      fetchBookAndProgress()
    }
  }, [user, bookId])

  // Calculate stats immediately when userInput or keystrokes change
  useEffect(() => {
    if (userInput.length > 0) {
      calculateStats()
    }
  }, [userInput, keystrokes])

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
    if (!book || keystrokes.length < 5) {
      // Don't show stats until at least 5 keystrokes
      setStats(prev => ({
        ...prev,
        wpm: 0,
        accuracy: 100,
        charsTyped: userInput.length,
        errors: 0
      }))
      return
    }

    // Calculate WPM based on last 10 seconds of typing
    const now = Date.now()
    const recentKeystrokes = keystrokes.filter(k => now - k.timestamp < 10000)
    
    if (recentKeystrokes.length < 5) {
      setStats(prev => ({ ...prev, wpm: 0 }))
      return
    }

    const timeSpan = (now - recentKeystrokes[0].timestamp) / 1000 / 60 // minutes
    const wordsTyped = recentKeystrokes.length / 5 // average 5 chars per word
    const wpm = timeSpan > 0 ? Math.round(wordsTyped / timeSpan) : 0

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

    // Track keystroke for WPM calculation
    if (newInput.length > userInput.length) {
      setKeystrokes(prev => [...prev, { timestamp: Date.now() }])
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
        const { data, error } = await supabase
          .from('progress')
          .insert(progressData)
          .select()
          .single()

        if (error) throw error
        if (data) setCurrentProgress(data)
      }

      setCurrentProgress(prev => prev ? {
        ...prev,
        chars_typed: charsTyped,
        completed: completed
      } : null)
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

  const renderTypingArea = () => {
    if (!book) return null

    const userText = userInput
    const fullText = book.content
    
    return (
      <div className="relative">
        {/* Hidden textarea that captures input */}
        <textarea
          value={userInput}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none z-10"
          autoFocus
          disabled={isCompleted}
          spellCheck={false}
        />
        
        {/* Visible text with highlighting */}
        <div 
          className="min-h-[500px] max-h-[600px] overflow-y-auto p-6 bg-white rounded-lg border-2 border-blue-200 font-mono text-lg leading-relaxed whitespace-pre-wrap cursor-text"
          onClick={(e) => {
            // Focus the textarea when clicking anywhere in the display
            const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement
            textarea?.focus()
          }}
        >
          {fullText.split('').map((char, index) => {
            if (index < userText.length) {
              // Already typed - show with highlighting
              const isCorrect = userText[index] === char
              return (
                <span
                  key={index}
                  className={
                    isCorrect 
                      ? 'text-gray-800' 
                      : 'bg-red-200 text-red-800 font-bold'
                  }
                >
                  {char}
                </span>
              )
            } else if (index === userText.length) {
              // Current character - show cursor
              return (
                <span key={index} className="relative">
                  <span className="absolute -left-0.5 top-0 w-0.5 h-full bg-blue-600 animate-pulse"></span>
                  <span className="text-gray-400">{char}</span>
                </span>
              )
            } else {
              // Future characters - show in gray
              return (
                <span key={index} className="text-gray-400">
                  {char}
                </span>
              )
            }
          })}
        </div>
        
        {/* Helper text */}
        {!isCompleted && userInput.length === 0 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Click anywhere in the text area to start typing
          </p>
        )}
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
      <div className="container mx-auto px-4 py-8">
        {/* Book Title Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/library" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-sm text-gray-600">by {book.author}</p>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
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
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 ease-out"
                      style={{
                        width: `${getProgressPercentage()}%`,
                        backgroundColor: `hsl(${getProgressPercentage() * 1.2}, 80%, 50%)`
                      }}
                    />
                  </div>
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
                  {isCompleted 
                    ? "You've completed this book! Review your typing below."
                    : "Start typing to begin. Your progress will be saved automatically."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Unified Typing Area */}
                  {renderTypingArea()}

                  {isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-800 mb-2">
                        Congratulations!
                      </h3>
                      <p className="text-green-700 mb-4">
                        You've successfully completed "{book.title}"!
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Link href="/library">
                          <Button>
                            Back to Library
                          </Button>
                        </Link>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setUserInput('')
                            setKeystrokes([])
                            setStats({
                              wpm: 0,
                              accuracy: 100,
                              charsTyped: 0,
                              errors: 0,
                              startTime: null
                            })
                            setIsCompleted(false)
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
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