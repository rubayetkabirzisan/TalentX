import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id') || ''
    const role = request.headers.get('x-role') || ''
    const name = request.headers.get('x-name') || ''

    const reqBody = await request.json().catch(() => ({ source: 'manual' }))

    const res = await fetch(`${BACKEND}/talent/jobs/${id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-role': role,
        'x-name': name,
      },
      body: JSON.stringify(reqBody),
    })

    const json = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: json.error?.message || 'Failed to apply' },
        { status: res.status }
      )
    }
    return NextResponse.json(json.data, { status: 201 })
  } catch (error) {
    console.error('[jobs/apply] error:', error)
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 })
  }
}