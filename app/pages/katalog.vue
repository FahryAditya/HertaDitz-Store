<script setup lang="ts">
import type { ProductProps } from '~/components/ui/ProductCard.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref((route.query.kategori as string) || 'ALL')
const sortBy = ref('featured')

const { data, status } = await useFetch<{ success: boolean; data: ProductProps[] }>('/api/products')

const categories = [
  { id: 'ALL', name: 'Semua Kategori' },
  { id: 'WEBSITE', name: 'Template Website' },
  { id: 'STICKER', name: 'Sticker Anime' },
  { id: 'POSTER', name: 'Template Poster' },
]

const filteredProducts = computed(() => {
  let list = [...(data.value?.data || [])]

  // Filter category
  if (selectedCategory.value !== 'ALL') {
    list = list.filter((p) => p.category === selectedCategory.value)
  }

  // Filter search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    )
  }

  // Sort
  if (sortBy.value === 'price-low') {
    list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
  } else if (sortBy.value === 'price-high') {
    list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }

  return list
})

watch(selectedCategory, (newCat) => {
  router.replace({
    query: {
      ...route.query,
      kategori: newCat === 'ALL' ? undefined : newCat,
    },
  })
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header Page -->
    <div class="border-b border-white/5 pb-6">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Katalog Aset Digital
      </h1>
      <p class="text-xs sm:text-sm text-gray-400 mt-1">
        Cari dan temukan template website, stiker anime, dan poster sesuai kebutuhan proyek Anda.
      </p>
    </div>

    <!-- Filter & Search Controls Bar -->
    <div class="bg-[#181926] border border-white/10 rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[220px]">
        <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama template, sticker, atau poster..."
          class="w-full bg-[#12131d] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
        />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          @click="selectedCategory = cat.id"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition"
          :class="
            selectedCategory === cat.id
              ? 'bg-white text-[#0b0c12] shadow-sm'
              : 'bg-[#25283c] text-gray-300 hover:text-white'
          "
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Sorting Select -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 font-medium">Urutan:</span>
        <select
          v-model="sortBy"
          class="bg-[#12131d] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 transition cursor-pointer"
        >
          <option value="featured">Unggulan</option>
          <option value="price-low">Termurah</option>
          <option value="price-high">Termahal</option>
          <option value="name">Nama (A-Z)</option>
        </select>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-[#181926] border border-white/5 rounded-[26px] p-5 h-[360px] animate-pulse"
      ></div>
    </div>

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
      class="text-center py-20 px-4 bg-[#181926]/40 border border-white/5 rounded-[28px]"
    >
      <Icon name="lucide:search-x" class="w-12 h-12 text-gray-500 mx-auto mb-3" />
      <h3 class="text-base font-semibold text-white">Tidak ada hasil pencarian</h3>
      <p class="text-xs text-gray-400 mt-1">Coba kata kunci lain atau ubah filter kategori yang dipilih.</p>
      <button
        type="button"
        @click="searchQuery = ''; selectedCategory = 'ALL'"
        class="mt-4 px-5 py-2 rounded-full bg-white text-[#0b0c12] text-xs font-semibold hover:bg-gray-100 transition"
      >
        Reset Filter
      </button>
    </div>
  </div>
</template>
