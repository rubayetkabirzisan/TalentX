import { Card } from '@/components/ui/card'

export function JobSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="pt-4 mt-4 border-t border-border">
          <div className="h-5 bg-muted rounded w-1/3" />
        </div>
      </div>
    </Card>
  )
}

export function JobListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobSkeleton key={i} />
      ))}
    </div>
  )
}
