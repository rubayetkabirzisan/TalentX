'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Talent {
  id: string
  name: string
  email: string
  matchScore: number
  invitationStatus: 'None' | 'Pending' | 'Accepted' | 'Declined'
}

interface TalentMatchesTabProps {
  jobId: string | null
}

export function TalentMatchesTab({ jobId }: TalentMatchesTabProps) {
  const { toast } = useToast()
  const [talents, setTalents] = useState<Talent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitingTalentId, setInvitingTalentId] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setTalents([])
      return
    }

    const fetchTalents = async () => {
      try {
        setError(null)
        setIsLoading(true)
        const response = await fetch(
          `/api/jobs/${jobId}/matched-talents`
        )
        if (!response.ok) throw new Error('Failed to fetch matched talents')
        const data = await response.json()
        setTalents(data)
      } catch (err) {
        console.error('[v0] Fetch matched talents error:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load talents'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchTalents()
  }, [jobId])

  const handleInvite = async (talentId: string) => {
    if (!jobId) return

    setInvitingTalentId(talentId)
    try {
      const response = await fetch(
        `/api/jobs/${jobId}/invite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ talentId }),
        }
      )

      if (!response.ok) throw new Error('Failed to send invitation')

      setTalents((prev) =>
        prev.map((t) =>
          t.id === talentId ? { ...t, invitationStatus: 'Pending' } : t
        )
      )

      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      })
    } catch (err) {
      console.error('[v0] Invite talent error:', err)
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      })
    } finally {
      setInvitingTalentId(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary'
      case 'Accepted':
        return 'default'
      case 'Declined':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (!jobId) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Select a job from the "My Jobs" tab to view matched talents
      </div>
    )
  }

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading talents...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-destructive">{error}</div>
  }

  if (talents.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No matched talents found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {talents.map((talent) => (
        <div
          key={talent.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-medium text-foreground">{talent.name}</p>
              <Badge variant="outline">
                {Math.round(talent.matchScore)}% match
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{talent.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={getStatusBadgeVariant(talent.invitationStatus)}>
              {talent.invitationStatus || 'No invitation'}
            </Badge>

            {talent.invitationStatus === 'None' && (
              <Button
                size="sm"
                onClick={() => handleInvite(talent.id)}
                disabled={invitingTalentId === talent.id}
              >
                {invitingTalentId === talent.id ? 'Inviting...' : 'Invite'}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
