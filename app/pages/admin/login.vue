<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const res = await $fetch<any>('/api/admin/login', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        password: password.value,
      },
    })

    if (res?.success) {
      cartStore.showToast(`Selamat datang, ${res.user.name}`)
      router.push('/admin')
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Login gagal. Periksa kembali email dan password Anda.'
  } finally {
    isLoading.value = false
  }
}

const fillDemo = () => {
  email.value = 'admin@hertaditz.store'
  password.value = 'AdminHerta2026!'
}
</script>

<template>
  <div class="max-w-md mx-auto py-10 space-y-8">
    <div class="text-center space-y-2">
      <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto border border-white/10 shadow-lg">
        <Icon name="lucide:shield-lock" class="w-7 h-7 text-[#a7f3d0]" />
      </div>
      <h1 class="text-2xl font-extrabold text-white tracking-tight">
        Portal Admin HertaDitz
      </h1>
      <p class="text-xs text-gray-400">
        Masuk untuk mengelola produk digital, voucher diskon, dan memantau pesanan.
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

    <!-- Login Form -->
    <form
      @submit.prevent="handleLogin"
      class="bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-5 shadow-2xl"
    >
      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-gray-300 mb-1.5">Email Administrator</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@hertaditz.store"
            required
            class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
          />
        </div>

        <div>
          <label class="block font-semibold text-gray-300 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••••••"
            required
            class="w-full bg-[#12131d] border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
          />
        </div>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-6 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 active:scale-95 disabled:opacity-50 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:log-in" class="w-4 h-4" />
          <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}</span>
        </button>
      </div>

      <!-- Quick Demo Credentials helper -->
      <div class="pt-2 text-center border-t border-white/5">
        <button
          type="button"
          @click="fillDemo"
          class="text-[11px] text-[#a7f3d0] hover:underline"
        >
          Gunakan Kredensial Demo Admin
        </button>
      </div>
    </form>
  </div>
</template>
