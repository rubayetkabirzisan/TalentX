'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JobMatchFeed } from '@/components/job-match-feed'
import { InvitationsTab } from '@/components/invitations-tab'
import { ApplicationHistoryTab } from '@/components/application-history-tab'
import { Toaster } from '@/components/ui/toaster'
import { Zap, Mail, FileText } from 'lucide-react'

export default function TalentDashboard() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Talent Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover jobs tailored to your skills and manage your applications
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Job Matches</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Invitations</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
          </TabsList>

          {/* Job Match Feed Tab */}
          <TabsContent value="feed" className="mt-0">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                AI Job Recommendations
              </h2>
              <JobMatchFeed />
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="mt-0">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Invitations from Companies
              </h2>
              <InvitationsTab />
            </div>
          </TabsContent>

          {/* Application History Tab */}
          <TabsContent value="history" className="mt-0">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Your Application History
              </h2>
              <ApplicationHistoryTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  )
}
