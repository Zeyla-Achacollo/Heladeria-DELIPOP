<template>
  <section class="page-section promo-hero">
    <div class="hero-copy">
      <span class="eyebrow">Promociones</span>
      <h1>Ofertas irresistibles para compartir</h1>
      <p>Encuentra paquetes especiales con descuentos únicos y sabores diseñados para disfrutar al máximo.</p>
    </div>
    <div class="hero-note">
      <h3>Descuentos hasta <span>35%</span></h3>
      <p>Elige tu paquete favorito y aprovecha precios más dulces en cada pedido.</p>
    </div>
  </section>

  <section v-if="isAdmin" class="admin-control">
    <button class="btn btn-secondary" type="button" @click="showPromotionForm = !showPromotionForm">
      {{ showPromotionForm ? 'Ocultar formulario' : 'Nueva promoción' }}
    </button>
  </section>

  <section v-if="isAdmin && showPromotionForm" class="admin-panel">
    <div class="admin-panel-header">
      <div>
        <h3>Administrar promociones</h3>
        <p>Crea nuevas promociones y elimina las que ya no quieras.</p>
      </div>
    </div>
    <form class="admin-form" @submit.prevent="submitPromotionForm">
      <div class="form-row">
        <label>Nombre de la promoción</label>
        <input v-model="promotionForm.name" required />
      </div>
      <div class="form-row">
        <label>Descripción</label>
        <textarea v-model="promotionForm.description" rows="2" required></textarea>
      </div>
      <div class="form-row">
        <label>Descuento (%)</label>
        <input type="number" min="0" max="100" v-model.number="promotionForm.discount" required />
      </div>
      <div class="admin-actions">
        <button class="btn btn-primary" type="submit">Crear promoción</button>
      </div>
      <p class="success-message" v-if="adminSuccess">{{ adminSuccess }}</p>
      <p class="error-message" v-if="adminError">{{ adminError }}</p>
    </form>
  </section>

  <div class="promo-grid">
    <template v-if="loading">
      <div class="empty-card">Cargando promociones...</div>
    </template>
    <template v-else-if="error">
      <div class="empty-card error-card">{{ error }}</div>
    </template>
    <template v-else-if="promotions.length === 0">
      <div class="empty-card">No hay promociones disponibles.</div>
    </template>
    <template v-else>
      <div class="promo-card" v-for="promo in promotions" :key="promo.id">
        <div class="promo-badge">Oferta</div>
        <div class="promo-card-top">
          <div>
            <h3>{{ promo.name }}</h3>
            <p>{{ promo.description }}</p>
          </div>
          <div class="promo-discount">-{{ promo.discount }}%</div>
        </div>

        <div class="promo-package" v-if="promo.packageProduct">
          <img v-if="promo.packageProduct.imageUrl" :src="`http://localhost:3000${promo.packageProduct.imageUrl}`" :alt="promo.packageProduct.name" />
          <div>
            <span>Incluye</span>
            <strong>{{ promo.packageProduct.name }}</strong>
          </div>
        </div>

        <div class="promo-actions">
          <router-link
            class="btn btn-primary"
            :to="promo.packageProduct ? { name: 'ProductDetail', params: { id: promo.packageProduct.id } } : { name: 'PromotionDetail', params: { id: promo.id } }"
          >
            Ver paquete
          </router-link>
          <span class="promo-spark">Solo por tiempo limitado</span>
        </div>
        <div v-if="isAdmin" class="admin-card-actions">
          <button type="button" class="btn btn-danger btn-small" @click="deletePromotion(promo.id)">Eliminar promoción</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { apiGet, apiPost, apiDelete } from '@/services/api'

const { isAdmin } = useAuth()
const promotions = ref<Array<{ id: number; name: string; description: string; discount: number; packageProduct?: { id: number; name: string; imageUrl?: string } }>>([])
const loading = ref(true)
const error = ref('')
const adminError = ref('')
const adminSuccess = ref('')
const promotionForm = ref({ name: '', description: '', discount: 0 })
const showPromotionForm = ref(false)

const loadPromotions = async () => {
  loading.value = true
  error.value = ''
  try {
    promotions.value = await apiGet('/promotions')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar las promociones'
  } finally {
    loading.value = false
  }
}

const submitPromotionForm = async () => {
  adminError.value = ''
  adminSuccess.value = ''

  if (!promotionForm.value.name || !promotionForm.value.description) {
    adminError.value = 'Completa todos los campos de la nueva promoción.'
    return
  }

  try {
    await apiPost('/promotions', {
      name: promotionForm.value.name,
      description: promotionForm.value.description,
      discount: promotionForm.value.discount,
    })
    promotionForm.value = { name: '', description: '', discount: 0 }
    adminSuccess.value = 'Promoción creada correctamente.'
    await loadPromotions()
    setTimeout(() => { adminSuccess.value = '' }, 4000)
  } catch (err) {
    adminError.value = err instanceof Error ? err.message : 'No se pudo crear la promoción.'
  }
}

