import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/workers/export - Export workers to CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region')
    const territory = searchParams.get('territory')

    let workers = await db.worker.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Generate CSV
    const headers = ['ID Number', 'Full Name', 'Phone Number', 'Created At']
    const rows = workers.map(worker => [
      worker.idNumber,
      worker.fullName,
      worker.phone,
      worker.createdAt.toISOString().split('T')[0]
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="workers.csv"'
      }
    })
  } catch (error) {
    console.error('Error exporting workers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export workers' },
      { status: 500 }
    )
  }
}
