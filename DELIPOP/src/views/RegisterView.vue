<template>
  <section class="page-section auth-section">
    <div class="auth-card">
      <h2>Crear cuenta</h2>
      <p>Registra tu información para comprar rápidamente.</p>
      <form @submit.prevent="handleRegister">
        <label>Nombre completo</label>
        <input type="text" v-model="name" required />
        <label>Correo electrónico</label>
        <input type="email" v-model="email" required />
        <label>Contraseña</label>
        <input type="password" v-model="password" required minlength="6" />
        <label>Teléfono</label>
        <input type="text" v-model="phone" required />
        <label>Dirección</label>
        <input type="text" v-model="address" required />
        <button class="btn btn-primary" type="submit">Registrarme</button>
      </form>
      <p class="form-footer">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
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
const { register } = useAuth()
const name = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const address = ref('')
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  try {
    await register({ name: name.value, email: email.value, password: password.value, phone: phone.value, address: address.value })
    router.push('/products')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al registrar'
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
