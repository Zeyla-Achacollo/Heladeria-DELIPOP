<template>
  <section class="page-section auth-section">
    <div class="auth-card">
      <h2>Recuperar contraseña</h2>
      <p>Ingresa tu correo para recibir un enlace de recuperación simulado.</p>
      <form @submit.prevent="handleReset">
        <label>Correo electrónico</label>
        <input type="email" v-model="email" required />
        <button class="btn btn-primary" type="submit">Enviar enlace</button>
      </form>
      <p v-if="message" class="success-message">{{ message }}</p>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="form-footer">
        ¿Recordaste tu contraseña? <router-link to="/login">Iniciar sesión</router-link>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { resetPassword } = useAuth()
const email = ref('')
const error = ref('')
const message = ref('')

const handleReset = async () => {
  error.value = ''
  message.value = ''
  try {
    message.value = await resetPassword(email.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al recuperar contraseña'
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
.success-message {
  color: #28a745;
}
.error-message {
  color: #d9534f;
}
</style>
