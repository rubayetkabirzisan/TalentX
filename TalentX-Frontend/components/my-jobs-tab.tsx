'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Job {
  id: string
  title: string
  company: string
  applicants: number
  deadline: string
  status: 'Active' | 'Closed' | 'Filled'
}

interface MyJobsTabProps {
  onSelectJob: (jobId: string) => void
}

export function MyJobsTab({ onSelectJob }: MyJobsTabProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError(null)
        const response = await fetch('/api/employer/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const data = await response.json()
        setJobs(data)
      } catch (err) {
        console.error('[v0] Fetch employer jobs error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default'
      case 'Closed':
        return 'secondary'
      case 'Filled':
        return 'outline'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading jobs...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-destructive">{error}</div>
  }

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">No jobs posted yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first job posting to get started
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Applicants</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.applicants}</TableCell>
              <TableCell>
                {new Date(job.deadline).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(job.status)}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectJob(job.id)}
                >
                  View Applicants
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
