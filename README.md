# Nuxt Project

Stack: Nuxt 4, Tailwind CSS v4, motion-v (Framer Motion untuk Vue), GSAP, Pinia, Nuxt Icon, Prisma 7, Zod, Argon2.

## Mulai
```bash
npm install
# isi DATABASE_URL di .env
npx prisma generate
npm run dev
```

## Struktur penting
- `app/assets/css/main.css` — import Tailwind
- `app/stores/` — Pinia store
- `app/plugins/gsap.client.ts` — GSAP via `useNuxtApp().$gsap`
- `server/utils/prisma.ts` — Prisma client (adapter pg)
- `server/utils/password.ts` — hash/verify Argon2
- `prisma/schema.prisma` + `prisma.config.ts`
