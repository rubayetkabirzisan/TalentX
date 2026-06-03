import { NextResponse } from 'next/server'

// Mock data - replace with real database queries
const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    score: 95,
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Stripe',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    score: 87,
    technologies: ['Node.js', 'PostgreSQL', 'React', 'AWS'],
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Google Cloud',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    score: 78,
    technologies: ['Kubernetes', 'Docker', 'GCP', 'Terraform'],
  },
  {
    id: '5',
    title: 'Backend Engineer',
    company: 'Notion',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    score: 92,
    technologies: ['Python', 'PostgreSQL', 'Redis', 'GraphQL'],
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'OpenAI',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    score: 85,
    technologies: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
  },
]

export async function GET() {
  try {
    // Sort by match score descending
    const sortedJobs = [...mockJobs].sort((a, b) => b.score - a.score)
    return NextResponse.json(sortedJobs)
  } catch (error) {
    console.error('[v0] Fetch feed error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job feed' },
      { status: 500 }
    )
  }
}
