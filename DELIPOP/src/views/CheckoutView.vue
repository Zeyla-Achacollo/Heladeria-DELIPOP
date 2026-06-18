<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Checkout</h2>
        <p>Completa tus datos para confirmar tu pedido.</p>
      </div>
    </div>

    <div class="checkout-layout">
      <div class="checkout-form" v-if="isAuthenticated">
        <h3>Datos del cliente</h3>
        <div class="field-group">
          <label>Nombre completo</label>
          <input type="text" v-model="customerName" placeholder="Ingresa tu nombre" />
        </div>
        <div class="field-group">
          <label>Teléfono</label>
          <input type="text" v-model="phone" placeholder="Ej. +51 912 345 678" />
        </div>
        <div class="field-group">
          <label>Correo electrónico</label>
          <input type="email" v-model="email" placeholder="correo@ejemplo.com" />
        </div>
        <div class="field-group">
          <label>Dirección</label>
          <textarea rows="3" v-model="address" placeholder="Calle, número, referencia"></textarea>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>Tipo de entrega</label>
            <select v-model="deliveryType">
              <option value="Delivery">Delivery</option>
              <option value="Recoger en tienda">Recoger en tienda</option>
            </select>
          </div>
          <div class="field-group">
            <label>Método de pago</label>
            <select v-model="paymentMethod">
              <option value="Efectivo">Efectivo</option>
              <option value="QR">QR</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>

        <div class="qr-preview" v-if="paymentMethod === 'QR'">
          <p>Escanea este código QR para pagar:</p>
          <img :src="qrImageUrl" alt="Código QR" />

          <div class="invoice-card">
            <div class="invoice-header">
              <h4>Factura</h4>
              <span>{{ invoiceNumber }}</span>
            </div>
            <div class="invoice-meta">
              <div>
                <strong>Cliente</strong>
                <p>{{ customerName }}</p>
              </div>
              <div>
                <strong>Fecha</strong>
                <p>{{ invoiceDate }}</p>
              </div>
            </div>
            <div class="invoice-details">
              <div class="detail-row"><span>Método</span><span>{{ paymentMethod }}</span></div>
              <div class="detail-row"><span>Entrega</span><span>{{ deliveryType }}</span></div>
            </div>
            <div class="invoice-items">
              <div v-for="item in cartItems" :key="item.id" class="invoice-item">
                <span>{{ item.quantity }} x {{ item.name }}</span>
                <strong>{{ formatCurrency(Number(item.price) * Number(item.quantity)) }}</strong>
              </div>
            </div>
            <div class="invoice-summary">
              <div class="summary-row"><span>Subtotal</span><strong>{{ formatCurrency(subtotal) }}</strong></div>
              <div class="summary-row"><span>IVA (12%)</span><strong>{{ formatCurrency(tax) }}</strong></div>
              <div class="summary-row total"><span>Total</span><strong>{{ formatCurrency(total) }}</strong></div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" type="button" @click="handleConfirm" :disabled="cartItems.length === 0">Confirmar pedido</button>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="message" class="success-message">{{ message }}</p>
      </div>

      <div class="checkout-form" v-else>
        <h3>Completa tu cuenta para finalizar</h3>
        <p>Debes iniciar sesión para realizar tu pedido y guardar tu historial.</p>
        <router-link class="btn btn-primary" to="/login">Ingresar</router-link>
        <router-link class="btn btn-secondary" to="/register">Registrarme</router-link>
      </div>

      <aside class="checkout-summary">
        <h3>Resumen del pedido</h3>
        <div class="summary-row"><span>Productos</span><span>{{ itemCount }}</span></div>
        <div class="summary-row"><span>Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
        <div class="summary-row"><span>IVA (12%)</span><span>{{ formatCurrency(tax) }}</span></div>
        <div class="summary-row total"><span>Total</span><span>{{ formatCurrency(total) }}</span></div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useAuth } from '@/composables/useAuth'
import { apiPost } from '@/services/api'

