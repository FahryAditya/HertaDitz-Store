<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num)
}
</script>

<template>
  <div class="balance-gradient rounded-[28px] p-6 sm:p-7 text-[#0b0c12] flex flex-col justify-between min-h-[220px] shadow-[0_20px_50px_rgba(134,239,172,0.15)] relative overflow-hidden group">
    <!-- Abstract rotating background shapes -->
    <div class="balance-shape-1"></div>
    <div class="balance-shape-2"></div>

    <div class="relative z-10">
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-[#0b0c12]/15 text-[#0b0c12] text-[10px] font-bold tracking-wider uppercase">
          Flash Sale Launching
        </span>
        <span class="text-[11px] font-semibold text-[#0b0c12]/80">Diskon hingga 20%</span>
      </div>

      <div class="mt-3">
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[#0b0c12]">
          Koleksi Aset Digital Terbaik
        </h2>
        <p class="mt-1 text-xs sm:text-sm font-medium text-[#0b0c12]/80 max-w-md">
          Template Website modern, paket Sticker Anime resolusi tinggi, dan Poster Vektor premium dengan lisensi instan.
        </p>
      </div>
    </div>

    <!-- Bottom Action Pill Buttons -->
    <div class="relative z-10 flex flex-wrap items-center gap-3 mt-6">
      <NuxtLink
        to="/katalog"
        class="px-6 py-2.5 rounded-full bg-[#0b0c12] text-white text-xs font-semibold hover:bg-[#1c1e2b] active:scale-95 transition shadow-md flex items-center gap-1.5"
      >
        <span>Jelajahi Katalog</span>
        <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
      </NuxtLink>

      <!-- Connected Gooey Button (Voucher info) -->
      <div class="gooey-btn-group">
        <button
          type="button"
          @click="cartStore.showToast('Voucher HERTA10 otomatis diterapkan di keranjang!')"
          class="px-4 py-2.5 rounded-full bg-white text-[#0b0c12] text-xs font-semibold hover:bg-gray-50 active:scale-95 transition shadow-sm"
        >
          Klaim Voucher HERTA10
        </button>
        <div class="gooey-bridge"></div>
        <button
          type="button"
          @click="cartStore.showToast('Voucher HERTA10 otomatis diterapkan di keranjang!')"
          aria-label="Klaim Voucher Diskon"
          class="w-9 h-9 rounded-full bg-white text-[#0b0c12] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition shadow-sm font-bold text-sm"
        >
          %
        </button>
      </div>
    </div>
  </div>
</template>
