import { NextRequest, NextResponse } from 'next/server'

// Mock data - replace with real database queries
const mockApplicants = {
  '1': [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      source: 'Direct',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      source: 'LinkedIn',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Carol White',
      email: 'carol@example.com',
      source: 'Referral',
      appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ],
  '2': [
    {
      id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      source: 'Job Board',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // TODO: Implement real auth check for employer role
    // Verify employer owns this job

    const applicants =
      mockApplicants[id as keyof typeof mockApplicants] || []

    return NextResponse.json(applicants)
  } catch (error) {
    console.error('[v0] Error fetching applicants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    )
  }
}
