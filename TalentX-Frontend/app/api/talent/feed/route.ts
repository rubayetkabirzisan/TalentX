import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    // Fetch all jobs from backend
    const res = await fetch(`${BACKEND}/jobs`)
    const json = await res.json()
    const jobs = json.data ?? []

    // Get talent skills from header (we'll expand this on Day 5)
    const skills = request.headers.get('x-skills') || ''
    const skillList = skills ? skills.split(',').map((s: string) => s.trim()) : []

    // Score each job using AI match endpoint
    const scored = await Promise.all(
      jobs.map(async (job: any) => {
        try {
          const matchRes = await fetch(`${BACKEND}/ai/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job: {
                title: job.title,
                tech_stack: job.tech_stack,
                description: job.description || '',
              },
              talent: { skills: skillList },
            }),
          })
          const matchJson = await matchRes.json()
          return { ...job, score: matchJson.data?.score ?? 50 }
        } catch {
          return { ...job, score: 50 }
        }
      })
    )

    // Sort by score descending
    scored.sort((a: any, b: any) => b.score - a.score)
    return NextResponse.json(scored)
  } catch (error) {
    console.error('[talent/feed] error:', error)
    return NextResponse.json([], { status: 500 })
  }
}