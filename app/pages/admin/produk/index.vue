<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

definePageMeta({
  layout: 'admin',
})

const cartStore = useCartStore()

const { data, refresh } = await useFetch<any>('/api/products')
const products = computed(() => data.value?.data || [])

const isDeleting = ref<string | null>(null)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) return

  isDeleting.value = id
  try {
    const res = await $fetch<any>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    })

    if (res?.success) {
      cartStore.showToast(`Produk "${name}" berhasil dihapus`)
      refresh()
    }
  } catch (err: any) {
    cartStore.showToast(err.data?.message || 'Gagal menghapus produk')
  } finally {
    isDeleting.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Kelola Produk Digital
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          Daftar seluruh aset website, sticker, dan poster yang tersimpan di database Neon DB.
        </p>
      </div>

      <NuxtLink
        to="/admin/produk/baru"
        class="px-5 py-2.5 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 font-bold text-xs transition shadow-sm flex items-center gap-2"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span>Tambah Produk Baru</span>
      </NuxtLink>
    </div>

    <!-- Products Table Card -->
    <div class="bg-[#181926] border border-white/10 rounded-[32px] overflow-hidden shadow-xl">
      <div v-if="products.length === 0" class="text-center py-20 px-4 space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mx-auto">
          <Icon name="lucide:package-open" class="w-7 h-7" />
        </div>
        <h3 class="text-base font-bold text-white">Belum Ada Produk Tersimpan</h3>
        <p class="text-xs text-gray-400 max-w-sm mx-auto">
          Database Anda saat ini bersih. Klik tombol di bawah untuk mengunggah produk pertama Anda.
        </p>
        <NuxtLink
          to="/admin/produk/baru"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0b0c12] text-xs font-bold hover:bg-gray-100 transition shadow-lg mt-2"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span>Unggah Produk Sekarang</span>
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#12131d] text-gray-400 font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-3.5 px-6">Produk</th>
              <th class="py-3.5 px-4">Kategori</th>
              <th class="py-3.5 px-4">Harga</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-gray-300">
            <tr
              v-for="p in products"
              :key="p.id"
              class="hover:bg-[#1f2130]/60 transition"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl overflow-hidden bg-[#12131d] border border-white/5 shrink-0">
                    <img
                      :src="p.previewPaths?.[0] || 'https://placehold.co/100'"
                      :alt="p.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-bold text-white truncate max-w-xs">{{ p.name }}</h4>
                    <span class="text-[10px] text-gray-400 font-mono">/produk/{{ p.slug }}</span>
                  </div>
                </div>
              </td>

              <td class="py-4 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-white/10"
                  :class="
                    p.category === 'WEBSITE'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : p.category === 'STICKER'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/20'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/20'
                  "
                >
                  {{ p.category }}
                </span>
              </td>

              <td class="py-4 px-4 font-mono font-semibold text-white tabular-nums">
                {{ formatRupiah(p.salePrice || p.price) }}
              </td>

              <td class="py-4 px-4">
                <span class="px-2 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] text-[10px] font-bold">
                  {{ p.status }}
                </span>
              </td>

              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/produk/${p.slug}`"
                    target="_blank"
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition"
                    title="Buka Halaman Produk"
                  >
                    <Icon name="lucide:external-link" class="w-3.5 h-3.5" />
                  </NuxtLink>

                  <button
                    type="button"
                    :disabled="isDeleting === p.id"
                    @click="handleDelete(p.id, p.name)"
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
                    title="Hapus Produk"
                  >
                    <Icon v-if="isDeleting === p.id" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
                    <Icon v-else name="lucide:trash-2" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
