<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="star" v-for="n in 30" :key="n" :style="starStyle(n)"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">✦ Numerología Mística</div>
        <h1 class="hero-title">
          Descubre los <span class="gradient-text">secretos</span> que 
          los números revelan sobre ti
        </h1>
        <p class="hero-subtitle">
          Explora tu perfil numerológico, obtén lecturas personalizadas y descubre 
          tu compatibilidad con otras personas a través del poder de los números.
        </p>
        <div class="hero-actions">
          <router-link to="/registro" class="btn btn-primary btn-lg">
            ✨ Comenzar gratis
          </router-link>
          <router-link to="/login" class="btn btn-secondary btn-lg">
            Ya tengo cuenta
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="features-title">¿Qué puedes hacer?</h2>
      <div class="grid-3">
        <div class="feature-card card card-glow">
          <div class="feature-icon">🔢</div>
          <h3>Perfil Numerológico</h3>
          <p>Calcula tu número de vida, expresión y alma a partir de tu fecha y nombre.</p>
        </div>
        <div class="feature-card card card-glow">
          <div class="feature-icon">🔮</div>
          <h3>Lecturas</h3>
          <p>Recibe lecturas diarias, generales o anuales personalizadas para ti.</p>
        </div>
        <div class="feature-card card card-glow">
          <div class="feature-icon">💕</div>
          <h3>Compatibilidad</h3>
          <p>Descubre qué tan compatible eres con otra persona según la numerología.</p>
        </div>
      </div>
    </section>

    <!-- Numbers Section -->
    <section class="numbers-section">
      <h2 class="features-title">Significado de los números</h2>
      <div class="grid-3">
        <div v-for="num in numberMeanings" :key="num.n" class="number-card card">
          <div class="number-circle">{{ num.n }}</div>
          <h4>{{ num.name }}</h4>
          <p>{{ num.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-card card">
        <h2>¿Listo para descubrir tu camino?</h2>
        <p>Regístrate ahora y obtén acceso a todas las herramientas numerológicas.</p>
        <router-link to="/registro" class="btn btn-primary btn-lg">
          🚀 Crear mi cuenta
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
const numberMeanings = [
  { n: 1, name: 'Liderazgo', desc: 'Independencia, creatividad y determinación. Los pioneros del zodiaco numerológico.' },
  { n: 2, name: 'Armonía', desc: 'Cooperación, sensibilidad y diplomacia. Los mediadores naturales.' },
  { n: 3, name: 'Expresión', desc: 'Creatividad, comunicación y alegría. Los artistas del universo numérico.' },
  { n: 4, name: 'Estabilidad', desc: 'Orden, trabajo y construcción. Los cimientos de toda gran obra.' },
  { n: 5, name: 'Libertad', desc: 'Aventura, cambio y versatilidad. Los espíritus libres e inquietos.' },
  { n: 6, name: 'Amor', desc: 'Responsabilidad, familia y compasión. Los cuidadores del corazón.' },
  { n: 7, name: 'Sabiduría', desc: 'Análisis, introspección y espiritualidad. Los buscadores de la verdad.' },
  { n: 8, name: 'Poder', desc: 'Ambición, éxito y materialización. Los grandes realizadores.' },
  { n: 9, name: 'Humanidad', desc: 'Generosidad, idealismo y compasión universal. Los altruistas.' },
];

function starStyle(n) {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 4;
  const size = 1 + Math.random() * 3;
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
  };
}
</script>

<style scoped>
.home {
  overflow: hidden;
}

/* === HERO === */
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 30%, rgba(124, 58, 237, 0.2) 0%, transparent 60%),
              radial-gradient(ellipse at 30% 70%, rgba(71, 191, 255, 0.1) 0%, transparent 50%);
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.2; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.5); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.hero-badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  color: var(--accent-purple-light);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 24px;
  letter-spacing: 0.05em;
}

.hero-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 20px;
}

.gradient-text {
  background: var(--gradient-mystic);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* === FEATURES === */
.features {
  padding: 80px 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.features-title {
  text-align: center;
  margin-bottom: 48px;
  font-size: 2rem;
}

.feature-card {
  text-align: center;
}

.feature-card h3 {
  margin: 16px 0 12px;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

/* === NUMBERS === */
.numbers-section {
  padding: 60px 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.number-card {
  text-align: center;
}

.number-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient-mystic);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  margin: 0 auto 12px;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
}

.number-card h4 {
  margin-bottom: 8px;
}

.number-card p {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
}

/* === CTA === */
.cta {
  padding: 80px 24px;
  max-width: 700px;
  margin: 0 auto;
}

.cta-card {
  text-align: center;
  padding: 48px;
}

.cta-card h2 {
  margin-bottom: 16px;
}

.cta-card p {
  color: var(--text-secondary);
  margin-bottom: 28px;
  font-size: 1.05rem;
}

/* === RESPONSIVE === */
@media (max-width: 640px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1rem; }
  .hero { min-height: 60vh; padding: 40px 16px; }
}
</style>
