<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

definePageMeta({
  layout: 'admin',
})

const cartStore = useCartStore()

const code = ref('')
const value = ref<number | null>(10)
const minTotal = ref<number | null>(50000)
const isSubmitting = ref(false)

const vouchers = ref([
  { code: 'HERTA10', type: 'PERCENT', value: 10, minTotal: 50000, active: true },
])

const handleCreateVoucher = () => {
  if (!code.value.trim()) {
    cartStore.showToast('Kode voucher harus diisi')
    return
  }
  vouchers.value.push({
    code: code.value.trim().toUpperCase(),
    type: 'PERCENT',
    value: value.value || 10,
    minTotal: minTotal.value || 0,
    active: true,
  })
  cartStore.showToast(`Voucher ${code.value.trim().toUpperCase()} berhasil dibuat!`)
  code.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-white/5 pb-4">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Voucher & Diskon
      </h1>
      <p class="text-xs text-gray-400 mt-1">
        Kelola kode voucher promo untuk pembeli di HertaDitz Store.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Create Voucher Form (5 cols) -->
      <div class="lg:col-span-5 bg-[#181926] border border-white/10 rounded-[32px] p-6 space-y-4">
        <h3 class="text-sm font-bold text-white border-b border-white/5 pb-2.5">
          Buat Voucher Baru
        </h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-300 mb-1">Kode Voucher</label>
            <input
              v-model="code"
              type="text"
              placeholder="Contoh: MERDEKA20"
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white font-mono uppercase focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-300 mb-1">Nilai Diskon (%)</label>
            <input
              v-model="value"
              type="number"
              min="1"
              max="100"
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white font-mono focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-300 mb-1">Minimal Belanja (Rp)</label>
            <input
              v-model="minTotal"
              type="number"
              min="0"
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white font-mono focus:outline-none focus:border-white/30"
            />
          </div>

          <button
            type="button"
            @click="handleCreateVoucher"
            class="w-full mt-2 py-3 rounded-full bg-white text-[#0b0c12] font-bold text-xs hover:bg-gray-100 transition shadow-md"
          >
            + Simpan Voucher
          </button>
        </div>
      </div>

      <!-- Voucher List (7 cols) -->
      <div class="lg:col-span-7 bg-[#181926] border border-white/10 rounded-[32px] p-6 space-y-4">
        <h3 class="text-sm font-bold text-white border-b border-white/5 pb-2.5">
          Daftar Voucher Aktif
        </h3>

        <div class="space-y-2.5">
          <div
            v-for="v in vouchers"
            :key="v.code"
            class="p-4 rounded-2xl bg-[#12131d] border border-white/5 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                %
              </div>
              <div>
                <h4 class="text-sm font-mono font-bold text-white">{{ v.code }}</h4>
                <p class="text-[11px] text-gray-400">Diskon {{ v.value }}% • Min. belanja Rp {{ v.minTotal.toLocaleString('id-ID') }}</p>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
