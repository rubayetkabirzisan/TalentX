'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'talent' | 'employer'>('talent')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }

      // Call backend to upsert user and get their real DB id
      const res = await fetch(`${BACKEND}/me/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': email,          // use email as unique identifier
          'x-role': role,
          'x-name': email.split('@')[0], // use email prefix as display name
        },
        body: JSON.stringify({ role, name: email.split('@')[0] }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json?.error?.message || 'Login failed')
        return
      }

      const json = await res.json()
      const user = json.data

      // Store real user info from DB
      localStorage.setItem('auth', JSON.stringify({
        id: user.id,
        email,
        role: user.role,
        name: user.name,
      }))

      // Redirect based on role
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
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to apply for jobs or post opportunities
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                I am a...
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="talent"
                    checked={role === 'talent'}
                    onChange={() => setRole('talent')}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-foreground">Job Seeker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={role === 'employer'}
                    onChange={() => setRole('employer')}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-foreground">Employer</span>
                </label>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground mb-2">How to use</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Enter any email + password to create/login your account</li>
            <li>• Select your role — Job Seeker or Employer</li>
            <li>• Your account is saved to the real database</li>
          </ul>
        </div>
      </div>
    </main>
  )
}