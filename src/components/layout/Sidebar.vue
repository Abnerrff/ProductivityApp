<template>
  <div class="sidebar" role="navigation" aria-label="Menu Principal">
    <div 
      v-if="sidebarItems && sidebarItems.length > 0"
      class="sidebar-debug"
    >
      Total de itens: {{ sidebarItems.length }}
    </div>
    <div 
      v-for="item in sidebarItems" 
      :key="item.id"
      class="sidebar-item"
      :data-id="item.id"
      :class="{ active: activeTab === item.id }"
      @click="switchTab(item.id)"
      :aria-selected="activeTab === item.id"
    >
      <span 
        class="sidebar-icon" 
        v-html="getIconForItem(item.id)"
      ></span>
      <span class="sidebar-label">
        {{ item.label }}
      </span>
    </div>
    <div 
      v-if="!sidebarItems || sidebarItems.length === 0" 
      class="sidebar-error"
    >
      ERRO: Nenhum item de menu encontrado
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('tasks')

const sidebarItems = [
  { 
    id: 'tasks', 
    label: 'Tarefas', 
    route: '/tasks' 
  },
  { 
    id: 'projects', 
    label: 'Projetos', 
    route: '/projects' 
  },
  { 
    id: 'statistics', 
    label: 'Estatísticas', 
    route: '/statistics' 
  },
  { 
    id: 'gamification', 
    label: 'Gamificação', 
    route: '/gamification' 
  },
  { 
    id: 'agenda', 
    label: 'Agenda', 
    route: '/agenda' 
  },
  { 
    id: 'calendar', 
    label: 'Calendário', 
    route: '/calendar' 
  },
  { 
    id: 'pomodoro', 
    label: 'Pomodoro', 
    route: '/pomodoro' 
  },
  { 
    id: 'settings', 
    label: 'Configurações', 
    route: '/settings' 
  }
]

const getIconForItem = (itemId) => {
  const iconMap = {
    'tasks': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h6v2H3V5zm0 6h6v2H3v-2zm0 6h6v2H3v-2zM13 5h8v2h-8V5zm0 6h8v2h-8v-2zm0 6h8v2h-8v-2z"/>
    </svg>`,
    'statistics': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>`,
    'gamification': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.42 4.42h4.58l-3.7 2.68 1.42 4.42-3.7-2.68-3.7 2.68 1.42-4.42-3.7-2.68h4.58z"/>
    </svg>`,
    'agenda': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm0-13H5V5h14v1zM7 10h5v5H7z"/>
    </svg>`,
    'pomodoro': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>`,
    'settings': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.38.12-.58l-1.93-3.34c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.46.12.58l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.38-.12.58l1.93 3.34c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.93-3.34c.12-.22.07-.46-.12-.58l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>`,
    'projects': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-5h10v2H7zm3 0h4v2h-4z"/>
    </svg>`,
    'calendar': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-3-7H7v2h9zm-2-3H7v2h8zm0-2H7v2h8z"/>
    </svg>`
  }
  return iconMap[itemId] || ''
}

const switchTab = (tabName) => {
  console.log('Mudando tab:', tabName)
  activeTab.value = tabName
  
  // Encontrar a rota correspondente
  const selectedItem = sidebarItems.find(item => item.id === tabName)
  
  console.log('Item selecionado:', selectedItem)
  console.log('Itens disponíveis:', sidebarItems)
  
  if (selectedItem && selectedItem.route) {
    console.log('Navegando para rota:', selectedItem.route)
    router.push(selectedItem.route).then(() => {
      console.log('Navegação bem-sucedida')
    }).catch(err => {
      console.error('Erro ao navegar:', err)
      console.log('Detalhes do erro:', {
        tabName,
        selectedItem,
        route: selectedItem.route
      })
    })
  } else {
    console.warn('Rota não encontrada para:', tabName)
  }
  
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

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border: 1px solid transparent; /* Debug: adicionar borda */
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
  color: white;
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
