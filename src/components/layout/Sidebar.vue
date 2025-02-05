<template>
  <div class="sidebar" role="navigation" aria-label="Menu Principal">
    <div 
      v-for="item in sidebarItems" 
      :key="item.id"
      class="sidebar-item"
      :class="{ active: activeTab === item.id }"
      @click="switchTab(item.id)"
      :aria-selected="activeTab === item.id"
    >
      <span 
        class="sidebar-icon" 
        v-html="getIconForItem(item.id)"
      ></span>
      <span class="sidebar-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const activeTab = ref('tasks')

const sidebarItems = [
  { 
    id: 'tasks', 
    label: 'Tarefas'
  },
  { 
    id: 'projects', 
    label: 'Projetos'
  },
  { 
    id: 'statistics', 
    label: 'Estatísticas'
  },
  { 
    id: 'gamification', 
    label: 'Conquistas'
  },
  { 
    id: 'pomodoro', 
    label: 'Pomodoro'
  },
  { 
    id: 'settings', 
    label: 'Configurações'
  }
]

const getIconForItem = (itemId) => {
  const iconMap = {
    'tasks': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h6v2H3V5zm0 6h6v2H3v-2zm0 6h6v2H3v-2zM13 5h8v2h-8V5zm0 6h8v2h-8v-2zm0 6h8v2h-8v-2z"/>
    </svg>`,
    'projects': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
    </svg>`,
    'statistics': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>`,
    'gamification': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.42 4.42h4.58l-3.7 2.68 1.42 4.42-3.7-2.68-3.7 2.68 1.42-4.42-3.7-2.68h4.58z"/>
    </svg>`,
    'pomodoro': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>`,
    'settings': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.38.12-.58l-1.93-3.34c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.46.12.58l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.38-.12.58l1.93 3.34c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.93-3.34c.12-.22.07-.46-.12-.58l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>`
  }
  return iconMap[itemId] || ''
}

const switchTab = (tabName) => {
  activeTab.value = tabName
  // Emitir evento para componente pai
  emit('tab-changed', tabName)
}

const emit = defineEmits(['tab-changed'])
</script>

<style scoped>
.sidebar {
  background-color: var(--sidebar-background);
  color: var(--text-color);
  width: 250px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  border-right: 1px solid var(--border-color);
  box-shadow: -2px 0 15px var(--shadow-color);
  transition: all 0.3s ease;
}

.sidebar-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.sidebar-icon svg {
  width: 100%;
  height: 100%;
  color: white;  /* Garantir que seja branco */
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.sidebar-label {
  margin-left: 10px;
}

.sidebar-item.active {
  color: var(--primary-color);
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    flex-direction: row;
  }

  .sidebar-item {
    flex-direction: column;
    align-items: center;
  }

  .sidebar-label {
    margin-left: 0;
    margin-top: 5px;
  }
}
</style>
