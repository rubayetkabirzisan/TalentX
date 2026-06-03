'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ApplyButtonProps {
  jobId: string
  deadlinePassed: boolean
  isLoggedIn: boolean
  userRole?: 'Talent' | 'Employer'
}

export function ApplyButton({
  jobId,
  deadlinePassed,
  isLoggedIn,
  userRole,
}: ApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Show "Employer view" for employers
  if (isLoggedIn && userRole === 'Employer') {
    return (
      <div className="flex items-center justify-center p-4 rounded-lg border border-border bg-muted/50">
        <p className="text-muted-foreground font-medium">Employer view</p>
      </div>
    )
  }

  const handleApply = async () => {
    // Not logged in - redirect to login
    if (!isLoggedIn) {
      router.push(`/login?returnUrl=/jobs/${jobId}`)
      return
    }

    // Deadline passed - button is disabled
    if (deadlinePassed) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      const data = await response.json()

      toast({
        title: 'Success!',
        description: data.message || 'Your application has been submitted.',
        variant: 'default',
      })

      // Optional: Navigate back or show success state
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('[v0] Apply error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to submit application',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Deadline passed tooltip
  if (deadlinePassed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button disabled size="lg" className="w-full">
              Application Closed
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>The deadline for this position has passed</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      onClick={handleApply}
      disabled={isLoading}
      size="lg"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : isLoggedIn ? (
        'Apply for this position'
      ) : (
        'Sign in to Apply'
      )}
    </Button>
  )
}
