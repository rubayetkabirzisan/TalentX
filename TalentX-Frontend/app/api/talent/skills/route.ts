import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const role = request.headers.get('x-role') || ''
    const name = request.headers.get('x-name') || ''
    const body = await request.json()

    const res = await fetch(`${BACKEND}/me/skills`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-role': role,
        'x-name': name,
      },
      body: JSON.stringify({ skills: body.skills }),
    })

    const json = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: json.error?.message || 'Failed to update skills' },
        { status: res.status }
      )
    }
    return NextResponse.json(json.data)
  } catch (error) {
    console.error('[talent/skills] error:', error)
    return NextResponse.json({ error: 'Failed to update skills' }, { status: 500 })
  }
}