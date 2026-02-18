import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/regions - Get all regions
export async function GET() {
  try {
    const regions = await db.region.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ success: true, regions })
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch regions' },
      { status: 500 }
    )
  }
}

// POST /api/regions - Create new region
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const region = await db.region.create({
      data: { name }
    })

    return NextResponse.json({ success: true, region })
  } catch (error) {
    console.error('Error creating region:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create region' },
      { status: 500 }
    )
  }
}
