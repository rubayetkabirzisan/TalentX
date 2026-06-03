'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

interface JobCardProps {
  id: string
  title: string
  company: string
  applicationCount: number
}

export function JobCard({
  id,
  title,
  company,
  applicationCount,
}: JobCardProps) {
  return (
    <Link href={`/jobs/${id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 h-full">
        <div className="p-6 flex flex-col justify-between h-full">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{company}</p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
            <Badge variant="secondary" className="font-medium">
              {applicationCount}{' '}
              {applicationCount === 1 ? 'application' : 'applications'}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
