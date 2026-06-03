import { Briefcase } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <Briefcase className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No jobs found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your search terms or browse all available positions
      </p>
    </div>
  )
}
