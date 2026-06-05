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
    return NextResponse.json(json.data ?? [])
  } catch (error) {
    console.error('[jobs] fetch error:', error)
    return NextResponse.json([], { status: 500 })
  }
}