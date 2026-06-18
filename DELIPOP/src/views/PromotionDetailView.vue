<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Promoción seleccionada</h2>
        <p>Revisa el paquete destacado y aprovecha el descuento especial.</p>
      </div>
      <router-link class="btn btn-secondary" to="/promotions">Volver a promociones</router-link>
    </div>

    <template v-if="loading">
      <div class="empty-card">Cargando promoción...</div>
    </template>

    <template v-else-if="error">
      <div class="empty-card error-card">{{ error }}</div>
    </template>

    <template v-else-if="promotion">
      <div class="detail-grid">
        <article class="promo-card promo-detail-card">
          <div class="promo-hero-card">
            <div>
              <span class="eyebrow">Promoción Especial</span>
              <h3>{{ promotion.name }}</h3>
            </div>
            <div class="promo-discount-badge">-{{ promotion.discount }}%</div>
          </div>
          <p>{{ promotion.description }}</p>
          <div class="promo-highlights">
            <div>
              <strong>Perfecta para:</strong>
              <p>Comparte, regala o disfruta con amigos.</p>
            </div>
            <div>
              <strong>Tiempo limitado</strong>
              <p>Oferta disponible por poco tiempo.</p>
            </div>
          </div>
        </article>

        <aside class="promo-package-card">
          <div class="package-header">
            <div>
              <h3>Paquete promocionado</h3>
              <p>Añádelo al carrito con el mejor precio del momento.</p>
            </div>
            <span class="package-badge">Paquete {{ promotion.name }}</span>
          </div>

          <div v-if="promotion.packageProduct" class="package-content">
            <div class="package-card">
              <div class="package-card-image">
                <img v-if="promotion.packageProduct.imageUrl" :src="`http://localhost:3000${promotion.packageProduct.imageUrl}`" :alt="promotion.packageProduct.name" />
              </div>
              <div class="package-card-body">
                <span class="product-badge">Producto del paquete</span>
                <h4>{{ promotion.packageProduct.name }}</h4>
                <p class="package-product-description">{{ promotion.packageProduct.description }}</p>
                <div class="package-tag">Incluye en la promoción: {{ promotion.name }}</div>
                <div class="price-row">
                  <span>Precio normal</span>
                  <strong>{{ formatCurrency(promotion.packageProduct.price) }}</strong>
                </div>
                <div class="price-row price-discounted">
                  <span>Precio con promoción</span>
                  <strong>{{ formatCurrency(discountedPrice) }}</strong>
                </div>
                <div class="promotion-actions">
                  <button class="btn btn-primary btn-wide" type="button" @click="addPackageToCart">
                    Agregar paquete al carrito
                  </button>
                  <router-link v-if="promotion.packageProduct" :to="{ name: 'ProductDetail', params: { id: promotion.packageProduct.id } }" class="btn btn-secondary btn-wide">
                    Ver producto
                  </router-link>
                </div>
                <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No hay un paquete asignado para esta promoción.</p>
          </div>
        </aside>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { apiGet } from '@/services/api'

const route = useRoute()
const { addItem } = useCart()
const promotion = ref<{ id: number; name: string; description: string; discount: number; packageProduct?: { id: number; name: string; description: string; price: number; imageUrl?: string } } | null>(null)
const loading = ref(true)
const error = ref('')
const successMessage = ref('')

const loadPromotion = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''
  const id = Number(route.params.id)

  if (Number.isNaN(id)) {
    error.value = 'Promoción inválida.'
    loading.value = false
    return
  }

  try {
    promotion.value = await apiGet(`/promotions/${id}`)
    if (promotion.value?.packageProduct?.price) {
      promotion.value.packageProduct.price = Number(promotion.value.packageProduct.price)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar la promoción.'
  } finally {
    loading.value = false
  }
}

const discountedPrice = computed(() => {
  if (!promotion.value?.packageProduct) return 0
  return Number((promotion.value.packageProduct.price * (1 - promotion.value.discount / 100)).toFixed(2))
})

