<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Contacto</h2>
        <p>Estamos listos para atender tu pedido y resolver tus dudas.</p>
      </div>
    </div>

    <div class="contact-grid">
      <div class="contact-card">
        <h3>Formulario de contacto</h3>
        <p>Envía tus consultas, reclamos o sugerencias y te responderemos pronto.</p>
        <form @submit.prevent="handleSubmit" class="contact-form">
          <label>Nombre</label>
          <input type="text" v-model="name" required />
          <label>Correo</label>
          <input type="email" v-model="email" required />
          <label>Asunto</label>
          <input type="text" v-model="subject" required />
          <label>Mensaje</label>
          <textarea rows="4" v-model="messageText" required></textarea>
          <button class="btn btn-primary" type="submit">Enviar mensaje</button>
        </form>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>
        <div class="contact-links">
          <p>Síguenos en:</p>
          <p><a href="#">Facebook</a> · <a href="#">Instagram</a></p>
          <p><a :href="whatsAppLink" target="_blank" rel="noreferrer">WhatsApp</a></p>
        </div>
      </div>
      <div class="contact-card contact-map">
        <h3>Nuestra ubicación</h3>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1010.2643879290789!2d-67.11175585884159!3d-17.974077820422963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e2b0b8d1c139db%3A0xdb66edeace776c3!2sSistemas%20e%20Inform%C3%A1tica%20FNI%20UTO!5e0!3m2!1ses-419!2sbo!4v1781821709002!5m2!1ses-419!2sbo"
          title="Ubicación"
          width="600"
          height="450"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const subject = ref('')
const messageText = ref('')
const successMessage = ref('')
const error = ref('')

const whatsAppLink = 'https://wa.me/1234567890?text=Hola%20Delipop%2C%20tengo%20una%20consulta.'

const handleSubmit = () => {
  error.value = ''
  successMessage.value = ''

  if (!name.value || !email.value || !subject.value || !messageText.value) {
    error.value = 'Por favor completa todos los campos.'
    return
  }

  successMessage.value = 'Tu mensaje ha sido enviado de forma simulada. Gracias por contactarnos.'
  name.value = ''
  email.value = ''
  subject.value = ''
  messageText.value = ''
}
</script>

<style scoped>
.contact-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(260px, 1fr) 1.5fr;
}
.contact-card {
  background: #fff;
  border-radius: 28px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
}
.contact-card h3,
.contact-card h4 {
  margin-top: 0;
}
.contact-card a {
  color: #ff6ea1;
}
.contact-map iframe {
  width: 100%;
  height: 100%;
  min-height: 340px;
  border: 0;
  border-radius: 22px;
}
.contact-form {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.contact-form label {
  display: block;
  font-weight: 600;
  color: #4b3b58;
  margin-bottom: 0.4rem;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(196, 168, 210, 0.75);
  border-radius: 18px;
  background: #fcf7fb;
  color: #2d2d35;
  font: inherit;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #ff6ea1;
  box-shadow: 0 0 0 4px rgba(255, 110, 161, 0.14);
}

.contact-form textarea {
  min-height: 140px;
  resize: vertical;
}

.contact-form button {
  justify-self: start;
  min-width: 170px;
}

.success-message,
.error-message {
  margin-top: 1rem;
  font-weight: 600;
  border-radius: 18px;
  padding: 0.95rem 1rem;
}

.success-message {
  background: rgba(49, 202, 134, 0.12);
  color: #246941;
}

.error-message {
  background: rgba(255, 110, 161, 0.12);
  color: #9f2f54;
}

.contact-links {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.55rem;
  color: #60546d;
}

.contact-links a {
  color: #ff6ea1;
  text-decoration: none;
}

.contact-links a:hover {
  text-decoration: underline;
}

@media (max-width: 960px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
