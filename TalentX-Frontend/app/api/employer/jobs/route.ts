import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const DEV_HEADERS = {
  'Content-Type': 'application/json',
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/employer/jobs`, {
      headers: DEV_HEADERS,
    })
    const json = await res.json()
    return NextResponse.json(json.data ?? [])
  } catch (error) {
    console.error('[employer/jobs] GET error:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${BACKEND}/employer/jobs`, {
      method: 'POST',
      headers: DEV_HEADERS,
      body: JSON.stringify({
        title: body.title,
        tech_stack: body.technologies ?? body.tech_stack ?? [],
        deadline: new Date(body.deadline).toISOString(),
        description: body.description || '',
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: json.error?.message || 'Failed to create job' },
        { status: res.status }
      )
    }
    return NextResponse.json(json.data, { status: 201 })
  } catch (error) {
    console.error('[employer/jobs] POST error:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}