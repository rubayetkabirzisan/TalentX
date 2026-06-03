import { NextResponse } from 'next/server'

// Mock data - replace with real database queries
const mockApplications = [
  {
    id: '1',
    company: 'Vercel',
    jobTitle: 'Senior Frontend Engineer',
    source: 'manual' as const,
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    company: 'Stripe',
    jobTitle: 'Full Stack Engineer',
    source: 'invitation' as const,
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    company: 'Google Cloud',
    jobTitle: 'DevOps Engineer',
    source: 'manual' as const,
    appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    company: 'Notion',
    jobTitle: 'Backend Engineer',
    source: 'manual' as const,
    appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    company: 'Figma',
    jobTitle: 'Product Designer',
    source: 'invitation' as const,
    appliedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET() {
  try {
    // Sort by applied date descending (most recent first)
    const sortedApplications = [...mockApplications].sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    )
    return NextResponse.json(sortedApplications)
  } catch (error) {
    console.error('[v0] Fetch applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
