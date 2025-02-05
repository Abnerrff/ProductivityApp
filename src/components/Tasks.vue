<template>
  <div class="tasks-container fade-in">
    <div class="tasks-header">
      <div class="header-content">
        <h2>Tarefas Diárias</h2>
        <div class="task-stats">
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">{{ taskStore.stats.dailyStreak }} dias</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">{{ taskStore.stats.totalPoints }} pts</span>
          </div>
        </div>
      </div>
    </div>

    <div class="task-input-area">
      <div class="input-wrapper">
        <input 
          v-model="newTaskTitle" 
          @keyup.enter="addNewTask"
          placeholder="Adicionar nova tarefa"
          class="task-input"
        />
        <select 
          v-model="newTaskCategory" 
          class="category-select"
        >
          <option 
            v-for="category in taskStore.DEFAULT_CATEGORIES" 
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
        <button 
          @click="addNewTask" 
          class="add-task-btn"
          :disabled="!newTaskTitle.trim()"
        >
          <span>➕</span>
          Adicionar
        </button>
      </div>
    </div>

    <div class="tasks-list">
      <div 
        v-for="task in taskStore.tasks.value" 
        :key="task.id"
        class="task-item"
        v-bind:class="{ 
          'completed-task': task.completed, 
          'difficulty-easy': task.difficulty === 'Fácil',
          'difficulty-medium': task.difficulty === 'Média',
          'difficulty-hard': task.difficulty === 'Difícil',
          'debug-task': true 
        }"
        @click="() => console.log('Task classes:', task.difficulty, task.completed)"
      >
        <div class="task-checkbox">
          <input 
            type="checkbox" 
            v-model="task.completed"
            @change="() => {
              console.log('Checkbox changed for task:', task);
              toggleTask(task.id);
            }"
          />
        </div>
        <div class="task-details">
          <span 
            class="task-text"
            @click="() => console.log('Task text:', task.title, task.difficulty, task.completed)"
          >
            {{ task.title }}
          </span>
          <span class="task-category">{{ task.category }}</span>
        </div>
        <div class="task-actions">
          <button 
            @click="moveTaskUp(task.id)"
            class="move-btn"
            title="Mover para cima"
          >
            ⬆️
          </button>
          <button 
            @click="moveTaskDown(task.id)"
            class="move-btn"
            title="Mover para baixo"
          >
            ⬇️
          </button>
          <button 
            @click="removeTask(task.id)"
            class="delete-btn"
            title="Excluir tarefa"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

// Inicializar store de tarefas
const taskStore = useTaskStore()

// Estados locais
const newTaskTitle = ref('')
const newTaskCategory = ref('Outros')

// Métodos
const addNewTask = () => {
  if (newTaskTitle.value.trim()) {
    taskStore.addTask(
      newTaskTitle.value, 
      newTaskCategory.value
    )
    newTaskTitle.value = ''
  }
}

const toggleTask = (taskId) => {
  taskStore.toggleTask(taskId)
}

const removeTask = (taskId) => {
  taskStore.removeTask(taskId)
}

const moveTaskUp = (taskId) => {
  taskStore.moveTaskUp(taskId)
}

const moveTaskDown = (taskId) => {
  taskStore.moveTaskDown(taskId)
}

// Carregar tarefas e redefinir diariamente
onMounted(() => {
  taskStore.resetDailyTasks()
})
</script>

<style scoped>
.tasks-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background-color: var(--background-mid-dark);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
}

.tasks-header {
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-md);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
}

.task-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color-muted);
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-weight: 500;
}

.task-input-area {
  margin-bottom: var(--spacing-lg);
}

.input-wrapper {
  display: flex;
  gap: var(--spacing-md);
}

.task-input {
  flex-grow: 1;
  min-width: 0;
}

.category-select {
  width: 150px;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  white-space: nowrap;
}

.add-task-btn span {
  margin-right: var(--spacing-xs);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.task-item {
  display: flex;
  align-items: center;
  background-color: var(--background-dark);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: all var(--transition-medium);
  gap: var(--spacing-md);
}

.task-item:hover {
  transform: translateX(5px);
  box-shadow: var(--shadow-subtle);
}

.task-checkbox {
  display: flex;
  align-items: center;
}

.task-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--accent-color);
}

.task-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.task-text {
  font-size: 1rem;
  color: var(--text-color);
}

.task-category {
  font-size: 0.8rem;
  color: var(--text-color-muted);
  background-color: var(--background-mid-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
}

.task-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.task-actions button {
  background: none;
  border: none;
  color: var(--text-color-muted);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.task-actions button:hover {
  background-color: var(--background-darker);
  color: var(--text-color);
}

.completed-task {
  opacity: 0.7;
  background-color: var(--task-completed-background);
}

.completed-task .task-text {
  text-decoration: line-through;
  font-style: italic;
  color: var(--task-completed-text);
}

.completed-task .task-category {
  opacity: 0.6;
}

.completed-task .task-actions button {
  opacity: 0.3;
  pointer-events: none;
}

.difficulty-easy {
  border-left: 5px solid var(--easy-task-color);
}

.difficulty-medium {
  border-left: 5px solid var(--medium-task-color);
}

.difficulty-hard {
  border-left: 5px solid var(--hard-task-color);
}

.completed-task-text {
  text-decoration: line-through;
  font-style: italic;
  color: var(--task-completed-text);
}
</style>
