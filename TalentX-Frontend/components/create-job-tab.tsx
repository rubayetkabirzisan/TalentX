'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface CreateJobFormData {
  title: string
  technologies: string
  deadline: string
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
  })
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
      const response = await fetch('/api/ai/jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          technologies: formData.technologies.split(',').map((t) => t.trim()),
        }),
      })

      if (!response.ok) throw new Error('Failed to generate JD')

      const data = await response.json()
      setGeneratedJD(data.description)
      toast({
        title: 'Success',
        description: 'Job description generated successfully',
      })
    } catch (err) {
      console.error('[v0] Generate JD error:', err)
      toast({
        title: 'Error',
        description: 'Failed to generate job description',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.technologies || !formData.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies
            .split(',')
            .map((t) => t.trim()),
          description: generatedJD || 'No description provided',
        }),
      })

      if (!response.ok) throw new Error('Failed to create job')

      toast({
        title: 'Success',
        description: 'Job posted successfully',
      })

      setFormData({ title: '', technologies: '', deadline: '' })
      setGeneratedJD(null)
      onJobCreated?.()
    } catch (err) {
      console.error('[v0] Create job error:', err)
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

      {/* Generate JD Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateJD}
          disabled={isGenerating || !formData.title || !formData.technologies}
        >
          {isGenerating ? 'Generating...' : 'Generate Job Description'}
        </Button>
      </div>

      {/* Generated JD Preview */}
      {generatedJD && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-2">
          <p className="text-sm font-medium text-foreground">
            Generated Job Description
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {generatedJD}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button type="submit">Post Job</Button>
      </div>
    </form>
  )
}
