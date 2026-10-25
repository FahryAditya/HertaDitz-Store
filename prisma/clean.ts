import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    {
      connectionString:
        process.env.DATABASE_URL ||
        process.env.PRISMA_DATABASE_URL ||
        process.env.POSTGRES_URL,
    },
    { schema: 'hertaditz' }
  ),
})

async function clean() {
  console.log('--- Membersihkan Data Dummy HertaDitz Store ---')

  // 1. Hapus transaksi & unduhan
  await prisma.downloadLog.deleteMany({})
  console.log('✓ Download logs dibersihkan')

  await prisma.paymentEvent.deleteMany({})
  console.log('✓ Payment events dibersihkan')

  await prisma.orderItem.deleteMany({})
  console.log('✓ Order items dibersihkan')

  await prisma.order.deleteMany({})
  console.log('✓ Orders dibersihkan')

  // 2. Hapus versi produk & produk
  await prisma.productVersion.deleteMany({})
  console.log('✓ Product versions dibersihkan')

  await prisma.product.deleteMany({})
  console.log('✓ Products dibersihkan')

  await prisma.uploadedFile.deleteMany({})
  console.log('✓ Uploaded files dibersihkan')

  // 3. Pastikan Akun Super Admin Bersih Siap Digunakan
  const passwordHash = await argon2.hash('AdminHerta2026!')
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@hertaditz.store' },
    update: {
      passwordHash,
      name: 'Super Admin Herta',
      role: 'SUPERADMIN',
    },
    create: {
      email: 'admin@hertaditz.store',
      passwordHash,
      name: 'Super Admin Herta',
      role: 'SUPERADMIN',
    },
  })
  console.log(`✓ Akun Admin Siap: ${admin.email}`)

  console.log('\n--> Pembersihan data dummy selesai! Database kini bersih.')
}

clean()
  .catch((e) => {
    console.error('Error saat membersihkan data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
