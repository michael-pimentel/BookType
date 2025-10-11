'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal' // Assuming AuthModal is now in src/components
import { User, LogOut, Library, BookText } from 'lucide-react'

// This component is explicitly client-side, fixing the hydration error
export default function Header() {
  const { user, signOut } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  const handleSignOut = async () => {
    setLoadingSignOut(true)
    try {
      // Supabase signOut call
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoadingSignOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Title - Uses font-serif for a stylized, professional look */}
        <Link href="/" className="flex items-center space-x-2">
          <BookText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-serif text-foreground hover:text-primary transition-colors">
            BookType
          </span>
        </Link>

        {/* Navigation & Auth Buttons */}
        <nav className="flex items-center space-x-4">
          {/* Library Link */}
          <Link href="/library" className="text-sm font-medium transition-colors hover:text-primary hidden sm:flex items-center space-x-1">
            <Library className="h-4 w-4 mr-1" />
            <span>My Library</span>
          </Link>

          {user ? (
            <>
              {/* User/Sign Out */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Hi, {user.email?.split('@')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={loadingSignOut}
                  className="group"
                >
                  <LogOut className="h-4 w-4 mr-1 transition-colors group-hover:text-destructive" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              variant="default" // Uses the Deep Green primary color
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </nav>
      </div>
      
      {/* Auth Modal is controlled by the Header's state */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  )
}