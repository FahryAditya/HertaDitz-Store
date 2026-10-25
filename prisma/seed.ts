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

async function main() {
  console.log('Seeding HertaDitz Store database...')

  // 1. Admin User
  const passwordHash = await argon2.hash('AdminHerta2026!')
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@hertaditz.store' },
    update: {},
    create: {
      email: 'admin@hertaditz.store',
      passwordHash,
      name: 'Super Admin Herta',
      role: 'SUPERADMIN',
    },
  })
  console.log(`Created admin: ${admin.email}`)

  // 2. Voucher
  const voucher = await prisma.voucher.upsert({
    where: { code: 'HERTA10' },
    update: {},
    create: {
      code: 'HERTA10',
      type: 'PERCENT',
      value: 10,
      minTotal: 50000,
      maxUses: 100,
      active: true,
      startsAt: new Date(),
    },
  })
  console.log(`Created voucher: ${voucher.code}`)

  // 3. Products
  const products = [
    {
      slug: 'ethereal-fintech-saas',
      name: 'Ethereal — Next.js & Nuxt Fintech SaaS Template',
      category: 'WEBSITE' as const,
      description:
        'Template website premium bergaya Ethereal Dark Luxury. Dilengkapi dashboard finansial interaktif, chart animasi SVG, kartu transaksi, dan sistem navigasi floating pill.',
      features: [
        'Nuxt 4 & Tailwind CSS v4',
        'Komponen Kartu 3D & Donut SVG Chart',
        'Fully Responsive & Dark Theme Native',
        'Siap integrasi API & Auth',
      ],
      price: 249000,
      salePrice: 199000,
      status: 'PUBLISHED' as const,
      featured: true,
      sortOrder: 1,
      demoUrl: 'https://demo.hertaditz.store/ethereal',
      previewPaths: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      ],
      versions: {
        create: [
          {
            version: '1.0.0',
            filePath: 'templates/ethereal-v1.0.0.zip',
            changelog: 'Rilis awal template Ethereal Fintech',
            isCurrent: true,
          },
        ],
      },
    },
    {
      slug: 'aura-modern-portfolio',
      name: 'Aura — Developer & Designer Creative Portfolio',
      category: 'WEBSITE' as const,
      description:
        'Template portofolio minimalis modern untuk developer, designer, dan creator digital. Dilengkapi animasi smooth scroll, showcase proyek grid, dan form kontak.',
      features: [
        'Bento Grid Project Showcase',
        'Smooth Micro-interactions with Motion',
        'SEO & Performance 100 on Lighthouse',
        'Dokumentasi Lengkap',
      ],
      price: 179000,
      salePrice: 149000,
      status: 'PUBLISHED' as const,
      featured: true,
      sortOrder: 2,
      demoUrl: 'https://demo.hertaditz.store/aura',
      previewPaths: [
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      ],
      versions: {
        create: [
          {
            version: '1.0.0',
            filePath: 'templates/aura-v1.0.0.zip',
            changelog: 'Rilis versi pertama portofolio Aura',
            isCurrent: true,
          },
        ],
      },
    },
    {
      slug: 'herta-kurukuru-expression-pack',
      name: 'Herta Kuru-Kuru Chibi Sticker Pack (16 Stickers)',
      category: 'STICKER' as const,
      description:
        'Koleksi 16 stiker chibi animasi Herta resolusi tinggi (PNG transparan 512x512). Cocok untuk Discord, Telegram, WhatsApp, atau avatar stream.',
      features: [
        '16 File PNG Transparan High-Res',
        'Format Siap Pakai Telegram & WhatsApp',
        'Vektor Original & Lineart Bersih',
        'Watermark-free pada file master',
      ],
      price: 49000,
      salePrice: 35000,
      status: 'PUBLISHED' as const,
      featured: true,
      sortOrder: 3,
      previewPaths: [
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      ],
      versions: {
        create: [
          {
            version: '1.0.0',
            filePath: 'stickers/herta-pack-v1.zip',
            changelog: 'Rilis paket 16 stiker Herta',
            isCurrent: true,
          },
        ],
      },
    },
    {
      slug: 'cyberpunk-neko-waifu-chibi',
      name: 'Cyberpunk Neko Waifu Emoji Pack (12 Stickers)',
      category: 'STICKER' as const,
      description:
        'Paket stiker bertema cyberpunk neon aesthetic dengan karakter neko chibi ekspresif. Siap pakai untuk server komunitas dan streaming.',
      features: [
        '12 Stiker Vektor Neon Style',
        'PNG 300 DPI 1024x1024 Master',
        'Lisensi Personal & Streamer Friendly',
      ],
      price: 39000,
      status: 'PUBLISHED' as const,
      featured: false,
      sortOrder: 4,
      previewPaths: [
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      ],
      versions: {
        create: [
          {
            version: '1.0.0',
            filePath: 'stickers/cyberpunk-neko-v1.zip',
            isCurrent: true,
          },
        ],
      },
    },
    {
      slug: 'neo-tokyo-cyberpunk-poster',
      name: 'Neo-Tokyo Cyberpunk Typography Poster Master',
      category: 'POSTER' as const,
      description:
        'Template poster beresolusi cetak tinggi (A2 / A3 300DPI) dengan gaya tipografi brutalist acid graphics dan estetika Neo-Tokyo.',
      features: [
        'File PSD Terorganisir & Layered',
        'Ekspor Siap Cetak PDF Vector & TIFF',
        'Font Gratis Termasuk dalam Dokumentasi',
        'Panduan Edit Lengkap',
      ],
      price: 79000,
      salePrice: 59000,
      status: 'PUBLISHED' as const,
      featured: true,
      sortOrder: 5,
      previewPaths: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      ],
      versions: {
        create: [
          {
            version: '1.0.0',
            filePath: 'posters/neo-tokyo-poster-v1.zip',
            isCurrent: true,
          },
        ],
      },
    },
    {
      slug: 'minimalist-acid-graphic-poster',
      name: 'Aesthetic Acid Wave Music Event Poster Template',
      category: 'POSTER' as const,
      description:
        'Desain poster acara musik / pameran seni bergaya modern acid wave. Sangat mudah diedit untuk promosi gig, festival, atau dekorasi kamar.',
      features: [
        'Figma & PSD File Included',
        'Ukuran Cetak Standar A3 (CMYK)',
        'Fully Editable Text & Gradient Mesh',
      ],
      price: 69000,
      status: 'PUBLISHED' as const,
      featured: false,
      sortOrder: 6,
      previewPaths: [
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
      ],
      versions: {
        create: [
          {
            version: '1.0.0',
            filePath: 'posters/acid-wave-v1.zip',
            isCurrent: true,
          },
        ],
      },
    },
  ]

  for (const prod of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
    })

    if (!existing) {
      const p = await prisma.product.create({
        data: prod,
      })
      console.log(`Created product: ${p.name} [${p.category}]`)
    } else {
      console.log(`Product already exists: ${existing.name}`)
    }
  }

  // 4. Store Settings
  await prisma.storeSetting.upsert({
    where: { key: 'home_banner' },
    update: {},
    create: {
      key: 'home_banner',
      value: {
        title: 'Special Launch Promo',
        subtitle: 'Hemat hingga 20% untuk semua template website & sticker pack anime!',
        ctaText: 'Jelajahi Sekarang',
        ctaLink: '/katalog',
        active: true,
      },
    },
  })

  console.log('Seeding selesai dengan sukses!')
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
