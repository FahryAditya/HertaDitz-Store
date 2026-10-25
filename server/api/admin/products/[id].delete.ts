import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID produk diperlukan' })
  }

  try {
    await prisma.product.delete({
      where: { id },
    })

    return {
      success: true,
      message: 'Produk berhasil dihapus dari database',
    }
  } catch (err: any) {
    console.error('Error deleting product:', err.message)
    throw createError({ statusCode: 500, message: 'Gagal menghapus produk' })
  }
})
