import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID file diperlukan' })
  }

  const record = await prisma.uploadedFile.findUnique({
    where: { id },
  })

  if (!record || !record.fileData) {
    throw createError({ statusCode: 404, message: 'File tidak ditemukan' })
  }

  // Set response headers
  setHeader(event, 'Content-Type', record.fileType || 'application/octet-stream')
  setHeader(event, 'Content-Length', record.fileSize)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return record.fileData
})
