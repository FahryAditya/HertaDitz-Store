<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const cartStore = useCartStore()

const name = ref('')
const slug = ref('')
const category = ref<'WEBSITE' | 'STICKER' | 'POSTER'>('WEBSITE')
const price = ref<number | null>(null)
const salePrice = ref<number | null>(null)
const description = ref('')
const demoUrl = ref('')
const previewUrl = ref('')
const filePath = ref('')
const featured = ref(false)
const status = ref<'PUBLISHED' | 'DRAFT'>('PUBLISHED')

const featuresList = ref<string[]>([
  'Source code lengkap & terorganisir',
  'Dokumentasi instalasi & pemakaian',
])
const newFeatureInput = ref('')

const isUploadingImage = ref(false)
const isUploadingMaster = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Auto slug generator
watch(name, (val) => {
  if (!slug.value || slug.value === slugify(val.slice(0, -1))) {
    slug.value = slugify(val)
  }
})

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

const addFeature = () => {
  if (newFeatureInput.value.trim()) {
    featuresList.value.push(newFeatureInput.value.trim())
    newFeatureInput.value = ''
  }
}

const removeFeature = (idx: number) => {
  featuresList.value.splice(idx, 1)
}

// Upload preview image to Neon DB via API
const handleImageFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploadingImage.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<any>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (res?.url) {
      previewUrl.value = res.url
      cartStore.showToast('Gambar preview berhasil diunggah ke Neon DB!')
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Gagal mengunggah gambar'
  } finally {
    isUploadingImage.value = false
  }
}

// Upload master file (.zip, .png, etc.)
const handleMasterFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploadingMaster.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<any>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (res?.url) {
      filePath.value = res.url
      cartStore.showToast('File master produk berhasil diunggah!')
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Gagal mengunggah file master'
  } finally {
    isUploadingMaster.value = false
  }
}

const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Nama produk wajib diisi'
    return
  }

  if (!price.value || price.value <= 0) {
    errorMessage.value = 'Harga normal harus lebih besar dari 0'
    return
  }

  if (!description.value.trim()) {
    errorMessage.value = 'Deskripsi produk wajib diisi'
    return
  }

  if (!previewUrl.value.trim()) {
    errorMessage.value = 'Silakan unggah gambar preview atau masukkan URL gambar'
    return
  }

  status.value = targetStatus
  isSubmitting.value = true

  try {
    const payload = {
      name: name.value.trim(),
      slug: slug.value.trim() || undefined,
      category: category.value,
      description: description.value.trim(),
      features: featuresList.value,
      price: Number(price.value),
      salePrice: salePrice.value && salePrice.value > 0 ? Number(salePrice.value) : null,
      demoUrl: demoUrl.value.trim() || null,
      previewPaths: [previewUrl.value.trim()],
      filePath: filePath.value.trim() || undefined,
      featured: featured.value,
      status: targetStatus,
    }

    const res = await $fetch<any>('/api/admin/products', {
      method: 'POST',
      body: payload,
    })

    if (res?.success) {
      cartStore.showToast(`Produk "${name.value}" berhasil disimpan!`)
      successMessage.value = `Produk berhasil diterbitkan! Anda dapat melihatnya langsung di etalase toko.`
      setTimeout(() => {
        router.push('/katalog')
      }, 1200)
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Gagal menyimpan produk ke database'
  } finally {
    isSubmitting.value = false
  }
}

