import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/territories - Get all territories
export async function GET() {
  try {
    const territories = await db.territory.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ success: true, territories })
  } catch (error) {
    console.error('Error fetching territories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch territories' },
      { status: 500 }
    )
  }
}

// POST /api/territories - Create new territory
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

    const territory = await db.territory.create({
      data: { name }
    })

    return NextResponse.json({ success: true, territory })
  } catch (error) {
    console.error('Error creating territory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create territory' },
      { status: 500 }
    )
  }
}
