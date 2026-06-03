import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['Accepted', 'Declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Replace with real database update
    console.log(`[v0] Invitation ${id} responded with status: ${status}`)

    return NextResponse.json({
      success: true,
      message: `Invitation ${status.toLowerCase()}`,
    })
  } catch (error) {
    console.error('[v0] Respond error:', error)
    return NextResponse.json(
      { error: 'Failed to respond to invitation' },
      { status: 500 }
    )
  }
}
