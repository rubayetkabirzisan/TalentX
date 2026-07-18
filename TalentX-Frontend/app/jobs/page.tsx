import type { Metadata } from 'next'
import JobsPageClient from './jobs-client'

export const metadata: Metadata = {
  title: 'Browse Tech Jobs | TalentX',
  description: 'Search and apply for top tech opportunities perfectly matched to your skills.',
}

export default function JobsPage() {
  return <JobsPageClient />
}