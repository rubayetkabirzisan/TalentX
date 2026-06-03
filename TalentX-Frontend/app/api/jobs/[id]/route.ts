import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with real data fetching
interface MockJob {
  id: string
  title: string
  company: string
  applicationCount: number
  deadline: string
  technologies: string[]
  description: string
}

const mockJobs: Record<string, MockJob> = {
  '1': {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    applicationCount: 42,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    description:
      'We are looking for a Senior Frontend Engineer to join our growing team. You will work on building world-class products used by millions of developers.\n\nResponsibilities:\n- Design and implement scalable frontend architectures\n- Collaborate with product and design teams\n- Mentor junior engineers\n- Optimize performance and user experience\n\nRequirements:\n- 5+ years of frontend development experience\n- Expert knowledge of React and modern JavaScript\n- Experience with TypeScript and state management\n- Strong problem-solving skills',
  },
  '2': {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Stripe',
    applicationCount: 38,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    technologies: ['Node.js', 'PostgreSQL', 'React', 'AWS'],
    description:
      'Stripe is hiring a Full Stack Developer to work on our payment infrastructure. Build APIs and interfaces that power payments globally.\n\nResponsibilities:\n- Develop robust backend services\n- Create intuitive user interfaces\n- Handle large-scale transactions\n- Ensure security and reliability\n\nRequirements:\n- Full stack development experience\n- Knowledge of payment systems a plus\n- Strong backend and frontend skills\n- Understanding of database design',
  },
  '3': {
    id: '3',
    title: 'Product Designer',
    company: 'Figma',
    applicationCount: 25,
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    technologies: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    description:
      'Join Figma as a Product Designer and help shape the future of design tools.\n\nResponsibilities:\n- Design user interfaces and user experiences\n- Conduct user research and testing\n- Collaborate with engineers and product managers\n- Maintain design systems\n\nRequirements:\n- 3+ years of product design experience\n- Portfolio showcasing design work\n- Understanding of design principles\n- Experience with design tools',
  },
  '4': {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Google Cloud',
    applicationCount: 31,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    technologies: ['Kubernetes', 'Docker', 'GCP', 'Terraform'],
    description:
      'Help us build and maintain the infrastructure that powers Google Cloud.\n\nResponsibilities:\n- Manage containerized deployments\n- Implement infrastructure as code\n- Monitor system health and performance\n- Automate deployment processes\n\nRequirements:\n- Experience with Kubernetes and Docker\n- Knowledge of cloud platforms\n- Strong scripting skills\n- Understanding of CI/CD pipelines',
  },
  '5': {
    id: '5',
    title: 'Backend Engineer',
    company: 'Notion',
    applicationCount: 45,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    technologies: ['Python', 'PostgreSQL', 'Redis', 'GraphQL'],
    description:
      'Join Notion to build the next generation of productivity tools.\n\nResponsibilities:\n- Design and implement scalable APIs\n- Optimize database queries\n- Build data processing pipelines\n- Work with machine learning models\n\nRequirements:\n- 3+ years of backend development\n- Strong database design skills\n- Experience with Python or similar languages\n- Understanding of system design',
  },
  '6': {
    id: '6',
    title: 'Data Scientist',
    company: 'OpenAI',
    applicationCount: 52,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    technologies: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    description:
      'Contribute to advancing AI research at OpenAI.\n\nResponsibilities:\n- Develop and train machine learning models\n- Conduct data analysis and experiments\n- Collaborate with research teams\n- Publish research findings\n\nRequirements:\n- Strong background in machine learning\n- Experience with Python and ML frameworks\n- Advanced statistics knowledge\n- Research experience preferred',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = mockJobs[id]

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(job)
}
