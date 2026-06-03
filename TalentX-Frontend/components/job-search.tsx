'use client'

import React from "react"

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useCallback } from 'react'

interface JobSearchProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function JobSearch({ onSearch, isLoading }: JobSearchProps) {
  const [query, setQuery] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      onSearch(value)
    },
    [onSearch]
  )

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search jobs by title, role..."
        value={query}
        onChange={handleChange}
        disabled={isLoading}
        className="pl-10"
      />
    </div>
  )
}
