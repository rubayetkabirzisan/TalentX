'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

interface Application {
  id: string
  company: string
  jobTitle: string
  source: 'manual' | 'invitation'
  appliedAt: string
}

const sourceConfig = {
  manual: {
    label: 'Manual',
    className: 'bg-blue-500/10 text-blue-700',
  },
  invitation: {
    label: 'Invitation',
    className: 'bg-purple-500/10 text-purple-700',
  },
}

export function ApplicationHistoryTab() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setError(null)
        const response = await fetch('/api/talent/applications')
        if (!response.ok) throw new Error('Failed to fetch applications')
        const data = await response.json()
        setApplications(data)
      } catch (err) {
        console.error('[v0] Fetch applications error:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load applications'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
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
            <div className="h-4 bg-muted rounded w-24" />
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

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No applications yet
        </h3>
        <p className="text-muted-foreground">
          Start applying to jobs to build your application history
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((application) => {
        const Config =
          sourceConfig[application.source as keyof typeof sourceConfig]

        return (
          <div
            key={application.id}
            className="rounded-lg border border-border bg-card p-5 flex items-start justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {application.jobTitle}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {application.company}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={`ml-4 whitespace-nowrap ${Config.className}`}>
              {Config.label}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}
