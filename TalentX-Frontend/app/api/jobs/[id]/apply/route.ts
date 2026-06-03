import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // In production, you would:
    // 1. Verify the user is authenticated
    // 2. Check if deadline has passed
    // 3. Check if user has already applied
    // 4. Save application to database

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Mock application submission
    console.log(`[v0] Application submitted for job ${id}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Your application has been submitted successfully!',
        jobId: id,
        submittedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Apply error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
