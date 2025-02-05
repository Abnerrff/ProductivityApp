<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const tasks = ref([])
const newTask = ref('')
const filter = ref('all')
const categories = ref(['Trabalho', 'Pessoal', 'Estudo'])
const selectedCategory = ref('')

const addTask = () => {
  if (newTask.value.trim() && selectedCategory.value) {
    const newTaskObj = {
      id: Date.now(),
      title: newTask.value,
      completed: false,
      category: selectedCategory.value,
      createdAt: new Date(),
      points: 10
    }
    tasks.value.push(newTaskObj)
    newTask.value = ''
    saveToLocalStorage()
    console.log('Tarefa adicionada:', newTaskObj)
  }
}

const removeTask = (taskId) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId)
  saveToLocalStorage()
  console.log('Tarefa removida:', taskId)
}

const toggleTask = (task) => {
  task.completed = !task.completed
  task.points = task.completed ? task.points * 2 : task.points / 2
  saveToLocalStorage()
  console.log('Tarefa alternada:', task)
}

const filteredTasks = computed(() => {
  switch(filter.value) {
    case 'active': return tasks.value.filter(task => !task.completed)
    case 'completed': return tasks.value.filter(task => task.completed)
    default: return tasks.value
  }
})

const saveToLocalStorage = () => {
  try {
    localStorage.setItem('productivityTasks', JSON.stringify(tasks.value))
    console.log('Tarefas salvas:', tasks.value)
  } catch (error) {
    console.error('Erro ao salvar tarefas:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const savedTasks = localStorage.getItem('productivityTasks')
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks)
      console.log('Tarefas carregadas:', tasks.value)
    } else {
      console.log('Nenhuma tarefa salva encontrada')
    }
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error)
  }
}

// Adicionar observador para depuração
watch(tasks, (newTasks) => {
  console.log('Tarefas atualizadas:', newTasks)
}, { deep: true })

onMounted(() => {
  loadFromLocalStorage()
})
</script>

<template>
  <div class="task-manager">
    <h2>Gerenciador de Tarefas</h2>
    
    <div class="task-input">
      <select v-model="selectedCategory" required>
        <option value="" disabled>Selecione Categoria</option>
        <option v-for="category in categories" :key="category">
          {{ category }}
        </option>
      </select>
      
      <input 
        v-model="newTask" 
        @keyup.enter="addTask"
        placeholder="Nova tarefa"
        required
      >
      <button @click="addTask" :disabled="!newTask || !selectedCategory">
        Adicionar
      </button>
    </div>

    <div class="task-filters">
      <button @click="filter = 'all'">Todas</button>
      <button @click="filter = 'active'">Ativas</button>
      <button @click="filter = 'completed'">Concluídas</button>
    </div>

    <ul class="task-list">
      <li 
        v-for="task in filteredTasks" 
        :key="task.id"
        :class="{ 
          'task-item': true, 
          'completed': task.completed,
          [task.category.toLowerCase()]: true 
        }"
      >
        <div class="task-content">
          <input 
            type="checkbox" 
            :checked="task.completed"
            @change="toggleTask(task)"
          >
          <span>{{ task.title }}</span>
          <span class="category-tag">{{ task.category }}</span>
          <span class="points">{{ task.points }} pts</span>
        </div>
        <button @click="removeTask(task.id)" class="remove-btn">✖</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.task-manager {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  background-color: var(--task-background, #2d3250);
  padding: 20px;
  border-radius: 10px;
  color: var(--text-color);
}

.task-input {
  display: flex;
  margin-bottom: 20px;
}

.task-input select, 
.task-input input, 
.task-input button {
  padding: 10px;
  margin-right: 10px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
}

.task-input button {
  background-color: var(--primary-color);
  color: var(--background-darkest);
  cursor: pointer;
}

.task-input button:disabled {
  background-color: var(--background-darker);
  color: var(--text-muted);
  cursor: not-allowed;
}

.task-filters {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.task-filters button {
  margin: 0 10px;
  padding: 5px 10px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
}

.task-list {
  list-style-type: none;
  padding: 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  transition: background-color 0.3s;
  background-color: var(--background-darker);
  border: 1px solid var(--border-color);
}

.task-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-item.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.category-tag {
  font-size: 0.8em;
  padding: 2px 5px;
  border-radius: 3px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
}

.points {
  font-weight: bold;
  color: var(--primary-color);
}

.remove-btn {
  background-color: var(--accent-color);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

input[type="checkbox"] {
  accent-color: var(--primary-color);
}
</style>
