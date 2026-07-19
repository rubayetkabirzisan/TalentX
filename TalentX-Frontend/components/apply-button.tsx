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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ApplyButtonProps {
  jobId: string
  deadlinePassed: boolean
  isLoggedIn: boolean
  userRole?: 'Talent' | 'Employer'
  onSuccess?: () => void
}

export function ApplyButton({
  jobId,
  deadlinePassed,
  isLoggedIn,
  userRole,
  onSuccess,
}: ApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [coverLetter, setCoverLetter] = useState('')
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
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': auth.id || '',
          'x-role': auth.role || '',
          'x-name': auth.name || '',
        },
        body: JSON.stringify({
          source: 'manual',
          cover_letter: coverLetter
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      toast({
        title: 'Success!',
        description: data.message || 'Your application has been submitted.',
        variant: 'default',
      })

      setIsOpen(false)
      setStep(1)
      setCoverLetter('')
      if (onSuccess) {
        onSuccess()
      } else {
        setTimeout(() => {
          router.push('/talent/dashboard')
        }, 1000)
      }
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

  const handleOpenChange = (open: boolean) => {
    if (!isLoggedIn) {
      router.push(`/login?returnUrl=/jobs/${jobId}`)
      return
    }
    setIsOpen(open)
    if (!open) {
      setStep(1) // Reset on close
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoggedIn ? 'Apply for this position' : 'Sign in to Apply'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Job Application</DialogTitle>
          <DialogDescription>
            Step {step} of 3
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-6 space-y-4">
            <h4 className="font-semibold text-foreground">Confirm your profile</h4>
            <p className="text-sm text-muted-foreground">
              Your existing skills and bio will be automatically attached to this application. Make sure your profile is up to date in your dashboard settings.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="py-6 space-y-4">
            <h4 className="font-semibold text-foreground">Why are you a good fit?</h4>
            <p className="text-sm text-muted-foreground">
              Stand out by writing a short cover letter or introduction.
            </p>
            <Textarea
              placeholder="I have 5 years of experience in..."
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="py-6 space-y-4 text-center">
            <h4 className="font-semibold text-foreground">Ready to submit?</h4>
            <p className="text-sm text-muted-foreground">
              By clicking Submit, your profile and cover letter will be sent directly to the employer.
            </p>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between w-full mt-4">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : setIsOpen(false)}>
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleApply} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}