<template>
  <section class="hero-section">
    <div class="hero-card">
      <div class="hero-copy">
        <span class="eyebrow">Helados artesanales</span>
        <h1>Sabores que alegran cada instante</h1>
        <p>Disfruta helados frescos, naturales y hechos con amor. Pide directo desde tu casa.</p>
        <div class="hero-actions">
          <router-link class="btn btn-primary" to="/products">Ver productos</router-link>
          <router-link class="btn btn-secondary" to="/promotions">Promociones</router-link>
        </div>
      </div>
      <div class="hero-image">
        <img :src="logoUrl" alt="Logo DELIPOP" class="hero-image-logo" />
      </div>
    </div>
  </section>

  <section class="section-block">
    <div class="section-header">
      <div>
        <h2>Productos destacados</h2>
        <p>Los sabores más pedidos para disfrutar hoy.</p>
      </div>
    </div>
    <div class="section-notice" v-if="successMessage">{{ successMessage }}</div>
    <div class="cards-grid">
      <template v-if="loading">
        <div class="loading-card">Cargando productos destacados...</div>
      </template>
      <template v-else-if="products.length === 0">
        <div class="empty-card">No hay productos destacados disponibles.</div>
      </template>
      <template v-else>
        <div class="product-card" v-for="item in products" :key="item.id">
          <div class="product-image">
            <img v-if="item.imageUrl" :src="`http://localhost:3000${item.imageUrl}`" :alt="item.name" class="product-thumb" />
          </div>
          <div class="product-body">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="product-footer">
              <strong>{{ formatCurrency(item.price) }}</strong>
              <button class="btn btn-primary" @click="addToCart(item)">Agregar</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCart } from '@/composables/useCart'
import { apiGet } from '@/services/api'

const logoUrl = new URL('../imagenes/logo.jpeg', import.meta.url).href

const { addItem } = useCart()
const products = ref<Array<{ id: number; name: string; description: string; price: number; category: string; featured: boolean; imageUrl?: string }>>([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')

const loadFeaturedProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiGet('/products?featured=true')
    products.value = res.map((item: any) => ({ ...item, price: Number(item.price) }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar los productos destacados'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`

const addToCart = (product: { id: number; name: string; description: string; price: number }) => {
  addItem({ ...product, quantity: 1 })
  successMessage.value = 'Producto agregado al carrito.'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

onMounted(loadFeaturedProducts)
</script>

<style scoped>
.hero-section {
  margin-bottom: 2.5rem;
}
.hero-card {
  display: grid;
  gap: 2rem;
  align-items: center;
  grid-template-columns: 1.2fr 0.8fr;
  background: #fff;
  border-radius: 32px;
  padding: 2.5rem;
  box-shadow: 0 40px 100px rgba(151, 85, 158, 0.12);
}
.hero-copy h1 {
  font-size: clamp(2.2rem, 3vw, 3.4rem);
  margin: 1rem 0;
}

.hero-image {
  width: 100%;
  min-height: 320px;
  background: radial-gradient(circle at center, #ffe6f1 0%, #f2e3f5 65%, #f8f2f7 100%);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.hero-image-logo {
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: 12px;
}
.eyebrow {
  display: inline-flex;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  background: #ffe6f1;
  color: #ff6ea1;
  font-weight: 700;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}
.hero-image {
  width: 100%;
  min-height: 320px;
  background: radial-gradient(circle at center, #ffe6f1 0%, #f2e3f5 65%, #f8f2f7 100%);
  border-radius: 28px;
}
.section-block {
  padding: 2rem 0;
}
.section-header h2 {
  margin: 0 0 0.5rem;
}
.cards-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.product-card {
  background: #fff;
  border-radius: 28px;
  padding: 1.25rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 300px;
}
.product-image {
  background: linear-gradient(135deg, #ff9ec8, #c992ff);
  height: 170px;
  border-radius: 22px;
  margin-bottom: 1rem;
}
.product-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
  display: block;
}
.product-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-notice {
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 24px;
  background: #f6ffef;
  color: #264d00;
  border: 1px solid #b7eb8f;
}
.btn {
  border-radius: 18px;
  padding: 0.85rem 1rem;
  font-weight: 600;
}
.btn-primary {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  color: white;
  border: none;
}
.btn-secondary {
  background: white;
  color: #5f4b67;
  border: 1px solid #e8d8ed;
}
@media (max-width: 960px) {
  .hero-card {
    grid-template-columns: 1fr;
  }
}
</style>
