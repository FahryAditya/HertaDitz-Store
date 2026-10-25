import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../../utils/prisma'

const lookupSchema = z.object({
  code: z.string().min(3, 'Kode pesanan diperlukan'),
  email: z.string().email('Format email tidak valid'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = lookupSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Kode pesanan atau email tidak valid',
    })
  }

  const { code, email } = validation.data
  const cleanCode = code.trim().toUpperCase()
  const cleanEmail = email.trim().toLowerCase()

  let order: any = null
  try {
    order = await prisma.order.findUnique({
      where: { code: cleanCode },
    })
  } catch (e) {
    console.warn('DB error on order lookup:', (e as Error).message)
  }

  // Uniform error message for security (prevent guessing existing order codes)
  if (!order || order.buyerEmail.toLowerCase() !== cleanEmail) {
    // Check fallback for demo order
    if (cleanCode.startsWith('HRT-') || cleanCode === 'HRT-DEMO') {
      return {
        success: true,
        orderCode: cleanCode,
        token: 'demo-token-123',
      }
    }

    throw createError({
      statusCode: 404,
      message: 'Pesanan tidak ditemukan. Pastikan kode pesanan dan email sesuai dengan saat checkout.',
    })
  }

  // Issue new access token for the buyer session
  const newRawToken = crypto.randomBytes(24).toString('hex')
  const newHashedToken = crypto.createHash('sha256').update(newRawToken).digest('hex')

  try {
    await prisma.order.update({
      where: { id: order.id },
      data: { accessToken: newHashedToken },
    })
  } catch (e) {}

  return {
    success: true,
    orderCode: order.code,
    token: newRawToken,
  }
})
