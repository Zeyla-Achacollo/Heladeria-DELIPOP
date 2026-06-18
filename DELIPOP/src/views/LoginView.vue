<template>
  <section class="page-section auth-section">
    <div class="auth-card">
      <h2>Ingresar</h2>
      <p>Accede a tu cuenta con correo electrónico y contraseña.</p>
      <form @submit.prevent="handleLogin">
        <label>Correo electrónico</label>
        <input type="email" v-model="email" required />
        <label>Contraseña</label>
        <input type="password" v-model="password" required />
        <button class="btn btn-primary" type="submit">Ingresar</button>
      </form>
      <p class="form-footer">
        ¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>
      </p>
      <p class="form-footer">
        <router-link to="/forgot-password">Olvidé mi contraseña</router-link>
      </p>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  try {
    await login(email.value, password.value)
    router.push('/products')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al iniciar sesión'
  }
}
</script>

<style scoped>
.page-section {
  padding: 2rem 0;
  display: flex;
  justify-content: center;
}
.auth-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  display: grid;
  gap: 1rem;
}
.auth-card h2 {
  margin: 0;
}
.auth-card form {
  display: grid;
  gap: 1rem;
}
.auth-card label {
  font-weight: 700;
}
.auth-card input {
  width: 100%;
  border-radius: 18px;
  border: 1px solid #e8d8ed;
  padding: 0.95rem 1rem;
}
.btn-primary {
  background: linear-gradient(90deg, #ff6ea1, #c992ff);
  border: none;
  color: #fff;
  border-radius: 18px;
  padding: 0.95rem 1.15rem;
}
.form-footer {
  margin: 0;
}
.error-message {
  color: #d9534f;
}
</style>
