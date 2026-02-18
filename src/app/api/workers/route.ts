import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/workers - Get all workers
export async function GET() {
  try {
    const workers = await db.worker.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, workers })
  } catch (error) {
    console.error('Error fetching workers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workers' },
      { status: 500 }
    )
  }
}

// POST /api/workers - Create new worker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, idNumber, phone } = body

    if (!fullName || !idNumber || !phone) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if worker with same ID number already exists
    const existingWorker = await db.worker.findUnique({
      where: { idNumber }
    })

    if (existingWorker) {
      return NextResponse.json(
        { success: false, error: 'Worker with this ID number already exists' },
        { status: 400 }
      )
    }

    const worker = await db.worker.create({
      data: { fullName, idNumber, phone }
    })

    return NextResponse.json({ success: true, worker })
  } catch (error) {
    console.error('Error creating worker:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create worker' },
      { status: 500 }
    )
  }
}
