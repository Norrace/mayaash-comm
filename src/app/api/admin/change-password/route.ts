import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/admin/change-password - Change admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, currentPassword, newPassword } = body

    // Validate required fields
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find admin by email
    const admin = await db.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update admin password
    await db.admin.update({
      where: { email },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
