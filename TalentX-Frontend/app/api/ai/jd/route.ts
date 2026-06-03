import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, technologies } = await request.json()

    if (!title || !technologies || technologies.length === 0) {
      return NextResponse.json(
        { error: 'Title and technologies are required' },
        { status: 400 }
      )
    }

    // TODO: Replace with real AI API call (e.g., OpenAI, Anthropic)
    // For now, generate a mock JD
    const techStack = technologies.join(', ')
    const description = `${title} Position

We are looking for an experienced ${title} to join our team.

Key Responsibilities:
- Lead the development of core features
- Collaborate with cross-functional teams
- Mentor junior engineers
- Contribute to architecture decisions
- Ensure code quality and best practices

Required Skills:
- Expertise in ${techStack}
- 5+ years of professional experience
- Strong problem-solving abilities
- Excellent communication skills

Nice to Have:
- Experience with scalable systems
- Open source contributions
- Technical leadership experience
- Knowledge of DevOps practices

We offer competitive salary, remote work options, and growth opportunities.`

    return NextResponse.json({ description })
  } catch (error) {
    console.error('[v0] Error generating JD:', error)
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    )
  }
}
