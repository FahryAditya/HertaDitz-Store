import { prisma } from '../../utils/prisma'

const fallbackProducts = [
  {
    id: 'prod-1',
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
  },
  {
    id: 'prod-2',
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
  },
  {
    id: 'prod-3',
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
  },
  {
    id: 'prod-4',
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
    salePrice: null,
    status: 'PUBLISHED' as const,
    featured: false,
    sortOrder: 4,
    previewPaths: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'prod-5',
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
  },
  {
    id: 'prod-6',
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
    salePrice: null,
    status: 'PUBLISHED' as const,
    featured: false,
    sortOrder: 6,
    previewPaths: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    ],
  },
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category as string | undefined
  const featuredOnly = query.featured === 'true'

  try {
    const where: any = {
      status: 'PUBLISHED',
    }

    if (category) {
      where.category = category.toUpperCase()
    }

    if (featuredOnly) {
      where.featured = true
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    })

    if (products.length > 0) {
      return {
        success: true,
        data: products,
      }
    }
  } catch (error) {
    // If DB is offline or not yet connected, fall back to initial mock catalogue
    console.warn('DB query failed, serving fallback products catalog:', (error as Error).message)
  }

  // Filter fallback products
  let filtered = [...fallbackProducts]
  if (category) {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  }
  if (featuredOnly) {
    filtered = filtered.filter((p) => p.featured)
  }

  return {
    success: true,
    data: filtered,
  }
})
