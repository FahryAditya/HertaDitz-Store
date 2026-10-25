import { z } from 'zod'
import { prisma } from '../../../utils/prisma'

const productCreateSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  slug: z.string().optional(),
  category: z.enum(['WEBSITE', 'STICKER', 'POSTER']),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  features: z.array(z.string()).default([]),
  price: z.number().positive('Harga normal harus lebih dari 0'),
  salePrice: z.number().nullable().optional(),
  demoUrl: z.string().url('URL demo tidak valid').nullable().optional().or(z.literal('')),
  previewPaths: z.array(z.string()).min(1, 'Minimal 1 gambar preview'),
  filePath: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  featured: z.boolean().default(false),
})

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = productCreateSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0]?.message || 'Data produk tidak valid',
    })
  }

  const data = validation.data
  const finalSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name)

  // Check if slug is unique
  const existing = await prisma.product.findUnique({
    where: { slug: finalSlug },
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: `Slug "${finalSlug}" sudah digunakan oleh produk lain. Gunakan nama atau slug berbeda.`,
    })
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        category: data.category,
        description: data.description,
        features: data.features.filter((f) => f.trim().length > 0),
        price: data.price,
        salePrice: data.salePrice && data.salePrice > 0 ? data.salePrice : null,
        demoUrl: data.demoUrl || null,
        previewPaths: data.previewPaths,
        status: data.status,
        featured: data.featured,
        versions: {
          create: [
            {
              version: '1.0.0',
              filePath: data.filePath || `products/${finalSlug}-v1.0.0.zip`,
              changelog: 'Rilis awal produk',
              isCurrent: true,
            },
          ],
        },
      },
    })

    return {
      success: true,
      message: 'Produk berhasil disimpan dan diterbitkan!',
      data: product,
    }
  } catch (err: any) {
    console.error('Error creating product in Neon DB:', err.message)
    throw createError({
      statusCode: 500,
      message: `Gagal menyimpan produk ke database: ${err.message}`,
    })
  }
})
