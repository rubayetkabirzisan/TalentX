'use client'

// ⚠️  DEV-ONLY widget — hidden in production via NEXT_PUBLIC_SHOW_DEV_AUTH=true
// Remove this component from layout.tsx if you are going live.

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { getAuth, clearAuth } from '@/lib/auth'

export function DemoAuth() {
  // Only render when explicitly enabled in dev
  if (process.env.NEXT_PUBLIC_SHOW_DEV_AUTH !== 'true') return null

  const [auth, setAuth] = useState<{
    email: string
    role: string
    name: string
  } | null>(null)
  const [collapsed, setCollapsed] = useState(false)

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
    <div
      className="fixed bottom-4 right-4 bg-card border border-border rounded-xl p-3 text-sm max-w-[220px] z-50 shadow-lg"
      data-testid="dev-auth-widget"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dev Auth</span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle dev auth widget"
        >
          {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="mb-2">
            <p className="font-medium text-foreground truncate">{auth.name}</p>
            <p className="text-xs text-muted-foreground truncate">{auth.email}</p>
            <p className="text-xs text-primary capitalize font-medium">{auth.role}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="w-full text-xs h-7 bg-transparent"
          >
            <LogOut className="mr-1.5 h-3 w-3" />
            Logout
          </Button>
        </>
      )}
    </div>
  )
}