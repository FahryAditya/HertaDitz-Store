import { z } from 'zod'
import { prisma } from '../../utils/prisma'

const quoteSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
    })
  ),
  voucherCode: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = quoteSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Format data keranjang tidak valid',
    })
  }

  const { items, voucherCode } = validation.data

  if (items.length === 0) {
    return {
      success: true,
      subtotal: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
      items: [],
      voucher: null,
    }
  }

  // Fallback price dictionary if DB is offline
  const fallbackPrices: Record<string, { name: string; price: number; salePrice?: number | null }> = {
    'ethereal-fintech-saas': {
      name: 'Ethereal — Next.js & Nuxt Fintech SaaS Template',
      price: 249000,
      salePrice: 199000,
    },
    'aura-modern-portfolio': {
      name: 'Aura — Developer & Designer Creative Portfolio',
      price: 179000,
      salePrice: 149000,
    },
    'herta-kurukuru-expression-pack': {
      name: 'Herta Kuru-Kuru Chibi Sticker Pack (16 Stickers)',
      price: 49000,
      salePrice: 35000,
    },
    'cyberpunk-neko-waifu-chibi': {
      name: 'Cyberpunk Neko Waifu Emoji Pack (12 Stickers)',
      price: 39000,
      salePrice: null,
    },
    'neo-tokyo-cyberpunk-poster': {
      name: 'Neo-Tokyo Cyberpunk Typography Poster Master',
      price: 79000,
      salePrice: 59000,
    },
    'minimalist-acid-graphic-poster': {
      name: 'Aesthetic Acid Wave Music Event Poster Template',
      price: 69000,
      salePrice: null,
    },
  }

  let dbProducts: any[] = []
  try {
    dbProducts = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.id) },
        status: 'PUBLISHED',
      },
    })
  } catch (e) {
    console.warn('DB offline during quote, using fallback price database')
  }

  // Calculate Subtotal from authoritative server records
  let subtotal = 0
  const verifiedItems: any[] = []

  for (const item of items) {
    const dbItem = dbProducts.find((p) => p.id === item.id)
    if (dbItem) {
      const effectivePrice = dbItem.salePrice && dbItem.salePrice > 0 ? dbItem.salePrice : dbItem.price
      subtotal += effectivePrice
      verifiedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        price: effectivePrice,
      })
    } else {
      // Check fallback by slug
      const fb = fallbackPrices[item.slug]
      const price = fb?.salePrice && fb.salePrice > 0 ? fb.salePrice : fb?.price || 50000
      subtotal += price
      verifiedItems.push({
        id: item.id,
        name: fb?.name || item.slug,
        price,
      })
    }
  }

  // Validate Voucher
  let discount = 0
  let appliedVoucher: any = null

  if (voucherCode && voucherCode.trim()) {
    const code = voucherCode.trim().toUpperCase()

    // 1. Try DB voucher
    let dbVoucher: any = null
    try {
      dbVoucher = await prisma.voucher.findUnique({
        where: { code },
      })
    } catch (e) {}

    // 2. Fallback voucher HERTA10
    if (!dbVoucher && code === 'HERTA10') {
      dbVoucher = {
        code: 'HERTA10',
        type: 'PERCENT',
        value: 10,
        minTotal: 50000,
        active: true,
      }
    }

    if (dbVoucher && dbVoucher.active) {
      const now = new Date()
      const isStarted = !dbVoucher.startsAt || new Date(dbVoucher.startsAt) <= now
      const isNotEnded = !dbVoucher.endsAt || new Date(dbVoucher.endsAt) >= now
      const hasQuota = !dbVoucher.maxUses || (dbVoucher.usedCount || 0) < dbVoucher.maxUses
      const meetsMinTotal = subtotal >= (dbVoucher.minTotal || 0)

      if (isStarted && isNotEnded && hasQuota && meetsMinTotal) {
        if (dbVoucher.type === 'PERCENT') {
          discount = Math.round((subtotal * dbVoucher.value) / 100)
        } else {
          discount = Math.min(dbVoucher.value, subtotal)
        }
        appliedVoucher = {
          code: dbVoucher.code,
          type: dbVoucher.type,
          value: dbVoucher.value,
        }
      }
    }
  }

  const total = Math.max(0, subtotal - discount)

  return {
    success: true,
    subtotal,
    discount,
    total,
    itemCount: verifiedItems.length,
    items: verifiedItems,
    voucher: appliedVoucher,
  }
})