const deletePromotion = async (promotionId: number) => {
  if (!window.confirm('¿Eliminar esta promoción?')) return
  try {
    await apiDelete(`/promotions/${promotionId}`)
    adminSuccess.value = 'Promoción eliminada.'
    await loadPromotions()
    setTimeout(() => { adminSuccess.value = '' }, 3000)
  } catch (err) {
    adminError.value = err instanceof Error ? err.message : 'No se pudo eliminar la promoción.'
  }
}

onMounted(loadPromotions)
</script>

<style scoped>
.page-section {
  padding: 0;
}
.promo-hero {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.5rem;
  background: linear-gradient(135deg, #ffe8f6 0%, #f5f0ff 100%);
  border-radius: 32px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 30px 80px rgba(139, 92, 246, 0.12);
}
.hero-copy h1 {
  font-size: clamp(2.4rem, 3vw, 3.8rem);
  margin: 0.75rem 0 1rem;
}
.hero-copy p {
  max-width: 42rem;
  color: #5f4b67;
  line-height: 1.8;
}
.hero-note {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  padding: 1.75rem;
  border: 1px solid rgba(177, 139, 255, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-note h3 {
  margin: 0;
  font-size: 1.75rem;
}
.hero-note h3 span {
  color: #9d4edd;
}
.hero-note p {
  margin: 0.85rem 0 0;
  color: #6b4d83;
}
.promo-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.promo-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 236, 248, 0.9));
  border-radius: 32px;
  padding: 1.75rem;
  box-shadow: 0 24px 60px rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(176, 95, 255, 0.2);
  display: grid;
  gap: 1rem;
}
.promo-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 110, 161, 0.18), transparent 24%), radial-gradient(circle at bottom left, rgba(137, 88, 255, 0.16), transparent 18%);
  pointer-events: none;
}
.promo-card > * {
  position: relative;
  z-index: 1;
}
.promo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 110, 161, 0.14);
  color: #c026d3;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.promo-card-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}
.promo-card h3 {
  margin: 0;
  font-size: 1.5rem;
}
.promo-card p {
  margin: 0.75rem 0 0;
  color: #5f4b67;
  line-height: 1.75;
}
.promo-discount {
  padding: 0.85rem 1rem;
  background: #f9e6ff;
  color: #7c2d8e;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 700;
}
.promo-package {
  display: grid;
  grid-template-columns: 72px auto;
  gap: 0.85rem;
  align-items: center;
  padding: 1rem;
  background: rgba(241, 233, 255, 0.9);
  border-radius: 22px;
  border: 1px solid rgba(192, 132, 252, 0.2);
}
.promo-package img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 18px;
}
.promo-package span {
  display: block;
  color: #7c3aed;
  font-size: 0.85rem;
}
.promo-package strong {
  display: block;
  font-size: 1rem;
  margin-top: 0.35rem;
}
.promo-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.promo-spark {
  color: #8b5cf6;
  font-weight: 700;
}
.btn-primary {
  background: linear-gradient(90deg, #d946ef, #7c3aed);
  border: none;
  color: #fff;
  border-radius: 18px;
  padding: 0.95rem 1.25rem;
}
.empty-card {
  background: #fff;
  padding: 2rem;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  text-align: center;
}
.error-card {
  color: #b91c1c;
}
  .admin-card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.75rem;
  }
  .admin-control {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
  }
  .admin-control .btn-secondary {
    background: #fff;
    color: #5f4b67;
    border: 1px solid #e8d8ed;
    padding: 0.85rem 1rem;
    border-radius: 18px;
  }
  .admin-panel {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 28px;
    padding: 1.75rem 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  }
  .admin-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .admin-form {
    display: grid;
    gap: 1rem;
  }
  .form-row {
    display: grid;
    gap: 0.5rem;
  }
  .form-row input,
  .form-row textarea {
    width: 100%;
    border: 1px solid #e5d4f7;
    border-radius: 16px;
    padding: 0.95rem 1rem;
    background: #faf7ff;
  }
  .admin-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .btn-danger {
    background: #f43f5e;
    color: #fff;
    border: none;
    border-radius: 18px;
    padding: 0.75rem 1rem;
  }
  .btn-small {
    padding: 0.75rem 1rem;
  }
  .success-message {
    color: #15803d;
    font-weight: 700;
  }
  .error-message {
    color: #9f2f54;
    font-weight: 700;
  }
</style>
