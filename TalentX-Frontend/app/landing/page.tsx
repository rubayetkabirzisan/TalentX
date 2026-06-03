'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Briefcase, Target, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="font-semibold text-foreground">JobMatch</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
                  Find Your Perfect Tech Job Match
                </h1>
                <p className="text-balance text-lg text-muted-foreground">
                  Connect top talent with amazing tech opportunities. Powered by AI-driven matching to find your ideal fit.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/jobs" className="flex-1 sm:flex-initial">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/employer/dashboard" className="flex-1 sm:flex-initial">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Post a Job
                  </Button>
                </Link>
              </div>

              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">10k+</div>
                  <p className="text-sm text-muted-foreground">Tech Talents</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">95%</div>
                  <p className="text-sm text-muted-foreground">Match Success</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 lg:aspect-auto lg:h-96">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center justify-center gap-3 rounded-lg bg-card p-4 border border-border">
                  <Target className="h-6 w-6 text-primary" />
                  <span className="font-semibold">AI Job Matching</span>
                </div>
                <div className="text-3xl font-bold text-primary">94%</div>
                <p className="text-center text-sm text-muted-foreground">Average Match Score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-card/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our platform uses advanced AI to match talent with opportunities that align with your skills and goals.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4 rounded-lg border border-border bg-background p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">For Talent</h3>
              <p className="text-sm text-muted-foreground">
                Discover jobs matched to your skills, experience, and career goals. Get notified about opportunities before anyone else.
              </p>
              <Link href="/jobs">
                <Button variant="link" className="p-0">
                  Browse Jobs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-background p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">For Employers</h3>
              <p className="text-sm text-muted-foreground">
                Post jobs and reach pre-vetted candidates. Our AI finds the best matches for your open positions.
              </p>
              <Link href="/employer/dashboard">
                <Button variant="link" className="p-0">
                  Post Job <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-background p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Perfect Matches</h3>
              <p className="text-sm text-muted-foreground">
                AI algorithms find candidates and jobs with the highest compatibility for mutual success.
              </p>
              <Link href="/talent/dashboard">
                <Button variant="link" className="p-0">
                  View Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-12 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Ready to Find Your Next Opportunity?
              </h2>
              <p className="text-muted-foreground">
                Join thousands of tech professionals already using JobMatch to advance their careers.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/jobs">
                <Button size="lg">
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-primary" />
                <span className="font-semibold text-foreground">JobMatch</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered job matching platform connecting talent with opportunity.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">For Talent</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/talent/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">For Employers</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/employer/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Post Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/employer/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 JobMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
