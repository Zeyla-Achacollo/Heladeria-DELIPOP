<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🍦</span>
          <span class="brand-text">DELIPOP</span>
        </router-link>
      </div>
      <nav class="main-nav">
        <router-link to="/">Inicio</router-link>
        <router-link to="/products">Productos</router-link>
        <router-link to="/promotions">Promociones</router-link>
        <router-link to="/about">Nosotros</router-link>
        <router-link to="/contact">Contacto</router-link>
        <router-link to="/cart" class="cart-link">
          Carrito
          <span v-if="itemCount > 0" class="cart-badge">{{ itemCount }}</span>
        </router-link>
        <template v-if="isAuthenticated">
          <router-link to="/orders">Mis pedidos</router-link>
          <button type="button" class="btn-link" @click="handleLogout">Cerrar sesión</button>
        </template>
        <template v-else>
          <router-link to="/login">Ingresar</router-link>
          <router-link to="/register" class="btn btn-secondary">Registrarse</router-link>
        </template>
      </nav>
    </header>

    <main class="page-content">
      <router-view />
    </main>

    <footer class="app-footer">
      <div>
        <strong>DELIPOP</strong>
        <p>Heladería artesanal · Sabor que enamora</p>
      </div>
      <div>
        <p>Contacto: contacto@delipop.com</p>
        <p>Tel: +123 456 789</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()
const { itemCount } = useCart()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f2f7;
  color: #2d2d35;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 18px 45px rgba(132, 81, 136, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}
.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 110, 161, 0.12) 0%, rgba(201, 146, 255, 0.12) 100%);
  border-radius: 999px;
  border: 1.5px solid rgba(255, 110, 161, 0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 12px 24px rgba(255, 110, 161, 0.12);
  text-decoration: none;
  color: inherit;
}
.brand-link:hover {
  background: linear-gradient(135deg, rgba(255, 110, 161, 0.18) 0%, rgba(201, 146, 255, 0.18) 100%);
  border-color: rgba(255, 110, 161, 0.35);
  box-shadow: 0 16px 32px rgba(255, 110, 161, 0.18);
  transform: translateY(-2px);
}
.brand-icon {
  font-size: 1.5rem;
  display: inline-block;
  animation: bounce 2.5s ease-in-out infinite;
}
.brand-text {
  background: linear-gradient(90deg, #ff6ea1 0%, #c992ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.main-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.main-nav a {
  color: #5f4b67;
  font-weight: 600;
    transition: all 0.2s ease;
  }
  .main-nav a.router-link-active {
    color: white;
    background: #ff6ea1;
    border-radius: 999px;
    padding: 0.55rem 1rem;
  }
  .main-nav a.router-link-active.cart-link {
    background: #ff6ea1;
    color: white;
  color: white;
  border-radius: 999px;
  padding: 0.55rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-badge {
  min-width: 1.6rem;
  height: 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.2);
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0 0.35rem;
}
.btn-link {
  background: none;
  border: none;
  color: #5f4b67;
  font-weight: 600;
  cursor: pointer;
}
.btn-link:hover {
  color: #ff6ea1;
}
.page-content {
  flex: 1;
  padding: 2rem 1.5rem;
}
.app-footer {
  background: #ffffff;
  border-top: 1px solid #f0e3ee;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
@media (max-width: 768px) {
  .app-header,
  .app-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .main-nav {
    justify-content: center;
  }
}
</style>
