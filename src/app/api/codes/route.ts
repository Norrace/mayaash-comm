import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/codes - List all download codes
export async function GET() {
  try {
    const codes = await db.downloadCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, codes })
  } catch (error) {
    console.error('Error fetching codes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch codes' },
      { status: 500 }
    )
  }
}

// POST /api/codes - Generate new download code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { expiresIn } = body

    // Generate random code (8 alphanumeric characters)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Calculate expiry date
    const expiresAt = new Date()
    if (expiresIn) {
      expiresAt.setDate(expiresAt.getDate() + expiresIn)
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30) // Default 30 days
    }

    const downloadCode = await db.downloadCode.create({
      data: {
        code,
        expiresAt
      }
    })

    return NextResponse.json({ success: true, downloadCode })
  } catch (error) {
    console.error('Error generating code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate code' },
      { status: 500 }
    )
  }
}
