<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const code = computed(() => route.params.code as string)
const token = computed(() => (route.query.token as string) || '')

const { data, refresh } = await useFetch<{
  success: boolean
  data: any
}>(`/api/orders/${code.value}`, {
  query: { token: token.value },
})

const order = computed(() => data.value?.data)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

const copyOrderCode = () => {
  if (import.meta.client && order.value?.code) {
    navigator.clipboard.writeText(order.value.code)
    cartStore.showToast('Kode pesanan disalin ke clipboard')
  }
}

const handleDownload = async (itemId: string, productName: string) => {
  try {
    const res = await $fetch<any>(`/api/download/${itemId}`, {
      query: { token: token.value },
    })

    if (res?.downloadUrl) {
      cartStore.showToast(`Memulai unduhan: ${productName}`)
      if (import.meta.client) {
        window.open(res.downloadUrl, '_blank')
      }
    }
  } catch (err: any) {
    cartStore.showToast(err.data?.message || 'Gagal memulai unduhan')
  }
}
</script>

<template>
  <div v-if="order" class="max-w-3xl mx-auto space-y-8">
    <!-- Header Card Status -->
    <div
      class="border rounded-[32px] p-6 sm:p-8 text-center space-y-4"
      :class="
        order.status === 'PAID'
          ? 'bg-gradient-to-b from-[#192b23] to-[#141a22] border-emerald-500/30'
          : 'bg-[#181926] border-white/10'
      "
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        :class="
          order.status === 'PAID'
            ? 'bg-emerald-500/20 text-[#a3e635] shadow-[0_0_30px_rgba(163,230,53,0.3)]'
            : 'bg-amber-500/20 text-amber-400'
        "
      >
        <Icon
          :name="order.status === 'PAID' ? 'lucide:check-circle' : 'lucide:clock'"
          class="w-8 h-8"
        />
      </div>

      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2"
          :class="
            order.status === 'PAID'
              ? 'bg-[#a3e635] text-[#0b0c12]'
              : 'bg-amber-400/20 text-amber-300'
          "
        >
          <span class="w-2 h-2 rounded-full" :class="order.status === 'PAID' ? 'bg-[#0b0c12] animate-pulse' : 'bg-amber-400'"></span>
          <span>Status: {{ order.status === 'PAID' ? 'PEMBAYARAN BERHASIL (PAID)' : 'MENUNGGU PEMBAYARAN' }}</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {{ order.status === 'PAID' ? 'Terima Kasih atas Pembelian Anda!' : 'Pesanan Telah Dibuat' }}
        </h1>
        <p class="text-xs text-gray-400 mt-1 max-w-md mx-auto">
          {{
            order.status === 'PAID'
              ? 'Aset digital Anda sudah siap. Anda dapat mengunduh master file kapan saja di bawah ini.'
              : 'Silakan selesaikan pembayaran melalui instruksi Snap Midtrans yang telah terbuka.'
          }}
        </p>
      </div>

      <!-- Order Code Pill -->
      <div class="inline-flex items-center gap-2 bg-[#0b0c12]/60 px-4 py-2 rounded-full border border-white/10 text-xs">
        <span class="text-gray-400">Kode Pesanan:</span>
        <span class="font-mono font-bold text-white tracking-wider">{{ order.code }}</span>
        <button
          type="button"
          @click="copyOrderCode"
          class="text-gray-400 hover:text-white transition ml-1"
          title="Salin kode pesanan"
        >
          <Icon name="lucide:copy" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Items & Download Section -->
    <div class="bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-7 space-y-5">
      <div class="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 class="text-base font-bold text-white tracking-tight">
          Daftar Aset Digital yang Dibeli
        </h2>
        <span class="text-xs text-gray-400">{{ order.items?.length || 0 }} item</span>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="bg-[#12131d] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white shrink-0">
              <Icon
                :name="
                  item.category === 'WEBSITE'
                    ? 'lucide:code'
                    : item.category === 'STICKER'
                    ? 'lucide:smile'
                    : 'lucide:image'
                "
                class="w-5 h-5 text-[#a7f3d0]"
              />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-white tracking-tight">{{ item.productName }}</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">Versi: v{{ item.version }} • Lisensi Personal & Komersial</p>
            </div>
          </div>

          <!-- Download Action -->
          <div>
            <button
              v-if="item.downloadAllowed"
              type="button"
              @click="handleDownload(item.id, item.productName)"
              class="px-4 py-2 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Icon name="lucide:download" class="w-3.5 h-3.5" />
              <span>Unduh File (.ZIP)</span>
            </button>
            <span
              v-else
              class="px-3 py-1.5 rounded-full bg-white/5 text-gray-400 text-xs font-medium"
            >
              Menunggu Pelunasan
            </span>
          </div>
        </div>
      </div>

      <!-- Total Breakdown -->
      <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <div>
          <span>Dikirim ke: </span>
          <strong class="text-white">{{ order.buyerEmail }}</strong>
        </div>
        <div class="text-right">
          <span>Total: </span>
          <strong class="text-white text-sm tabular-nums">{{ formatRupiah(order.total) }}</strong>
        </div>
      </div>
    </div>

    <!-- Instructions note -->
    <div class="bg-[#181926]/60 border border-white/5 rounded-[24px] p-5 text-xs text-gray-400 space-y-2">
      <h4 class="font-bold text-white flex items-center gap-1.5">
        <Icon name="lucide:info" class="w-4 h-4 text-[#a7f3d0]" />
        <span>Petunjuk Penggunaan File</span>
      </h4>
      <p class="leading-relaxed">
        File aset digital akan diunduh dalam format <strong>.ZIP</strong>. Untuk template website, silakan ekstrak dan ikuti petunjuk pada file <code>README.md</code>. Untuk sticker dan poster, file PNG/PSD resolusi penuh berada di dalam folder yang sama.
      </p>
    </div>
  </div>
</template>
