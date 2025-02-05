<template>
  <div class="task-manager">
    <div class="task-header">
      <h2>Gerenciador de Tarefas</h2>
      <div class="points-display">
        🏆 Pontos: {{ taskStats.totalPoints }}
      </div>
    </div>

    <div class="task-input-section">
      <input 
        v-model="newTaskTitle" 
        @keyup.enter="addNewTask" 
        placeholder="Digite uma nova tarefa"
        class="task-input"
      />
      <select v-model="newTaskCategory" class="category-select">
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
      <select v-model="newTaskDifficulty" class="difficulty-select">
        <option v-for="difficulty in difficulties" :key="difficulty" :value="difficulty">
          {{ difficulty }}
        </option>
      </select>
      <button @click="addNewTask" class="add-task-btn">Adicionar</button>
      <button @click="removeBlankTasks" class="remove-blank-btn">Limpar Vazias</button>
    </div>

    <div class="task-stats">
      <div class="stat-card">
        <h3>Resumo de Tarefas</h3>
        <p>Total: {{ taskStats.totalTasks }}</p>
        <p>Concluídas: {{ taskStats.completedTasks }}</p>
        <p>Taxa de Conclusão: {{ taskStats.completionRate }}%</p>
      </div>
    </div>

    <div class="category-tabs">
      <button 
        v-for="category in categories" 
        :key="category"
        @click="selectedCategory = category"
        :class="{ active: selectedCategory === category }"
      >
        {{ category }} ({{ taskStats.categoryCounts[category].completed }}/{{ taskStats.categoryCounts[category].total }})
      </button>
    </div>

    <div class="task-list">
      <div 
        v-for="task in filteredTasks" 
        :key="task.id" 
        class="task-item"
        :class="{
          'completed': task.completed,
          'difficulty-easy': task.difficulty === 'Fácil',
          'difficulty-medium': task.difficulty === 'Média',
          'difficulty-hard': task.difficulty === 'Difícil'
        }"
      >
        <input 
          type="checkbox" 
          :checked="task.completed"
          @change="toggleTask(task.id)"
        />
        <span class="task-title">{{ task.title }}</span>
        <span class="task-category">{{ task.category }}</span>
        <span class="task-difficulty">{{ task.difficulty }}</span>
        <button @click="removeTask(task.id)" class="delete-task-btn">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const { 
  tasks, 
  addTask, 
  removeTask, 
  toggleTask, 
  taskStats, 
  categories,
  filterTasksByCategory 
} = useTaskStore()

const newTaskTitle = ref('')
const newTaskCategory = ref('Outros')
const difficulties = [
  'Fácil',
  'Média', 
  'Difícil'
]
const newTaskDifficulty = ref('Média')
const selectedCategory = ref('Todos')

const filteredTasks = computed(() => {
  if (selectedCategory.value === 'Todos') {
    return tasks.value
  }
  return filterTasksByCategory(selectedCategory.value)
})

const addNewTask = () => {
  if (!newTaskTitle.value.trim()) {
    alert('Por favor, insira um título para a tarefa')
    return
  }

  addTask(
    newTaskTitle.value, 
    newTaskCategory.value, 
    newTaskDifficulty.value
  )

  // Resetar valores após adicionar tarefa
  newTaskTitle.value = ''
  newTaskDifficulty.value = 'Média'
}

const removeBlankTasks = () => {
  const blankTasks = tasks.value.filter(task => 
    !task.title || task.title.trim() === ''
  )
  
  blankTasks.forEach(blankTask => {
    removeTask(blankTask.id)
  })
}

watch(newTaskDifficulty, (newValue) => {
  console.log('New task difficulty:', newValue)
})

onMounted(() => {
  removeBlankTasks()
})
</script>

<style scoped>
.task-manager {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-darkest);
  border-radius: 8px;
  color: var(--text-color);
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--border-color-medium);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.points-display {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--primary-color);
}

.task-input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.task-input {
  flex-grow: 1;
  padding: 10px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color-subtle);
  border-radius: 4px;
  box-shadow: var(--shadow-subtle);
  transition: box-shadow 0.3s, border-color 0.3s;
}

.task-input:focus {
  border-color: var(--border-color-medium);
  box-shadow: var(--shadow-medium);
}

.category-select, .difficulty-select {
  padding: 10px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.add-task-btn, .remove-blank-btn {
  padding: 10px 15px;
  background-color: var(--primary-color);
  color: var(--background-darkest);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-blank-btn {
  background-color: var(--accent-color);
  margin-left: 10px;
}

.task-stats {
  margin-bottom: 20px;
}

.stat-card {
  background-color: var(--background-darker);
  color: var(--text-color);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.category-tabs button {
  padding: 10px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.category-tabs button.active {
  background-color: var(--primary-color);
  color: var(--background-darkest);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  background-color: var(--background-darker);
  color: var(--text-color);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.task-item input[type="checkbox"] {
  margin-right: 10px;
  accent-color: var(--primary-color);
}

.task-title {
  flex-grow: 1;
  margin-right: 10px;
}

.task-category {
  margin-right: 10px;
  font-size: 0.8em;
  background-color: var(--background-mid-dark);
  padding: 2px 5px;
  border-radius: 3px;
}

.task-difficulty {
  margin-right: 10px;
  font-size: 0.8em;
}

.delete-task-btn {
  background-color: var(--accent-color);
  color: var(--text-color);
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.difficulty-easy {
  border-left: 4px solid var(--primary-color);
}

.difficulty-medium {
  border-left: 4px solid var(--secondary-color);
}

.difficulty-hard {
  border-left: 4px solid var(--accent-color);
}
</style>
