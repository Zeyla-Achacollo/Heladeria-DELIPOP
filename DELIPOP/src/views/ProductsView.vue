<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Productos</h2>
        <p>Elige tu helado favorito entre nuestros sabores artesanales.</p>
      </div>
      <div class="search-bar">
        <input v-model="query" type="search" placeholder="Buscar..." />
      </div>
    </div>

    <section v-if="isAdmin" class="admin-panel" ref="adminPanelRef">
      <div class="admin-panel-header">
        <h3>Panel de administración</h3>
        <p>Agrega, edita o elimina productos. Solo visible para administradores.</p>
      </div>

      <form class="admin-form" @submit.prevent="submitAdminProduct">
        <div class="form-row">
          <label>Nombre</label>
          <input v-model="adminForm.name" required />
        </div>
        <div class="form-row">
          <label>Descripción</label>
          <textarea v-model="adminForm.description" required rows="2"></textarea>
        </div>
        <div class="form-row">
          <label>Categoría</label>
          <select v-model="adminForm.category" required>
            <option value="Clásicos">Clásicos</option>
            <option value="Frutales">Frutales</option>
            <option value="Veganos">Veganos</option>
            <option value="Especiales">Especiales</option>
          </select>
        </div>
        <div class="form-row form-grid">
          <div>
            <label>Precio</label>
            <input v-model.number="adminForm.price" type="number" min="0" step="0.01" required />
          </div>
          <div>
            <label>Stock</label>
            <input v-model.number="adminForm.stock" type="number" min="0" required />
          </div>
          <div>
            <label>Destacado</label>
            <input type="checkbox" v-model="adminForm.featured" />
          </div>
        </div>

        <div class="form-row">
          <label>Imagen del producto</label>
          <div class="image-upload">
            <input 
              ref="imageInputRef"
              type="file" 
              accept="image/*" 
              @change="handleImageSelect"
              style="display: none"
            />
            <button 
              type="button" 
              class="btn-upload-image"
              @click="imageInputRef?.click()"
            >
              {{ imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen' }}
            </button>
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Vista previa" />
              <button 
                type="button" 
                class="btn-remove-image"
                @click="removeImage"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="admin-actions">
          <button class="btn btn-primary" type="submit">{{ editingProductId ? 'Actualizar producto' : 'Crear producto' }}</button>
          <button class="btn btn-secondary" type="button" @click="resetAdminForm" v-if="editingProductId">Cancelar edición</button>
        </div>

        <p class="success-message" v-if="adminSuccess">{{ adminSuccess }}</p>
        <p class="error-message" v-if="adminError">{{ adminError }}</p>
      </form>
    </section>

    <div class="products-layout">
      <aside class="filter-panel">
        <div class="filter-header">
          <div>
            <h3>Filtros</h3>
            <p>Encuentra tu helado ideal con opciones rápidas.</p>
          </div>
          <button class="btn btn-clear" type="button" @click="category=''; sort=''">Limpiar</button>
        </div>

        <div class="filter-chip-group">
          <span class="filter-label">Categoría</span>
          <div class="chips">
            <button type="button" class="chip" :class="{ active: category === '' }" @click="category = ''">Todas</button>
            <button
              type="button"
              v-for="cat in categories"
              :key="cat"
              class="chip"
              :class="{ active: category === cat }"
              @click="category = cat"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="filter-chip-group">
          <span class="filter-label">Ordenar</span>
          <div class="chips">
            <button type="button" class="chip" :class="{ active: sort === '' }" @click="sort = ''">Relevancia</button>
            <button type="button" class="chip" :class="{ active: sort === 'price_asc' }" @click="sort = 'price_asc'">Menor a mayor</button>
            <button type="button" class="chip" :class="{ active: sort === 'price_desc' }" @click="sort = 'price_desc'">Mayor a menor</button>
          </div>
        </div>
      </aside>

      <div class="products-grid-wrapper">
        <div class="products-grid">
          <div class="product-card" v-for="product in filteredProducts" :key="product.id">
            <div class="product-image">
              <img 
                v-if="product.imageUrl" 
                :src="`http://localhost:3000${product.imageUrl}`" 
                :alt="product.name"
                class="product-img"
              />
            </div>
            <div class="product-body">
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <small>{{ product.category }}</small>
              <div class="product-actions">
                <strong>{{ formatCurrency(product.price) }}</strong>
                <button class="btn btn-primary" @click="addToCart(product)">Agregar al carrito</button>
              </div>
              <div v-if="isAdmin" class="admin-product-actions">
                <button class="btn btn-secondary" type="button" @click="startEditProduct(product)">Editar</button>
                <button class="btn btn-danger" type="button" @click="deleteProduct(product.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cart-toast" v-if="cartSuccessMessage">{{ cartSuccessMessage }}</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCart } from '@/composables/useCart'
import { useAuth } from '@/composables/useAuth'
import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData, apiPutFormData } from '@/services/api'

