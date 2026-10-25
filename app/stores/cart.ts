import { defineStore } from 'pinia'

export interface CartItem {
  id: string
  slug: string
  name: string
  category: 'WEBSITE' | 'STICKER' | 'POSTER'
  price: number
  salePrice?: number | null
  previewUrl: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const voucherCode = ref('')
  const toastMessage = ref('')
  const isToastVisible = ref(false)
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  // Restore cart from localStorage on client side
  if (import.meta.client) {
    const saved = localStorage.getItem('hertaditz_cart')
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse cart storage', e)
      }
    }
  }

  // Save changes to localStorage
  watch(
    items,
    (val) => {
      if (import.meta.client) {
        localStorage.setItem('hertaditz_cart', JSON.stringify(val))
      }
    },
    { deep: true }
  )

  const showToast = (msg: string) => {
    toastMessage.value = msg
    isToastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      isToastVisible.value = false
    }, 2800)
  }

  const addToCart = (product: CartItem) => {
    const exists = items.value.some((item) => item.id === product.id)
    if (exists) {
      showToast(`"${product.name}" sudah ada di keranjang`)
      return
    }
    items.value.push({ ...product })
    showToast(`"${product.name}" ditambahkan ke keranjang`)
  }

  const removeFromCart = (productId: string) => {
    const item = items.value.find((i) => i.id === productId)
    items.value = items.value.filter((i) => i.id !== productId)
    if (item) {
      showToast(`"${item.name}" dihapus dari keranjang`)
    }
  }

  const clearCart = () => {
    items.value = []
    if (import.meta.client) {
      localStorage.removeItem('hertaditz_cart')
    }
  }

  const count = computed(() => items.value.length)

  const subtotal = computed(() => {
    return items.value.reduce((acc, item) => {
      const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price
      return acc + price
    }, 0)
  })

  return {
    items,
    voucherCode,
    toastMessage,
    isToastVisible,
    count,
    subtotal,
    addToCart,
    removeFromCart,
    clearCart,
    showToast,
  }
})
