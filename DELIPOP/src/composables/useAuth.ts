import { computed, ref } from 'vue'
import { apiGet, apiPost } from '@/services/api'

export interface UserProfile {
  id?: number
  name: string
  email: string
  password?: string
  phone: string
  address: string
  role?: string
}

export interface OrderSummary {
  id: number
  createdAt: string
  status: string
  total: string
  items: Array<{ name: string; quantity: number; price: string }>
}

const STORAGE_CURRENT_USER = 'delipop_current_user'
const currentUser = ref<UserProfile | null>(JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER) || 'null'))

function saveCurrentUser() {
  localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser.value))
}

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)

  const register = async (payload: Omit<UserProfile, 'password'> & { password: string }) => {
    const user = await apiPost('/auth/register', payload)
    currentUser.value = user
    saveCurrentUser()
    return user
  }

  const login = async (email: string, password: string) => {
    const user = await apiPost('/auth/login', { email, password })
    currentUser.value = user
    saveCurrentUser()
    return user
  }

  const logout = () => {
    currentUser.value = null
    saveCurrentUser()
  }

  const resetPassword = async (email: string) => {
    const response = await apiPost('/auth/forgot-password', { email })
    return response.message
  }

  const getOrders = async () => {
    if (!currentUser.value) {
      return [] as OrderSummary[]
    }

    return apiGet(`/orders?email=${encodeURIComponent(currentUser.value.email)}`)
  }

  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    resetPassword,
    getOrders,
  }
}
