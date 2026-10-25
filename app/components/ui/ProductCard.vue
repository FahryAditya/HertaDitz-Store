<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

export interface ProductProps {
  id: string
  slug: string
  name: string
  category: 'WEBSITE' | 'STICKER' | 'POSTER'
  description?: string
  features?: string[]
  price: number
  salePrice?: number | null
  previewPaths?: string[]
  demoUrl?: string | null
}

const props = defineProps<{
  product: ProductProps
}>()

const cartStore = useCartStore()

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

const categoryStyles: Record<string, { label: string; bg: string; text: string }> = {
  WEBSITE: { label: 'Website Template', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  STICKER: { label: 'Anime Sticker', bg: 'bg-purple-500/15', text: 'text-purple-300' },
  POSTER: { label: 'Poster Template', bg: 'bg-sky-500/15', text: 'text-sky-300' },
}

const activeCategory = computed(() => {
  return (
    categoryStyles[props.product.category] || {
      label: props.product.category,
      bg: 'bg-white/10',
      text: 'text-white',
    }
  )
})

const defaultImage = computed(() => {
  if (props.product.previewPaths && props.product.previewPaths.length > 0) {
    return props.product.previewPaths[0]
  }
  return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'
})

const handleAddToCart = () => {
  cartStore.addToCart({
    id: props.product.id,
    slug: props.product.slug,
    name: props.product.name,
    category: props.product.category,
    price: props.product.price,
    salePrice: props.product.salePrice,
    previewUrl: defaultImage.value,
  })
}
</script>

<template>
  <div
    class="bg-[#181926] hover:bg-[#202234] border border-white/10 hover:border-white/20 rounded-[26px] p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:-translate-y-1"
  >
    <div>
      <!-- Thumbnail with Watermark Overlay for Sticker/Poster -->
      <div class="relative w-full h-[180px] sm:h-[190px] rounded-[20px] overflow-hidden bg-[#12131d] border border-white/5 mb-4">
        <img
          :src="defaultImage"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        <!-- Watermark Pattern for Digital Artwork -->
        <div
          v-if="product.category === 'STICKER' || product.category === 'POSTER'"
          class="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/20"
        >
          <span
            class="text-white/25 font-bold tracking-widest text-xs uppercase -rotate-12 border border-white/20 px-3 py-1 rounded-full backdrop-blur-[1px]"
          >
            HERTADITZ PREVIEW
          </span>
        </div>

        <!-- Category Badge Floating Top Left -->
        <div class="absolute top-3 left-3">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border border-white/10"
            :class="[activeCategory.bg, activeCategory.text]"
          >
            {{ activeCategory.label }}
          </span>
        </div>

        <!-- Sale % Badge Top Right -->
        <div
          v-if="product.salePrice && product.salePrice < product.price"
          class="absolute top-3 right-3"
        >
          <span
            class="px-2 py-0.5 rounded-full bg-[#f87171] text-[#0b0c12] text-[10px] font-extrabold tabular-nums shadow-sm"
          >
            -{{ Math.round(((product.price - product.salePrice) / product.price) * 100) }}%
          </span>
        </div>
      </div>

      <!-- Title & Details -->
      <NuxtLink :to="`/produk/${product.slug}`" class="block group-hover:text-[#a7f3d0] transition">
        <h3 class="text-sm sm:text-base font-semibold text-white tracking-tight line-clamp-1 leading-snug">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <p class="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
        {{ product.description }}
      </p>

      <!-- Features bullet tag preview -->
      <div v-if="product.features && product.features.length > 0" class="flex flex-wrap gap-1.5 mt-3">
        <span
          v-for="(f, i) in product.features.slice(0, 2)"
          :key="i"
          class="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-300 font-medium"
        >
          {{ f }}
        </span>
      </div>
    </div>

    <!-- Bottom Pricing & Action -->
    <div class="pt-5 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
      <!-- Price Column -->
      <div class="flex flex-col">
        <div v-if="product.salePrice && product.salePrice < product.price" class="flex items-center gap-1.5">
          <span class="text-[11px] text-gray-400 line-through tabular-nums">
            {{ formatRupiah(product.price) }}
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-base sm:text-lg font-bold text-white tabular-nums tracking-tight">
            {{ formatRupiah(product.salePrice || product.price) }}
          </span>
        </div>
      </div>

      <!-- Action Button Group -->
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="`/produk/${product.slug}`"
          aria-label="Lihat detail produk"
          class="w-8 h-8 rounded-full bg-[#25283c] hover:bg-[#32364f] text-gray-300 hover:text-white flex items-center justify-center transition text-xs"
        >
          <Icon name="lucide:eye" class="w-4 h-4" />
        </NuxtLink>

        <button
          type="button"
          @click="handleAddToCart"
          class="px-3.5 py-1.5 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Icon name="lucide:plus" class="w-3.5 h-3.5" />
          <span>Beli</span>
        </button>
      </div>
    </div>
  </div>
</template>
