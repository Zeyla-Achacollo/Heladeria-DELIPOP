<template>
  <section class="about-hero">
    <div class="hero-copy">
      <span class="eyebrow">Nuestra esencia</span>
      <h1>Delicias artesanales hechas con cariño</h1>
      <p>En DELIPOP transformamos los mejores ingredientes en helados cremosos, frescos y llenos de sabor para cada momento.</p>
    </div>
    <div class="hero-card">
      <div class="hero-stat">
        <strong>15+</strong>
        <span>Sabores exclusivos</span>
      </div>
      <div class="hero-stat">
        <strong>100%</strong>
        <span>Ingredientes naturales</span>
      </div>
      <div class="hero-stat">
        <strong>5</strong>
        <span>Valores que nos guían</span>
      </div>
    </div>
  </section>

  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>Lo que nos define</h2>
        <p>Conoce nuestra historia y los principios que hacen de DELIPOP un lugar especial.</p>
      </div>
    </div>

    <div class="about-grid">
      <div class="about-card card-accent">
        <h3>Historia</h3>
        <p>DELIPOP nació para llevar helados artesanales con personalidad propia, hechos con ingredientes naturales y el cariño de siempre.</p>
      </div>
      <div class="about-card card-accent">
        <h3>Misión</h3>
        <p>Crear experiencias dulces y memorables que reconforten a cada persona desde el primer bocado.</p>
      </div>
      <div class="about-card card-accent">
        <h3>Visión</h3>
        <p>Ser el referente preferido en sabor, creatividad y servicio, inspirando sonrisas en cada entrega.</p>
      </div>
      <div class="about-card card-accent">
        <h3>Valores</h3>
        <ul>
          <li>Calidad</li>
          <li>Innovación</li>
          <li>Integridad</li>
          <li>Servicio</li>
          <li>Pasión</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.about-hero {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  background: linear-gradient(135deg, #ffe6f1 0%, #f8f2f7 100%);
  border-radius: 32px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 40px 100px rgba(151, 85, 158, 0.12);
}
.hero-copy h1 {
  margin: 0.75rem 0 1rem;
  font-size: clamp(2rem, 3vw, 3.5rem);
}
.hero-copy p {
  max-width: 42rem;
  line-height: 1.8;
  color: #5f4b67;
}
.eyebrow {
  display: inline-flex;
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  background: #ffebf4;
  color: #d6336c;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.hero-card {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 28px;
  border: 1px solid rgba(243, 199, 234, 0.7);
}
.hero-stat {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: 22px;
  background: #fff5fb;
}
.hero-stat strong {
  font-size: 2rem;
  color: #7c2d8e;
}
.hero-stat span {
  color: #6b4f6a;
}
.page-section {
  padding: 0;
}
.section-header h2 {
  margin-bottom: 0.5rem;
}
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}
.about-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 1.75rem;
  box-shadow: 0 24px 60px rgba(147, 77, 152, 0.08);
  border: 1px solid rgba(233, 208, 236, 0.8);
}
.card-accent {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 238, 247, 0.95) 100%);
}
.about-card h3 {
  margin-top: 0;
  color: #5f4b67;
}
.about-card p,
.about-card li {
  color: #6b4f6a;
}
.about-card ul {
  padding-left: 1.25rem;
  margin: 0;
}
.about-card li {
  margin-bottom: 0.65rem;
}
@media (max-width: 860px) {
  .about-hero {
    grid-template-columns: 1fr;
  }
}
</style>
