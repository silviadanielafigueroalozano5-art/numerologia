<template>
  <div class="page-container">
    <div class="section-header">
      <div class="flex justify-between items-center">
        <div>
          <h2>🔮 Lecturas</h2>
          <p>Tus lecturas numerológicas personalizadas</p>
        </div>
        <button class="btn btn-primary" @click="showForm = !showForm">
          {{ showForm ? '✕ Cerrar' : '+ Nueva lectura' }}
        </button>
      </div>
    </div>

    <!-- Create Form -->
    <div v-if="showForm" class="card card-glow mb-4">
      <h3 class="mb-2">Crear lectura</h3>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tipo de lectura</label>
          <select v-model="form.tipoLectura" class="form-select">
            <option value="diaria">📖 Diaria</option>
            <option value="general">🌟 General</option>
            <option value="anual">📅 Anual</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tu consulta</label>
          <input v-model="form.prompt" class="form-input" placeholder="¿Qué deseas saber?" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Respuesta / Interpretación</label>
        <textarea v-model="form.respuesta" class="form-input form-textarea" placeholder="Escribe la interpretación numerológica..." rows="4"></textarea>
      </div>
      <button class="btn btn-primary" @click="crearLectura" :disabled="loading">
        {{ loading ? 'Guardando...' : '💾 Guardar lectura' }}
      </button>
    </div>

    <!-- Lecturas List -->
    <div v-if="loadingList" class="loading-overlay"><div class="spinner"></div></div>
    <div v-else-if="lecturas.length === 0" class="empty-state">
      <div class="icon">🔮</div>
      <p>No tienes lecturas aún</p>
      <button class="btn btn-primary" @click="showForm = true">Crear primera lectura</button>
    </div>
    <div v-else class="lecturas-grid">
      <div v-for="lectura in lecturas" :key="lectura._id" class="lectura-card card card-glow">
        <div class="lectura-header">
          <span class="badge" :class="tipoBadge(lectura.tipoLectura)">
            {{ tipoIcon(lectura.tipoLectura) }} {{ lectura.tipoLectura }}
          </span>
          <span class="lectura-date">{{ formatDate(lectura.fecha) }}</span>
        </div>
        <div class="lectura-body">
          <h4>Consulta</h4>
          <p class="lectura-prompt">{{ lectura.prompt }}</p>
          <h4 class="mt-2">Interpretación</h4>
          <p class="lectura-respuesta">{{ lectura.respuesta }}</p>
        </div>
        <div class="lectura-actions">
          <button class="btn btn-ghost btn-sm" @click="editarLectura(lectura)">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" @click="eliminarLectura(lectura._id)">🗑️</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editModal" class="modal-overlay" @click.self="editModal = null">
      <div class="modal card">
        <h3 class="mb-3">✏️ Editar lectura</h3>
        <div class="form-group">
          <label class="form-label">Tipo de lectura</label>
          <select v-model="editForm.tipoLectura" class="form-select">
            <option value="diaria">📖 Diaria</option>
            <option value="general">🌟 General</option>
            <option value="anual">📅 Anual</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Consulta</label>
          <input v-model="editForm.prompt" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Respuesta</label>
          <textarea v-model="editForm.respuesta" class="form-input form-textarea" rows="4"></textarea>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" @click="guardarEdicion" :disabled="loading">Guardar</button>
          <button class="btn btn-ghost" @click="editModal = null">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue';
import { useAuth } from '../stores/auth.js';
import { obtenerLecturas, crearLectura as apiCrear, actualizarLectura as apiActualizar, eliminarLectura as apiEliminar } from '../services/api.js';

const showToast = inject('showToast');
const { state: authState } = useAuth();

const lecturas = ref([]);
const loading = ref(false);
const loadingList = ref(false);
const showForm = ref(false);
const editModal = ref(null);

const form = reactive({
  tipoLectura: 'diaria',
  prompt: '',
  respuesta: '',
});

const editForm = reactive({
  tipoLectura: '',
  prompt: '',
  respuesta: '',
});

function tipoIcon(tipo) {
  return { diaria: '📖', general: '🌟', anual: '📅' }[tipo] || '🔮';
}

function tipoBadge(tipo) {
  return { diaria: 'badge-purple', general: 'badge-blue', anual: 'badge-gold' }[tipo] || 'badge-purple';
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function crearLectura() {
  if (!form.prompt || !form.respuesta) {
    showToast('Completa la consulta y la respuesta', 'error');
    return;
  }
  loading.value = true;
  try {
    const userId = authState.user?.id || authState.user?._id;
    const result = await apiCrear({
      usuario_id: userId,
      tipoLectura: form.tipoLectura,
      prompt: form.prompt,
      respuesta: form.respuesta,
    });
    lecturas.value.unshift(result);
    form.prompt = '';
    form.respuesta = '';
    showForm.value = false;
    showToast('¡Lectura creada!', 'success');
  } catch (err) {
    showToast(err.message || 'Error al crear lectura', 'error');
  } finally {
    loading.value = false;
  }
}

function editarLectura(lectura) {
  editModal.value = lectura;
  editForm.tipoLectura = lectura.tipoLectura;
  editForm.prompt = lectura.prompt;
  editForm.respuesta = lectura.respuesta;
}

async function guardarEdicion() {
  loading.value = true;
  try {
    const result = await apiActualizar(editModal.value._id, {
      ...editForm,
      usuario_id: editModal.value.usuario_id?._id || editModal.value.usuario_id,
    });
    const idx = lecturas.value.findIndex(l => l._id === editModal.value._id);
    if (idx !== -1) lecturas.value[idx] = result;
    editModal.value = null;
    showToast('Lectura actualizada', 'success');
  } catch (err) {
    showToast(err.message || 'Error al actualizar', 'error');
  } finally {
    loading.value = false;
  }
}

async function eliminarLectura(id) {
  if (!confirm('¿Eliminar esta lectura?')) return;
  try {
    await apiEliminar(id);
    lecturas.value = lecturas.value.filter(l => l._id !== id);
    showToast('Lectura eliminada', 'success');
  } catch (err) {
    showToast(err.message || 'Error al eliminar', 'error');
  }
}

onMounted(async () => {
  loadingList.value = true;
  try {
    lecturas.value = await obtenerLecturas();
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
  min-height: 100px;
}

.lecturas-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.lectura-card {
  position: relative;
}

.lectura-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.lectura-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.lectura-body h4 {
  font-size: 0.85rem;
  color: var(--accent-purple-light);
  margin-bottom: 6px;
}

.lectura-prompt {
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 10px 14px;
  background: rgba(124, 58, 237, 0.06);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.lectura-respuesta {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 12px 16px;
  background: rgba(71, 191, 255, 0.05);
  border-left: 3px solid var(--accent-blue);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.lectura-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  max-width: 500px;
  width: 100%;
}

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
