import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/workers/search?prefix=xxx - Search workers by ID prefix
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const prefix = searchParams.get('prefix')

    if (!prefix) {
      return NextResponse.json(
        { success: false, error: 'Prefix parameter is required' },
        { status: 400 }
      )
    }

    const workers = await db.worker.findMany({
      where: {
        idNumber: {
          startsWith: prefix
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, workers })
  } catch (error) {
    console.error('Error searching workers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search workers' },
      { status: 500 }
    )
  }
}
