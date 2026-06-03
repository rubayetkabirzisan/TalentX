'use client'

interface TechStackProps {
  technologies: string[]
}

export function TechStack({ technologies }: TechStackProps) {
  if (!technologies || technologies.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((tech) => (
        <div
          key={tech}
          className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
        >
          {tech}
        </div>
      ))}
    </div>
  )
}
