import { reactive } from 'vue';
import { login as apiLogin, register as apiRegister, obtenerUsuario } from '../services/api.js';

const state = reactive({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
});

export function useAuth() {
  function setAuth(token, user) {
    state.token = token;
    state.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  function clearAuth() {
    state.token = null;
    state.user = null;
    state.error = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function login(email, password) {
    state.loading = true;
    state.error = null;
    try {
      const data = await apiLogin(email, password);
      setAuth(data.token, { email });
      return data;
    } catch (err) {
      state.error = err.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      state.loading = false;
    }
  }

  async function register(nombreCompleto, email, password, fechaNacimiento) {
    state.loading = true;
    state.error = null;
    try {
      const data = await apiRegister(nombreCompleto, email, password, fechaNacimiento);
      return data;
    } catch (err) {
      state.error = err.message || 'Error al registrarse';
      throw err;
    } finally {
      state.loading = false;
    }
  }

  function logout() {
    clearAuth();
  }

  const isAuthenticated = () => !!state.token;

  return {
    state,
    login,
    register,
    logout,
    isAuthenticated,
  };
}
