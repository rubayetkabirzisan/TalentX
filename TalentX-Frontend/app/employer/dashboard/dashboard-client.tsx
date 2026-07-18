'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MyJobsTab } from '@/components/my-jobs-tab'
import { CreateJobTab } from '@/components/create-job-tab'
import { ApplicantsTab } from '@/components/applicants-tab'
import { TalentMatchesTab } from '@/components/talent-matches-tab'
import { ProfileSettingsTab } from '@/components/profile-settings-tab'
import { Toaster } from '@/components/ui/toaster'
import { Briefcase, Plus, Users, Star, Settings } from 'lucide-react'

export default function EmployerDashboardClient() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('jobs')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    if (!auth.id) {
      router.push('/login')
      return
    }
    if (auth.role !== 'employer') {
      router.push('/talent/dashboard')
      return
    }
    setIsAuthenticated(true)
  }, [])

  if (!isAuthenticated) return null

  const handleJobCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab('jobs')
  }

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId)
    setActiveTab('applicants')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">Employer Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your job postings and track applicants
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={(val) => {
          if (val !== 'applicants' && val !== 'matches') {
            setSelectedJobId(null)
          }
          setActiveTab(val)
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <MyJobsTab onSelectJob={handleSelectJob} />
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <CreateJobTab onJobCreated={handleJobCreated} />
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <ApplicantsTab jobId={selectedJobId} />
            </div>
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <TalentMatchesTab jobId={selectedJobId} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Company Settings
              </h2>
              <ProfileSettingsTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  )
}
