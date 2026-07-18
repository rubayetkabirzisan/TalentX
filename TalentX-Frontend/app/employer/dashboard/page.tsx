import type { Metadata } from 'next'
import EmployerDashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: 'Employer Dashboard | TalentX',
  description: 'Manage your job postings and track top tier talent applicants.',
}

export default function EmployerDashboard() {
  return <EmployerDashboardClient />
}