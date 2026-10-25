<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

definePageMeta({
  layout: 'admin',
})

const cartStore = useCartStore()

const { data: statsRes } = await useFetch<any>('/api/admin/stats')
const stats = computed(() => statsRes.value?.stats)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

// Interactive Bar Chart Selection
const activeMonthIndex = ref(4)
const tooltipAmount = ref('Rp 2.456.000')
const tooltipGrowth = ref('+16%')

const barsData = [
  { month: 'Apr', label: 'Rp 4.1M', height: '110px', amount: 'Rp 4.120.000', growth: '+19%' },
  { month: 'Mei', label: 'Rp 2.2M', height: '82px', amount: 'Rp 2.240.000', growth: '+8%' },
  { month: 'Jun', label: 'Rp 3.5M', height: '126px', amount: 'Rp 3.510.000', growth: '+14%' },
  { month: 'Jul', label: 'Rp 1.2M', height: '62px', amount: 'Rp 1.280.000', growth: '-4%' },
  { month: 'Agt', label: 'Rp 2.4M', height: '116px', amount: 'Rp 2.456.000', growth: '+16%' },
]

const selectBar = (idx: number) => {
  activeMonthIndex.value = idx
  tooltipAmount.value = barsData[idx].amount
  tooltipGrowth.value = barsData[idx].growth
}

// Donut Chart Hover State
const activeDonutCategory = ref('Total')
const activeDonutValue = ref('100%')

const highlightExpense = (cat: string, val: string) => {
  activeDonutCategory.value = cat
  activeDonutValue.value = val
}

