'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, User, Camera, Mail, Key, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    const emailName = user.email.split('@')[0]
    return emailName.charAt(0).toUpperCase()
  }

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion logic
    // This should:
    // 1. Delete all user data (books, progress, etc.)
    // 2. Delete the user account from Supabase
    // 3. Sign out the user
    // 4. Redirect to home page
    console.log('Account deletion requested for:', user?.email)
    alert('Account deletion not yet implemented')
  }

  const handleChangePassword = () => {
    // TODO: Implement password change logic
    // This should:
    // 1. Show a modal or form for current password and new password
    // 2. Call Supabase auth.updateUser() with new password
    // 3. Handle errors appropriately
    setIsChangingPassword(true)
    setTimeout(() => {
      alert('Password change not yet implemented')
      setIsChangingPassword(false)
    }, 500)
  }

  const handleUploadPicture = () => {
    // TODO: Implement profile picture upload
    // This should:
    // 1. Allow user to select an image file
    // 2. Upload to Supabase Storage or similar
    // 3. Update user metadata with image URL
    // 4. Refresh the avatar display
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('Profile picture selected:', file.name)
        // TODO: Upload file and update user profile
        alert('Profile picture upload not yet implemented')
      }
    }
    input.click()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access your settings
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button / Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Picture Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" aria-hidden="true" />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Update your profile picture that will be displayed across the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Recommended: Square image, at least 400x400 pixels
                </p>
                <Button
                  onClick={handleUploadPicture}
                  variant="outline"
                  className="w-fit"
                  aria-label="Change profile picture"
                >
                  <Camera className="h-4 w-4 mr-2" aria-hidden="true" />
                  Change Picture
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden="true" />
              Account Information
            </CardTitle>
            <CardDescription>
              View and manage your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
                aria-label="Email address (read-only)"
              />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed at this time
              </p>
            </div>

            {/* Change Password Button */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" aria-hidden="true" />
                Password
              </Label>
              <Button
                onClick={handleChangePassword}
                variant="outline"
                disabled={isChangingPassword}
                className="w-full sm:w-auto"
                aria-label="Change password"
              >
                {isChangingPassword ? (
                  <>
                    <span className="mr-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" aria-hidden="true" />
                    Change Password
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Section */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-destructive mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All your
                  data, including books, progress, and achievements will be
                  permanently deleted.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      aria-label="Delete account"
                    >
                      <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        your account and remove all your data from our servers.
                        <br />
                        <br />
                        This includes:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All books you&apos;ve created</li>
                          <li>Your typing progress and statistics</li>
                          <li>Your account profile and settings</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

