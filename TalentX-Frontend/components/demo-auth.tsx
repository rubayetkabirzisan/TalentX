'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { getAuth, clearAuth } from '@/lib/auth'

export function DemoAuth() {
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
    setAuth(null)
    window.location.href = '/login'
  }
const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
if (pathname === '/landing' || pathname === '/login' || pathname === '/') {
  return null
}
  if (!auth) return null

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 text-sm max-w-xs z-50">
      <div className="mb-3">
        <p className="font-medium text-foreground">{auth.name}</p>
        <p className="text-xs text-muted-foreground">{auth.email}</p>
        <p className="text-xs text-muted-foreground capitalize">{auth.role}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleLogout}
        className="w-full bg-transparent"
      >
        <LogOut className="mr-2 h-3 w-3" />
        Logout
      </Button>
    </div>
  )
}