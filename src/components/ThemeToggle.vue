<template>
  <div class="theme-toggle">
    <button 
      @click="toggleTheme" 
      :aria-label="currentTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"
    >
      <span v-if="currentTheme === 'dark'">☀️</span>
      <span v-else>🌙</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { applyTheme } from '@/assets/design-tokens'

const currentTheme = ref('dark')

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  applyTheme(currentTheme.value)
  
  // Salvar preferência do usuário
  localStorage.setItem('app-theme', currentTheme.value)
}

onMounted(() => {
  // Recuperar tema salvo
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    applyTheme(savedTheme)
  }
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-toggle button {
  background: var(--background-midDark);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-medium);
}

.theme-toggle button:hover {
  transform: scale(1.1);
}

.theme-toggle button span {
  font-size: 24px;
}
</style>
