<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const navItems = [
  { name: 'Beranda', path: '/' },
  { name: 'Katalog', path: '/katalog' },
  { name: 'Cek Pesanan', path: '/cek-pesanan' },
  { name: 'Bantuan', path: '/bantuan' },
]

const navContainer = ref<HTMLElement | null>(null)
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)', opacity: '0' })

const updateIndicator = () => {
  if (!navContainer.value || !import.meta.client) return
  const activeTab = navContainer.value.querySelector<HTMLElement>('.nav-tab-active')
  if (activeTab) {
    const parentRect = navContainer.value.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()
    const offsetLeft = tabRect.left - parentRect.left
    indicatorStyle.value = {
      width: `${tabRect.width}px`,
      transform: `translateX(${offsetLeft}px)`,
      opacity: '1',
    }
  } else {
    indicatorStyle.value.opacity = '0'
  }
}

watch(
  () => route.path,
  () => {
    nextTick(() => {
      setTimeout(updateIndicator, 50)
    })
  }
)

onMounted(() => {
  nextTick(() => {
    setTimeout(updateIndicator, 100)
    window.addEventListener('resize', updateIndicator)
  })
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', updateIndicator)
  }
})
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-4 mb-8 px-2 select-none">
    <!-- Brand Logo -->
    <NuxtLink to="/" class="flex items-center gap-2.5 group focus:outline-none">
      <div
        class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-white/30 group-hover:bg-white/15 transition shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        <Icon name="lucide:sparkles" class="w-5 h-5 text-white" />
      </div>
      <div class="flex flex-col">
        <span class="text-lg font-bold tracking-tight text-white leading-tight">hertaditz</span>
        <span class="text-[9px] font-mono tracking-widest text-[#a7f3d0] uppercase -mt-0.5">digital assets</span>
      </div>
    </NuxtLink>

    <!-- Center Floating Pill Nav -->
    <nav
      ref="navContainer"
      class="relative bg-[#171824] p-1.5 rounded-full border border-white/5 flex items-center gap-1 order-3 lg:order-2 w-full lg:w-auto justify-center overflow-x-auto shadow-lg"
    >
      <!-- Animated Active Indicator -->
      <div
        class="absolute left-0 top-1.5 bottom-1.5 bg-white rounded-full transition-all duration-300 ease-out pointer-events-none"
        :style="indicatorStyle"
      ></div>

      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="relative z-10 px-4 py-1.5 rounded-full text-xs transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap"
        :class="
          route.path === item.path
            ? 'nav-tab-active font-semibold text-[#0b0c12]'
            : 'text-gray-400 hover:text-white font-medium'
        "
      >
        <span
          v-if="route.path === item.path"
          class="w-1.5 h-1.5 rounded-full bg-[#0b0c12]"
        ></span>
        {{ item.name }}
      </NuxtLink>
    </nav>

    <!-- Right Action Icons & Cart -->
    <div class="flex items-center gap-3 order-2 lg:order-3">
      <!-- Search shortcut -->
      <NuxtLink
        to="/katalog"
        aria-label="Pencarian Katalog"
        class="w-9 h-9 rounded-full bg-[#181926] hover:bg-[#232538] border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition"
      >
        <Icon name="lucide:search" class="w-4 h-4" />
      </NuxtLink>

      <!-- Cart Button Pill -->
      <NuxtLink
        to="/keranjang"
        class="relative px-3.5 py-1.5 rounded-full bg-[#181926] hover:bg-[#232538] border border-white/10 flex items-center gap-2 text-white transition shadow-sm group"
      >
        <Icon name="lucide:shopping-bag" class="w-4 h-4 text-gray-300 group-hover:text-white transition" />
        <span class="text-xs font-semibold tabular-nums">Keranjang</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition"
          :class="
            cartStore.count > 0
              ? 'bg-[#a3e635] text-[#0b0c12] shadow-[0_0_12px_rgba(163,230,53,0.4)]'
              : 'bg-white/10 text-gray-300'
          "
        >
          {{ cartStore.count }}
        </span>
      </NuxtLink>

      <!-- Admin Portal Link -->
      <NuxtLink
        to="/admin/login"
        aria-label="Admin Portal"
        title="Admin Portal"
        class="w-9 h-9 rounded-full bg-[#181926] hover:bg-[#232538] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
      >
        <Icon name="lucide:shield" class="w-4 h-4" />
      </NuxtLink>
    </div>
  </header>
</template>
