<template>
  <div class="page-container">
    <div class="section-header">
      <h2>🔢 Perfil Numerológico</h2>
      <p>Tus números revelan tu esencia interior</p>
    </div>

    <!-- Create Form -->
    <div class="card card-glow mb-4" v-if="!miPerfil">
      <h3 class="mb-2">✨ Calcular mi perfil</h3>
      <p class="mb-3" style="color: var(--text-secondary); font-size: 0.9rem;">
        Ingresa tus datos para calcular tu perfil numerológico automáticamente.
      </p>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha de nacimiento</label>
          <input v-model="fechaNac" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input v-model="nombreCompleto" type="text" class="form-input" placeholder="Tu nombre completo" />
        </div>
      </div>

      <div class="number-preview" v-if="fechaNac">
        <div class="preview-item">
          <span class="preview-label">Número de Vida</span>
          <span class="preview-value">{{ numeroVida }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Número de Expresión</span>
          <span class="preview-value">{{ numeroExpresion }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Número de Alma</span>
          <span class="preview-value">{{ numeroAlma }}</span>
        </div>
      </div>

      <button class="btn btn-primary mt-2" @click="crearMiPerfil" :disabled="loading">
        {{ loading ? 'Guardando...' : '💾 Guardar mi perfil' }}
      </button>
    </div>

    <!-- Profile Display -->
    <div v-if="miPerfil" class="profile-display">
      <div class="profile-main card card-glow">
        <h3 class="mb-2">✦ Tu Perfil Numerológico</h3>

        <div class="numbers-grid">
          <div class="number-box">
            <div class="number-circle-lg">{{ miPerfil.numeroVida }}</div>
            <h4>Número de Vida</h4>
            <p class="number-desc">{{ meanings[miPerfil.numeroVida]?.desc || 'Camino de vida único' }}</p>
            <span class="badge badge-purple">{{ meanings[miPerfil.numeroVida]?.name || '' }}</span>
          </div>

          <div class="number-box">
            <div class="number-circle-lg" style="background: linear-gradient(135deg, #47bfff, #7c3aed);">
              {{ miPerfil.numeroExpresion }}
            </div>
            <h4>Número de Expresión</h4>
            <p class="number-desc">{{ meanings[miPerfil.numeroExpresion]?.desc || 'Talento natural' }}</p>
            <span class="badge badge-blue">{{ meanings[miPerfil.numeroExpresion]?.name || '' }}</span>
          </div>

          <div class="number-box">
            <div class="number-circle-lg" style="background: linear-gradient(135deg, #e040fb, #7c3aed);">
              {{ miPerfil.numeroAlma }}
            </div>
            <h4>Número de Alma</h4>
            <p class="number-desc">{{ meanings[miPerfil.numeroAlma]?.desc || 'Deseo del alma' }}</p>
            <span class="badge badge-pink">{{ meanings[miPerfil.numeroAlma]?.name || '' }}</span>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <button class="btn btn-danger btn-sm" @click="eliminarMiPerfil">
          🗑️ Eliminar perfil
        </button>
      </div>
    </div>

    <!-- All profiles -->
    <div class="mt-4">
      <h3 class="mb-2">Todos los perfiles</h3>
      <div v-if="loadingList" class="loading-overlay"><div class="spinner"></div></div>
      <div v-else-if="perfiles.length === 0" class="empty-state">
        <div class="icon">🔢</div>
        <p>No hay perfiles numerológicos aún</p>
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>N° Vida</th>
              <th>N° Expresión</th>
              <th>N° Alma</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="perfil in perfiles" :key="perfil._id">
              <td>{{ perfil.usuario_id?.nombreCompleto || perfil.usuario_id }}</td>
              <td><span class="badge badge-purple">{{ perfil.numeroVida }}</span></td>
              <td><span class="badge badge-blue">{{ perfil.numeroExpresion }}</span></td>
              <td><span class="badge badge-pink">{{ perfil.numeroAlma }}</span></td>
              <td>
                <button class="btn btn-danger btn-sm" @click="eliminarPerfil(perfil._id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useAuth } from '../stores/auth.js';
import { obtenerPerfiles, crearPerfil, eliminarPerfil as apiEliminarPerfil } from '../services/api.js';

const showToast = inject('showToast');
const { state: authState } = useAuth();

const perfiles = ref([]);
const miPerfil = ref(null);
const loading = ref(false);
const loadingList = ref(false);
const fechaNac = ref('');
const nombreCompleto = ref('');

const meanings = {
  1: { name: 'Liderazgo', desc: 'Persona independiente, creativa y determinada. Líder natural con gran fuerza de voluntad.' },
  2: { name: 'Armonía', desc: 'Persona cooperativa, sensible y diplomática. Mediadora natural que busca el equilibrio.' },
  3: { name: 'Expresión', desc: 'Persona creativa, comunicativa y alegre. Artista natural con gran carisma.' },
  4: { name: 'Estabilidad', desc: 'Persona ordenada, trabajadora y constructora. Base sólida de toda gran obra.' },
  5: { name: 'Libertad', desc: 'Persona aventurera, versátil y libre. Espíritu inquieto que ama los cambios.' },
  6: { name: 'Amor', desc: 'Persona responsable, familiar y compasiva. Cuidadora del corazón y el hogar.' },
  7: { name: 'Sabiduría', desc: 'Persona analítica, introspectiva y espiritual. Buscadora incansable de la verdad.' },
  8: { name: 'Poder', desc: 'Persona ambiciosa, exitosa y realizadora. Gran capacidad para materializar metas.' },
  9: { name: 'Humanidad', desc: 'Persona generosa, idealista y altruista. Comprometida con el bienestar colectivo.' },
};

function reduceNumber(num) {
  while (num > 9) {
    num = num.toString().split('').reduce((a, b) => a + +b, 0);
  }
  return num || 9;
}

const numeroVida = computed(() => {
  if (!fechaNac.value) return '-';
  const parts = fechaNac.value.split('-');
  const sum = parts.reduce((a, p) => a + parseInt(p), 0);
  return reduceNumber(sum);
});

const numeroExpresion = computed(() => {
  if (!nombreCompleto.value.trim()) return '-';
  const letterValues = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };
  const sum = nombreCompleto.value.toLowerCase().replace(/[^a-z]/g, '').split('').reduce((a, l) => a + (letterValues[l] || 0), 0);
  return reduceNumber(sum);
});

const numeroAlma = computed(() => {
  if (!nombreCompleto.value.trim()) return '-';
  const vowels = { a:1, e:5, i:9, o:6, u:3 };
  const sum = nombreCompleto.value.toLowerCase().replace(/[^aeiou]/g, '').split('').reduce((a, l) => a + (vowels[l] || 0), 0);
  return reduceNumber(sum);
});

async function crearMiPerfil() {
  if (!fechaNac.value) {
    showToast('Ingresa tu fecha de nacimiento', 'error');
    return;
  }
  loading.value = true;
  try {
    const userId = authState.user?.id || authState.user?._id;
    const datos = {
      usuario_id: userId,
      numeroVida: numeroVida.value,
      numeroExpresion: numeroExpresion.value,
      numeroAlma: numeroAlma.value,
    };
    const result = await crearPerfil(datos);
    miPerfil.value = result;
    perfiles.value.push(result);
    showToast('¡Perfil numerológico creado!', 'success');
  } catch (err) {
    showToast(err.message || 'Error al crear perfil', 'error');
  } finally {
    loading.value = false;
  }
}

async function eliminarMiPerfil() {
  try {
    await apiEliminarPerfil(miPerfil.value._id);
    perfiles.value = perfiles.value.filter(p => p._id !== miPerfil.value._id);
    miPerfil.value = null;
    showToast('Perfil eliminado', 'success');
  } catch (err) {
    showToast(err.message || 'Error al eliminar', 'error');
  }
}

async function eliminarPerfil(id) {
  try {
    await apiEliminarPerfil(id);
    perfiles.value = perfiles.value.filter(p => p._id !== id);
    if (miPerfil.value?._id === id) miPerfil.value = null;
    showToast('Perfil eliminado', 'success');
  } catch (err) {
    showToast(err.message || 'Error al eliminar', 'error');
  }
}

onMounted(async () => {
  loadingList.value = true;
  try {
    perfiles.value = await obtenerPerfiles();
    const userId = authState.user?.id || authState.user?._id;
    miPerfil.value = perfiles.value.find(p => p.usuario_id?._id === userId || p.usuario_id === userId) || null;
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

.number-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
  padding: 20px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: var(--radius-md);
}

.preview-item {
  text-align: center;
}

.preview-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.preview-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-mystic);
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 12px;
}

.number-box {
  text-align: center;
}

.number-circle-lg {
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
  margin: 0 auto 14px;
  box-shadow: var(--shadow-glow-strong);
}

.number-box h4 {
  margin-bottom: 8px;
}

.number-desc {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 10px;
}

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .number-preview { grid-template-columns: 1fr; }
  .numbers-grid { grid-template-columns: 1fr; }
}
</style>
