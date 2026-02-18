import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/workers/[id] - Update worker
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { fullName, idNumber, phone } = body

    // Check if worker exists
    const existingWorker = await db.worker.findUnique({
      where: { id }
    })

    if (!existingWorker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      )
    }

    // If ID number is being changed, check if new ID is already taken
    if (idNumber && idNumber !== existingWorker.idNumber) {
      const duplicateWorker = await db.worker.findUnique({
        where: { idNumber }
      })

      if (duplicateWorker) {
        return NextResponse.json(
          { success: false, error: 'Worker with this ID number already exists' },
          { status: 400 }
        )
      }
    }

    const worker = await db.worker.update({
      where: { id },
      data: { fullName, idNumber, phone }
    })

    return NextResponse.json({ success: true, worker })
  } catch (error) {
    console.error('Error updating worker:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update worker' },
      { status: 500 }
    )
  }
}

// DELETE /api/workers/[id] - Delete worker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const worker = await db.worker.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, worker })
  } catch (error) {
    console.error('Error deleting worker:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete worker' },
      { status: 500 }
    )
  }
}