const { addItem } = useCart()
const { isAdmin } = useAuth()
const query = ref('')
const category = ref('')
const sort = ref('')
const adminPanelRef = ref<HTMLElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const products = ref<Array<{ id: number; name: string; description: string; price: number; category: string; stock: number; featured: boolean; imageUrl?: string }>>([])
const error = ref('')
const adminError = ref('')
const adminSuccess = ref('')
const cartSuccessMessage = ref('')
const editingProductId = ref<number | null>(null)
const selectedImage = ref<File | null>(null)
const imagePreview = ref<string>('')
const adminForm = ref({
  name: '',
  description: '',
  price: 0,
  category: 'Clásicos',
  stock: 0,
  featured: false,
})

const loadProducts = async () => {
  error.value = ''
  try {
    const res = await apiGet('/products')
    // Normalizar tipos: Prisma puede devolver `price` como string (Decimal).
    products.value = res.map((p: any) => ({ ...p, price: Number(p.price) }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar los productos'
  }
}

onMounted(loadProducts)

const categories = computed(() => {
  const unique = new Set(products.value.map((item) => item.category))
  return Array.from(unique)
})

const filteredProducts = computed(() => {
  let result = products.value.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.value.toLowerCase())
    const matchesCategory = category.value ? item.category === category.value : true
    return matchesQuery && matchesCategory
  })

  if (sort.value === 'price_asc') {
    result = result.slice().sort((a, b) => a.price - b.price)
  }
  if (sort.value === 'price_desc') {
    result = result.slice().sort((a, b) => b.price - a.price)
  }

  return result
})

const addToCart = (product: { id: number; name: string; description: string; price: number }) => {
  addItem({ ...product, quantity: 1 })
  cartSuccessMessage.value = 'Producto agregado al carrito.'
  setTimeout(() => {
    cartSuccessMessage.value = ''
  }, 3000)
}

const startEditProduct = (product: { id: number; name: string; description: string; price: number; category: string; stock: number; featured: boolean; imageUrl?: string }) => {
  editingProductId.value = product.id
  adminError.value = ''
  adminForm.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    featured: product.featured,
  }
  imagePreview.value = product.imageUrl ? `http://localhost:3000${product.imageUrl}` : ''
  selectedImage.value = null
  
  // Hacer scroll al formulario
  setTimeout(() => {
    adminPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 0)
}

const resetAdminForm = () => {
  editingProductId.value = null
  adminError.value = ''
  adminForm.value = {
    name: '',
    description: '',
    price: 0,
    category: 'Clásicos',
    stock: 0,
    featured: false,
  }
  selectedImage.value = null
  imagePreview.value = ''
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      adminError.value = 'Por favor selecciona un archivo de imagen válido'
      return
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      adminError.value = 'La imagen no debe superar 5MB'
      return
    }
    
    selectedImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    adminError.value = ''
  }
}

const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

const submitAdminProduct = async () => {
  adminError.value = ''
  try {
    const formData = new FormData()
    formData.append('name', adminForm.value.name)
    formData.append('description', adminForm.value.description)
    formData.append('price', String(adminForm.value.price))
    formData.append('category', adminForm.value.category)
    formData.append('stock', String(adminForm.value.stock))
    formData.append('featured', String(adminForm.value.featured))
    
    if (selectedImage.value) {
      formData.append('image', selectedImage.value)
    }

    if (editingProductId.value) {
      await apiPutFormData(`/products/${editingProductId.value}`, formData)
    } else {
      await apiPostFormData('/products', formData)
    }

    await loadProducts()
    adminSuccess.value = editingProductId.value ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
    resetAdminForm()
    setTimeout(() => { adminSuccess.value = '' }, 4000)
  } catch (err) {
    adminError.value = err instanceof Error ? err.message : 'Error en la gestión del producto'
  }
}

