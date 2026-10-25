<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const buyerName = ref('')
const buyerEmail = ref('')
const agreeTerms = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const quoteData = ref<any>(null)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

onMounted(async () => {
  if (cartStore.items.length === 0) {
    router.replace('/keranjang')
    return
  }

  // Fetch verified quote
  try {
    const res = await $fetch<any>('/api/cart/quote', {
      method: 'POST',
      body: {
        items: cartStore.items.map((i) => ({ id: i.id, slug: i.slug })),
        voucherCode: cartStore.voucherCode || undefined,
      },
    })
    quoteData.value = res
  } catch (e) {
    console.warn('Quote error', e)
  }
})

const handlePay = async () => {
  errorMessage.value = ''

  if (!buyerName.value.trim() || buyerName.value.trim().length < 2) {
    errorMessage.value = 'Silakan masukkan nama lengkap Anda (minimal 2 karakter)'
    return
  }

  if (!buyerEmail.value.trim() || !buyerEmail.value.includes('@')) {
    errorMessage.value = 'Silakan masukkan alamat email aktif yang valid'
    return
  }

  if (!agreeTerms.value) {
    errorMessage.value = 'Anda harus menyetujui ketentuan lisensi dan kebijakan toko'
    return
  }

  isSubmitting.value = true

  try {
    const checkoutRes = await $fetch<any>('/api/checkout', {
      method: 'POST',
      body: {
        buyerName: buyerName.value.trim(),
        buyerEmail: buyerEmail.value.trim(),
        agreeTerms: agreeTerms.value,
        items: cartStore.items.map((i) => ({ id: i.id, slug: i.slug })),
        voucherCode: cartStore.voucherCode || undefined,
      },
    })

    if (checkoutRes?.success) {
      const orderCode = checkoutRes.orderCode
      const rawToken = checkoutRes.accessToken

      // Trigger Snap if Snap script is available
      if ((window as any).snap && checkoutRes.snapToken && !checkoutRes.snapToken.startsWith('snap_token_')) {
        ;(window as any).snap.pay(checkoutRes.snapToken, {
          onSuccess: (result: any) => {
            cartStore.clearCart()
            router.push(`/pesanan/${orderCode}?token=${rawToken}`)
          },
          onPending: (result: any) => {
            cartStore.clearCart()
            router.push(`/pesanan/${orderCode}?token=${rawToken}`)
          },
          onError: (result: any) => {
            cartStore.showToast('Pembayaran dibatalkan atau terjadi kesalahan')
          },
          onClose: () => {
            router.push(`/pesanan/${orderCode}?token=${rawToken}`)
          },
        })
      } else {
        // Development Sandbox Simulation:
        // Automatically simulates payment success and routes to /pesanan/[code]
        cartStore.clearCart()
        cartStore.showToast('Pesanan berhasil dibuat!')
        router.push(`/pesanan/${orderCode}?token=${rawToken}`)
      }
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Gagal memproses pesanan. Silakan periksa kembali formulir Anda.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="border-b border-white/5 pb-6">
      <NuxtLink to="/keranjang" class="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition mb-3">
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
        <span>Kembali ke Keranjang</span>
      </NuxtLink>
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Checkout & Pembayaran
      </h1>
      <p class="text-xs text-gray-400 mt-1">
        Lengkapi informasi penerima lisensi dan akses unduh aset digital Anda.
      </p>
    </div>

    <!-- Error Banner -->
    <div
      v-if="errorMessage"
      class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5"
    >
      <Icon name="lucide:alert-circle" class="w-4 h-4 text-rose-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 2 Column Checkout Layout -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Buyer Form (7 cols) -->
      <div class="md:col-span-7 bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-7 space-y-5">
        <h2 class="text-base font-bold text-white tracking-tight border-b border-white/5 pb-3">
          Informasi Pembeli & Lisensi
        </h2>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Nama Lengkap *</label>
            <input
              v-model="buyerName"
              type="text"
              placeholder="Contoh: Budi Santoso"
              required
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Alamat Email Aktif *</label>
            <input
              v-model="buyerEmail"
              type="email"
              placeholder="budi@example.com"
              required
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
            />
            <p class="text-[11px] text-gray-400 mt-1">
              Link unduhan file dan tanda terima transaksi akan dikirimkan ke email ini.
            </p>
          </div>

          <!-- License & Terms Checkbox -->
          <div class="pt-2">
            <label class="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                v-model="agreeTerms"
                type="checkbox"
                class="mt-0.5 rounded bg-[#12131d] border-white/20 text-[#a3e635] focus:ring-0 cursor-pointer"
              />
              <span class="text-gray-300 text-[11px] leading-relaxed">
                Saya menyetujui
                <NuxtLink to="/kebijakan/lisensi" target="_blank" class="text-[#a7f3d0] hover:underline">Ketentuan Lisensi Digital</NuxtLink>
                dan
                <NuxtLink to="/kebijakan/refund" target="_blank" class="text-[#a7f3d0] hover:underline">Kebijakan Pengembalian</NuxtLink>
                HertaDitz Store.
              </span>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 border-t border-white/5">
          <button
            type="button"
            :disabled="isSubmitting"
            @click="handlePay"
            class="w-full py-3.5 px-6 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 disabled:opacity-50 font-bold text-sm transition shadow-xl flex items-center justify-center gap-2"
          >
            <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:shield-check" class="w-4 h-4 text-emerald-600" />
            <span>{{ isSubmitting ? 'Menyiapkan Pembayaran...' : 'Bayar Sekarang' }}</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Order Preview (5 cols) -->
      <div class="md:col-span-5 bg-[#181926] border border-white/10 rounded-[32px] p-6 space-y-4">
        <h3 class="text-sm font-bold text-white tracking-tight border-b border-white/5 pb-2.5">
          Pesanan Anda ({{ cartStore.count }})
        </h3>

        <!-- Items Mini List -->
        <div class="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 text-xs"
          >
            <div class="truncate">
              <span class="font-medium text-white truncate block">{{ item.name }}</span>
              <span class="text-[10px] text-gray-400">1x Lisensi Digital</span>
            </div>
            <span class="font-semibold text-white tabular-nums shrink-0">
              {{ formatRupiah(item.salePrice || item.price) }}
            </span>
          </div>
        </div>

        <!-- Breakdown Total -->
        <div class="border-t border-white/10 pt-3 space-y-2 text-xs text-gray-300">
          <div class="flex items-center justify-between">
            <span class="text-gray-400">Subtotal</span>
            <span class="font-semibold text-white tabular-nums">
              {{ formatRupiah(quoteData?.subtotal || cartStore.subtotal) }}
            </span>
          </div>

          <div v-if="quoteData?.discount > 0" class="flex items-center justify-between text-emerald-400">
            <span>Diskon Voucher</span>
            <span class="font-semibold tabular-nums">-{{ formatRupiah(quoteData.discount) }}</span>
          </div>

          <div class="border-t border-white/5 pt-2 flex items-baseline justify-between text-sm">
            <span class="font-bold text-white">Total Bayar</span>
            <span class="text-xl font-extrabold text-white tabular-nums">
              {{ formatRupiah(quoteData?.total || cartStore.subtotal) }}
            </span>
          </div>
        </div>

        <!-- Midtrans badge -->
        <div class="bg-[#12131d] rounded-2xl p-3 border border-white/5 flex items-center gap-2.5 text-[11px] text-gray-400">
          <Icon name="lucide:qr-code" class="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Mendukung QRIS (GoPay, OVO, ShopeePay, BCA/Mandiri VA)</span>
        </div>
      </div>
    </div>
  </div>
</template>
