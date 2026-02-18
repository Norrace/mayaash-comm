import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/regions/[id] - Update region
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, isActive } = body

    const region = await db.region.update({
      where: { id },
      data: { name, isActive }
    })

    return NextResponse.json({ success: true, region })
  } catch (error) {
    console.error('Error updating region:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update region' },
      { status: 500 }
    )
  }
}

// DELETE /api/regions/[id] - Delete region
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.region.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting region:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete region' },
      { status: 500 }
    )
  }
}
