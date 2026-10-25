<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const orderCode = ref('')
const email = ref('')
const isSearching = ref(false)
const errorMessage = ref('')

const handleLookup = async () => {
  errorMessage.value = ''

  if (!orderCode.value.trim()) {
    errorMessage.value = 'Silakan masukkan kode pesanan Anda'
    return
  }

  if (!email.value.trim() || !email.value.includes('@')) {
    errorMessage.value = 'Silakan masukkan alamat email yang digunakan saat checkout'
    return
  }

  isSearching.value = true

  try {
    const res = await $fetch<any>('/api/orders/lookup', {
      method: 'POST',
      body: {
        code: orderCode.value.trim().toUpperCase(),
        email: email.value.trim().toLowerCase(),
      },
    })

    if (res?.success) {
      cartStore.showToast('Pesanan ditemukan!')
      router.push(`/pesanan/${res.orderCode}?token=${res.token}`)
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Pesanan tidak ditemukan. Periksa kembali kode pesanan dan email Anda.'
  } finally {
    isSearching.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-8 py-6">
    <div class="text-center space-y-2">
      <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto border border-white/10 shadow-lg">
        <Icon name="lucide:search" class="w-6 h-6 text-[#a7f3d0]" />
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Cek Status Pesanan
      </h1>
      <p class="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
        Masukkan kode pesanan dan email pembelian Anda untuk mengakses halaman status serta link unduhan.
      </p>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5"
    >
      <Icon name="lucide:alert-circle" class="w-4 h-4 text-rose-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Lookup Form -->
    <form
      @submit.prevent="handleLookup"
      class="bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-5 shadow-2xl"
    >
      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-gray-300 mb-1.5">Kode Pesanan *</label>
          <input
            v-model="orderCode"
            type="text"
            placeholder="Contoh: HRT-20261025-XXXXX"
            required
            class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 uppercase font-mono tracking-wider focus:outline-none focus:border-white/30 transition"
          />
        </div>

        <div>
          <label class="block font-semibold text-gray-300 mb-1.5">Email Pembeli *</label>
          <input
            v-model="email"
            type="email"
            placeholder="email-anda@example.com"
            required
            class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
          />
        </div>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="isSearching"
          class="w-full py-3 px-6 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 disabled:opacity-50 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
        >
          <Icon v-if="isSearching" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:search" class="w-4 h-4" />
          <span>{{ isSearching ? 'Mencari Pesanan...' : 'Cari & Akses Pesanan' }}</span>
        </button>
      </div>

      <div class="text-center pt-2">
        <p class="text-[11px] text-gray-500">
          Lupa kode pesanan? Silakan periksa inbox atau folder spam email Anda dari <strong>HertaDitz Store</strong>.
        </p>
      </div>
    </form>
  </div>
</template>
