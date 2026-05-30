'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AddBookModal } from '@/components/AddBookModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { BookOpen, Plus, CheckCircle, Clock, Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Book {
  id: string
  title: string
  author: string
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ProgressData {
  book_id: string
  chars_typed: number
  completed: boolean
}

interface BookWithProgress extends Book {
  progress: ProgressData | null
}

function BookCard({ book }: { book: BookWithProgress }) {
  const status = book.progress?.completed
    ? 'completed'
    : (book.progress?.chars_typed ?? 0) > 0
    ? 'in-progress'
    : 'not-started'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-snug mb-1 line-clamp-2">
                {book.title}
              </CardTitle>
              <CardDescription className="text-sm truncate">
                {book.author}
              </CardDescription>
            </div>
            {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {status === 'in-progress' && <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {status !== 'not-started' && (
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${status === 'completed' ? 'bg-green-500 w-full' : 'bg-blue-500'}`}
                style={status === 'in-progress' ? { width: `${Math.min(Math.round((book.progress!.chars_typed / 5000)), 95)}%`, minWidth: '8%' } : undefined}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Badge
              variant={status === 'completed' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
            </Badge>
            <Link href={`/type/${book.id}`}>
              <Button size="sm" variant={status === 'completed' ? 'outline' : 'default'}>
                {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-1.5 bg-gray-200 rounded mb-3" />
            <div className="h-8 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function LibraryPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [myBooks, setMyBooks] = useState<BookWithProgress[]>([])
  const [browseBooks, setBrowseBooks] = useState<BookWithProgress[]>([])
  const [searchResults, setSearchResults] = useState<BookWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (user) fetchInitial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchInitial = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [
        { data: progressData },
        { data: browseData },
        { count },
      ] = await Promise.all([
        supabase.from('progress').select('book_id, chars_typed, completed').eq('user_id', user.id),
        supabase.from('books').select('id, title, author, created_by, created_at, updated_at').order('title').limit(24),
        supabase.from('books').select('*', { count: 'exact', head: true }),
      ])

      const progressMap = new Map((progressData || []).map((p) => [p.book_id, p]))
      setTotalCount(count || 0)

      const withProgress = (books: Book[]): BookWithProgress[] =>
        books.map((b) => ({ ...b, progress: progressMap.get(b.id) || null }))

      const myBookIds = new Set((progressData || []).filter(p => p.chars_typed > 0 || p.completed).map(p => p.book_id))

      // Books with user progress (separate section)
      if (myBookIds.size > 0) {
        const { data: myBooksData } = await supabase
          .from('books')
          .select('id, title, author, created_by, created_at, updated_at')
          .in('id', Array.from(myBookIds))
          .order('title')
        setMyBooks(withProgress(myBooksData || []))
      }

      // Browse: popular picks excluding ones user already has progress on
      const browse = withProgress(browseData || []).filter(b => !myBookIds.has(b.id))
      setBrowseBooks(browse)
    } finally {
      setLoading(false)
    }
  }

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    try {
      const [{ data: results }, { data: progressData }] = await Promise.all([
        supabase
          .from('books')
          .select('id, title, author, created_by, created_at, updated_at')
          .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
          .order('title')
          .limit(60),
        supabase.from('progress').select('book_id, chars_typed, completed').eq('user_id', user.id),
      ])
      const progressMap = new Map((progressData || []).map((p) => [p.book_id, p]))
      setSearchResults((results || []).map((b) => ({ ...b, progress: progressMap.get(b.id) || null })))
    } finally {
      setSearching(false)
    }
  }, [user])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 300)
  }

  const clearSearch = () => {
    setSearch('')
    setSearchResults([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your library</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button className="w-full">Go to Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSearching = search.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Library</h1>
            <p className="text-gray-500 text-sm">
              {totalCount > 0 ? `${totalCount} books available` : 'Loading books...'}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title or author..."
            className="pl-10 pr-10 h-11 bg-white shadow-sm"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : isSearching ? (
          /* ── Search results ── */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {searching ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${search}"`}
              </h2>
              {searching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            </div>
            {searchResults.length === 0 && !searching ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No books matched &ldquo;{search}&rdquo;</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            )}
          </div>
        ) : (
          /* ── Default view ── */
          <div className="space-y-10">
            {/* Your reading */}
            {myBooks.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Your Reading
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myBooks.map((book) => <BookCard key={book.id} book={book} />)}
                </div>
              </section>
            )}

            {/* Browse / popular */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  {myBooks.length > 0 ? 'Popular Picks' : 'Start Reading'}
                </h2>
                <p className="text-sm text-gray-400">
                  Use the search bar to browse all {totalCount} books
                </p>
              </div>
              {browseBooks.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No books yet. Search above or add one.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {browseBooks.map((book) => <BookCard key={book.id} book={book} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBookAdded={fetchInitial}
      />
    </div>
  )
}
