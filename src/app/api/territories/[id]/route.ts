import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/territories/[id] - Update territory
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, isActive } = body

    const territory = await db.territory.update({
      where: { id },
      data: { name, isActive }
    })

    return NextResponse.json({ success: true, territory })
  } catch (error) {
    console.error('Error updating territory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update territory' },
      { status: 500 }
    )
  }
}

// DELETE /api/territories/[id] - Delete territory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.territory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting territory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete territory' },
      { status: 500 }
    )
  }
}