const formatRupiah = (val: number | null) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Breadcrumb & Header -->
    <div class="border-b border-white/5 pb-5">
      <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-white transition">Admin Dashboard</NuxtLink>
        <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
        <span class="text-white font-medium">Tambah Produk Baru</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Unggah Produk Digital Baru
      </h1>
      <p class="text-xs text-gray-400 mt-1">
        Tambahkan template website, paket stiker anime, atau poster ke toko Anda. Data disimpan langsung ke Neon DB.
      </p>
    </div>

    <!-- Alert Notifications -->
    <div
      v-if="errorMessage"
      class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5"
    >
      <Icon name="lucide:alert-circle" class="w-4 h-4 text-rose-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div
      v-if="successMessage"
      class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2.5"
    >
      <Icon name="lucide:check-circle" class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <!-- 2 Column Layout: Form Left (7 Cols) + Live Card Preview Right (5 Cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- FORM COLUMN (7 COLS) -->
      <div class="lg:col-span-7 bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xl">
        <div class="space-y-5 text-xs">
          <!-- Category Selector Pills -->
          <div>
            <label class="block font-semibold text-gray-300 mb-2">Kategori Produk *</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="category = 'WEBSITE'"
                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none"
                :class="
                  category === 'WEBSITE'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-[#12131d] border-white/5 text-gray-400 hover:text-white'
                "
              >
                <Icon name="lucide:code" class="w-4 h-4" />
                <span>Website</span>
              </button>

              <button
                type="button"
                @click="category = 'STICKER'"
                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none"
                :class="
                  category === 'STICKER'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-sm'
                    : 'bg-[#12131d] border-white/5 text-gray-400 hover:text-white'
                "
              >
                <Icon name="lucide:smile" class="w-4 h-4" />
                <span>Sticker</span>
              </button>

              <button
                type="button"
                @click="category = 'POSTER'"
                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition select-none"
                :class="
                  category === 'POSTER'
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-sm'
                    : 'bg-[#12131d] border-white/5 text-gray-400 hover:text-white'
                "
              >
                <Icon name="lucide:image" class="w-4 h-4" />
                <span>Poster</span>
              </button>
            </div>
          </div>

          <!-- Product Name & Slug -->
          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Nama Produk *</label>
            <input
              v-model="name"
              type="text"
              placeholder="Contoh: Modern SaaS Dashboard Template"
              required
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Slug URL (Otomatis)</label>
            <input
              v-model="slug"
              type="text"
              placeholder="modern-saas-dashboard-template"
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-gray-400 font-mono text-[11px] focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <!-- Pricing: Normal & Promo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-gray-300 mb-1.5">Harga Normal (Rp) *</label>
              <input
                v-model="price"
                type="number"
                placeholder="150000"
                min="1000"
                required
                class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-white/30 transition"
              />
            </div>

            <div>
              <label class="block font-semibold text-gray-300 mb-1.5">Harga Diskon (Rp, Opsional)</label>
              <input
                v-model="salePrice"
                type="number"
                placeholder="120000"
                min="0"
                class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-white/30 transition"
              />
            </div>
          </div>

          <!-- Image Preview Upload & Input -->
          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Gambar Preview Produk *</label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  v-model="previewUrl"
                  type="text"
                  placeholder="URL gambar (https://... atau upload file di bawah)"
                  class="flex-1 bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <!-- Upload File Button -->
              <div class="flex items-center gap-3">
                <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition font-medium">
                  <Icon v-if="isUploadingImage" name="lucide:loader-2" class="w-4 h-4 animate-spin text-[#a7f3d0]" />
                  <Icon v-else name="lucide:upload" class="w-4 h-4 text-[#a7f3d0]" />
                  <span>{{ isUploadingImage ? 'Mengunggah ke Neon DB...' : 'Pilih Gambar dari Komputer' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageFileChange"
                  />
                </label>
                <span v-if="previewUrl" class="text-emerald-400 flex items-center gap-1">
                  <Icon name="lucide:check" class="w-3.5 h-3.5" />
                  <span>Gambar terpilih</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Master File (.ZIP) Upload & Link -->
          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">File Master Aset (.ZIP / File Asli)</label>
            <div class="space-y-2">
              <input
                v-model="filePath"
                type="text"
                placeholder="Path file atau URL unduhan aset digital"
                class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-gray-500 font-mono text-[11px] focus:outline-none focus:border-white/30 transition"
              />

              <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition font-medium">
                <Icon v-if="isUploadingMaster" name="lucide:loader-2" class="w-4 h-4 animate-spin text-purple-400" />
                <Icon v-else name="lucide:file-archive" class="w-4 h-4 text-purple-400" />
                <span>{{ isUploadingMaster ? 'Mengunggah file master...' : 'Unggah File (.ZIP / Master)' }}</span>
                <input
                  type="file"
                  class="hidden"
                  @change="handleMasterFileChange"
                />
              </label>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Deskripsi Lengkap *</label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="Jelaskan keunggulan produk, spesifikasi teknis, atau isi paket..."
              required
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
            ></textarea>
          </div>

          <!-- Demo URL (Only for Website) -->
          <div v-if="category === 'WEBSITE'">
            <label class="block font-semibold text-gray-300 mb-1.5">URL Live Demo (Opsional)</label>
            <input
              v-model="demoUrl"
              type="url"
              placeholder="https://demo-website.com"
              class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <!-- Features List Manager -->
          <div>
            <label class="block font-semibold text-gray-300 mb-1.5">Poin Fitur & Keunggulan</label>
            <div class="flex items-center gap-2 mb-2">
              <input
                v-model="newFeatureInput"
                type="text"
                placeholder="Contoh: Responsive Mobile & Desktop"
                @keydown.enter.prevent="addFeature"
                class="flex-1 bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
              />
              <button
                type="button"
                @click="addFeature"
                class="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
              >
                + Tambah
              </button>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(f, idx) in featuresList"
                :key="idx"
                class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 flex items-center gap-1.5"
              >
                <span>{{ f }}</span>
                <button
                  type="button"
                  @click="removeFeature(idx)"
                  class="text-gray-400 hover:text-rose-400"
                >
                  <Icon name="lucide:x" class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Featured Checkbox -->
          <div class="pt-2">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="featured"
                type="checkbox"
                class="rounded bg-[#12131d] border-white/20 text-[#a3e635] focus:ring-0 cursor-pointer"
              />
              <span class="text-gray-300 font-medium">Tampilkan sebagai Produk Unggulan di Beranda</span>
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-6 border-t border-white/5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit('PUBLISHED')"
            class="flex-1 py-3 px-6 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 disabled:opacity-50 font-bold text-sm transition shadow-xl flex items-center justify-center gap-2"
          >
            <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:send" class="w-4 h-4" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Terbitkan Produk Sekarang' }}</span>
          </button>

          <button
            type="button"
            :disabled="isSubmitting"
            @click="handleSubmit('DRAFT')"
            class="py-3 px-5 rounded-full bg-[#25283c] hover:bg-[#32364f] text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            Simpan Draf
          </button>
        </div>
      </div>

      <!-- LIVE PREVIEW COLUMN (5 COLS) -->
      <div class="lg:col-span-5 space-y-4 sticky top-6">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="lucide:eye" class="w-3.5 h-3.5 text-[#a7f3d0]" />
            <span>Pratinjau Kartu Produk (Live Preview)</span>
          </h3>
          <span class="text-[10px] text-gray-500">Tampilan di Etalase</span>
        </div>

        <!-- Simulated Product Card -->
        <div class="bg-[#181926] border border-white/15 rounded-[26px] p-5 shadow-2xl space-y-4">
          <!-- Thumbnail -->
          <div class="relative w-full h-[200px] rounded-[20px] overflow-hidden bg-[#12131d] border border-white/5">
            <img
              v-if="previewUrl"
              :src="previewUrl"
              :alt="name || 'Preview Produk'"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2"
            >
              <Icon name="lucide:image" class="w-8 h-8" />
              <span class="text-[11px]">Unggah gambar untuk melihat preview</span>
            </div>

            <!-- Watermark simulated for sticker/poster -->
            <div
              v-if="category === 'STICKER' || category === 'POSTER'"
              class="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/20"
            >
              <span class="text-white/30 font-bold tracking-widest text-[11px] uppercase -rotate-12 border border-white/20 px-3 py-1 rounded-full backdrop-blur-[1px]">
                HERTADITZ PREVIEW
              </span>
            </div>

            <!-- Category Badge -->
            <div class="absolute top-3 left-3">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border border-white/10 bg-white/10 text-white">
                {{ category }}
              </span>
            </div>

            <!-- Sale Badge -->
            <div
              v-if="price && salePrice && salePrice < price"
              class="absolute top-3 right-3"
            >
              <span class="px-2 py-0.5 rounded-full bg-[#f87171] text-[#0b0c12] text-[10px] font-extrabold tabular-nums shadow-sm">
                -{{ Math.round(((price - salePrice) / price) * 100) }}%
              </span>
            </div>
          </div>

          <!-- Title & Description -->
          <div>
            <h4 class="text-base font-bold text-white tracking-tight leading-snug">
              {{ name || 'Nama Produk Anda' }}
            </h4>
            <p class="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
              {{ description || 'Deskripsi singkat produk digital Anda akan muncul di bagian ini...' }}
            </p>

            <div v-if="featuresList.length > 0" class="flex flex-wrap gap-1.5 mt-3">
              <span
                v-for="(f, i) in featuresList.slice(0, 2)"
                :key="i"
                class="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-300"
              >
                {{ f }}
              </span>
            </div>
          </div>

          <!-- Price & Button -->
          <div class="pt-4 border-t border-white/5 flex items-center justify-between">
            <div class="flex flex-col">
              <span
                v-if="price && salePrice && salePrice < price"
                class="text-[11px] text-gray-400 line-through tabular-nums"
              >
                {{ formatRupiah(price) }}
              </span>
              <span class="text-lg font-bold text-white tabular-nums tracking-tight">
                {{ formatRupiah(salePrice || price || 0) }}
              </span>
            </div>

            <button
              type="button"
              class="px-4 py-1.5 rounded-full bg-white text-[#0b0c12] text-xs font-semibold flex items-center gap-1.5 shadow-sm pointer-events-none"
            >
              <Icon name="lucide:plus" class="w-3.5 h-3.5" />
              <span>Beli</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