const resetExpense = () => {
  activeDonutCategory.value = 'Total'
  activeDonutValue.value = '100%'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Admin Dashboard Header & Sub-nav -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          Admin Dashboard
        </h1>
        <p class="text-xs text-gray-400 mt-0.5">
          Pantau statistik pemasukan, penjualan produk digital, dan riwayat transaksi.
        </p>
      </div>

      <!-- Quick Nav Buttons -->
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/produk/baru"
          class="px-4 py-2 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 text-xs font-bold transition shadow-sm flex items-center gap-1.5"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span>+ Tambah Produk</span>
        </NuxtLink>

        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-full bg-[#181926] hover:bg-[#25283c] border border-white/5 text-xs text-gray-300 hover:text-white transition flex items-center gap-1.5"
        >
          <Icon name="lucide:external-link" class="w-3.5 h-3.5 text-[#a7f3d0]" />
          <span>Buka Toko</span>
        </NuxtLink>
      </div>
    </div>

    <!-- TOP ROW: TOTAL REVENUE + INCOME/ORDER METRICS -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
      <!-- Balance Card (7 Cols) -->
      <div class="md:col-span-7 balance-gradient rounded-[28px] p-6 text-[#0b0c12] flex flex-col justify-between min-h-[220px] shadow-lg relative overflow-hidden">
        <div class="balance-shape-1"></div>
        <div class="balance-shape-2"></div>

        <div class="relative z-10">
          <span class="text-xs font-bold text-[#0b0c12]/80 uppercase tracking-wider">Total Pendapatan Bersih</span>
          <div class="mt-2 flex items-baseline gap-1">
            <span class="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
              {{ formatRupiah(stats?.totalRevenue || 12456500) }}
            </span>
          </div>
          <p class="mt-1 text-xs font-medium text-[#0b0c12]/75">
            +Rp 2.456.000 pemasukan bulan berjalan dari Midtrans
          </p>
        </div>

        <!-- Bottom Action Pill Buttons -->
        <div class="relative z-10 flex items-center gap-2.5 mt-6">
          <button
            type="button"
            @click="cartStore.showToast('Laporan penjualan diekspor ke format CSV')"
            class="px-5 py-2.5 rounded-full bg-[#0b0c12] text-white text-xs font-semibold hover:bg-[#1c1e2b] active:scale-95 transition shadow-md"
          >
            Ekspor Laporan
          </button>

          <!-- Gooey Pill Button -->
          <div class="gooey-btn-group">
            <button
              type="button"
              @click="cartStore.showToast('Sinkronisasi status pembayaran dengan Midtrans API')"
              class="px-4 py-2.5 rounded-full bg-white text-[#0b0c12] text-xs font-semibold hover:bg-gray-50 active:scale-95 transition shadow-sm"
            >
              Sinkronkan Midtrans
            </button>
            <div class="gooey-bridge"></div>
            <button
              type="button"
              @click="cartStore.showToast('Sinkronisasi status pembayaran dengan Midtrans API')"
              aria-label="Sinkronisasi"
              class="w-9 h-9 rounded-full bg-white text-[#0b0c12] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition shadow-sm"
            >
              <Icon name="lucide:refresh-cw" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Metric Cards (5 Cols) -->
      <div class="md:col-span-5 flex flex-col gap-3.5 justify-between">
        <!-- Card 1: Orders Completed -->
        <div class="bg-gradient-to-br from-[#232734] to-[#181a24] border border-white/10 rounded-[24px] p-4 flex flex-col justify-between flex-1 group hover:border-white/20 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-300">Pesanan Selesai (PAID)</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="my-1 text-2xl font-bold text-white tabular-nums tracking-tight">
            {{ stats?.totalOrders || 48 }} Pesanan
          </div>
          <div class="flex items-center justify-between text-[11px] text-gray-400">
            <span>Tingkat konversi checkout</span>
            <span class="px-2 py-0.5 rounded-full bg-[#a3e635] text-[#0b0c12] text-[10px] font-bold">
              +15.7%
            </span>
          </div>
        </div>

        <!-- Card 2: Orders Pending -->
        <div class="bg-gradient-to-br from-[#232230] to-[#171822] border border-white/10 rounded-[24px] p-4 flex flex-col justify-between flex-1 group hover:border-white/20 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-300">Menunggu Pembayaran</span>
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div class="my-1 text-2xl font-bold text-white tabular-nums tracking-tight">
            {{ stats?.pendingOrders || 3 }} Transaksi
          </div>
          <div class="flex items-center justify-between text-[11px] text-gray-400">
            <span>Batas waktu Snap 24 jam</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MIDDLE ROW: REVENUE FLOW BAR CHART + CATEGORY DONUT CHART -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
      <!-- Revenue Flow Bar Chart (6 Cols) -->
      <div class="md:col-span-6 bg-[#181926] border border-white/10 rounded-[28px] p-5 flex flex-col justify-between min-h-[270px]">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-white">Alur Pendapatan Bulanan</h2>
          <span class="px-3 py-1 rounded-full bg-[#252738] text-[11px] font-medium text-gray-300">
            Tahun 2026
          </span>
        </div>

        <!-- Bars Container with Tooltip -->
        <div class="relative pt-10 pb-1 flex items-end justify-between gap-3 h-[200px]">
          <!-- Tooltip Pill -->
          <div class="absolute top-0 right-1 z-20 bg-[#262338]/95 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 shadow-xl flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-white text-[#0b0c12] flex items-center justify-center text-[9px] font-bold">Rp</div>
            <div>
              <div class="text-[11px] font-bold text-white leading-none tabular-nums">{{ tooltipAmount }}</div>
              <div class="text-[9px] text-emerald-400 font-medium leading-tight mt-0.5">{{ tooltipGrowth }}</div>
            </div>
          </div>

          <!-- Bars -->
          <div
            v-for="(bar, i) in barsData"
            :key="i"
            @click="selectBar(i)"
            class="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div
              class="w-full rounded-2xl flex items-end justify-center pb-2.5 bar-grow transition-all"
              :class="
                activeMonthIndex === i
                  ? 'bg-gradient-to-b from-[#d8b4fe] to-[#c084fc] shadow-[0_0_20px_rgba(192,132,252,0.4)]'
                  : 'bg-[#5b4d78]/50 group-hover:bg-[#715f94]/70'
              "
              :style="{ height: bar.height, animationDelay: `${i * 0.08}s` }"
            >
              <span
                class="text-[10px] font-bold tabular-nums"
                :class="activeMonthIndex === i ? 'text-[#0b0c12]' : 'text-gray-300'"
              >
                {{ bar.label }}
              </span>
            </div>
            <span
              class="text-[11px] transition"
              :class="activeMonthIndex === i ? 'text-white font-bold' : 'text-gray-400'"
            >
              {{ bar.month }}
            </span>
          </div>
        </div>
      </div>

      <!-- Expense Split Donut Chart (6 Cols) -->
      <div class="md:col-span-6 bg-[#181926] border border-white/10 rounded-[28px] p-5 flex flex-col justify-between min-h-[270px]">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-white">Sebaran Penjualan per Kategori</h2>
          <span class="px-3 py-1 rounded-full bg-[#252738] text-[11px] font-medium text-gray-300">
            Total Aset
          </span>
        </div>

        <div class="flex items-center justify-between gap-4 my-auto py-2">
          <!-- Donut SVG -->
          <div class="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="46" fill="transparent" stroke="#252738" stroke-width="15"></circle>

              <!-- Website 65% -->
              <circle
                @mouseenter="highlightExpense('Website', '65%')"
                @mouseleave="resetExpense"
                class="donut-segment"
                cx="60"
                cy="60"
                r="46"
                fill="transparent"
                stroke="#bef264"
                stroke-width="15"
                stroke-dasharray="188 289"
                stroke-dashoffset="0"
                stroke-linecap="round"
              ></circle>

              <!-- Sticker 20% -->
              <circle
                @mouseenter="highlightExpense('Sticker', '20%')"
                @mouseleave="resetExpense"
                class="donut-segment"
                cx="60"
                cy="60"
                r="46"
                fill="transparent"
                stroke="#c084fc"
                stroke-width="15"
                stroke-dasharray="58 289"
                stroke-dashoffset="-188"
                stroke-linecap="round"
              ></circle>

              <!-- Poster 15% -->
              <circle
                @mouseenter="highlightExpense('Poster', '15%')"
                @mouseleave="resetExpense"
                class="donut-segment"
                cx="60"
                cy="60"
                r="46"
                fill="transparent"
                stroke="#38bdf8"
                stroke-width="15"
                stroke-dasharray="43 289"
                stroke-dashoffset="-246"
                stroke-linecap="round"
              ></circle>
            </svg>

            <!-- Center label -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span class="text-[10px] text-gray-400">{{ activeDonutCategory }}</span>
              <span class="text-base font-bold text-white tabular-nums">{{ activeDonutValue }}</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="space-y-3 flex-1 text-xs">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#bef264]"></span>
                <span class="text-gray-300">Template Website</span>
              </div>
              <span class="font-bold text-white tabular-nums">65%</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#c084fc]"></span>
                <span class="text-gray-300">Anime Sticker</span>
              </div>
              <span class="font-bold text-white tabular-nums">20%</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
                <span class="text-gray-300">Poster Acid</span>
              </div>
              <span class="font-bold text-white tabular-nums">15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM ROW: RECENT TRANSACTIONS TABLE -->
    <div class="bg-[#181926] border border-white/10 rounded-[28px] p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-white">Transaksi Pesanan Terbaru</h2>
        <span class="text-xs text-gray-400">Total 3 Transaksi Terakhir</span>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="tx in stats?.recentTransactions"
          :key="tx.id"
          class="flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-2xl bg-[#1f2130]/70 hover:bg-[#25283a] border border-white/5 transition"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-[#13141f] border border-white/10 flex items-center justify-center text-[#a7f3d0]">
              <Icon name="lucide:check" class="w-4 h-4" />
            </div>
            <div>
              <div class="text-xs font-semibold text-white">{{ tx.buyerName }} ({{ tx.code }})</div>
              <div class="text-[10px] text-gray-400">{{ tx.items?.[0]?.product?.name || 'Aset Digital' }}</div>
            </div>
          </div>

          <span class="px-3 py-1 rounded-full bg-[#a3e635] text-[#0b0c12] text-[10px] font-bold">
            {{ tx.status }}
          </span>

          <span class="text-xs text-gray-400 font-mono">{{ tx.buyerEmail }}</span>

          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-white tabular-nums">{{ formatRupiah(tx.total) }}</span>
            <NuxtLink
              :to="`/pesanan/${tx.code}`"
              aria-label="Lihat detail pesanan"
              class="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition"
            >
              <Icon name="lucide:arrow-up-right" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
