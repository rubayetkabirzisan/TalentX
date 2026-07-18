'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getAuth, clearAuth } from '@/lib/auth'
import { LogOut, Briefcase, User, Sun, Moon, Menu, X, Zap, Bell, Check } from 'lucide-react'
import { useRealtime } from '@/components/realtime-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [auth, setAuth] = useState<{
    email: string
    role: string
    name: string
  } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { unreadNotifications, notifications, setUnreadNotifications } = useRealtime()

  useEffect(() => {
    setMounted(true)
    setAuth(getAuth())
  }, [pathname])

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const handleMarkAsRead = async (notifId?: string) => {
    // In a real app, this would call an API to mark as read in DB
    // For now, just optimistically clear the unread count
    setUnreadNotifications(0)
  }

  return (
    <nav
      className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50"
      data-testid="navbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="navbar-logo">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight">TalentX</span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-browse-jobs"
            >
              Browse Jobs
            </Link>
            {auth?.role === 'employer' && (
              <Link
                href="/employer/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-employer-dashboard"
              >
                Dashboard
              </Link>
            )}
            {auth?.role === 'talent' && (
              <Link
                href="/talent/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-talent-dashboard"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth + Theme Toggle */}
          <div className="flex items-center gap-2">

            {/* Notification Bell */}
            {auth && (
              <DropdownMenu onOpenChange={(open) => { if(!open) handleMarkAsRead() }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 whitespace-normal">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm">{notif.title}</span>
                            {!notif.read && <span className="h-2 w-2 rounded-full bg-violet-500"></span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{notif.body}</span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Dark mode toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
                aria-label="Toggle dark mode"
                data-testid="theme-toggle"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {auth ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-full px-3 py-1">
                    {auth.role === 'employer' ? (
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span className="font-medium text-foreground">{auth.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    data-testid="navbar-logout"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" data-testid="navbar-signin">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login?role=talent">
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90" data-testid="navbar-get-started">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/jobs"
              className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Browse Jobs
            </Link>
            {auth?.role === 'employer' && (
              <Link
                href="/employer/dashboard"
                className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {auth?.role === 'talent' && (
              <Link
                href="/talent/dashboard"
                className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-border">
              {auth ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0">
                    Sign In / Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}