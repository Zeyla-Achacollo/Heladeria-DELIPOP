<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Carrito</h2>
        <p>Revisa los productos antes de finalizar tu pedido.</p>
      </div>
    </div>

    <div class="cart-empty" v-if="cartItems.length === 0">
      <div class="card-panel">
        <h3>Tu carrito está vacío</h3>
        <p>Agrega tus helados favoritos para comenzar.</p>
        <router-link class="btn btn-primary" to="/products">Ver productos</router-link>
      </div>
    </div>

    <div class="cart-layout" v-else>
      <div class="cart-list">
        <div class="cart-item" v-for="item in cartItems" :key="item.id">
          <div class="item-thumb">
            <img v-if="item.imageUrl" :src="`http://localhost:3000${item.imageUrl}`" :alt="item.name" />
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="item-controls">
              <input type="number" min="1" v-model.number="item.quantity" @change="handleQuantityChange(item.id, item.quantity)" />
              <span>{{ formatCurrency(item.price) }}</span>
            </div>
            <button class="btn btn-secondary remove-btn" @click="removeItem(item.id)">Eliminar</button>
          </div>
        </div>
      </div>
      <aside class="summary-card">
        <h3>Resumen</h3>
        <div class="summary-row"><span>Subtotal</span><span>{{ subtotal }}</span></div>
        <div class="summary-row"><span>IVA (12%)</span><span>{{ tax }}</span></div>
        <div class="summary-row total"><span>Total</span><span>{{ total }}</span></div>
        <router-link class="btn btn-primary w-full" to="/checkout">Proceder al pago</router-link>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCart } from '@/composables/useCart'

const { cartItems, updateQuantity, removeItem, subtotal, tax, total } = useCart()

const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`

const handleQuantityChange = (itemId: number, quantity: number) => {
  updateQuantity(itemId, quantity)
}
</script>

<style scoped>
.cart-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1.7fr 0.95fr;
}
.cart-list {
  display: grid;
  gap: 1.25rem;
}
.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #feebf6 100%);
  border: 1px solid rgba(255, 110, 161, 0.18);
  border-radius: 32px;
  padding: 1.1rem;
  box-shadow: 0 20px 45px rgba(147, 77, 152, 0.12);
  overflow: hidden;
}
.item-thumb {
  background: #ffe9f5;
  border-radius: 24px;
  overflow: hidden;
  min-height: 120px;
}
.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.item-info {
  display: grid;
  gap: 0.85rem;
}
.item-info h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #3f2a45;
}
.item-info p {
  margin: 0;
  color: #6c597a;
  line-height: 1.6;
}
.item-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
.item-controls input {
  width: 90px;
  border-radius: 16px;
  border: 1px solid #e8d8ed;
  padding: 0.75rem 0.9rem;
  background: #fff;
}
.remove-btn {
  max-width: 180px;
}
.summary-card {
  background: linear-gradient(180deg, #fff8fe 0%, #fff0f7 100%);
  border: 1px solid rgba(255, 110, 161, 0.18);
  border-radius: 32px;
  padding: 1.75rem;
  box-shadow: 0 20px 45px rgba(147, 77, 152, 0.12);
}
.summary-card h3 {
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #5f3660;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.95rem;
  color: #5f4b67;
}
.summary-row span:last-child {
  font-weight: 700;
}
.total {
  font-weight: 800;
  color: #3f2a45;
}
.w-full {
  width: 100%;
}
.cart-empty .card-panel {
  background: #fff;
  border-radius: 32px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
}
@media (max-width: 960px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  .cart-item {
    grid-template-columns: 1fr;
  }
  .item-thumb {
    min-height: 180px;
  }
}
</style>
