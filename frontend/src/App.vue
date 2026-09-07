<template>
  <AppNavbar />
  <main class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <footer class="app-footer">
    <p>✦ Numerología — Descubre tu esencia numerológica ✦</p>
  </footer>
  <AppToast :message="toastMessage" :type="toastType" />
</template>

<script setup>
import { provide, ref } from 'vue';
import AppNavbar from './components/AppNavbar.vue';
import AppToast from './components/AppToast.vue';

const toastMessage = ref('');
const toastType = ref('success');

function showToast(msg, type = 'success') {
  toastMessage.value = '';
  setTimeout(() => {
    toastMessage.value = msg;
    toastType.value = type;
  }, 50);
}

provide('showToast', showToast);
</script>

<style scoped>
.main-content {
  flex: 1;
}

.app-footer {
  text-align: center;
  padding: 32px 24px;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border-color);
}
</style>
