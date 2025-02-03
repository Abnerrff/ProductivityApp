<script setup>
import { ref, computed, onMounted } from 'vue'

const totalPoints = ref(0)
const level = computed(() => {
  if (totalPoints.value < 100) return 1
  if (totalPoints.value < 500) return 2
  if (totalPoints.value < 1000) return 3
  return 4
})

const achievements = ref([
  { 
    name: 'Iniciante', 
    description: 'Complete 5 tarefas', 
    points: 50, 
    achieved: false 
  },
  { 
    name: 'Produtivo', 
    description: 'Complete 20 tarefas', 
    points: 200, 
    achieved: false 
  },
  { 
    name: 'Mestre da Produtividade', 
    description: 'Complete 50 tarefas', 
    points: 500, 
    achieved: false 
  }
])

const updateAchievements = (completedTasksCount) => {
  achievements.value.forEach(achievement => {
    if (!achievement.achieved) {
      switch(achievement.name) {
        case 'Iniciante':
          achievement.achieved = completedTasksCount >= 5
          break
        case 'Produtivo':
          achievement.achieved = completedTasksCount >= 20
          break
        case 'Mestre da Produtividade':
          achievement.achieved = completedTasksCount >= 50
          break
      }
    }
  })
}

const loadGameData = () => {
  const savedGameData = localStorage.getItem('productivityGameData')
  if (savedGameData) {
    const parsedData = JSON.parse(savedGameData)
    totalPoints.value = parsedData.totalPoints || 0
    achievements.value = parsedData.achievements || achievements.value
  }
}

const saveGameData = () => {
  localStorage.setItem('productivityGameData', JSON.stringify({
    totalPoints: totalPoints.value,
    achievements: achievements.value
  }))
}

const addPoints = (points) => {
  totalPoints.value += points
  saveGameData()
}

onMounted(() => {
  loadGameData()
  
  // Observar mudanças nas tarefas para atualizar conquistas
  const tasks = JSON.parse(localStorage.getItem('productivityTasks') || '[]')
  const completedTasksCount = tasks.filter(task => task.completed).length
  updateAchievements(completedTasksCount)
})
</script>

<template>
  <div class="gamification">
    <h2>Conquistas</h2>
    
    <div class="player-stats">
      <div class="total-points">
        <h3>Pontos Totais</h3>
        <p>{{ totalPoints }}</p>
      </div>
      
      <div class="level">
        <h3>Nível</h3>
        <p>{{ level }}</p>
      </div>
    </div>

    <div class="achievements">
      <h3>Conquistas</h3>
      <ul>
        <li 
          v-for="achievement in achievements" 
          :key="achievement.name"
          :class="{ achieved: achievement.achieved }"
        >
          {{ achievement.name }} 
          ({{ achievement.description }})
          <span v-if="achievement.achieved">✅</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.gamification {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-dark);
  border-radius: 10px;
  color: var(--text-color);
}

.player-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.total-points, .level {
  text-align: center;
  background-color: var(--background-mid-dark);
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.total-points h3, .level h3 {
  color: var(--text-color);
}

.total-points p, .level p {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
}

.achievements {
  background-color: var(--background-mid-dark);
  padding: 15px;
  border-radius: 5px;
}

.achievements h3 {
  color: var(--text-color);
}

.achievements ul {
  list-style-type: none;
  padding: 0;
}

.achievements li {
  margin: 10px 0;
  padding: 10px;
  background-color: var(--background-dark);
  border-radius: 5px;
  color: var(--text-color);
}

.achievements li.achieved {
  background-color: var(--background-darker);
  color: var(--primary-color);
}
</style>
