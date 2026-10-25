<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const slug = computed(() => route.params.slug as string)

const { data, error, status } = await useFetch<{
  success: boolean
  data: any
}>(`/api/products/${slug.value}`)

const product = computed(() => data.value?.data)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

const activePreview = ref(0)

const activeImage = computed(() => {
  if (product.value?.previewPaths && product.value.previewPaths.length > 0) {
    return product.value.previewPaths[activePreview.value] || product.value.previewPaths[0]
  }
  return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80'
})

const handleAddToCart = () => {
  if (!product.value) return
  cartStore.addToCart({
    id: product.value.id,
    slug: product.value.slug,
    name: product.value.name,
    category: product.value.category,
    price: product.value.price,
    salePrice: product.value.salePrice,
    previewUrl: activeImage.value,
  })
}

const handleBuyNow = () => {
  handleAddToCart()
  router.push('/keranjang')
}
</script>

<template>
  <div v-if="product" class="space-y-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-gray-400">
      <NuxtLink to="/" class="hover:text-white transition">Beranda</NuxtLink>
      <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
      <NuxtLink to="/katalog" class="hover:text-white transition">Katalog</NuxtLink>
      <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
      <span class="text-gray-200 font-medium truncate max-w-xs">{{ product.name }}</span>
    </nav>

    <!-- Main Product Grid: Gallery Left (6 Cols) + Info Right (6 Cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Gallery Column -->
      <div class="lg:col-span-6 space-y-4">
        <!-- Main Preview Image Container -->
        <div class="relative w-full h-[380px] sm:h-[420px] rounded-[32px] overflow-hidden bg-[#151624] border border-white/10 shadow-2xl">
          <img
            :src="activeImage"
            :alt="product.name"
            class="w-full h-full object-cover"
          />

          <!-- Watermark for digital files -->
          <div
            v-if="product.category === 'STICKER' || product.category === 'POSTER'"
            class="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/25"
          >
            <span class="text-white/30 font-bold tracking-widest text-sm uppercase -rotate-12 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
              HERTADITZ OFFICIAL PREVIEW
            </span>
          </div>

          <!-- Live Demo Link Badge (for templates) -->
          <a
            v-if="product.demoUrl"
            :href="product.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-[#0b0c12]/90 hover:bg-[#0b0c12] text-white text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center gap-1.5 transition shadow-lg"
          >
            <Icon name="lucide:external-link" class="w-3.5 h-3.5 text-emerald-400" />
            <span>Lihat Live Demo</span>
          </a>
        </div>

        <!-- Thumbnails row if multiple -->
        <div
          v-if="product.previewPaths && product.previewPaths.length > 1"
          class="flex items-center gap-3 overflow-x-auto pb-1"
        >
          <button
            v-for="(path, idx) in product.previewPaths"
            :key="idx"
            type="button"
            @click="activePreview = idx"
            class="w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0"
            :class="
              activePreview === idx
                ? 'border-[#a3e635] scale-105'
                : 'border-white/10 opacity-60 hover:opacity-100'
            "
          >
            <img :src="path" :alt="`Preview ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Details Column -->
      <div class="lg:col-span-6 bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-6">
        <div>
          <!-- Category & Status Badge -->
          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              {{ product.category }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 text-[11px] font-mono">
              v{{ product.versions?.[0]?.version || '1.0.0' }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {{ product.name }}
          </h1>

          <!-- Price Display -->
          <div class="mt-4 flex items-baseline gap-3">
            <span class="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
              {{ formatRupiah(product.salePrice || product.price) }}
            </span>
            <span
              v-if="product.salePrice && product.salePrice < product.price"
              class="text-sm text-gray-400 line-through tabular-nums"
            >
              {{ formatRupiah(product.price) }}
            </span>
            <span
              v-if="product.salePrice && product.salePrice < product.price"
              class="px-2.5 py-0.5 rounded-full bg-[#a3e635] text-[#0b0c12] text-[11px] font-bold tabular-nums"
            >
              Hemat {{ formatRupiah(product.price - product.salePrice) }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div class="border-t border-white/5 pt-4">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Deskripsi Produk
          </h2>
          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {{ product.description }}
          </p>
        </div>

        <!-- Features Included -->
        <div v-if="product.features && product.features.length > 0" class="border-t border-white/5 pt-4">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Fitur & Keunggulan
          </h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200">
            <li
              v-for="(f, i) in product.features"
              :key="i"
              class="flex items-center gap-2"
            >
              <Icon name="lucide:check-circle-2" class="w-4 h-4 text-[#a3e635] shrink-0" />
              <span>{{ f }}</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="border-t border-white/5 pt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="handleBuyNow"
            class="flex-1 min-w-[160px] py-3 px-6 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 font-bold text-sm transition shadow-lg text-center"
          >
            Beli Sekarang
          </button>
          <button
            type="button"
            @click="handleAddToCart"
            class="px-5 py-3 rounded-full bg-[#25283c] hover:bg-[#32364f] text-white active:scale-95 text-sm font-semibold flex items-center gap-2 transition"
          >
            <Icon name="lucide:shopping-bag" class="w-4 h-4" />
            <span>+ Keranjang</span>
          </button>
        </div>

        <!-- License Notice Box -->
        <div class="bg-[#12131d] rounded-2xl p-4 border border-white/5 text-[11px] text-gray-400 space-y-1">
          <div class="flex items-center gap-1.5 text-gray-300 font-semibold">
            <Icon name="lucide:file-check" class="w-4 h-4 text-[#a7f3d0]" />
            <span>Lisensi Standar Digital Termasuk</span>
          </div>
          <p>
            Boleh digunakan untuk proyek personal dan komersial (1 klien/penggunaan). Dilarang menjual ulang atau mendistribusikan ulang file aset asli secara bebas.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="status === 'pending'" class="text-center py-24">
    <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-[#a7f3d0] mx-auto mb-2" />
    <p class="text-xs text-gray-400">Memuat detail produk...</p>
  </div>

  <div v-else class="text-center py-24">
    <Icon name="lucide:alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-3" />
    <h1 class="text-xl font-bold text-white">Produk Tidak Ditemukan</h1>
    <p class="text-xs text-gray-400 mt-1">Produk yang Anda cari mungkin belum diterbitkan atau telah dihapus.</p>
    <NuxtLink
      to="/katalog"
      class="mt-4 inline-block px-5 py-2 rounded-full bg-white text-[#0b0c12] text-xs font-semibold"
    >
      Kembali ke Katalog
    </NuxtLink>
  </div>
</template>
