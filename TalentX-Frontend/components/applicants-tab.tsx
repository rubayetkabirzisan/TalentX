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
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { Download, MessageSquare } from 'lucide-react'
import { useRealtime } from './realtime-provider'

interface Applicant {
  id: string
  talent_id: string
  talent_name: string
  source: string
  status: string
  cover_letter?: string
  applied_at: string
}

interface ApplicantsTabProps {
  jobId: string | null
}

export function ApplicantsTab({ jobId }: ApplicantsTabProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null)
  const [timeslot, setTimeslot] = useState('')
  const { toast } = useToast()
  const { setActiveChatUserId } = useRealtime()

  useEffect(() => {
    if (!jobId) {
      setApplicants([])
      return
    }

    const fetchApplicants = async () => {
      try {
        setError(null)
        setIsLoading(true)
        const auth = JSON.parse(localStorage.getItem('auth') || '{}')
const response = await fetch(
  `/api/employer/jobs/${jobId}/applicants`,
  {
    headers: {
      'x-user-id': auth.id || '',
      'x-role': auth.role || '',
      'x-name': auth.name || '',
    },
  }
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

  // Removing early return for no applicants so table renders

  const handleSchedule = async (appId: string) => {
    if (!timeslot) return

    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const res = await fetch(`${BACKEND}/employer/jobs/${jobId}/applicants/${appId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': auth.id || '',
          'x-role': auth.role || '',
        },
        body: JSON.stringify({ timeslot })
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error?.message || 'Failed to schedule interview')
      }
      
      toast({ title: 'Success', description: 'Interview scheduled!' })
      setSchedulingAppId(null)
      setTimeslot('')
      
      // Update local state
      setApplicants(prev => prev.map(a => 
        a.id === appId ? { ...a, status: 'interviewing' } : a
      ))
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Source', 'Status', 'Applied Date', 'Cover Letter']
    const rows = applicants.map(a => [
      a.talent_name,
      a.source,
      a.status,
      new Date(a.applied_at).toLocaleDateString(),
      `"${(a.cover_letter || '').replace(/"/g, '""')}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "applicants.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" /> Export to CSV
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                No applicants yet
              </TableCell>
            </TableRow>
          ) : (
            applicants.map((applicant) => (
              <TableRow key={applicant.id}>
                <TableCell className="font-medium">
                  {applicant.talent_name}
                  {applicant.cover_letter && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                      {applicant.cover_letter}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{applicant.source}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={applicant.status === 'interviewing' ? 'default' : 'outline'}>
                    {applicant.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(applicant.applied_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveChatUserId(applicant.talent_id)}
                      title="Message Talent"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Dialog open={schedulingAppId === applicant.id} onOpenChange={(open) => setSchedulingAppId(open ? applicant.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={applicant.status === 'interviewing'}>
                          {applicant.status === 'interviewing' ? 'Scheduled' : 'Schedule Interview'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Interview</DialogTitle>
                          <DialogDescription>
                            Propose a date and time for an interview with {applicant.talent_name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder="e.g. Next Tuesday at 2pm EST"
                            value={timeslot}
                            onChange={(e) => setTimeslot(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setSchedulingAppId(null)}>Cancel</Button>
                          <Button onClick={() => handleSchedule(applicant.id)} disabled={!timeslot}>
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  )
}