const deleteProduct = async (productId: number) => {
  if (!window.confirm('¿Eliminar este producto?')) return
  try {
    await apiDelete(`/products/${productId}`)
    await loadProducts()
    adminSuccess.value = 'Producto eliminado'
    setTimeout(() => { adminSuccess.value = '' }, 3000)
  } catch (err) {
    adminError.value = err instanceof Error ? err.message : 'Error eliminando el producto'
  }
}

const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`
</script>

<style scoped>
.page-section {
  padding: 1rem 0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.section-header h2 {
  margin: 0;
}
.search-bar input {
  width: 220px;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid #e8d8ed;
}
.products-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 280px 1fr;
}
.filter-panel {
  background: #fff;
  border-radius: 28px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  display: grid;
  gap: 1rem;
}
.admin-panel {
  background: #fff;
  border-radius: 28px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
}
.admin-panel-header {
  margin-bottom: 1.25rem;
}
.admin-panel-header h3 {
  margin: 0 0 0.5rem;
}
.admin-form {
  display: grid;
  gap: 1rem;
}
.form-row {
  display: grid;
  gap: 0.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}
.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
.admin-form input,
.admin-form select,
.admin-form textarea {
  width: 100%;
  border-radius: 18px;
  border: 1px solid #e8d8ed;
  padding: 0.95rem 1rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}
.admin-form textarea {
  min-height: 90px;
}
.error-message,
.success-message {
  margin: 0;
  font-weight: 600;
}
.error-message {
  color: #d6455c;
}
.success-message {
  color: #2f855a;
}
.filter-panel h3 {
  margin: 0;
}
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.filter-header p {
  margin: 0.35rem 0 0;
  color: #6b4b7d;
  line-height: 1.6;
}
.filter-chip-group {
  display: grid;
  gap: 0.85rem;
}
.filter-label {
  color: #5f4b67;
  font-weight: 700;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.chip {
  border: 1px solid rgba(149, 89, 188, 0.35);
  background: rgba(249, 237, 255, 0.85);
  color: #5f4b67;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  font-weight: 700;
}
.chip:hover {
  transform: translateY(-1px);
  border-color: #c084fc;
}
.chip.active {
  background: linear-gradient(135deg, #ff6ea1, #c992ff);
  color: white;
  border-color: transparent;
}
.btn-clear {
  border: none;
  background: transparent;
  color: #8b5cf6;
  font-weight: 700;
  cursor: pointer;
  padding: 0.65rem 0.85rem;
  border-radius: 999px;
}
.btn-clear:hover {
  background: rgba(139, 92, 246, 0.1);
}

.products-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  z-index: 200;
  background: rgba(47, 133, 90, 0.95);
  color: white;
  border-radius: 999px;
  padding: 0.95rem 1.5rem;
  box-shadow: 0 18px 40px rgba(47, 133, 90, 0.2);
  font-weight: 700;
  max-width: min(90%, 420px);
  text-align: center;
}

.products-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.product-card {
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.product-image {
  height: 180px;
  background: linear-gradient(135deg, #ff9ec8, #c992ff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn-danger {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  cursor: pointer;
}
.btn-secondary {
  background: #f0e3ee;
  color: #5f4b67;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  cursor: pointer;
}
.product-body {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}
.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}
.admin-product-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.btn-primary {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  color: white;
  border: none;
}
.btn-danger {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  cursor: pointer;
}
.btn-secondary {
  background: #f0e3ee;
  color: #5f4b67;
  border: none;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  cursor: pointer;
}
.image-upload {
  display: grid;
  gap: 1rem;
}
.btn-upload-image {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  color: white;
  border: none;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 500;
}
.btn-upload-image:hover {
  opacity: 0.9;
}
.image-preview {
  position: relative;
  display: inline-block;
  max-width: 200px;
}
.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.btn-remove-image {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #ff6b6b;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.btn-remove-image:hover {
  background: #ff5252;
}
@media (max-width: 960px) {
  .products-layout {
    grid-template-columns: 1fr;
  }
}
</style>
