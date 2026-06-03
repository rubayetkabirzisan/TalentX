import { NextResponse } from 'next/server'

// Mock data - replace with real database queries
const mockInvitations = [
  {
    id: '1',
    company: 'Stripe',
    jobTitle: 'Full Stack Engineer',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending' as const,
  },
  {
    id: '2',
    company: 'Vercel',
    jobTitle: 'Senior Frontend Engineer',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Accepted' as const,
  },
  {
    id: '3',
    company: 'GitHub',
    jobTitle: 'Backend Engineer',
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Declined' as const,
  },
  {
    id: '4',
    company: 'Notion',
    jobTitle: 'Full Stack Developer',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending' as const,
  },
]

export async function GET() {
  try {
    return NextResponse.json(mockInvitations)
  } catch (error) {
    console.error('[v0] Fetch invitations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
