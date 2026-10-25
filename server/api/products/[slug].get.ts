import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug produk diperlukan' })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        versions: {
          where: { isCurrent: true },
          select: {
            id: true,
            version: true,
            changelog: true,
            createdAt: true,
          },
        },
      },
    })

    if (!product || product.status !== 'PUBLISHED') {
      throw createError({ statusCode: 404, message: 'Produk tidak ditemukan atau belum diterbitkan' })
    }

    return { success: true, data: product }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error fetching product by slug:', error.message)
    throw createError({ statusCode: 500, message: 'Terjadi kesalahan saat mengambil detail produk' })
  }
})
