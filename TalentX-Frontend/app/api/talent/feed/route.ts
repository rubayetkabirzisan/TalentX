import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const role = request.headers.get('x-role') || ''
    const name = request.headers.get('x-name') || ''

    const authHeaders = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-role': role,
      'x-name': name,
    }

    // Fetch talent's skills from their profile
    const meRes = await fetch(`${BACKEND}/me`, { headers: authHeaders })
    if (!meRes.ok) {
      const errText = await meRes.text().catch(() => 'No response body')
      console.error(`[talent/feed] /me failed with status ${meRes.status}:`, errText, 'Headers sent:', authHeaders)
      throw new Error(`Failed to fetch talent profile: ${meRes.status}`)
    }
    const meJson = await meRes.json()
    const skillList: string[] = meJson.data?.skills ?? []

    // Fetch all jobs
    const res = await fetch(`${BACKEND}/jobs`)
    if (!res.ok) throw new Error('Failed to fetch jobs')
    const json = await res.json()
    const jobs = json.data ?? []

    // Score all jobs in a single bulk request to avoid N+1 and rate limit exhaustion
    const matchBulkRes = await fetch(`${BACKEND}/ai/match-bulk`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        matches: jobs.map((job: any) => ({
          job: {
            title: job.title,
            tech_stack: job.tech_stack,
            description: job.description || '',
          },
          talent: { skills: skillList },
        })),
      }),
    })

    let scores: number[] = []
    if (matchBulkRes.ok) {
      const matchBulkJson = await matchBulkRes.json()
      scores = matchBulkJson.data?.scores ?? []
    }

    const scored = jobs.map((job: any, index: number) => ({
      ...job,
      technologies: job.tech_stack,
      score: scores[index] ?? 50,
    }))

    scored.sort((a: any, b: any) => b.score - a.score)
    return NextResponse.json(scored)
  } catch (error) {
    console.error('[talent/feed] error:', error)
    return NextResponse.json([], { status: 500 })
  }
}