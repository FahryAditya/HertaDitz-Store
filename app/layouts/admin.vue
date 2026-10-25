<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const isMobileSidebarOpen = ref(false)

const navLinks = [
  { name: 'Dashboard', path: '/admin', icon: 'lucide:layout-dashboard' },
  { name: 'Kelola Produk', path: '/admin/produk', icon: 'lucide:package' },
  { name: 'Tambah Produk', path: '/admin/produk/baru', icon: 'lucide:plus-circle' },
  { name: 'Voucher & Diskon', path: '/admin/voucher', icon: 'lucide:ticket' },
  { name: 'Pesanan', path: '/admin/pesanan', icon: 'lucide:shopping-bag' },
]

const handleLogout = () => {
  // Clear session cookie if needed and toast
  cartStore.showToast('Anda telah keluar dari sesi admin')
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen p-2 sm:p-5 md:p-8 flex items-center justify-center">
    <!-- App Outer Frame Container inspired by Ethereal -->
    <div
      class="w-full max-w-[1380px] min-h-[92vh] bg-[#090a0f] rounded-[32px] sm:rounded-[44px] border-[4px] sm:border-[8px] border-[#1f212d] shadow-[0_35px_90px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col lg:flex-row"
    >
      <!-- MOBILE HEADER BAR (lg:hidden) -->
      <div class="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#12131d]">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <Icon name="lucide:sparkles" class="w-4 h-4 text-[#a7f3d0]" />
          </div>
          <span class="text-base font-bold text-white tracking-tight">hertaditz admin</span>
        </div>

        <button
          type="button"
          @click="isMobileSidebarOpen = !isMobileSidebarOpen"
          class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <Icon :name="isMobileSidebarOpen ? 'lucide:x' : 'lucide:menu'" class="w-5 h-5" />
        </button>
      </div>

      <!-- SIDEBAR (Desktop & Mobile Drawer) -->
      <aside
        class="w-full lg:w-[260px] bg-[#12131e] border-r border-white/5 p-5 flex flex-col justify-between shrink-0 transition-all duration-300"
        :class="isMobileSidebarOpen ? 'block' : 'hidden lg:flex'"
      >
        <div class="space-y-6">
          <!-- Brand Logo in Sidebar -->
          <div class="flex items-center gap-3 px-2 pt-2">
            <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-md">
              <Icon name="lucide:sparkles" class="w-5 h-5 text-[#a7f3d0]" />
            </div>
            <div class="flex flex-col">
              <span class="text-base font-bold tracking-tight text-white leading-tight">hertaditz</span>
              <span class="text-[9px] font-mono tracking-widest text-[#a7f3d0] uppercase -mt-0.5">ADMIN PANEL</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="space-y-1.5 pt-2">
            <NuxtLink
              v-for="item in navLinks"
              :key="item.path"
              :to="item.path"
              @click="isMobileSidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-full text-xs transition-all duration-200 select-none"
              :class="
                route.path === item.path
                  ? 'bg-white text-[#0b0c12] font-bold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
              "
            >
              <Icon :name="item.icon" class="w-4 h-4" />
              <span>{{ item.name }}</span>
            </NuxtLink>

            <!-- External Store Link -->
            <NuxtLink
              to="/"
              class="flex items-center gap-3 px-4 py-3 rounded-full text-xs text-gray-400 hover:text-[#a7f3d0] hover:bg-white/5 transition font-medium"
            >
              <Icon name="lucide:store" class="w-4 h-4" />
              <span>Lihat Toko Publik</span>
              <Icon name="lucide:arrow-up-right" class="w-3 h-3 ml-auto opacity-60" />
            </NuxtLink>
          </nav>
        </div>

        <!-- Sidebar Bottom: Admin Profile Card -->
        <div class="pt-6 border-t border-white/5 space-y-3">
          <div class="flex items-center gap-3 px-2">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
              SA
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-white truncate">Super Admin</span>
              <span class="text-[10px] text-gray-400 truncate">admin@hertaditz.store</span>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            type="button"
            @click="handleLogout"
            class="w-full py-2.5 px-4 rounded-full bg-white/5 hover:bg-rose-500/15 hover:text-rose-300 text-gray-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Icon name="lucide:log-out" class="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT PANEL -->
      <div class="flex-1 flex flex-col min-w-0 bg-[#090a0f]">
        <!-- Top Subheader in Content Area -->
        <header class="hidden lg:flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0e0f17]">
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span class="font-medium text-white">HertaDitz Admin Workspace</span>
            <span class="w-1 h-1 rounded-full bg-gray-600"></span>
            <span class="text-emerald-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Neon PostgreSQL Connected
            </span>
          </div>

          <div class="flex items-center gap-3">
            <NuxtLink
              to="/admin/produk/baru"
              class="px-4 py-2 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Icon name="lucide:plus" class="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </NuxtLink>

            <NuxtLink
              to="/"
              class="w-9 h-9 rounded-full bg-[#181926] hover:bg-[#232538] border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition"
              title="Kunjungi Toko"
            >
              <Icon name="lucide:external-link" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </header>

        <!-- Slot Content -->
        <main class="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <slot />
        </main>
      </div>

      <!-- Global Toast -->
      <UiAppToast />
    </div>
  </div>
</template>
