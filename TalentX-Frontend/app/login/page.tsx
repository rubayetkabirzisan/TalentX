'use client'

import React from "react"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'Talent' | 'Employer'>('Talent')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Mock login - in production, call your auth API
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Store mock auth
      localStorage.setItem(
        'mockAuth',
        JSON.stringify({
          email,
          role,
          loggedInAt: new Date().toISOString(),
        })
      )

      // Redirect to return URL or home
      router.push(returnUrl)
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error('[v0] Login error:', err)
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
                    value="Talent"
                    checked={role === 'Talent'}
                    onChange={(e) => setRole(e.target.value as 'Talent')}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-foreground">Job Seeker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="Employer"
                    checked={role === 'Employer'}
                    onChange={(e) => setRole(e.target.value as 'Employer')}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-foreground">Employer</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo credentials info */}
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            Demo Credentials
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Use any email and password to login. Select your role (Job Seeker or Employer).
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Job Seekers can apply to positions</li>
            <li>• Employers see a different view in job listings</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
