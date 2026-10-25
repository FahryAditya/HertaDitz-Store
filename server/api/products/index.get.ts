import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category as string | undefined
  const featuredOnly = query.featured === 'true'

  try {
    const where: any = {
      status: 'PUBLISHED',
    }

    if (category && category !== 'ALL') {
      where.category = category.toUpperCase()
    }

    if (featuredOnly) {
      where.featured = true
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return {
      success: true,
      data: products,
    }
  } catch (error) {
    console.error('Error fetching products from database:', (error as Error).message)
    return {
      success: false,
      data: [],
      error: 'Gagal mengambil data produk dari database',
    }
  }
})
