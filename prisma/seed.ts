import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Check if admin exists, if not create one
  const existingAdmin = await prisma.admin.findFirst()
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@mayaacomm.co.ke',
        password: hashedPassword,
        name: 'System Administrator'
      }
    })
    console.log('Admin created:', admin.email)
    console.log('Password: admin123')
  } else {
    console.log('Admin already exists:', existingAdmin.email)
  }

  // Check if workers exist, if not create sample workers
  const workerCount = await prisma.worker.count()
  if (workerCount === 0) {
    const sampleWorkers = [
      {
        fullName: 'John Kamau',
        idNumber: '1234500001',
        phone: '0712345678'
      },
      {
        fullName: 'Mary Wanjiku',
        idNumber: '1234500002',
        phone: '0712345679'
      },
      {
        fullName: 'Peter Ochieng',
        idNumber: '1234500003',
        phone: '0712345680'
      },
      {
        fullName: 'Grace Nyambura',
        idNumber: '1234500004',
        phone: '0712345681'
      },
      {
        fullName: 'David Mutua',
        idNumber: '1234500005',
        phone: '0712345682'
      }
    ]

    for (const worker of sampleWorkers) {
      await prisma.worker.create({ data: worker })
      console.log('Worker created:', worker.fullName)
    }
  } else {
    console.log(`${workerCount} workers already exist`)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
