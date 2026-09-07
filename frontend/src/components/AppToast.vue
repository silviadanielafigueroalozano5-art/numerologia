<template>
  <Transition name="slide-toast">
    <div v-if="visible" class="toast" :class="`toast-${type}`">
      <span class="toast-icon">{{ iconMap[type] }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: String,
  type: { type: String, default: 'success' },
  duration: { type: Number, default: 3000 },
});

const visible = ref(false);
let timeout = null;

const iconMap = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true;
    clearTimeout(timeout);
    timeout = setTimeout(() => { visible.value = false; }, props.duration);
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  top: 80px;
  right: 24px;
  padding: 14px 22px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-card);
  max-width: 400px;
}

.toast-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.toast-error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.toast-icon {
  font-size: 1.1rem;
}

.slide-toast-enter-active,
.slide-toast-leave-active {
  transition: all 0.4s ease;
}

.slide-toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
