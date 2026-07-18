import type { Metadata } from 'next'
import LandingPageClient from './landing-client'

export const metadata: Metadata = {
  title: 'TalentX — AI Job Marketplace | Find Your Perfect Tech Job',
  description: 'Connect top tech talent with amazing opportunities. AI-driven matching finds your ideal fit faster than traditional job boards.',
  openGraph: {
    title: 'TalentX — AI Job Marketplace',
    description: 'AI-powered job matching for tech professionals.',
  },
}

export default function LandingPage() {
  return <LandingPageClient />
}