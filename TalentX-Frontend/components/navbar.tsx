'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getAuth, clearAuth } from '@/lib/auth'
import { LogOut, Briefcase, User } from 'lucide-react'

export function Navbar() {
  const [auth, setAuth] = useState<{
    email: string
    role: string
    name: string
  } | null>(null)

  useEffect(() => {
    setAuth(getAuth())
  }, [])

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 hover:opacity-80">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TX</span>
            </div>
            <span className="font-semibold text-foreground">TalentX</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
              Browse Jobs
            </Link>
            {auth?.role === 'employer' && (
              <Link href="/employer/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            )}
            {auth?.role === 'talent' && (
              <Link href="/talent/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {auth ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  {auth.role === 'employer' ? (
                    <Briefcase className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{auth.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}