import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/codes/verify - Verify download code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    const downloadCode = await db.downloadCode.findUnique({
      where: { code }
    })

    if (!downloadCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid code' },
        { status: 400 }
      )
    }

    // Check if code is expired
    if (new Date() > downloadCode.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Code has expired' },
        { status: 400 }
      )
    }

    // Check if code is already used
    if (downloadCode.isUsed) {
      return NextResponse.json(
        { success: false, error: 'Code has already been used' },
        { status: 400 }
      )
    }

    // Mark code as used
    await db.downloadCode.update({
      where: { id: downloadCode.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, message: 'Code verified successfully' })
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
