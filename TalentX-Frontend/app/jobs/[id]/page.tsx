'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { ArrowLeft } from 'lucide-react'
import { ApplyButton } from '@/components/apply-button'
import { JobHeader } from '@/components/job-header'
import { TechStack } from '@/components/tech-stack'

interface JobDetails {
  id: string
  title: string
  company: string
  applicationCount: number
  deadline: string
  technologies: string[]
  description: string
}

// Mock auth - replace with real auth check
function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<'Talent' | 'Employer' | null>(null)

  useEffect(() => {
    // In production, verify auth token from localStorage or cookies
    const mockAuth = localStorage.getItem('mockAuth')
    if (mockAuth) {
      const auth = JSON.parse(mockAuth)
      setIsLoggedIn(true)
      setUserRole(auth.role)
    }
  }, [])

  return { isLoggedIn, userRole }
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [job, setJob] = useState<JobDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(null)
  const { isLoggedIn, userRole } = useAuth()

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id)
    })
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchJobDetails = async () => {
      try {
        setError(null)
        const response = await fetch(`/api/jobs/${id}`)

        if (!response.ok) {
          throw new Error('Job not found')
        }

        const data = await response.json()
        setJob(data)
      } catch (err) {
        console.error('[v0] Fetch job error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load job')
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [id])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-1/4" />
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block mb-8">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
          <div className="rounded-lg border border-border bg-card p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Job not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              The job listing you're looking for is no longer available.
            </p>
            <Link href="/">
              <Button>Back to all jobs</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const deadlinePassed = new Date(job.deadline) < new Date()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        {/* Main Card */}
        <div className="rounded-lg border border-border bg-card p-8 mb-8">
          {/* Header Section */}
          <JobHeader
            title={job.title}
            company={job.company}
            deadline={job.deadline}
            applicationCount={job.applicationCount}
          />

          {/* Tech Stack */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Tech Stack
            </h2>
            <TechStack technologies={job.technologies} />
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* Job Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              About this role
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              {job.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* Apply Section */}
          <div className="mt-8">
            <ApplyButton
              jobId={job.id}
              deadlinePassed={deadlinePassed}
              isLoggedIn={isLoggedIn}
              userRole={userRole || undefined}
            />
          </div>
        </div>
      </div>

      <Toaster />
    </main>
  )
}
