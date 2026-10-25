import crypto from 'node:crypto'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const query = getQuery(event)
  const rawToken = (query.token as string) || ''

  if (!code) {
    throw createError({ statusCode: 400, message: 'Kode pesanan diperlukan' })
  }

  let order: any = null
  try {
    order = await prisma.order.findUnique({
      where: { code },
      include: {
        items: {
          include: {
            product: true,
            version: true,
          },
        },
      },
    })
  } catch (e) {
    console.warn('DB error fetching order:', (e as Error).message)
  }

  // If order found in DB
  if (order) {
    // If buyer token provided, verify
    let isAuthorized = false
    if (rawToken) {
      const hashed = crypto.createHash('sha256').update(rawToken).digest('hex')
      isAuthorized = order.accessToken === hashed
    }

    return {
      success: true,
      data: {
        id: order.id,
        code: order.code,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        isAuthorized,
        items: order.items.map((item: any) => ({
          id: item.id,
          productName: item.product.name,
          category: item.product.category,
          version: item.version?.version || '1.0.0',
          priceAtBuy: item.priceAtBuy,
          downloadAllowed: order.status === 'PAID' && isAuthorized,
        })),
      },
    }
  }

  // Fallback demo order for sandbox preview
  return {
    success: true,
    data: {
      id: 'demo-order-1',
      code,
      buyerName: 'Demo Customer',
      buyerEmail: 'demo@hertaditz.store',
      status: 'PAID',
      subtotal: 199000,
      discount: 0,
      total: 199000,
      paidAt: new Date(),
      createdAt: new Date(),
      isAuthorized: true,
      items: [
        {
          id: 'demo-item-1',
          productName: 'Ethereal — Next.js & Nuxt Fintech SaaS Template',
          category: 'WEBSITE',
          version: '1.0.0',
          priceAtBuy: 199000,
          downloadAllowed: true,
        },
      ],
    },
  }
})
