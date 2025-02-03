<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const themes = [
  { value: 'light', name: 'Claro' },
  { value: 'dark', name: 'Escuro' }
]

const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'en-US', name: 'English (US)' }
]

onMounted(() => {
  // Garantir que as configurações sejam aplicadas ao montar o componente
  settingsStore.loadSettings()
})
</script>

<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>Configurações</h1>
    </div>
    
    <div class="settings-content">
      <div class="settings-section">
        <h2>Aparência</h2>
        
        <div class="setting-group">
          <div class="setting-item">
            <label>Tema</label>
            <select 
              :value="settingsStore.theme"
              @change="settingsStore.setTheme($event.target.value)"
            >
              <option 
                v-for="theme in themes" 
                :key="theme.value" 
                :value="theme.value"
              >
                {{ theme.name }}
              </option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>Tamanho da Fonte</label>
            <input 
              type="range" 
              :value="settingsStore.fontSize"
              min="12" 
              max="24"
              @input="settingsStore.setFontSize(Number($event.target.value))"
            >
            <span>{{ settingsStore.fontSize }}px</span>
          </div>
          
          <div class="setting-item">
            <label>Modo Compacto</label>
            <input 
              type="checkbox" 
              :checked="settingsStore.compactMode"
              @change="settingsStore.toggleCompactMode()"
            >
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h2>Preferências</h2>
        
        <div class="setting-group">
          <div class="setting-item">
            <label>Idioma</label>
            <select 
              :value="settingsStore.language"
              @change="settingsStore.setLanguage($event.target.value)"
              disabled
            >
              <option 
                v-for="lang in languages" 
                :key="lang.code" 
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>Notificações</label>
            <input 
              type="checkbox" 
              :checked="settingsStore.notifications"
              @change="settingsStore.toggleNotifications()"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
  border-radius: 8px;
}

.settings-header {
  text-align: center;
  margin-bottom: 20px;
}

.settings-section {
  margin-bottom: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-weight: bold;
}

select, input[type="range"], input[type="checkbox"] {
  cursor: pointer;
}

select {
  padding: 5px;
  border-radius: 4px;
  background-color: var(--background-light);
  color: var(--text-color);
}

input[type="range"] {
  flex-grow: 1;
  margin: 0 10px;
}
</style>
