'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MyJobsTab } from '@/components/my-jobs-tab'
import { CreateJobTab } from '@/components/create-job-tab'
import { ApplicantsTab } from '@/components/applicants-tab'
import { TalentMatchesTab } from '@/components/talent-matches-tab'
import { Toaster } from '@/components/ui/toaster'
import { Briefcase, Plus, Users, Star } from 'lucide-react'

export default function EmployerDashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleJobCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Employer Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your job postings and track applicants
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">My Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Job</span>
            </TabsTrigger>
            <TabsTrigger value="applicants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Applicants</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Matches</span>
            </TabsTrigger>
          </TabsList>

          {/* My Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <MyJobsTab onSelectJob={setSelectedJobId} />
            </div>
          </TabsContent>

          {/* Create Job Tab */}
          <TabsContent value="create" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <CreateJobTab onJobCreated={handleJobCreated} />
            </div>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <ApplicantsTab jobId={selectedJobId} />
            </div>
          </TabsContent>

          {/* Talent Matches Tab */}
          <TabsContent value="matches" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <TalentMatchesTab jobId={selectedJobId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  )
}
