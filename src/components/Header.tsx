'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import {
  BookOpen,
  Library,
  Users,
  Trophy,
  User,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  const handleSignOut = async () => {
    setLoadingSignOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoadingSignOut(false)
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Title on the left */}
        <Link
          href="/"
          className="flex items-center space-x-2 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="BookType Home"
        >
          <BookOpen className="h-8 w-8 text-blue-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-gray-900">
            BookType
          </span>
        </Link>

        {/* Navigation links and profile - on the right */}
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/library"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              aria-label="Go to Library"
            >
              <span className="flex items-center gap-2">
                <Library className="h-4 w-4" aria-hidden="true" />
                Library
              </span>
            </Link>
            <Link
              href="/friends"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              aria-label="Go to Friends"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                Friends
              </span>
            </Link>
            <Link
              href="/leaderboard"
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              aria-label="Go to Leaderboard"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Leaderboard
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Profile Dropdown or Sign In */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="User account menu"
                  aria-haspopup="true"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
                aria-label="User menu"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/profile/${user.email?.split('@')[0] || user.id || 'profile'}`}
                    className="cursor-pointer focus:bg-accent"
                    aria-label="Go to Profile"
                  >
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="cursor-pointer focus:bg-accent"
                    aria-label="Go to Settings"
                  >
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={loadingSignOut}
                  className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              variant="default"
              className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Sign in to your account"
            >
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign In
            </Button>
          )}
        </nav>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  )
}