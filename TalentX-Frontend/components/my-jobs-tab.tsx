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
import { Button } from '@/components/ui/button'

interface Job {
  id: string
  title: string
  company: string
  applicants: number
  deadline: string
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
        const auth = JSON.parse(localStorage.getItem('auth') || '{}')
        const response = await fetch('/api/employer/jobs', {
          headers: {
            'x-user-id': auth.email || '',
            'x-role': auth.role || '',
            'x-name': auth.name || '',
          },
        })
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
              <TableCell>{job.applicant_count ?? 0}</TableCell>
              <TableCell>
                {new Date(job.deadline).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span className={new Date(job.deadline) < new Date() ? 'text-destructive text-sm' : 'text-green-600 text-sm'}>
                  {new Date(job.deadline) < new Date() ? 'Closed' : 'Active'}
                </span>
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