<script setup lang="ts">
import type { ProductProps } from '~/components/ui/ProductCard.vue'

const activeCategory = ref('ALL')
const { data, status } = await useFetch<{ success: boolean; data: ProductProps[] }>('/api/products')

const categories = [
  { id: 'ALL', name: 'Semua Aset', icon: 'lucide:layout-grid' },
  { id: 'WEBSITE', name: 'Template Website', icon: 'lucide:code' },
  { id: 'STICKER', name: 'Sticker Anime', icon: 'lucide:smile' },
  { id: 'POSTER', name: 'Template Poster', icon: 'lucide:image' },
]

const filteredProducts = computed(() => {
  const list = data.value?.data || []
  if (activeCategory.value === 'ALL') return list
  return list.filter((p) => p.category === activeCategory.value)
})

const featuredProducts = computed(() => {
  return (data.value?.data || []).filter((p) => (p as any).featured)
})
</script>

<template>
  <div class="space-y-10">
    <!-- HERO ROW: Promo Card + Fast Stats / Feature Pillars -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      <!-- Left 7 Cols: Lime-Mint Hero Promo Card -->
      <div class="lg:col-span-7">
        <UiHeroPromoCard />
      </div>

      <!-- Right 5 Cols: Quick Highlights Cards inspired by Ethereal -->
      <div class="lg:col-span-5 flex flex-col gap-3.5 justify-between">
        <!-- Feature 1: Instant Download -->
        <div
          class="bg-gradient-to-br from-[#232734] to-[#181a24] border border-white/10 rounded-[24px] p-5 flex items-center justify-between hover:border-white/20 transition group"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Icon name="lucide:zap" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-white tracking-tight">Unduh Instan & Aman</h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Signed URL Supabase berumur pendek</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-[#a3e635] text-[#0b0c12] text-[10px] font-bold">
            Aktif
          </span>
        </div>

        <!-- Feature 2: Clean Master Files -->
        <div
          class="bg-gradient-to-br from-[#262438] to-[#181926] border border-white/10 rounded-[24px] p-5 flex items-center justify-between hover:border-white/20 transition group"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Icon name="lucide:sparkles" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-white tracking-tight">File Master Asli</h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Bebas watermark & siap pakai</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 text-[10px] font-bold">
            Master
          </span>
        </div>

        <!-- Feature 3: Midtrans Payment -->
        <div
          class="bg-gradient-to-br from-[#232230] to-[#171822] border border-white/10 rounded-[24px] p-5 flex items-center justify-between hover:border-white/20 transition group"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
              <Icon name="lucide:qr-code" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-white tracking-tight">Pembayaran Lengkap</h3>
              <p class="text-[11px] text-gray-400 mt-0.5">QRIS, VA Bank & E-Wallet Midtrans</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-[10px] font-bold">
            Snap
          </span>
        </div>
      </div>
    </div>

    <!-- SECTION: PRODUK UNGGULAN & KATALOG -->
    <div class="space-y-6">
      <!-- Section Header & Filter Pills -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Koleksi Terbaru
          </h2>
          <p class="text-xs text-gray-400 mt-0.5">
            Jelajahi produk digital terverifikasi dan siap digunakan
          </p>
        </div>

        <!-- Category Filter Pills -->
        <div class="bg-[#171824] p-1 rounded-full border border-white/5 flex items-center gap-1 overflow-x-auto">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            @click="activeCategory = cat.id"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap"
            :class="
              activeCategory === cat.id
                ? 'bg-white text-[#0b0c12] shadow-sm'
                : 'text-gray-400 hover:text-white'
            "
          >
            <Icon :name="cat.icon" class="w-3.5 h-3.5" />
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="status === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-[#181926] border border-white/5 rounded-[26px] p-5 h-[360px] animate-pulse"
        ></div>
      </div>

      <!-- Product Grid -->
      <div
        v-else-if="filteredProducts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <UiProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-16 px-4 bg-[#181926]/50 border border-white/5 rounded-[28px]"
      >
        <Icon name="lucide:inbox" class="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <h3 class="text-base font-semibold text-white">Tidak ada produk dalam kategori ini</h3>
        <p class="text-xs text-gray-400 mt-1">Silakan pilih kategori lain atau reset filter pencarian.</p>
        <button
          type="button"
          @click="activeCategory = 'ALL'"
          class="mt-4 px-5 py-2 rounded-full bg-white text-[#0b0c12] text-xs font-semibold hover:bg-gray-100 transition"
        >
          Lihat Semua Produk
        </button>
      </div>
    </div>
  </div>
</template>
