<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
const voucherInput = ref(cartStore.voucherCode || '')
const quoteData = ref<any>(null)
const isLoadingQuote = ref(false)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

const fetchServerQuote = async () => {
  if (cartStore.items.length === 0) {
    quoteData.value = null
    return
  }
  isLoadingQuote.value = true
  try {
    const res = await $fetch<any>('/api/cart/quote', {
      method: 'POST',
      body: {
        items: cartStore.items.map((i) => ({ id: i.id, slug: i.slug })),
        voucherCode: voucherInput.value.trim() || undefined,
      },
    })
    quoteData.value = res
  } catch (err: any) {
    cartStore.showToast(err.data?.message || 'Gagal menghitung ringkasan harga')
  } finally {
    isLoadingQuote.value = false
  }
}

const applyVoucher = () => {
  cartStore.voucherCode = voucherInput.value.trim().toUpperCase()
  fetchServerQuote()
  if (voucherInput.value.trim()) {
    cartStore.showToast(`Memvalidasi voucher: ${voucherInput.value.trim().toUpperCase()}`)
  }
}

const removeVoucher = () => {
  voucherInput.value = ''
  cartStore.voucherCode = ''
  fetchServerQuote()
  cartStore.showToast('Voucher dihapus')
}

watch(
  () => cartStore.items.length,
  () => {
    fetchServerQuote()
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="border-b border-white/5 pb-6">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Keranjang Belanja
      </h1>
      <p class="text-xs text-gray-400 mt-1">
        Periksa kembali aset digital yang ingin Anda beli sebelum menuju pembayaran.
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="cartStore.items.length === 0"
      class="text-center py-20 bg-[#181926]/50 border border-white/5 rounded-[32px] space-y-4"
    >
      <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 mx-auto">
        <Icon name="lucide:shopping-bag" class="w-8 h-8" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-white">Keranjang Anda Masih Kosong</h3>
        <p class="text-xs text-gray-400 mt-1">Temukan berbagai template website dan koleksi stiker di katalog kami.</p>
      </div>
      <NuxtLink
        to="/katalog"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#0b0c12] text-xs font-bold hover:bg-gray-100 transition shadow-lg"
      >
        <span>Mulai Belanja</span>
        <Icon name="lucide:arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- Cart Layout Grid: Items Left (7 Cols) + Summary Right (5 Cols) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Items Column -->
      <div class="lg:col-span-7 space-y-3">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="bg-[#181926] border border-white/10 hover:border-white/15 rounded-[24px] p-4 flex items-center justify-between gap-4 transition"
        >
          <!-- Thumbnail & Info -->
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-[#12131d] border border-white/5 shrink-0">
              <img :src="item.previewUrl" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <span class="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-semibold text-gray-300">
                {{ item.category }}
              </span>
              <NuxtLink :to="`/produk/${item.slug}`" class="block mt-1">
                <h4 class="text-sm font-semibold text-white tracking-tight truncate hover:text-[#a7f3d0] transition">
                  {{ item.name }}
                </h4>
              </NuxtLink>
              <div class="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                <span>Kuantitas: 1 (Lisensi Digital)</span>
              </div>
            </div>
          </div>

          <!-- Price & Delete Action -->
          <div class="flex items-center gap-4 shrink-0">
            <div class="text-right">
              <div class="text-sm sm:text-base font-bold text-white tabular-nums">
                {{ formatRupiah(item.salePrice || item.price) }}
              </div>
              <div
                v-if="item.salePrice && item.salePrice < item.price"
                class="text-[10px] text-gray-400 line-through tabular-nums"
              >
                {{ formatRupiah(item.price) }}
              </div>
            </div>

            <button
              type="button"
              @click="cartStore.removeFromCart(item.id)"
              aria-label="Hapus dari keranjang"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 px-1 text-xs text-gray-400">
          <NuxtLink to="/katalog" class="flex items-center gap-1.5 hover:text-white transition">
            <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
            <span>Tambah Produk Lain</span>
          </NuxtLink>

          <button
            type="button"
            @click="cartStore.clearCart()"
            class="text-rose-400/80 hover:text-rose-400 transition"
          >
            Kosongkan Keranjang
          </button>
        </div>
      </div>

      <!-- Order Summary Column -->
      <div class="lg:col-span-5 bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-7 space-y-6">
        <h3 class="text-base font-bold text-white tracking-tight border-b border-white/5 pb-3">
          Ringkasan Pesanan
        </h3>

        <!-- Voucher Input Form -->
        <div class="space-y-2">
          <label class="text-xs font-semibold text-gray-300">Voucher Diskon</label>
          <div class="flex items-center gap-2">
            <input
              v-model="voucherInput"
              type="text"
              placeholder="Contoh: HERTA10"
              class="flex-1 bg-[#12131d] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 uppercase font-mono tracking-wider focus:outline-none focus:border-white/30 transition"
            />
            <button
              type="button"
              @click="applyVoucher"
              class="px-4 py-2 rounded-full bg-white text-[#0b0c12] text-xs font-bold hover:bg-gray-100 transition shadow-sm"
            >
              Terapkan
            </button>
          </div>

          <!-- Applied Voucher Notification -->
          <div
            v-if="quoteData?.voucher"
            class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
          >
            <div class="flex items-center gap-1.5">
              <Icon name="lucide:check-circle-2" class="w-3.5 h-3.5" />
              <span>Voucher <strong>{{ quoteData.voucher.code }}</strong> aktif ({{ quoteData.voucher.value }}%)</span>
            </div>
            <button
              type="button"
              @click="removeVoucher"
              class="text-gray-400 hover:text-white"
            >
              <Icon name="lucide:x" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Breakdown Prices (Authoritative Server Quote) -->
        <div class="space-y-3 pt-2 text-xs text-gray-300">
          <div class="flex items-center justify-between">
            <span class="text-gray-400">Subtotal ({{ cartStore.count }} item)</span>
            <span class="font-semibold text-white tabular-nums">
              {{ formatRupiah(quoteData?.subtotal || cartStore.subtotal) }}
            </span>
          </div>

          <div v-if="quoteData?.discount > 0" class="flex items-center justify-between text-emerald-400">
            <span>Potongan Voucher</span>
            <span class="font-semibold tabular-nums">-{{ formatRupiah(quoteData.discount) }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-400">Biaya Layanan & Download</span>
            <span class="text-emerald-400 font-semibold">Gratis</span>
          </div>

          <div class="border-t border-white/10 pt-4 flex items-baseline justify-between">
            <span class="text-sm font-bold text-white">Total Pembayaran</span>
            <div class="text-right">
              <span class="text-2xl font-extrabold text-white tabular-nums tracking-tight">
                {{ formatRupiah(quoteData?.total || cartStore.subtotal) }}
              </span>
              <p class="text-[10px] text-gray-400 mt-0.5">Sudah termasuk lisensi & update</p>
            </div>
          </div>
        </div>

        <!-- Checkout Action Button -->
        <NuxtLink
          to="/checkout"
          class="w-full py-3.5 px-6 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 group text-center"
        >
          <span>Lanjut ke Pembayaran</span>
          <Icon name="lucide:arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition" />
        </NuxtLink>

        <!-- Guarantee badge -->
        <div class="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
          <Icon name="lucide:lock" class="w-3.5 h-3.5 text-[#a7f3d0]" />
          <span>Checkout Aman & Terenkripsi Midtrans</span>
        </div>
      </div>
    </div>
  </div>
</template>
