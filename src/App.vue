<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from './stores/settings'

import Navbar from './components/Navbar.vue'
import TaskManager from './components/TaskManager.vue'
import Gamification from './components/Gamification.vue'
import Settings from './components/Settings.vue'
import TaskStatistics from './components/TaskStatistics.vue'
import Pomodoro from './components/Pomodoro.vue'
import ProjectTracker from './components/ProjectTracker.vue'

const settingsStore = useSettingsStore()
const activeTab = ref('tasks')
const showSettings = ref(false)

const sidebarItems = [
  { 
    id: 'tasks', 
    icon: '', 
    label: 'Tarefas' 
  },
  { 
    id: 'projects', 
    icon: '', 
    label: 'Projetos' 
  },
  { 
    id: 'statistics', 
    icon: '', 
    label: 'Estatísticas' 
  },
  { 
    id: 'gamification', 
    icon: '', 
    label: 'Conquistas' 
  },
  { 
    id: 'pomodoro', 
    icon: '', 
    label: 'Pomodoro' 
  },
  { 
    id: 'settings', 
    icon: '', 
    label: 'Configurações' 
  }
]

onMounted(() => {
  // Aplicar tema inicial
  settingsStore.applyTheme()
  
  // Aplicar tamanho da fonte
  settingsStore.applyFontSize()
})

const switchTab = (tabId) => {
  activeTab.value = tabId
  showSettings.value = tabId === 'settings'
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
        <span>{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </div>
    </div>
    
    <div class="main-content">
      <Navbar />
      
      <div class="content-area">
        <TaskManager v-if="activeTab === 'tasks'" />
        <ProjectTracker v-else-if="activeTab === 'projects'" />
        <TaskStatistics v-else-if="activeTab === 'statistics'" />
        <Gamification v-else-if="activeTab === 'gamification'" />
        <Pomodoro v-else-if="activeTab === 'pomodoro'" />
        <Settings v-else-if="showSettings" />
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  display: flex;
  height: 100vh;
  background-color: var(--background-darker);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.sidebar {
  width: 250px;
  min-width: 250px;
  background-color: var(--background-dark);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  border-right: 1px solid var(--border-color);
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 8px;
  background-color: var(--background-mid-dark);
  width: calc(100% - 40px);
}

.sidebar-item:hover {
  background-color: var(--background-darker);
}

.sidebar-item.active {
  background-color: var(--background-darker);
  color: var(--primary-color);
}

.sidebar-item span:first-child {
  margin-right: 10px;
  font-size: 1.2em;
}

.sidebar-item span:last-child {
  flex-grow: 1;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--background-darker);
}

.content-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
}
</style>
