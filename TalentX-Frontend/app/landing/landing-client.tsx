'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { ArrowRight, Briefcase, Target, TrendingUp, CheckCircle, Star, Zap } from 'lucide-react'

const features = [
  {
    icon: Briefcase,
    title: 'For Talent',
    description: 'Discover jobs matched to your skills, experience, and career goals. Get AI-ranked opportunities before anyone else.',
    href: '/jobs',
    cta: 'Browse Jobs',
  },
  {
    icon: TrendingUp,
    title: 'For Employers',
    description: 'Post jobs and instantly reach pre-vetted candidates. Our AI surfaces the best-fit talent for every role.',
    href: '/login?role=employer',
    cta: 'Post a Job',
  },
  {
    icon: Target,
    title: 'Perfect Matches',
    description: 'AI algorithms score compatibility between talent and roles — both sides get only high-signal, relevant connections.',
    href: '/login?role=talent',
    cta: 'View Dashboard',
  },
]

const benefits = [
  'AI-powered match scoring — no more manual filtering',
  'Two-way invitation system for proactive hiring',
  'Skill-based profile that gets smarter over time',
  'Real-time application tracking for candidates',
]

export default function LandingPageClient() {
  const [auth, setAuth] = useState<{ role: string } | null>(null)
  const [dbStats, setDbStats] = useState({ employers: 0, talents: 0, jobs: 0, applications: 0, avgMatchScore: 94 })

  useEffect(() => {
    setAuth(getAuth())
    apiFetch('/stats')
      .then(data => {
        if (data) setDbStats(data)
      })
      .catch(err => console.error("Failed to fetch stats", err))
  }, [])

  const displayFeatures = features.filter((f) => {
    if (auth?.role === 'talent' && f.title === 'For Employers') return false
    if (auth?.role === 'employer' && f.title === 'For Talent') return false
    return true
  })

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" data-testid="hero-section">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 hero-glow" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/5 blur-3xl" aria-hidden="true" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

            {/* Left copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                AI-Powered Job Matching
              </div>

              <div className="space-y-4">
                <h1
                  className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
                  data-testid="hero-heading"
                >
                  Find Your{' '}
                  <span className="gradient-text">Perfect</span>{' '}
                  {!auth ? 'Tech Match' : auth.role === 'employer' ? 'Tech Talent Match' : 'Tech Job Match'}
                </h1>
                <p className="text-balance text-lg text-muted-foreground max-w-lg leading-relaxed">
                  {!auth 
                    ? 'The AI-powered marketplace connecting top tech professionals with innovative companies. We match based on true skills and compatibility, not just keywords.'
                    : auth.role === 'employer' 
                    ? 'Connect with top tech professionals. Powered by AI-driven matching that understands skills, not just keywords.'
                    : 'Connect with top tech opportunities. Powered by AI-driven matching that understands your skills, not just keywords.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {auth?.role === 'talent' ? (
                  <>
                    <Link href="/jobs" data-testid="hero-explore-jobs">
                      <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-105">
                        Explore Jobs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/talent/dashboard">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-accent transition-all duration-200">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                ) : auth?.role === 'employer' ? (
                  <>
                    <Link href="/employer/dashboard">
                      <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-105">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/employer/dashboard?tab=create" data-testid="hero-post-job">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-accent transition-all duration-200">
                        Post a Job
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/jobs" data-testid="hero-explore-jobs">
                      <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0 hover:opacity-90 shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-105">
                        Explore Jobs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login?role=employer" data-testid="hero-post-job">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-accent transition-all duration-200">
                        Post a Job
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-2" data-testid="hero-stats">
                {[
                  { value: dbStats.jobs, label: 'Active Jobs' },
                  { value: dbStats.talents, label: 'Tech Talents' },
                  { value: `${dbStats.avgMatchScore}%`, label: 'Match Success' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual — dashboard preview card */}
            <div className="relative">
              <div className="relative rounded-2xl border border-border/60 bg-card shadow-2xl shadow-violet-500/10 overflow-hidden">
                {/* Mock header bar */}
                <div className="flex items-center gap-2 border-b border-border bg-card/80 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <div className="ml-3 flex-1 rounded-md bg-muted h-5 max-w-[180px]" />
                </div>

                {/* Mock match card */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-5 w-40 rounded-md bg-muted mb-1.5" />
                      <div className="h-3.5 w-24 rounded-md bg-muted/60" />
                    </div>
                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 shadow-md">
                      <span className="text-xl font-bold text-white leading-none">94</span>
                      <span className="text-[9px] text-white/80 font-medium">match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL'].map((tag) => (
                      <span key={tag} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="h-px bg-border" />

                  {/* Two more mock job rows */}
                  {[82, 71].map((score) => (
                    <div key={score} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                      <div className="flex-1 space-y-1">
                        <div className="h-3.5 w-32 rounded bg-muted" />
                        <div className="h-2.5 w-20 rounded bg-muted/60" />
                      </div>
                      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-secondary border border-border text-xs font-bold text-foreground">
                        {score}
                      </div>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 text-white border-0"
                  >
                    View All Matches
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 px-4 py-2 shadow-lg text-white text-sm font-semibold flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-white" />
                94% Avg Match
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50 px-4 py-20 sm:px-6 lg:px-8" data-testid="features-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our platform uses advanced AI to match talent with opportunities that perfectly align with your skills and goals.
            </p>
          </div>

          <div className={`grid gap-6 ${displayFeatures.length === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 max-w-4xl mx-auto'}`}>
            {displayFeatures.map(({ icon: Icon, title, description, href, cta }) => {
              let dynamicHref = href
              if (auth?.role === 'employer' && title === 'For Employers') dynamicHref = '/employer/dashboard?tab=create'
              if (auth?.role === 'employer' && title === 'Perfect Matches') dynamicHref = '/employer/dashboard'
              if (auth?.role === 'talent' && title === 'Perfect Matches') dynamicHref = '/talent/dashboard'

              return (
                <div
                  key={title}
                  className="group space-y-4 rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                  data-testid={`feature-card-${title.toLowerCase().replace(/\\s+/g, '-')}`}
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/10 to-indigo-500/10 group-hover:from-violet-600/20 group-hover:to-indigo-500/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  <Link href={dynamicHref}>
                    <Button variant="link" className="p-0 text-primary hover:text-primary/80">
                      {cta} <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {!auth ? 'Built for modern tech hiring & careers' 
                 : auth.role === 'talent' ? 'Built for modern tech careers' 
                 : 'Built for modern tech hiring'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {!auth 
                  ? 'TalentX eliminates the noise of traditional job boards by using AI to surface only the most relevant opportunities and candidates — so everyone connects faster.'
                  : auth.role === 'talent' 
                  ? 'TalentX eliminates the noise of traditional job boards by using AI to surface only the most relevant opportunities — so you can focus on advancing your career.'
                  : 'TalentX eliminates the noise of traditional job boards by using AI to surface only the most relevant candidates — so you can close roles faster with better matches.'}
              </p>
              <ul className="space-y-3">
                {[
                  'AI-powered match scoring — no more manual filtering',
                  !auth ? 'Proactive two-way invitation system' : auth.role === 'talent' ? 'Direct interview invitations from top companies' : 'Proactive two-way invitation system for faster hiring',
                  'Skill-based profile that gets smarter over time',
                  !auth ? 'Real-time tracking for applications and hiring pipelines' : auth.role === 'employer' ? 'Automated candidate tracking and scoring' : 'Real-time application tracking and status updates',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(!auth ? [
                { label: 'Active tech talents', value: dbStats.talents, sub: 'pre-vetted professionals' },
                { label: 'Active employers', value: dbStats.employers, sub: 'verified companies' },
                { label: 'Match accuracy', value: `${dbStats.avgMatchScore}%`, sub: 'based on AI score vs outcome' },
                { label: 'Total Applications', value: dbStats.applications, sub: 'processed via platform' },
              ] : [
                { label: auth.role === 'talent' ? 'Avg. time to get hired' : 'Avg. time to hire', value: '5 days', sub: 'vs 30-day industry avg' },
                { label: 'Match accuracy', value: `${dbStats.avgMatchScore}%`, sub: 'based on AI score vs outcome' },
                { label: auth.role === 'employer' ? 'Active tech talents' : 'Active employers', value: auth.role === 'employer' ? dbStats.talents : dbStats.employers, sub: auth.role === 'employer' ? 'pre-vetted professionals' : 'verified companies' },
                { label: 'Total Applications', value: dbStats.applications, sub: 'processed via platform' },
              ]).map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-5 space-y-1 hover:border-primary/30 transition-colors">
                  <div className="text-2xl font-bold gradient-text">{m.value}</div>
                  <div className="text-sm font-medium text-foreground">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" data-testid="cta-section">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-12 text-center text-white shadow-2xl shadow-violet-500/30">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" aria-hidden="true" />
            <div className="relative space-y-6">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {!auth ? 'Ready to Connect?' : auth.role === 'employer' ? 'Ready to Build Your Team?' : 'Ready to Find Your Next Opportunity?'}
              </h2>
              <p className="text-white/80 max-w-xl mx-auto">
                {!auth 
                  ? 'Join thousands of tech professionals and innovative companies using TalentX to make smarter hiring and career decisions.'
                  : auth.role === 'employer'
                  ? 'Join innovative companies already using TalentX to hire top engineering talent faster with AI-powered matching.'
                  : 'Join thousands of tech professionals already using TalentX to advance their careers with AI-powered job matching.'}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {auth?.role === 'talent' ? (
                  <>
                    <Link href="/jobs">
                      <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 border-0 shadow-md font-semibold" data-testid="cta-explore-jobs">
                        Start Exploring
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/talent/dashboard">
                      <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                ) : auth?.role === 'employer' ? (
                  <>
                    <Link href="/employer/dashboard">
                      <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 border-0 shadow-md font-semibold">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/employer/dashboard?tab=create">
                      <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
                        Post a Job Free
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/jobs">
                      <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 border-0 shadow-md font-semibold" data-testid="cta-explore-jobs">
                        Start Exploring
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login?role=employer">
                      <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
                        Post a Job Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50 px-4 py-12 sm:px-6 lg:px-8" data-testid="footer">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row flex-wrap gap-12 sm:gap-24 lg:gap-32">
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-foreground">TalentX</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered job matching platform connecting talent with opportunity.
              </p>
            </div>
            <div className="flex flex-wrap gap-12 sm:gap-24">
              {auth?.role !== 'employer' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">For Talent</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Find Jobs
                      </Link>
                    </li>
                    <li>
                      <Link href="/talent/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Dashboard
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
              {auth?.role !== 'talent' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">For Employers</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href={auth?.role === 'employer' ? '/employer/dashboard?tab=create' : '/login?role=employer'} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Post Jobs
                      </Link>
                    </li>
                    <li>
                      <Link href={auth?.role === 'employer' ? '/employer/dashboard' : '/login?role=employer'} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Dashboard
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
              {!auth && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Account</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/login?tab=signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Create Account
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TalentX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
