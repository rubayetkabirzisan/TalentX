import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id') || ''
    const role = request.headers.get('x-role') || ''
    const name = request.headers.get('x-name') || ''

    const authHeaders = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-role': role,
      'x-name': name,
    }

    // Get the job details
    const jobRes = await fetch(`${BACKEND}/jobs/${id}`)
    const jobJson = await jobRes.json()
    const job = jobJson.data

    if (!job) {
      return NextResponse.json([], { status: 404 })
    }

    // Get all talent users from DB
    const talentsRes = await fetch(`${BACKEND}/talents`, {
      headers: authHeaders,
    })

    if (!talentsRes.ok) {
      return NextResponse.json([], { status: 500 })
    }

    const talentsJson = await talentsRes.json()
    const talents = talentsJson.data ?? []

    // Get existing invitations for this job
    const invRes = await fetch(`${BACKEND}/employer/jobs/${id}/invitations`, {
      headers: authHeaders,
    })
    const invJson = invRes.ok ? await invRes.json() : { data: [] }
    const invitations = invJson.data ?? []

    // Score each talent against the job
    const scored = await Promise.all(
      talents.map(async (talent: any) => {
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
              talent: {
                skills: talent.skills ?? [],
              },
            }),
          })
          const matchJson = await matchRes.json()
          const score = matchJson.data?.score ?? 50

          // Check invitation status for this talent
          const inv = invitations.find((i: any) => i.talent_id === talent.id)
          const invitationStatus = inv ? inv.status : 'none'

          return {
            id: talent.id,
            name: talent.name,
            email: talent.auth_provider_id,
            matchScore: score,
            invitationStatus,
          }
        } catch {
          return {
            id: talent.id,
            name: talent.name,
            email: talent.auth_provider_id,
            matchScore: 50,
            invitationStatus: 'none',
          }
        }
      })
    )

    scored.sort((a: any, b: any) => b.matchScore - a.matchScore)
    return NextResponse.json(scored)
  } catch (error) {
    console.error('[matched-talents] error:', error)
    return NextResponse.json([], { status: 500 })
  }
}