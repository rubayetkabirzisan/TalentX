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

    const res = await fetch(`${BACKEND}/ai/generate-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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