<template>
  <div class="auth-page">
    <div class="auth-card card card-glow">
      <div class="auth-header">
        <div class="auth-icon">✨</div>
        <h2>Crear cuenta</h2>
        <p>Únete y descubre tu perfil numerológico</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input
            v-model="form.nombreCompleto"
            type="text"
            class="form-input"
            placeholder="Tu nombre completo"
            required
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Fecha de nacimiento</label>
          <input
            v-model="form.fechaNacimiento"
            type="date"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <div class="password-wrapper">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Mínimo 6 caracteres"
              required
              minlength="6"
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirmar contraseña</label>
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Repite tu contraseña"
            required
          />
        </div>

        <div v-if="error" class="form-error">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
          <span v-if="loading" class="spinner-sm"></span>
          {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';

const { register } = useAuth();
const router = useRouter();
const showToast = inject('showToast');

const form = reactive({
  nombreCompleto: '',
  email: '',
  password: '',
  fechaNacimiento: '',
});

const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

async function handleRegister() {
  error.value = '';

  if (form.password !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  loading.value = true;
  try {
    await register(form.nombreCompleto, form.email, form.password, form.fechaNacimiento);
    showToast('¡Cuenta creada exitosamente! Ahora inicia sesión.', 'success');
    router.push('/login');
  } catch (err) {
    error.value = err.message || 'Error al crear la cuenta';
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 68px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.auth-header h2 {
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 48px;
}

.toggle-pw {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 8px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.auth-footer p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--accent-purple-light);
  font-weight: 600;
}
</style>