const addPackageToCart = () => {
  if (!promotion.value?.packageProduct) return

  addItem({
    id: promotion.value.packageProduct.id,
    name: `Paquete ${promotion.value.packageProduct.name}`,
    description: `${promotion.value.packageProduct.description} - ${promotion.value.name}`,
    price: discountedPrice.value,
    quantity: 1,
  })

  successMessage.value = 'Paquete agregado al carrito con descuento.'
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

onMounted(loadPromotion)
</script>

<style scoped>
.detail-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1.2fr 0.9fr;
  align-items: start;
}

.promo-card,
.promo-package-card {
  background: #fff;
  border-radius: 32px;
  padding: 2rem;
  box-shadow: 0 30px 80px rgba(147, 77, 152, 0.1);
  border: 1px solid rgba(235, 210, 246, 0.9);
}

.promo-hero-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.promo-hero-card .eyebrow {
  display: inline-flex;
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  background: #ffe6f8;
  color: #c026d3;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.promo-hero-card h3 {
  margin: 0.5rem 0 0;
  font-size: 2rem;
}

.promo-discount-badge {
  background: #faf5ff;
  color: #7c3aed;
  border-radius: 22px;
  padding: 0.75rem 1rem;
  font-weight: 700;
  min-width: 90px;
  text-align: center;
}

.promo-card p {
  color: #5f4b67;
  line-height: 1.75;
}

.promo-highlights {
  display: grid;
  gap: 1rem;
  margin-top: 1.75rem;
}

.promo-highlights div {
  background: #fff5ff;
  border-radius: 22px;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.promo-highlights strong {
  display: block;
  margin-bottom: 0.45rem;
  color: #6d28d9;
}

.package-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.package-badge {
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: rgba(255, 110, 161, 0.14);
  color: #9d174d;
  font-weight: 700;
}

.package-content {
  display: grid;
  gap: 1.25rem;
}

.package-card {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1rem;
  background: rgba(246, 237, 255, 0.9);
  border-radius: 28px;
  padding: 1rem;
  border: 1px solid rgba(199, 210, 254, 0.7);
}

.package-card-image {
  border-radius: 24px;
  overflow: hidden;
  min-height: 140px;
  background: linear-gradient(135deg, #f5e3ff, #ffe6f6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.package-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.package-card-body {
  display: grid;
  gap: 0.85rem;
}

.product-badge {
  display: inline-flex;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 110, 161, 0.14);
  color: #9d174d;
  font-size: 0.85rem;
  font-weight: 700;
}

.package-card-body h4 {
  margin: 0;
  font-size: 1.3rem;
  color: #4c1d95;
}

.package-product-description {
  margin: 0;
  color: #5f4b67;
  line-height: 1.75;
}

.package-tag {
  display: inline-flex;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.1);
  color: #5b21b6;
  font-size: 0.9rem;
  font-weight: 700;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 20px;
  background: #f8f3ff;
  color: #5f4b67;
  font-weight: 700;
}

.price-discounted {
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.12), rgba(185, 28, 242, 0.08));
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 20px;
  background: #faf5ff;
  color: #6d28d9;
  font-weight: 700;
}

.price-discounted {
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.12), rgba(185, 28, 242, 0.08));
}

.promotion-actions {
  display: grid;
  gap: 0.85rem;
}

.btn-wide {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(90deg, #d946ef, #7c3aed);
  border: none;
  color: #fff;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  font-weight: 700;
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.18);
}

.btn-secondary {
  width: 100%;
  background: #f0e3ee;
  color: #5f4b67;
  border: none;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  font-weight: 700;
  text-align: center;
}

.success-message {
  color: #15803d;
  padding-top: 0.5rem;
}

.error-card {
  background: rgba(255, 110, 161, 0.12);
  color: #9f2f54;
  border-radius: 28px;
  padding: 1.25rem;
}

@media (max-width: 960px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
