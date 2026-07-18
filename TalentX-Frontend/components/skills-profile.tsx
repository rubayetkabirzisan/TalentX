'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

export function SkillsProfile() {
  const [skills, setSkills] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved skills from localStorage
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    if (auth.skills) setSkills(auth.skills)
  }, [])

  const addSkill = () => {
    const skill = input.trim()
    if (!skill || skills.includes(skill)) return
    setSkills((prev) => [...prev, skill])
    setInput('')
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const saveSkills = async () => {
    setIsSaving(true)
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      const res = await fetch('/api/talent/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': auth.email || auth.id || '',
          'x-role': auth.role || '',
          'x-name': auth.name || '',
        },
        body: JSON.stringify({ skills }),
      })

      if (!res.ok) throw new Error('Failed to save skills')

      // Update localStorage
      localStorage.setItem('auth', JSON.stringify({ ...auth, skills }))

      toast({ title: 'Skills saved', description: 'Your profile has been updated' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save skills', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Your Skills</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Add your skills to get better AI job match scores
      </p>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="e.g. Python, React, PostgreSQL"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
        />
        <Button type="button" variant="outline" onClick={addSkill}>
          Add
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              {skill}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeSkill(skill)}
              />
            </Badge>
          ))}
        </div>
      )}

      <Button onClick={saveSkills} disabled={isSaving} size="sm">
        {isSaving ? 'Saving...' : 'Save Skills'}
      </Button>
    </div>
  )
}