import type { Metadata } from 'next'
import TalentDashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: 'Talent Dashboard | TalentX',
  description: 'View your AI job matches, manage applications, and see invitations from employers.',
}

export default function TalentDashboard() {
  return <TalentDashboardClient />
}