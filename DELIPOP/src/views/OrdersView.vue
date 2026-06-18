<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Historial de compras</h2>
        <p>Consulta tus pedidos realizados anteriormente.</p>
      </div>
    </div>

    <div v-if="!isAuthenticated && !error" class="empty-state">
      <p>Para ver tu historial debes iniciar sesión.</p>
      <router-link class="btn btn-primary" to="/login">Ingresar</router-link>
      <router-link class="btn btn-secondary" to="/register">Registrarme</router-link>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <p>No tienes pedidos realizados aún.</p>
      <router-link class="btn btn-primary" to="/products">Ver productos</router-link>
    </div>

    <div v-else class="orders-grid">
      <div v-if="error" class="empty-state">
        <p>{{ error }}</p>
      </div>
      <div class="order-card" v-for="order in orders" :key="order.id">
        <div class="order-row">
          <div class="order-left">
            <div class="order-meta">
              <div>
                <strong>Pedido #{{ order.id }}</strong>
                <p class="muted">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>

            <div class="order-items">
              <div v-for="item in order.items" :key="item.id || item.productId" class="order-item">
                <div class="item-info">
                  <img v-if="item.product?.imageUrl" :src="`http://localhost:3000${item.product.imageUrl}`" class="item-thumb" />
                  <div>
                    <div class="item-name">{{ item.product?.name ?? item.name }}</div>
                    <div class="muted">{{ item.quantity }} x {{ formatCurrency(Number(item.price)) }}</div>
                  </div>
                </div>
                <strong class="item-total">{{ formatCurrency(Number(item.price) * Number(item.quantity)) }}</strong>
              </div>
            </div>
          </div>

          <div class="order-right">
            <div class="order-status-row">
              <span :class="['order-status', statusClass(order.status)]">{{ humanStatus(order.status) }}</span>
            </div>
            <div class="order-summary">
              <div>
                <span class="muted">Subtotal</span>
                <strong>{{ formatCurrency(Number(order.subtotal)) }}</strong>
              </div>
              <div>
                <span class="muted">Impuestos</span>
                <strong>{{ formatCurrency(Number(order.tax)) }}</strong>
              </div>
              <div class="total-row">
                <span>Total</span>
                <strong>{{ formatCurrency(Number(order.total)) }}</strong>
              </div>
            </div>

            <div class="order-actions">
              <button v-if="order.status === 'pending'" class="btn btn-ghost" @click="updateStatus(order.id, 'paid')">Marcar como pagado</button>
              <button v-if="order.status === 'pending'" class="btn btn-warning" @click="updateStatus(order.id, 'cancelled')">Cancelar</button>
              <button class="btn btn-danger btn-sm" type="button" @click="deleteOrder(order.id)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { apiDelete, apiPut } from '@/services/api'

const { getOrders, isAuthenticated } = useAuth()
const orders = ref<any[]>([])
const error = ref('')

const loadOrders = async () => {
  error.value = ''
  try {
    orders.value = await getOrders()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar el historial'
  }
}

const deleteOrder = async (orderId: number) => {
  if (!window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return
  try {
    await apiDelete(`/orders/${orderId}`)
    await loadOrders()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar el pedido'
  }
}

const updateStatus = async (orderId: number, status: string) => {
  const confirmMsg = status === 'cancelled' ? '¿Cancelar este pedido?' : '¿Marcar como pagado?'
  if (!window.confirm(confirmMsg)) return
  try {
    await apiPut(`/orders/${orderId}`, { status })
    await loadOrders()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar el pedido'
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleString()
const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`
const humanStatus = (s: string) => (s === 'pending' ? 'Pendiente' : s === 'paid' ? 'Pagado' : s === 'cancelled' ? 'Cancelado' : s)
const statusClass = (s: string) => (s === 'pending' ? 'status-pending' : s === 'paid' ? 'status-paid' : s === 'cancelled' ? 'status-cancelled' : '')

onMounted(() => {
  if (isAuthenticated.value) {
    loadOrders()
  }
})
</script>

<style scoped>
.page-section {
  padding: 1rem 0;
}
.orders-grid {
  display: grid;
  gap: 1.25rem;
}
.order-card {
  background: #fff;
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 20px 40px rgba(147, 77, 152, 0.06);
}
.order-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.order-left {
  flex: 1 1 60%;
}
.order-right {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}
.order-meta p.muted { color: #7a6b7a; margin: 0.25rem 0 0 }
.order-items { margin-top: 0.75rem }
.order-item { display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px dashed rgba(0,0,0,0.04) }
.item-info { display:flex; gap:0.75rem; align-items:center }
.item-thumb { width:56px; height:56px; object-fit:cover; border-radius:10px }
.item-name { font-weight:700 }
.item-total { min-width:72px; text-align:right }
.order-status { padding:0.5rem 0.75rem; border-radius:999px; font-weight:700; display:inline-block }
.status-pending { background:#fff0f6; color:#d6336c }
.status-paid { background:#ecfdf5; color:#0f766e }
.status-cancelled { background:#f3f4f6; color:#6b7280 }
.order-summary { display:flex; flex-direction:column; gap:0.5rem; background:#fbf8ff; padding:0.75rem; border-radius:12px }
.total-row { display:flex; justify-content:space-between; align-items:center; font-weight:800 }
.btn { border-radius:12px; padding:0.5rem 0.75rem; cursor:pointer; border: none }
.btn-ghost { background:transparent; color:#5f4b67; border:1px solid #e9dff3 }
.btn-warning { background:#ffecb5; color:#b45309 }
.btn-danger { background:#ff6b6b; color:white }
.btn-sm { font-size:0.85rem }
.empty-state {
  text-align: center;
  background: #fff;
  padding: 2rem;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
}
.btn-primary {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  border: none;
  color: #fff;
  border-radius: 18px;
  padding: 0.95rem 1.15rem;
}
</style>
