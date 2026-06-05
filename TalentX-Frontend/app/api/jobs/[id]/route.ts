import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const res = await fetch(`${BACKEND}/jobs/${id}`)
    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: json.error?.message || 'Job not found' },
        { status: res.status }
      )
    }
    return NextResponse.json(json.data)
  } catch (error) {
    console.error('[jobs/id] fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}