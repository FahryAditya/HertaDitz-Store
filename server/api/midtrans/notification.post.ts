import crypto from 'node:crypto'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: transactionStatus,
    fraud_status: fraudStatus,
  } = body || {}

  if (!orderId || !signatureKey) {
    throw createError({ statusCode: 400, message: 'Invalid webhook payload' })
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'demo_server_key'

  // 1. Signature Verification: SHA512(order_id + status_code + gross_amount + ServerKey)
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex')

  const isValidSignature =
    process.env.NODE_ENV === 'development' ||
    !process.env.MIDTRANS_SERVER_KEY ||
    signatureKey === expectedSignature

  let order: any = null
  try {
    order = await prisma.order.findUnique({
      where: { code: orderId },
      include: { voucher: true },
    })
  } catch (e) {
    console.warn('DB error reading order for webhook:', (e as Error).message)
  }

  // 2. Log Payment Event
  try {
    await prisma.paymentEvent.create({
      data: {
        orderId: order?.id || null,
        rawStatus: transactionStatus || 'unknown',
        payload: body,
        valid: isValidSignature,
      },
    })
  } catch (e) {}

  if (!isValidSignature) {
    throw createError({ statusCode: 403, message: 'Invalid Midtrans signature key' })
  }

  if (!order) {
    // If order record not found in DB
    return { success: true, message: 'Webhook received for untracked/mock order' }
  }

  // 3. Idempotency Check
  if (order.status === 'PAID') {
    return { success: true, message: 'Order is already marked as PAID' }
  }

  // 4. Map Midtrans Status
  let newStatus: 'PAID' | 'PENDING' | 'EXPIRED' | 'CANCELED' | 'FAILED' = 'PENDING'

  if (transactionStatus === 'capture') {
    newStatus = fraudStatus === 'accept' ? 'PAID' : 'FAILED'
  } else if (transactionStatus === 'settlement') {
    newStatus = 'PAID'
  } else if (transactionStatus === 'pending') {
    newStatus = 'PENDING'
  } else if (transactionStatus === 'deny') {
    newStatus = 'FAILED'
  } else if (transactionStatus === 'expire') {
    newStatus = 'EXPIRED'
  } else if (transactionStatus === 'cancel') {
    newStatus = 'CANCELED'
  }

  // 5. Update Order & Voucher in one transaction
  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date() : undefined,
          midtransRef: body.transaction_id || undefined,
        },
      })

      // If PAID and has voucher, increment voucher usage count
      if (newStatus === 'PAID' && order.voucherId) {
        await tx.voucher.update({
          where: { id: order.voucherId },
          data: {
            usedCount: { increment: 1 },
          },
        })
      }
    })
  } catch (dbErr) {
    console.error('Failed to update order status from webhook:', (dbErr as Error).message)
  }

  return { success: true, newStatus }
})
