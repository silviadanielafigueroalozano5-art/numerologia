<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">
        <span class="brand-icon">✦</span>
        <span class="brand-text">Numerología</span>
      </router-link>

      <div class="navbar-links" :class="{ open: menuOpen }">
        <template v-if="isAuthenticated()">
          <router-link to="/dashboard" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">📊</span> Dashboard
          </router-link>
          <router-link to="/perfil-numerologico" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">🔢</span> Perfil
          </router-link>
          <router-link to="/lecturas" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">🔮</span> Lecturas
          </router-link>
          <router-link to="/compatibilidad" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">💕</span> Compatibilidad
          </router-link>
          <router-link to="/cuenta" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">👤</span> Mi Cuenta
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">🔑</span> Iniciar sesión
          </router-link>
          <router-link to="/registro" class="nav-link" @click="menuOpen = false">
            <span class="nav-icon">✨</span> Registrarse
          </router-link>
        </template>
      </div>

      <div v-if="isAuthenticated()" class="navbar-user">
        <button class="btn btn-ghost btn-sm" @click="logout">
          Cerrar sesión
        </button>
      </div>

      <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ active: menuOpen }">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth.js';

const { isAuthenticated, logout: authLogout } = useAuth();
const router = useRouter();
const menuOpen = ref(false);

function logout() {
  authLogout();
  router.push('/');
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  padding: 0 24px;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.6rem;
  background: var(--gradient-mystic);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-text {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: var(--gradient-mystic);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(124, 58, 237, 0.08);
}

.nav-link.router-link-active {
  color: var(--accent-purple-light);
  background: rgba(124, 58, 237, 0.12);
}

.nav-icon {
  font-size: 1rem;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 768px) {
  .hamburger { display: flex; }

  .navbar-links {
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    background: rgba(10, 10, 26, 0.97);
    backdrop-filter: blur(20px);
    padding: 16px;
    flex-direction: column;
    gap: 4px;
    border-bottom: 1px solid var(--border-color);
    transform: translateY(-120%);
    transition: transform var(--transition-normal);
  }

  .navbar-links.open {
    transform: translateY(0);
  }

  .nav-link {
    padding: 12px 16px;
    width: 100%;
  }

  .navbar-user { display: none; }
}
</style>
