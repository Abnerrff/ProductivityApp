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
      <span class="sidebar-icon" :aria-label="item.label">
        <FontAwesomeIcon 
          :icon="['fas', getIconForItem(item.id)]" 
          aria-hidden="true" 
        />
      </span>
      <span class="sidebar-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const activeTab = ref('tasks')

const sidebarItems = [
  { id: 'tasks', label: 'Tarefas' },
  { id: 'projects', label: 'Projetos' },
  { id: 'statistics', label: 'Estatísticas' },
  { id: 'gamification', label: 'Conquistas' },
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'settings', label: 'Configurações' }
]

const getIconForItem = (itemId) => {
  const iconMap = {
    'tasks': 'list-check',
    'projects': 'folder-open',
    'statistics': 'chart-simple',
    'gamification': 'trophy',
    'pomodoro': 'clock',
    'settings': 'gear'
  }
  return iconMap[itemId] || 'home'
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

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 5px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sidebar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--text-color);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.sidebar-item:hover::before {
  opacity: 0.1;
}

.sidebar-item.active::before {
  opacity: 0.2;
}

.sidebar-item.active {
  color: var(--primary-color);
  font-weight: 600;
}

.sidebar-icon {
  margin-right: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  transition: transform 0.3s ease;
}

.sidebar-item:hover .sidebar-icon {
  transform: scale(1.1);
}

.sidebar-icon svg {
  font-size: 1.2em;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.sidebar-item:hover .sidebar-icon svg {
  color: var(--primary-color);
}

.sidebar-label {
  flex-grow: 1;
  font-size: 0.9em;
  transition: color 0.3s ease;
  color: var(--text-muted);
}

.sidebar-item:hover .sidebar-label {
  color: var(--text-color);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px;
  }

  .sidebar-item {
    flex-direction: column;
    align-items: center;
    padding: 8px;
    margin: 0 5px;
  }

  .sidebar-icon {
    margin-right: 0;
    margin-bottom: 5px;
  }

  .sidebar-label {
    font-size: 0.7em;
  }
}
</style>
