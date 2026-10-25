<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { data } = await useFetch<any>('/api/admin/stats')
const transactions = computed(() => data.value?.stats?.recentTransactions || [])

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-white/5 pb-4">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Daftar Pesanan & Transaksi
      </h1>
      <p class="text-xs text-gray-400 mt-1">
        Pantau status pesanan pembeli yang diproses melalui webhook Midtrans.
      </p>
    </div>

    <!-- Orders List Card -->
    <div class="bg-[#181926] border border-white/10 rounded-[32px] overflow-hidden shadow-xl p-6">
      <div v-if="transactions.length === 0" class="text-center py-16 text-gray-400 text-xs">
        Belum ada transaksi pesanan yang tercatat.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="p-4 rounded-2xl bg-[#12131d] border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
              <Icon name="lucide:receipt" class="w-5 h-5 text-[#a7f3d0]" />
            </div>
            <div>
              <div class="font-bold text-white">{{ tx.buyerName }} • {{ tx.code }}</div>
              <div class="text-[11px] text-gray-400">{{ tx.buyerEmail }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              :class="
                tx.status === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-300'
              "
            >
              {{ tx.status }}
            </span>

            <span class="font-bold text-white tabular-nums text-sm">
              {{ formatRupiah(tx.total) }}
            </span>

            <NuxtLink
              :to="`/pesanan/${tx.code}`"
              target="_blank"
              class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition text-xs font-medium"
            >
              Lihat Detail
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
