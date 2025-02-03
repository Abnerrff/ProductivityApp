<script setup>
import { ref, computed, onMounted } from 'vue'

const tasks = ref([])

const loadTasksFromStorage = () => {
  const savedTasks = localStorage.getItem('productivityTasks')
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks)
  }
}

const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() => tasks.value.filter(task => task.completed).length)
const completionRate = computed(() => {
  return totalTasks.value > 0 
    ? ((completedTasks.value / totalTasks.value) * 100).toFixed(2) 
    : 0
})

const tasksByCategory = computed(() => {
  const categories = {}
  tasks.value.forEach(task => {
    if (!categories[task.category]) {
      categories[task.category] = {
        total: 0,
        completed: 0
      }
    }
    categories[task.category].total++
    if (task.completed) categories[task.category].completed++
  })
  return categories
})

const totalPoints = computed(() => 
  tasks.value.reduce((sum, task) => sum + task.points, 0)
)

onMounted(loadTasksFromStorage)
</script>

<template>
  <div class="task-statistics">
    <h2>Estatísticas de Produtividade</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total de Tarefas</h3>
        <p>{{ totalTasks }}</p>
      </div>
      
      <div class="stat-card">
        <h3>Tarefas Concluídas</h3>
        <p>{{ completedTasks }}</p>
      </div>
      
      <div class="stat-card">
        <h3>Taxa de Conclusão</h3>
        <p>{{ completionRate }}%</p>
      </div>
      
      <div class="stat-card">
        <h3>Pontos Totais</h3>
        <p>{{ totalPoints }}</p>
      </div>
    </div>

    <div class="category-breakdown">
      <h3>Detalhamento por Categoria</h3>
      <ul>
        <li v-for="(data, category) in tasksByCategory" :key="category">
          {{ category }}: 
          {{ data.completed }}/{{ data.total }} 
          ({{ ((data.completed / data.total) * 100).toFixed(2) }}%)
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.task-statistics {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-dark);
  border-radius: 10px;
  color: var(--text-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: var(--background-mid-dark);
  border-radius: 5px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.stat-card h3 {
  margin-bottom: 10px;
  color: var(--text-color);
}

.stat-card p {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
}

.category-breakdown {
  margin-top: 20px;
  background-color: var(--background-mid-dark);
  padding: 15px;
  border-radius: 5px;
}

.category-breakdown h3 {
  color: var(--text-color);
}

.category-breakdown ul {
  list-style-type: none;
  padding: 0;
}

.category-breakdown li {
  margin: 10px 0;
  padding: 10px;
  background-color: var(--background-dark);
  border-radius: 5px;
  color: var(--text-color);
}
</style>
