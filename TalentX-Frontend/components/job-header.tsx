'use client'

import { format } from 'date-fns'
import { Calendar, Building2, Users } from 'lucide-react'

interface JobHeaderProps {
  title: string
  company: string
  deadline: string
  applicationCount: number
}

export function JobHeader({
  title,
  company,
  deadline,
  applicationCount,
}: JobHeaderProps) {
  const deadlineDate = new Date(deadline)
  const isPassed = deadlineDate < new Date()

  return (
    <div className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
        {title}
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="font-medium text-foreground">{company}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className={isPassed ? 'text-destructive' : ''}>
            {isPassed ? 'Deadline passed' : 'Closes'} {format(deadlineDate, 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {applicationCount} {applicationCount === 1 ? 'application' : 'applications'}
          </span>
        </div>
      </div>
    </div>
  )
}
