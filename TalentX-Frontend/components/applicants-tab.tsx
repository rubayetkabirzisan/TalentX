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

interface Applicant {
  id: string
  name: string
  email: string
  source: string
  appliedAt: string
}

interface ApplicantsTabProps {
  jobId: string | null
}

export function ApplicantsTab({ jobId }: ApplicantsTabProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setApplicants([])
      return
    }

    const fetchApplicants = async () => {
      try {
        setError(null)
        setIsLoading(true)
        const response = await fetch(
          `/api/employer/jobs/${jobId}/applicants`
        )
        if (!response.ok) throw new Error('Failed to fetch applicants')
        const data = await response.json()
        setApplicants(data)
      } catch (err) {
        console.error('[v0] Fetch applicants error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load applicants')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicants()
  }, [jobId])

  if (!jobId) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Select a job from the "My Jobs" tab to view applicants
      </div>
    )
  }

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading applicants...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-destructive">{error}</div>
  }

  if (applicants.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No applicants yet</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Applied Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              <TableCell className="font-medium">{applicant.name}</TableCell>
              <TableCell>{applicant.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{applicant.source}</Badge>
              </TableCell>
              <TableCell>
                {new Date(applicant.appliedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
