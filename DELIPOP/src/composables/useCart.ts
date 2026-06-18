import { computed, ref } from 'vue'

export interface CartItem {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  imageUrl?: string
}

const STORAGE_CART = 'delipop_cart'
const cartItems = ref<CartItem[]>(JSON.parse(localStorage.getItem(STORAGE_CART) || '[]'))

const saveCart = () => {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cartItems.value))
}

export function useCart() {
  const addItem = (item: CartItem) => {
    const existing = cartItems.value.find((cartItem) => cartItem.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
      existing.price = item.price
    } else {
      cartItems.value.push({ ...item })
    }
    saveCart()
  }

  const removeItem = (itemId: number) => {
    cartItems.value = cartItems.value.filter((item) => item.id !== itemId)
    saveCart()
  }

  const updateQuantity = (itemId: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.id === itemId)
    if (!item) return
    item.quantity = Math.max(1, quantity)
    saveCart()
  }

  const clearCart = () => {
    cartItems.value = []
    saveCart()
  }

  const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const tax = computed(() => Number((subtotal.value * 0.12).toFixed(2)))
  const total = computed(() => Number((subtotal.value + tax.value).toFixed(2)))
  const itemCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

  return {
    cartItems,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
  }
}
