<template>
  <div class="page-container">
    <div class="section-header">
      <h2>👤 Mi Cuenta</h2>
      <p>Gestiona tu información personal</p>
    </div>

    <div class="account-grid">
      <!-- Profile Card -->
      <div class="card card-glow">
        <div class="account-avatar">
          <div class="avatar-circle">
            {{ initials }}
          </div>
          <h3>{{ user.nombreCompleto }}</h3>
          <p class="text-secondary">{{ user.email }}</p>
          <span class="badge badge-purple mt-2">Miembro</span>
        </div>

        <div class="account-stats">
          <div class="stat-item">
            <span class="stat-value">{{ user.nombreCompleto?.split(' ').length || 0 }}</span>
            <span class="stat-label">Nombres</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ daysSinceJoin }}</span>
            <span class="stat-label">Días activo</span>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="card card-glow">
        <h3 class="mb-3">✏️ Editar perfil</h3>

        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input v-model="form.nombreCompleto" class="form-input" placeholder="Tu nombre completo" />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="form.email" class="form-input" type="email" placeholder="tu@email.com" />
        </div>

        <div class="form-group">
          <label class="form-label">Fecha de nacimiento</label>
          <input v-model="form.fechaNacimiento" class="form-input" type="date" />
        </div>

        <div class="form-group">
          <label class="form-label">Nueva contraseña (dejar vacío para no cambiar)</label>
          <div class="password-wrapper">
            <input v-model="form.password" class="form-input" :type="showPass ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" />
            <button class="btn-toggle-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button class="btn btn-primary mt-2" @click="guardarCambios" :disabled="loading">
          {{ loading ? 'Guardando...' : '💾 Guardar cambios' }}
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card mt-4 danger-zone">
      <h3 class="mb-2">⚠️ Zona peligrosa</h3>
      <p class="text-secondary mb-3">Estas acciones son irreversibles</p>
      <div class="flex gap-2">
        <button class="btn btn-danger" @click="cerrarSesion">🚪 Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';
import { actualizarUsuario } from '../services/api.js';

const showToast = inject('showToast');
const router = useRouter();
const { state: authState, logout } = useAuth();

const loading = ref(false);
const showPass = ref(false);

const user = computed(() => authState.user || {});

const initials = computed(() => {
  const name = user.value.nombreCompleto || '';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
});

const daysSinceJoin = computed(() => {
  const created = user.value.createdAt ? new Date(user.value.createdAt) : new Date();
  return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
});

const form = reactive({
  nombreCompleto: '',
  email: '',
  fechaNacimiento: '',
  password: '',
});

onMounted(() => {
  form.nombreCompleto = user.value.nombreCompleto || '';
  form.email = user.value.email || '';
  form.fechaNacimiento = user.value.fechaNacimiento ? user.value.fechaNacimiento.split('T')[0] : '';
});

async function guardarCambios() {
  if (form.nombreCompleto.length < 3) {
    showToast('El nombre debe tener al menos 3 caracteres', 'error');
    return;
  }
  loading.value = true;
  try {
    const datos = { ...form };
    if (!datos.password) delete datos.password;
    const result = await actualizarUsuario(user.value.id || user.value._id, datos);
    authState.user = { ...authState.user, ...result };
    showToast('¡Perfil actualizado!', 'success');
  } catch (err) {
    showToast(err.message || 'Error al actualizar', 'error');
  } finally {
    loading.value = false;
  }
}

function cerrarSesion() {
  logout();
  router.push('/login');
  showToast('Sesión cerrada', 'success');
}
</script>

<style scoped>
.account-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
}

.account-avatar {
  text-align: center;
  padding: 20px 0;
}

.avatar-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--gradient-mystic);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  margin: 0 auto 16px;
  box-shadow: var(--shadow-glow-strong);
}

.account-avatar h3 {
  margin-bottom: 4px;
}

.account-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-purple-light);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 48px;
}

.btn-toggle-pass {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
}

.danger-zone {
  border-color: rgba(239, 68, 68, 0.3);
}

.danger-zone h3 {
  color: #ef4444;
}

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
