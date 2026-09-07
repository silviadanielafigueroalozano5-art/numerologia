<template>
  <div class="page-container">
    <div class="section-header">
      <h2>✦ Dashboard</h2>
      <p>Bienvenido a tu espacio numerológico personal</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-header mt-4">
      <h3>Acciones rápidas</h3>
    </div>

    <div class="grid-3">
      <router-link to="/perfil-numerologico" class="action-card card card-glow">
        <div class="action-icon">🔢</div>
        <h4>Mi Perfil Numerológico</h4>
        <p>Consulta y calcula tus números de vida, expresión y alma.</p>
        <span class="action-arrow">→</span>
      </router-link>

      <router-link to="/lecturas" class="action-card card card-glow">
        <div class="action-icon">🔮</div>
        <h4>Mis Lecturas</h4>
        <p>Revisa tus lecturas diarias, generales y anuales.</p>
        <span class="action-arrow">→</span>
      </router-link>

      <router-link to="/compatibilidad" class="action-card card card-glow">
        <div class="action-icon">💕</div>
        <h4>Compatibilidad</h4>
        <p>Descubre tu compatibilidad numerológica con otros.</p>
        <span class="action-arrow">→</span>
      </router-link>
    </div>

    <!-- Today's Number -->
    <div class="today-card card card-glow mt-4">
      <div class="today-left">
        <div class="today-badge">Número del día</div>
        <div class="today-number">{{ todayNumber }}</div>
      </div>
      <div class="today-right">
        <h3>{{ todayMeaning.name }}</h3>
        <p>{{ todayMeaning.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { obtenerPerfiles, obtenerLecturas, obtenerCompatibilidades } from '../services/api.js';

const perfiles = ref([]);
const lecturas = ref([]);
const compatibilidades = ref([]);

const stats = computed(() => [
  { icon: '🔢', value: perfiles.value.length, label: 'Perfiles' },
  { icon: '🔮', value: lecturas.value.length, label: 'Lecturas' },
  { icon: '💕', value: compatibilidades.value.length, label: 'Compatibilidades' },
  { icon: '📅', value: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short' }), label: 'Hoy' },
]);

const todayNumber = computed(() => {
  const today = new Date();
  let sum = today.getDate() + today.getMonth() + 1 + today.getFullYear();
  while (sum > 9) sum = sum.toString().split('').reduce((a, b) => a + +b, 0);
  return sum || 9;
});

const meanings = {
  1: { name: 'Liderazgo', desc: 'Hoy es un día ideal para tomar decisiones y liderar proyectos. Tu energía creativa está en su punto más alto.' },
  2: { name: 'Armonía', desc: 'Busca el equilibrio y la cooperación. Las relaciones interpersonales serán clave para tu éxito hoy.' },
  3: { name: 'Expresión', desc: 'Deja fluir tu creatividad y comunícate con claridad. Hoy es un excelente día para el arte y la autoexpresión.' },
  4: { name: 'Estabilidad', desc: 'Enfócate en construir bases sólidas. La disciplina y el trabajo constante traerán grandes recompensas.' },
  5: { name: 'Libertad', desc: 'Abrazá el cambio y la aventura. Hoy es un día para explorar nuevas posibilidades y romper rutinas.' },
  6: { name: 'Amor', desc: 'Dedica tiempo a tus seres queridos. La compasión y la responsabilidad emocional te guiarán hoy.' },
  7: { name: 'Sabiduría', desc: 'Tómate un momento para la introspección. Las respuestas que buscas llegan a través de la reflexión profunda.' },
  8: { name: 'Poder', desc: 'Tu energía de realización está en su apogeo. Es un día para tomar acción hacia tus ambiciones.' },
  9: { name: 'Humanidad', desc: 'Practica la generosidad y piensa en el bienestar colectivo. Tu compasión puede cambiar el mundo hoy.' },
};

const todayMeaning = computed(() => meanings[todayNumber.value] || meanings[9]);

onMounted(async () => {
  try {
    perfiles.value = await obtenerPerfiles();
  } catch {}
  try {
    lecturas.value = await obtenerLecturas();
  } catch {}
  try {
    compatibilidades.value = await obtenerCompatibilidades();
  } catch {}
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  background: var(--gradient-mystic);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.action-card {
  text-decoration: none;
  color: var(--text-primary);
  position: relative;
  padding: 28px;
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.action-card h4 {
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.action-card p {
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
}

.action-arrow {
  position: absolute;
  top: 28px;
  right: 24px;
  font-size: 1.2rem;
  color: var(--accent-purple-light);
  transition: transform var(--transition-fast);
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

.today-card {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 36px 40px;
}

.today-left {
  text-align: center;
  flex-shrink: 0;
}

.today-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-purple-light);
  margin-bottom: 8px;
}

.today-number {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-mystic);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  margin: 0 auto;
  box-shadow: var(--shadow-glow-strong);
}

.today-right h3 {
  margin-bottom: 8px;
  font-size: 1.3rem;
}

.today-right p {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .today-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}
</style>
