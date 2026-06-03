'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { JobSearch } from '@/components/job-search'
import { JobCard } from '@/components/job-card'
import { EmptyState } from '@/components/empty-state'
import { JobListSkeleton } from '@/components/job-skeleton'
import { ArrowLeft } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  applicationCount: number
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const fetchJobs = useCallback(async (query: string) => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams()
      if (query) {
        params.append('search', query)
      }
      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      fetchJobs(query)
    },
    [fetchJobs]
  )

  // Fetch initial jobs on mount
  useEffect(() => {
    fetchJobs('')
  }, [fetchJobs])

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/landing" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Back</span>
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-foreground">Job Listings</h1>
            </div>
            <div className="w-12" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-foreground">Discover Your Next Opportunity</h2>
            <p className="mt-2 text-muted-foreground">
              Browse thousands of tech jobs matched to your skills
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <JobSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <JobListSkeleton />
        ) : jobs.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {jobs.length}{' '}
                {jobs.length === 1 ? 'job' : 'jobs'}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  applicationCount={job.applicationCount}
                />
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <EmptyState />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        )}
      </div>
    </main>
  )
}
