<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Detalle del producto</h2>
        <p>Conoce más sobre este sabor y agrégalo al carrito.</p>
      </div>
      <router-link class="btn btn-secondary" to="/products">Volver a productos</router-link>
    </div>

    <template v-if="loading">
      <div class="empty-card">Cargando producto...</div>
    </template>

    <template v-else-if="error">
      <div class="empty-card error-card">{{ error }}</div>
    </template>

    <template v-else-if="product">
      <div class="detail-grid">
        <div class="product-gallery">
          <img v-if="product.imageUrl" :src="`http://localhost:3000${product.imageUrl}`" :alt="product.name" />
        </div>
        <div class="product-info">
          <span class="eyebrow">{{ product.category }}</span>
          <h3>{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-meta">
            <div>
              <span>Precio</span>
              <strong>{{ formatCurrency(product.price) }}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong>{{ product.stock }}</strong>
            </div>
          </div>
          <button class="btn btn-primary btn-wide" @click="addToCart">Agregar al carrito</button>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { apiGet } from '@/services/api'

const route = useRoute()
const { addItem } = useCart()
const product = ref<{ id: number; name: string; description: string; price: number; category: string; stock: number; imageUrl?: string } | null>(null)
const loading = ref(true)
const error = ref('')
const successMessage = ref('')

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''
  const id = Number(route.params.id)

  if (Number.isNaN(id)) {
    error.value = 'Producto inválido.'
    loading.value = false
    return
  }

  try {
    const res = await apiGet(`/products/${id}`)
    product.value = { ...res, price: Number(res.price) }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar el producto.'
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (!product.value) return
  addItem({ ...product.value, quantity: 1 })
  successMessage.value = 'Producto agregado al carrito.'
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

onMounted(loadProduct)
</script>

<style scoped>
.detail-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: start;
}

.product-gallery {
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
}

.product-gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 420px;
}

.product-info {
  background: #fff;
  border-radius: 32px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  display: grid;
  gap: 1rem;
}

.eyebrow {
  display: inline-flex;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  background: #ffe6f1;
  color: #ff6ea1;
  font-weight: 700;
}

.product-info h3 {
  margin: 0.75rem 0;
  font-size: clamp(2rem, 2.5vw, 2.6rem);
}

.product-description {
  color: #5f4b67;
  line-height: 1.8;
}

.product-meta {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  background: #f9f5ff;
  border-radius: 24px;
  padding: 1rem 1.25rem;
}

.product-meta span {
  display: block;
  color: #6b4f6a;
  font-size: 0.95rem;
}

.product-meta strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.15rem;
  color: #3c096c;
}

.btn-wide {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  color: white;
  border: none;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  font-weight: 700;
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.18);
}

.success-message {
  color: #15803d;
  font-weight: 700;
}

.empty-card,
.error-card {
  background: #fff;
  border-radius: 28px;
  padding: 1.75rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  text-align: center;
}

.error-card {
  color: #9f2f54;
}

@media (max-width: 960px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
