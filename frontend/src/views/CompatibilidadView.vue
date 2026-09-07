<template>
  <div class="page-container">
    <div class="section-header">
      <div class="flex justify-between items-center">
        <div>
          <h2>💕 Compatibilidad</h2>
          <p>Descubre la armonía numerológica entre dos personas</p>
        </div>
        <button class="btn btn-primary" @click="showForm = !showForm">
          {{ showForm ? '✕ Cerrar' : '+ Nueva compatibilidad' }}
        </button>
      </div>
    </div>

    <!-- Calculator -->
    <div v-if="showForm" class="card card-glow mb-4">
      <h3 class="mb-2">✨ Calcular compatibilidad</h3>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Persona 1 - Fecha de nacimiento</label>
          <input v-model="fecha1" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Persona 2 - Fecha de nacimiento</label>
          <input v-model="fecha2" type="date" class="form-input" />
        </div>
      </div>

      <div v-if="fecha1 && fecha2" class="compat-preview">
        <div class="compat-person">
          <div class="compat-circle">{{ numVida1 }}</div>
          <span class="compat-label">Persona 1</span>
        </div>
        <div class="compat-heart">💕</div>
        <div class="compat-person">
          <div class="compat-circle" style="background: linear-gradient(135deg, #47bfff, #7c3aed);">
            {{ numVida2 }}
          </div>
          <span class="compat-label">Persona 2</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Interpretación</label>
        <textarea v-model="form.interpretacionIA" class="form-input form-textarea" 
          :placeholder="fecha1 && fecha2 ? 'Compatibilidad entre ' + numVida1 + ' y ' + numVida2 + '...' : 'Escribe la interpretación...'"
          rows="3"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Puntaje (0-100)</label>
        <div class="score-input">
          <input v-model.number="form.puntaje" type="range" min="0" max="100" class="score-slider" />
          <span class="score-value">{{ form.puntaje }}%</span>
        </div>
      </div>

      <button class="btn btn-primary" @click="crearCompatibilidad" :disabled="loading">
        {{ loading ? 'Guardando...' : '💾 Guardar' }}
      </button>
    </div>

    <!-- List -->
    <div v-if="loadingList" class="loading-overlay"><div class="spinner"></div></div>
    <div v-else-if="compatibilidades.length === 0" class="empty-state">
      <div class="icon">💕</div>
      <p>No hay compatibilidades calculadas</p>
      <button class="btn btn-primary" @click="showForm = true">Calcular compatibilidad</button>
    </div>
    <div v-else class="compat-grid">
      <div v-for="comp in compatibilidades" :key="comp._id" class="compat-result-card card card-glow">
        <div class="compat-result-header">
          <div class="compat-result-person">
            <span class="person-name">{{ comp.usuario1_id?.nombreCompleto || 'Persona 1' }}</span>
          </div>
          <span class="compat-x">✕</span>
          <div class="compat-result-person">
            <span class="person-name">{{ comp.usuario2_id?.nombreCompleto || 'Persona 2' }}</span>
          </div>
        </div>

        <div class="score-display">
          <div class="score-circle" :style="scoreStyle(comp.puntaje)">
            {{ Math.round(comp.puntaje) }}%
          </div>
          <span class="score-label">{{ scoreLabel(comp.puntaje) }}</span>
        </div>

        <div class="compat-interpretation">
          <p>{{ comp.interpretacionIA }}</p>
        </div>

        <div class="compat-actions">
          <button class="btn btn-danger btn-sm" @click="eliminarComp(comp._id)">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue';
import { useAuth } from '../stores/auth.js';
import { obtenerCompatibilidades, crearCompatibilidad as apiCrear, eliminarCompatibilidad as apiEliminar } from '../services/api.js';

const showToast = inject('showToast');
const { state: authState } = useAuth();

const compatibilidades = ref([]);
const loading = ref(false);
const loadingList = ref(false);
const showForm = ref(false);
const fecha1 = ref('');
const fecha2 = ref('');

const form = reactive({
  puntaje: 75,
  interpretacionIA: '',
});

function reduceNumber(num) {
  while (num > 9) {
    num = num.toString().split('').reduce((a, b) => a + +b, 0);
  }
  return num || 9;
}

const numVida1 = computed(() => {
  if (!fecha1.value) return '-';
  const sum = fecha1.value.split('-').reduce((a, p) => a + parseInt(p), 0);
  return reduceNumber(sum);
});

const numVida2 = computed(() => {
  if (!fecha2.value) return '-';
  const sum = fecha2.value.split('-').reduce((a, p) => a + parseInt(p), 0);
  return reduceNumber(sum);
});

function scoreLabel(score) {
  if (score >= 80) return '🔥 Excelente compatibilidad';
  if (score >= 60) return '💫 Buena compatibilidad';
  if (score >= 40) return '🔄 Compatibilidad moderada';
  return '⚡ Compatibilidad desafiante';
}

function scoreStyle(score) {
  const hue = score >= 80 ? '120' : score >= 60 ? '60' : score >= 40 ? '30' : '0';
  return {
    background: 'hsl(' + hue + ', 80%, 55%)',
    boxShadow: '0 0 20px hsla(' + hue + ', 80%, 55%, 0.4)',
  };
}

async function crearCompatibilidad() {
  loading.value = true;
  try {
    const userId = authState.user?.id || authState.user?._id;
    const result = await apiCrear({
      usuario1_id: userId,
      usuario2_id: userId,
      puntaje: form.puntaje,
      interpretacionIA: form.interpretacionIA || 'Compatibilidad entre números de vida ' + numVida1.value + ' y ' + numVida2.value,
    });
    compatibilidades.value.unshift(result);
    showForm.value = false;
    form.puntaje = 75;
    form.interpretacionIA = '';
    showToast('¡Compatibilidad guardada!', 'success');
  } catch (err) {
    showToast(err.message || 'Error al guardar', 'error');
  } finally {
    loading.value = false;
  }
}

async function eliminarComp(id) {
  if (!confirm('¿Eliminar esta compatibilidad?')) return;
  try {
    await apiEliminar(id);
    compatibilidades.value = compatibilidades.value.filter(c => c._id !== id);
    showToast('Eliminada', 'success');
  } catch (err) {
    showToast(err.message || 'Error al eliminar', 'error');
  }
}

onMounted(async () => {
  loadingList.value = true;
  try {
    compatibilidades.value = await obtenerCompatibilidades();
  } catch {}
  loadingList.value = false;
});
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.compat-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 28px;
  margin-bottom: 20px;
  background: rgba(124, 58, 237, 0.06);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(124, 58, 237, 0.15);
}

.compat-person {
  text-align: center;
}

.compat-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--gradient-mystic);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  margin: 0 auto 8px;
}

.compat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.compat-heart {
  font-size: 2rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.score-input {
  display: flex;
  align-items: center;
  gap: 16px;
}

.score-slider {
  flex: 1;
  accent-color: var(--accent-purple);
  height: 6px;
}

.score-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent-purple-light);
  min-width: 60px;
  text-align: right;
}

.compat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.compat-result-card {
  text-align: center;
}

.compat-result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.compat-result-person {
  text-align: center;
}

.person-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.compat-x {
  color: var(--accent-pink);
  font-size: 1rem;
}

.score-display {
  margin-bottom: 16px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 8px;
}

.score-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.compat-interpretation p {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
  padding: 12px;
  background: rgba(124, 58, 237, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.compat-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .compat-grid { grid-template-columns: 1fr; }
}
</style>
