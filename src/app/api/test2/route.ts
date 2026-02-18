import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const prisma = new PrismaClient()
    const workers = await prisma.worker.findMany()
    const territories = await prisma.territory.findMany()
    const regions = await prisma.region.findMany()

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      workers: workers.length,
      territories: territories.length,
      regions: regions.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Test failed'
    }, { status: 500 })
  }
}
