'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function DemoAuth() {
  const [auth, setAuth] = useState<{
    email: string
    role: 'Talent' | 'Employer'
  } | null>(null)

  useEffect(() => {
    const mockAuth = localStorage.getItem('mockAuth')
    if (mockAuth) {
      setAuth(JSON.parse(mockAuth))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('mockAuth')
    setAuth(null)
    window.location.reload()
  }

  if (!auth) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 text-sm max-w-xs">
      <div className="mb-3">
        <p className="font-medium text-foreground">{auth.email}</p>
        <p className="text-xs text-muted-foreground">{auth.role}</p>
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
