<script setup>
import { ref, onMounted, shallowRef, watch } from 'vue'
import { useSettingsStore } from './stores/settings'

import Navbar from './components/Navbar.vue'
import TaskManager from './components/TaskManager.vue'
import Gamification from './components/Gamification.vue'
import Settings from './components/Settings.vue'
import TaskStatistics from './components/TaskStatistics.vue'
import Pomodoro from './components/Pomodoro.vue'

console.log(' App.vue: Módulo carregado')

// Importação dinâmica do Font Awesome
const FontAwesomeIcon = ref(null)
const faIcons = ref({})

onMounted(async () => {
  try {
    const { FontAwesomeIcon: Icon } = await import('@fortawesome/vue-fontawesome')
    const { library } = await import('@fortawesome/fontawesome-svg-core')
    const icons = await import('@fortawesome/free-solid-svg-icons')
    
    const iconList = Object.keys(icons)
      .filter(key => key.startsWith('fa'))
      .map(key => icons[key])
    
    library.add(...iconList)
    
    FontAwesomeIcon.value = Icon
    faIcons.value = icons
    
    console.log(' Font Awesome carregado com sucesso!')
  } catch (error) {
    console.error('Erro ao carregar Font Awesome:', error)
  }
})

const settingsStore = useSettingsStore()
const activeTab = ref('tasks')
const showSettings = ref(false)

// Usar shallowRef para componentes para melhor performance
const currentComponent = shallowRef(null)

const sidebarItems = [
  { id: 'tasks', label: 'Tarefas' },
  { id: 'statistics', label: 'Estatísticas' },
  { id: 'gamification', label: 'Conquistas' },
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'settings', label: 'Configurações' }
]

const componentMap = {
  'tasks': TaskManager,
  'statistics': TaskStatistics,
  'gamification': Gamification,
  'pomodoro': Pomodoro,
  'settings': Settings
}

const getIconForItem = (itemId) => {
  const iconMap = {
    'tasks': 'list-check',
    'statistics': 'chart-simple',
    'gamification': 'trophy',
    'pomodoro': 'clock',
    'settings': 'gear'
  }
  return iconMap[itemId] || 'home'
}

// Observar mudanças na aba ativa
watch(activeTab, (newTab) => {
  console.log(` Aba ativa mudou para: ${newTab}`)
  try {
    showSettings.value = newTab === 'settings'
    currentComponent.value = componentMap[newTab]
    console.log(' Componente atual:', currentComponent.value)
  } catch (error) {
    console.error('Erro ao atualizar componente:', error)
  }
})

onMounted(() => {
  console.log(' App.vue: Componente montado')
  
  // Aplicar tema inicial
  settingsStore.applyTheme()
  
  // Aplicar tamanho da fonte
  settingsStore.applyFontSize()

  // Definir componente inicial
  currentComponent.value = componentMap[activeTab.value]
  console.log(' Componente inicial:', currentComponent.value)
})

const switchTab = (tabId) => {
  console.log(` Mudando para aba: ${tabId}`)
  try {
    activeTab.value = tabId
    showSettings.value = tabId === 'settings'
    
    // Atualizar componente atual
    currentComponent.value = componentMap[tabId]
    
    console.log(' Componente atual após mudança:', currentComponent.value)
  } catch (error) {
    console.error('Erro ao mudar de aba:', error)
  }
}

// Método de tratamento de erro global
const handleComponentError = (error) => {
  console.error(' Erro global no componente:', error)
  // Você pode adicionar lógica para mostrar uma mensagem de erro ao usuário
}
</script>

<template>
  <div class="app-container">
    <div class="sidebar">
      <div 
        v-for="item in sidebarItems" 
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeTab === item.id }"
        @click="switchTab(item.id)"
      >
        <span class="sidebar-icon">
          <i :class="`fas fa-${getIconForItem(item.id)}`"></i>
        </span>
        <span class="sidebar-label">{{ item.label }}</span>
      </div>
    </div>
    
    <div class="main-content">
      <Navbar />
      
      <div class="content-area">
        <Suspense>
          <template #default>
            <component 
              :is="currentComponent" 
              :key="activeTab"
              @error="handleComponentError"
            />
          </template>
          <template #fallback">
            <div>Carregando...</div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  display: flex;
  height: 100vh;
  background-color: var(--background-darkest);
  color: var(--text-color);
  transition: all 0.3s ease;
  overflow: hidden;
}

.main-content {
  flex-grow: 1;
  background-color: var(--background-darkest);
  color: var(--text-color);
  overflow-y: auto;
  padding: 20px;
}

.content-area {
  background-color: var(--background-darker);
  border-radius: 10px;
  padding: 20px;
  color: var(--text-color);
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  box-shadow: var(--shadow-medium);
  border: none;
}

.sidebar {
  width: 250px;
  min-width: 250px;
  background-color: var(--sidebar-background);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 5px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s, box-shadow 0.3s, border 0.3s;
  background-color: var(--background-mid-dark);
  width: calc(100% - 40px);
  color: var(--text-color);
  box-shadow: var(--shadow-subtle);
  border: 1px solid rgba(255,255,255,0.2);
}

.sidebar-item:hover {
  background-color: var(--background-dark);
  box-shadow: var(--shadow-medium);
  border-color: rgba(255,255,255,0.4);
}

.sidebar-item.active {
  background-color: var(--primary-color);
  color: var(--background-darkest);
  box-shadow: var(--shadow-strong);
  border-color: rgba(255,255,255,0.6);
}

.sidebar-icon {
  margin-right: 15px;
}

.sidebar-label {
  flex-grow: 1;
}
</style>
