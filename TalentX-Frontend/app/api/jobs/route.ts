import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with real data fetching
const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    applicationCount: 42,
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Stripe',
    applicationCount: 38,
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'Figma',
    applicationCount: 25,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Google Cloud',
    applicationCount: 31,
  },
  {
    id: '5',
    title: 'Backend Engineer',
    company: 'Notion',
    applicationCount: 45,
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'OpenAI',
    applicationCount: 52,
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')?.toLowerCase() || ''

  let results = mockJobs

  if (search) {
    results = mockJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search)
    )
  }

  return NextResponse.json(results)
}
