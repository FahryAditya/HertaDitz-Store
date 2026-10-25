import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { verifyPassword } from '../../utils/password'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)

  if (!validation.success) {
    throw createError({ statusCode: 400, message: 'Email dan password tidak valid' })
  }

  const { email, password } = validation.data
  const cleanEmail = email.trim().toLowerCase()

  let adminUser: any = null
  try {
    adminUser = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    })
  } catch (e) {
    console.warn('DB error checking admin user:', (e as Error).message)
  }

  // Check database or fallback admin credential
  let isValid = false
  let userName = 'Super Admin'

  if (adminUser) {
    try {
      isValid = await verifyPassword(adminUser.passwordHash, password)
      userName = adminUser.name
    } catch (e) {}
  } else if (cleanEmail === 'admin@hertaditz.store' && password === 'AdminHerta2026!') {
    // Development sandbox fallback credential
    isValid = true
    userName = 'Super Admin Herta'
  }

  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Email atau password salah' })
  }

  // Set httpOnly session cookie
  setCookie(event, 'hertaditz_admin_session', 'auth_token_' + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return {
    success: true,
    user: {
      email: cleanEmail,
      name: userName,
      role: 'SUPERADMIN',
    },
  }
})
