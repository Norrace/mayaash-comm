import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/admin/init - Initialize admin account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await db.admin.findFirst()

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin already initialized' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin
    const admin = await db.admin.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Administrator'
      }
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      message: 'Admin initialized successfully'
    })
  } catch (error) {
    console.error('Error initializing admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize admin' },
      { status: 500 }
    )
  }
}
