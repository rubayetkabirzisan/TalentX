'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Zap } from 'lucide-react'
import { ApplyButton } from '@/components/apply-button'

interface MatchedJob {
  id: string
  title: string
  company: string
  deadline: string
  score: number
  technologies: string[]
}

export function JobMatchFeed() {
  const [jobs, setJobs] = useState<MatchedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [isApplying, setIsApplying] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchFeed = async () => {
  try {
    setError(null)
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    const headers = {
      'x-user-id': auth.email || auth.id || '',
      'x-role': auth.role || '',
      'x-name': auth.name || '',
    }

    // Pre-load already applied jobs
    const appsRes = await fetch('/api/talent/applications', { headers })
    if (appsRes.ok) {
      const appsData = await appsRes.json()
      const appliedIds = new Set<string>(appsData.map((a: any) => a.job_id))
      setAppliedJobs(appliedIds)
    }

    const response = await fetch('/api/talent/feed', {
      headers
    })
     
        if (!response.ok) throw new Error('Failed to fetch job feed')
        const data = await response.json()
        setJobs(data)
      } catch (err) {
        console.error('[v0] Fetch job feed error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeed()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 animate-pulse"
          >
            <div className="h-6 bg-muted rounded w-1/3 mb-3" />
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-12" />
              <div className="h-6 bg-muted rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No matching jobs yet
        </h3>
        <p className="text-muted-foreground">
          Complete your profile to get personalized job recommendations
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
            </div>
            <Badge className="ml-4 whitespace-nowrap bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
              {job.score}% match
            </Badge>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(job.technologies ?? job.tech_stack ?? []).slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {(job.technologies ?? job.tech_stack ?? []).length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{(job.technologies ?? job.tech_stack ?? []).length - 4} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </p>
            <div className="w-[200px]">
              {appliedJobs.has(job.id) ? (
                <Button disabled size="sm" className="w-full">Applied</Button>
              ) : (
                <ApplyButton 
                  jobId={job.id} 
                  deadlinePassed={new Date(job.deadline) < new Date()}
                  isLoggedIn={true}
                  onSuccess={() => {
                    setAppliedJobs((prev) => new Set([...prev, job.id]))
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
