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
    const meJson = await meRes.json()
    const skillList: string[] = meJson.data?.skills ?? []

    // Fetch all jobs
    const res = await fetch(`${BACKEND}/jobs`)
    const json = await res.json()
    const jobs = json.data ?? []

    // Score each job using AI match with real skills
    const scored = await Promise.all(
      jobs.map(async (job: any) => {
        try {
          const matchRes = await fetch(`${BACKEND}/ai/match`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'x-role': role,
    'x-name': name,
  },
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
          return {
            ...job,
            technologies: job.tech_stack,
            score: matchJson.data?.score ?? 50,
          }
        } catch {
          return { ...job, technologies: job.tech_stack, score: 50 }
        }
      })
    )

    scored.sort((a: any, b: any) => b.score - a.score)
    return NextResponse.json(scored)
  } catch (error) {
    console.error('[talent/feed] error:', error)
    return NextResponse.json([], { status: 500 })
  }
}