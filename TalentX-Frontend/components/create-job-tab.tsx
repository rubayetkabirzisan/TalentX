'use client'

import React from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface CreateJobFormData {
  title: string
  technologies: string
  deadline: string
  salaryMin: string
  salaryMax: string
}

interface CreateJobTabProps {
  onJobCreated?: () => void
}

export function CreateJobTab({ onJobCreated }: CreateJobTabProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreateJobFormData>({
    title: '',
    technologies: '',
    deadline: '',
    salaryMin: '',
    salaryMax: '',
  })

  const [workStyle, setWorkStyle] = useState<string[]>([])
  const [manualDescription, setManualDescription] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedJD, setGeneratedJD] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateJD = async () => {
    if (!formData.title || !formData.technologies) {
      toast({
        title: 'Error',
        description: 'Please fill in job title and tech stack',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      const response = await fetch('/api/ai/jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': auth.id || '',
          'x-role': auth.role || '',
          'x-name': auth.name || '',
        },
        body: JSON.stringify({
          title: formData.title,
          technologies: formData.technologies.split(',').map((t) => t.trim()),
        }),
      })

      if (!response.ok) throw new Error('Failed to generate JD')

      const data = await response.json()

      // Put the AI result into manualDescription so employer can edit it
      setGeneratedJD(data.description)
      setManualDescription(data.description)

      toast({
        title: 'Success',
        description: 'Job description generated — you can edit it below',
      })
    } catch (err) {
      console.error('[CreateJobTab] Generate JD error:', err)
      toast({
        title: 'Error',
        description: 'Failed to generate job description',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    // Step 1: Check required fields
    if (!formData.title || !formData.technologies || !formData.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill in job title, tech stack, and deadline',
        variant: 'destructive',
      })
      return
    }

    // Step 2: FIX — use manual description OR AI description, whichever exists
    const description = manualDescription.trim() || generatedJD

    if (!description) {
      toast({
        title: 'Error',
        description: 'Please write or generate a job description',
        variant: 'destructive',
      })
      return
    }

    // Step 3: Post the job
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      const response = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': auth.id || '',
          'x-role': auth.role || '',
          'x-name': auth.name || '',
        },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies.split(',').map((t) => t.trim()),
          description,
          salary_min: Number(formData.salaryMin) || 0,
          salary_max: Number(formData.salaryMax) || 0,
          work_style_flags: workStyle
        }),
      })

      if (!response.ok) throw new Error('Failed to create job')

      toast({
        title: 'Success',
        description: 'Job posted successfully',
      })

      // Reset form
      setFormData({ title: '', technologies: '', deadline: '', salaryMin: '', salaryMax: '' })
      setWorkStyle([])
      setManualDescription('')
      setGeneratedJD(null)
      onJobCreated?.()
    } catch (err) {
      console.error('[CreateJobTab] Create job error:', err)
      toast({
        title: 'Error',
        description: 'Failed to create job',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Senior React Developer"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label htmlFor="technologies">
          Tech Stack (comma-separated)
        </Label>
        <Input
          id="technologies"
          name="technologies"
          placeholder="e.g., React, TypeScript, Node.js, PostgreSQL"
          value={formData.technologies}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">Application Deadline</Label>
        <Input
          id="deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            value={formData.salaryMin}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            value={formData.salaryMax}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Work Style Preferences</Label>
        <div className="flex flex-wrap gap-2">
          {['Remote', 'Hybrid', 'On-site', 'Async', 'Fast-paced'].map(flag => (
            <button
              key={flag}
              type="button"
              onClick={() => {
                setWorkStyle(prev => 
                  prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
                )
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                workStyle.includes(flag) 
                  ? 'bg-violet-600 text-white border-violet-600' 
                  : 'bg-transparent text-muted-foreground border-border hover:border-violet-600/50'
              }`}
            >
              {flag}
            </button>
          ))}
        </div>
      </div>

      {/* Generate JD Button — optional, not required */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateJD}
          disabled={isGenerating || !formData.title || !formData.technologies}
        >
          {isGenerating ? 'Generating...' : '✨ Generate with AI (optional)'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Fills the description below automatically. You can edit or ignore it.
        </p>
      </div>

      {/* Job Description — manual textarea, also receives AI output */}
      <div className="space-y-2">
        <Label htmlFor="manualDescription">
          Job Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="manualDescription"
          placeholder="Describe the role, responsibilities, and requirements...&#10;&#10;You can write this manually or use the AI button above to generate a starting point."
          value={manualDescription}
          onChange={(e) => setManualDescription(e.target.value)}
          rows={8}
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {manualDescription.length} characters
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-2 pt-4">
        <Button type="submit">Post Job</Button>
      </div>

    </form>
  )
}