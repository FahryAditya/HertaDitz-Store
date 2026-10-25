import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'Tidak ada file yang diunggah' })
  }

  const filePart = parts.find((p) => p.name === 'file' || p.filename)
  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, message: 'File tidak ditemukan dalam request' })
  }

  const fileName = filePart.filename || `upload-${Date.now()}`
  const fileType = filePart.type || 'application/octet-stream'
  const fileSize = filePart.data.length

  try {
    const record = await prisma.uploadedFile.create({
      data: {
        fileName,
        fileType,
        fileSize,
        fileData: filePart.data,
        category: fileType.startsWith('image/') ? 'preview' : 'master',
      },
    })

    const fileUrl = `/api/files/${record.id}`

    // Update URL field in record
    await prisma.uploadedFile.update({
      where: { id: record.id },
      data: { url: fileUrl },
    })

    return {
      success: true,
      fileId: record.id,
      fileName,
      fileType,
      fileSize,
      url: fileUrl,
    }
  } catch (err: any) {
    console.error('Error saving uploaded file to Neon DB:', err.message)
    throw createError({ statusCode: 500, message: 'Gagal menyimpan file ke database' })
  }
})
