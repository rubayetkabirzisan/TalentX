import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const res = await fetch(`${BACKEND}/employer/jobs/${id}/applicants`, {
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    return NextResponse.json(json.data ?? [])
  } catch (error) {
    console.error('[employer/jobs/applicants] error:', error)
    return NextResponse.json([], { status: 500 })
  }
}