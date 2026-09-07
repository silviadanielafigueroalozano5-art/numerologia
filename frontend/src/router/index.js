import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('../views/RegistroView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/perfil-numerologico',
    name: 'PerfilNumerologico',
    component: () => import('../views/PerfilNumerologicoView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/lecturas',
    name: 'Lecturas',
    component: () => import('../views/LecturasView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/compatibilidad',
    name: 'Compatibilidad',
    component: () => import('../views/CompatibilidadView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cuenta',
    name: 'Cuenta',
    component: () => import('../views/CuentaView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
});

export default router;
