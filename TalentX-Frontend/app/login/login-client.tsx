'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, Zap, Briefcase, User } from 'lucide-react'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const defaultRole = (searchParams.get('role') as 'talent' | 'employer') || 'talent'
  const isSignUp = searchParams.get('tab') === 'signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'talent' | 'employer'>(defaultRole)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already logged in
  React.useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      if (auth.id) {
        if (auth.role === 'employer') {
          router.replace('/employer/dashboard')
        } else {
          router.replace('/talent/dashboard')
        }
      }
    } catch (err) {
      console.error('Error checking auth state:', err)
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }

      const endpoint = isSignUp ? '/auth/register' : '/auth/login'
      const body = isSignUp ? { email, password, role, name: email.split('@')[0] } : { email, password, role }

      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json?.error?.message || 'Login failed')
        return
      }

      const json = await res.json()
      const user = json.data

      localStorage.setItem('auth', JSON.stringify({
        id: user.id,
        email,
        role: user.role,
        name: user.name,
      }))
      // Dispatch custom event for real-time connection
      window.dispatchEvent(new Event('auth_changed'))

      if (user.role === 'employer') {
        router.push('/employer/dashboard')
      } else {
        router.push('/talent/dashboard')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4" data-testid="login-page">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 hero-glow" aria-hidden="true" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/landing" className="inline-block mb-8">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Brand mark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">TalentX</span>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-xl shadow-violet-500/5">
          <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="login-heading">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? 'Join TalentX to apply for jobs or post opportunities' : 'Sign in to apply for jobs or post opportunities'}
          </p>

          <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
            {error && (
              <div
                className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
                data-testid="login-error"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                data-testid="login-email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                data-testid="login-password"
              />
            </div>

            {/* Role selection */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">I am a...</p>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition-all duration-150 ${
                    role === 'talent'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-accent/50'
                  }`}
                  data-testid="role-talent"
                >
                  <input
                    type="radio"
                    name="role"
                    value="talent"
                    checked={role === 'talent'}
                    onChange={() => setRole('talent')}
                    disabled={isLoading}
                    className="sr-only"
                  />
                  <User className={`h-4 w-4 ${role === 'talent' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'talent' ? 'text-primary' : 'text-foreground'}`}>
                    Job Seeker
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition-all duration-150 ${
                    role === 'employer'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-accent/50'
                  }`}
                  data-testid="role-employer"
                >
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={role === 'employer'}
                    onChange={() => setRole('employer')}
                    disabled={isLoading}
                    className="sr-only"
                  />
                  <Briefcase className={`h-4 w-4 ${role === 'employer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'employer' ? 'text-primary' : 'text-foreground'}`}>
                    Employer
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 shadow-md"
              disabled={isLoading}
              data-testid="login-submit"
            >
              {isLoading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link 
              href={isSignUp ? `/login?role=${role}` : `/login?tab=signup&role=${role}`} 
              className="text-primary hover:underline font-medium" 
              data-testid="auth-toggle-link"
            >
              {isSignUp ? 'Sign in' : 'Create one for free'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
