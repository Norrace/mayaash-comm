import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/payments/[merchantRef] - Get payment status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantRef: string }> }
) {
  try {
    const { merchantRef } = await params
    const payment = await db.payment.findUnique({
      where: { merchantRef }
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}
