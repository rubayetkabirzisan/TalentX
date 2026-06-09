import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { title, technologies } = await request.json()

    if (!title || !technologies?.length) {
      return NextResponse.json(
        { error: 'Title and technologies are required' },
        { status: 400 }
      )
    }

    const userId = request.headers.get('x-user-id') || ''
    const role = request.headers.get('x-role') || ''
    const name = request.headers.get('x-name') || ''

    const res = await fetch(`${BACKEND}/ai/generate-jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-role': role,
        'x-name': name,
      },
      body: JSON.stringify({ title, tech_stack: technologies }),
    })

    const json = await res.json()
    return NextResponse.json({ description: json.data?.description ?? '' })
  } catch (error) {
    console.error('[ai/jd] error:', error)
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    )
  }
}