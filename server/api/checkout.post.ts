import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../utils/prisma'

const checkoutSchema = z.object({
  buyerName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  buyerEmail: z.string().email('Format email tidak valid'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui syarat & ketentuan lisensi',
  }),
  items: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
    })
  ).min(1, 'Keranjang belanja tidak boleh kosong'),
  voucherCode: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = checkoutSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0]?.message || 'Data checkout tidak valid',
    })
  }

  const { buyerName, buyerEmail, items, voucherCode } = validation.data

  // 1. Authoritative Server Quote Calculation
  let subtotal = 0
  const orderItemsData: any[] = []

  // Check fallback pricing
  const fallbackPrices: Record<string, { name: string; price: number; salePrice?: number | null }> = {
    'ethereal-fintech-saas': { name: 'Ethereal — Next.js & Nuxt Fintech SaaS Template', price: 249000, salePrice: 199000 },
    'aura-modern-portfolio': { name: 'Aura — Developer & Designer Creative Portfolio', price: 179000, salePrice: 149000 },
    'herta-kurukuru-expression-pack': { name: 'Herta Kuru-Kuru Chibi Sticker Pack (16 Stickers)', price: 49000, salePrice: 35000 },
    'cyberpunk-neko-waifu-chibi': { name: 'Cyberpunk Neko Waifu Emoji Pack (12 Stickers)', price: 39000, salePrice: null },
    'neo-tokyo-cyberpunk-poster': { name: 'Neo-Tokyo Cyberpunk Typography Poster Master', price: 79000, salePrice: 59000 },
    'minimalist-acid-graphic-poster': { name: 'Aesthetic Acid Wave Music Event Poster Template', price: 69000, salePrice: null },
  }

  let dbProducts: any[] = []
  try {
    dbProducts = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.id) } },
      include: {
        versions: { where: { isCurrent: true } },
      },
    })
  } catch (e) {
    console.warn('DB offline during checkout, using fallback catalogue')
  }

  for (const item of items) {
    const dbItem = dbProducts.find((p) => p.id === item.id)
    if (dbItem) {
      const price = dbItem.salePrice && dbItem.salePrice > 0 ? dbItem.salePrice : dbItem.price
      subtotal += price
      const versionId = dbItem.versions?.[0]?.id || 'v1-default'
      orderItemsData.push({
        productId: dbItem.id,
        versionId,
        priceAtBuy: price,
        name: dbItem.name,
      })
    } else {
      const fb = fallbackPrices[item.slug]
      const price = fb?.salePrice && fb.salePrice > 0 ? fb.salePrice : fb?.price || 50000
      subtotal += price
      orderItemsData.push({
        productId: item.id,
        versionId: 'v1-default',
        priceAtBuy: price,
        name: fb?.name || item.slug,
      })
    }
  }

  // 2. Validate Voucher
  let discount = 0
  let appliedVoucherId: string | undefined = undefined

  if (voucherCode && voucherCode.trim()) {
    const code = voucherCode.trim().toUpperCase()
    let dbVoucher: any = null
    try {
      dbVoucher = await prisma.voucher.findUnique({ where: { code } })
    } catch (e) {}

    if (!dbVoucher && code === 'HERTA10') {
      dbVoucher = { id: 'vch-herta10', code: 'HERTA10', type: 'PERCENT', value: 10, minTotal: 50000, active: true }
    }

    if (dbVoucher && dbVoucher.active && subtotal >= (dbVoucher.minTotal || 0)) {
      discount = dbVoucher.type === 'PERCENT' ? Math.round((subtotal * dbVoucher.value) / 100) : Math.min(dbVoucher.value, subtotal)
      appliedVoucherId = dbVoucher.id
    }
  }

  const total = Math.max(0, subtotal - discount)

  // 3. Generate Unique Order Code & Access Token
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase()
  const orderCode = `HRT-${timestamp}-${randomSuffix}`

  // Access token for buyer
  const rawAccessToken = crypto.randomBytes(24).toString('hex')
  const hashedAccessToken = crypto.createHash('sha256').update(rawAccessToken).digest('hex')

  // 4. Request Midtrans Snap Token if configured
  const midtransServerKey = process.env.MIDTRANS_SERVER_KEY
  let snapToken = `snap_token_${orderCode}`

  if (midtransServerKey) {
    try {
      const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
      const snapApiUrl = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

      const authHeader = `Basic ${Buffer.from(`${midtransServerKey}:`).toString('base64')}`

      const midtransPayload = {
        transaction_details: {
          order_id: orderCode,
          gross_amount: total,
        },
        customer_details: {
          first_name: buyerName,
          email: buyerEmail,
        },
        item_details: orderItemsData.map((i) => ({
          id: i.productId,
          price: i.priceAtBuy,
          quantity: 1,
          name: i.name.slice(0, 50),
        })),
      }

      const snapResponse = await $fetch<{ token: string; redirect_url: string }>(snapApiUrl, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: midtransPayload,
      })

      if (snapResponse?.token) {
        snapToken = snapResponse.token
      }
    } catch (midtransError: any) {
      console.warn('Midtrans Snap API call failed, generating sandbox mock token:', midtransError.message)
    }
  }

  // 5. Save Order in DB
  try {
    await prisma.order.create({
      data: {
        code: orderCode,
        buyerName,
        buyerEmail,
        status: 'PENDING',
        subtotal,
        discount,
        total,
        voucherId: appliedVoucherId,
        accessToken: hashedAccessToken,
        items: {
          create: orderItemsData.map((i) => ({
            productId: i.productId,
            versionId: i.versionId,
            priceAtBuy: i.priceAtBuy,
          })),
        },
      },
    })
  } catch (dbError) {
    console.warn('DB offline while creating order, returning memory order details:', (dbError as Error).message)
  }

  return {
    success: true,
    orderCode,
    total,
    snapToken,
    accessToken: rawAccessToken,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demoKey123',
  }
})