const router = useRouter()
const { cartItems, subtotal, tax, total, clearCart } = useCart()
const { currentUser, isAuthenticated } = useAuth()
const qrImageUrl = new URL('../imagenes/QR.jpeg', import.meta.url).href

const customerName = ref(currentUser.value?.name ?? '')
const phone = ref(currentUser.value?.phone ?? '')
const email = ref(currentUser.value?.email ?? '')
const address = ref(currentUser.value?.address ?? '')
const deliveryType = ref('Delivery')
const paymentMethod = ref('Efectivo')
const message = ref('')
const error = ref('')

const itemCount = computed(() => cartItems.value.reduce((total, item) => total + item.quantity, 0))
const invoiceNumber = `INV-${new Date().getTime()}`
const invoiceDate = new Date().toLocaleDateString()

const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`

const handleConfirm = async () => {
  message.value = ''
  error.value = ''

  if (cartItems.value.length === 0) {
    error.value = 'El carrito está vacío. Agrega productos antes de confirmar.'
    return
  }

  if (!customerName.value || !phone.value || !email.value || !address.value) {
    error.value = 'Completa todos los datos del cliente.'
    return
  }

  try {
    const body = {
      customerName: customerName.value,
      phone: phone.value,
      email: email.value,
      address: address.value,
      deliveryType: deliveryType.value,
      paymentMethod: paymentMethod.value,
      items: cartItems.value.map((item) => ({ productId: item.id, quantity: item.quantity })),
      userId: currentUser.value?.id,
    }

    await apiPost('/orders', body)
    clearCart()
    message.value = 'Pedido confirmado correctamente. Tu comprobante se ha generado de forma simulada.'
    setTimeout(() => {
      router.push('/orders')
    }, 900)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al confirmar el pedido'
  }
}
</script>

<style scoped>
.checkout-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1.5fr 0.9fr;
}
.checkout-form,
.checkout-summary {
  background: #fff;
  border-radius: 28px;
  padding: 1.75rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
}
.checkout-form h3,
.checkout-summary h3 {
  margin-top: 0;
}
.field-group {
  display: grid;
  gap: 0.55rem;
  margin-bottom: 1rem;
}
.field-group input,
.field-group textarea,
.field-group select {
  border-radius: 18px;
  border: 1px solid #e8d8ed;
  padding: 0.95rem 1rem;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  color: #5f4b67;
  margin-bottom: 0.9rem;
}
.total {
  font-weight: 700;
  color: #2d2d35;
}
.btn-primary {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  border: none;
  color: #fff;
  border-radius: 18px;
  padding: 0.95rem 1.15rem;
  width: 100%;
}

.qr-preview {
  background: #faf5ff;
  border-radius: 20px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e8d8ed;
}

.qr-preview p {
  margin: 0 0 0.75rem;
  color: #5f4b67;
  font-weight: 600;
}

.qr-preview img {
  display: block;
  width: min(100%, 250px);
  max-height: 250px;
  margin: 0 auto;
  border-radius: 20px;
}

.invoice-card {
  background: #fff;
  border-radius: 24px;
  padding: 1rem;
  border: 1px solid rgba(255, 110, 161, 0.16);
  box-shadow: 0 18px 40px rgba(147, 77, 152, 0.08);
}
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.invoice-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #4b2a52;
}
.invoice-header span {
  font-weight: 700;
  color: #5f3b72;
}
.invoice-meta {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.invoice-meta div {
  display: flex;
  justify-content: space-between;
  color: #6c607e;
}
.invoice-details {
  margin-bottom: 1rem;
  border-top: 1px solid #f1e8f5;
  border-bottom: 1px solid #f1e8f5;
  padding: 0.75rem 0;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  color: #5f4b67;
  margin-bottom: 0.5rem;
}
.invoice-items {
  margin-bottom: 1rem;
}
.invoice-item {
  display: flex;
  justify-content: space-between;
  color: #5f4b67;
  margin-bottom: 0.5rem;
}
.invoice-summary {
  border-top: 1px solid #f2e8f7;
  padding-top: 0.9rem;
}
.invoice-summary .summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.invoice-summary .total {
  color: #2d2a35;
}

</style>