'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Mail, Clock, Check, X } from 'lucide-react'

interface Invitation {
  id: string
  company: string
  jobTitle: string
  deadline: string
  status: 'Pending' | 'Accepted' | 'Declined'
}

const statusConfig = {
  Pending: {
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-700',
  },
  Accepted: {
    icon: Check,
    className: 'bg-green-500/10 text-green-700',
  },
  Declined: {
    icon: X,
    className: 'bg-red-500/10 text-red-700',
  },
}

export function InvitationsTab() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setError(null)
        const response = await fetch('/api/talent/invitations')
        if (!response.ok) throw new Error('Failed to fetch invitations')
        const data = await response.json()
        setInvitations(data)
      } catch (err) {
        console.error('[v0] Fetch invitations error:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load invitations'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitations()
  }, [])

  const handleRespond = async (
    invitationId: string,
    status: 'Accepted' | 'Declined'
  ) => {
    setRespondingId(invitationId)
    try {
      const response = await fetch(`/api/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to respond to invitation')

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status } : inv
        )
      )

      toast({
        title: 'Success',
        description: `Invitation ${status.toLowerCase()}`,
      })
    } catch (err) {
      console.error('[v0] Respond error:', err)
      toast({
        title: 'Error',
        description: 'Failed to respond to invitation',
        variant: 'destructive',
      })
    } finally {
      setRespondingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 animate-pulse"
          >
            <div className="h-6 bg-muted rounded w-1/3 mb-3" />
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded w-24" />
              <div className="h-10 bg-muted rounded w-24" />
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

  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No invitations yet
        </h3>
        <p className="text-muted-foreground">
          When companies invite you to apply, they'll appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => {
        const Config = statusConfig[invitation.status]
        const Icon = Config.icon

        return (
          <div
            key={invitation.id}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {invitation.jobTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {invitation.company}
                </p>
              </div>
              <Badge className={`ml-4 whitespace-nowrap ${Config.className}`}>
                <Icon className="h-3 w-3 mr-1" />
                {invitation.status}
              </Badge>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground">
                Deadline: {new Date(invitation.deadline).toLocaleDateString()}
              </p>
            </div>

            {invitation.status === 'Pending' && (
              <div className="flex gap-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleRespond(invitation.id, 'Accepted')}
                  disabled={respondingId === invitation.id}
                >
                  {respondingId === invitation.id ? 'Processing...' : 'Accept'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRespond(invitation.id, 'Declined')}
                  disabled={respondingId === invitation.id}
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
