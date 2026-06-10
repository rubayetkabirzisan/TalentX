import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')
    const url = search
      ? `${BACKEND}/jobs?search=${encodeURIComponent(search)}`
      : `${BACKEND}/jobs`

    const res = await fetch(url)
    const json = await res.json()
    const jobs = json.data ?? []

    // Normalize field names for frontend components
    const normalized = jobs.map((job: any) => ({
      ...job,
      company: job.employer_name ?? 'Unknown Company',
      applicationCount: job.application_count ?? 0,
      technologies: job.tech_stack ?? [],
    }))

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('[jobs] fetch error:', error)
    return NextResponse.json([], { status: 500 })
  }
}