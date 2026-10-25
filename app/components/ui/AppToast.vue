<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
</script>

<template>
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-[#0b0c12] px-5 py-2.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 pointer-events-none"
    :class="
      cartStore.isToastVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-4 pointer-events-none'
    "
  >
    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
    <span>{{ cartStore.toastMessage }}</span>
  </div>
</template>
