<template>
  <div class="pomodoro-container">
    <div class="pomodoro-stats">
      <div class="stat-item">
        <span>Pomodoros Concluídos:</span>
        <span class="stat-value">{{ completedPomodoros }}</span>
      </div>
      <div class="stat-item">
        <span>Tempo Total de Trabalho:</span>
        <span class="stat-value">{{ formatTotalWorkTime }}</span>
      </div>
    </div>

    <div class="project-selection">
      <h3>Selecione um Projeto</h3>
      <div class="project-list">
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="project-item"
          :class="{ 'selected': selectedProject?.id === project.id }"
          @click="selectProject(project)"
        >
          {{ project.name }}
        </div>
      </div>
    </div>

    <div class="pomodoro-timer">
      <div class="timer-mode">
        <button 
          @click="switchMode('work')" 
          :class="{ active: currentMode === 'work' }"
        >
          Trabalho
        </button>
        <button 
          @click="switchMode('break')" 
          :class="{ active: currentMode === 'break' }"
        >
          Descanso
        </button>
      </div>

      <div class="timer-display">
        <span class="minutes">{{ formattedMinutes }}</span>
        <span class="separator">:</span>
        <span class="seconds">{{ formattedSeconds }}</span>
      </div>
      
      <div class="timer-controls">
        <button 
          @click="startTimer" 
          v-if="!isRunning"
          class="control-btn start-btn"
          :disabled="!selectedProject"
        >
          Iniciar
        </button>
        <button 
          @click="pauseTimer" 
          v-if="isRunning"
          class="control-btn pause-btn"
        >
          Pausar
        </button>
        <button 
          @click="resetTimer" 
          class="control-btn reset-btn"
        >
          Resetar
        </button>
      </div>
      
      <div class="timer-settings">
        <div class="setting-group">
          <label>Tempo de Trabalho (minutos):</label>
          <input 
            type="number" 
            v-model.number="settingsWorkDuration" 
            min="1" 
            max="60"
          />
        </div>
        <div class="setting-group">
          <label>Tempo de Descanso (minutos):</label>
          <input 
            type="number" 
            v-model.number="settingsBreakDuration" 
            min="1" 
            max="30"
          />
        </div>
        <button 
          @click="applySettings" 
          class="settings-btn"
        >
          Aplicar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import ProjectTracker from './ProjectTracker.vue'

// Configurações padrão
const DEFAULT_WORK_DURATION = 25
const DEFAULT_BREAK_DURATION = 5

// Estados do timer
const currentMode = ref('work')
const workDuration = ref(DEFAULT_WORK_DURATION * 60)
const breakDuration = ref(DEFAULT_BREAK_DURATION * 60)
const remainingTime = ref(workDuration.value)
const isRunning = ref(false)
const timerId = ref(null)

// Configurações ajustáveis
const settingsWorkDuration = ref(DEFAULT_WORK_DURATION)
const settingsBreakDuration = ref(DEFAULT_BREAK_DURATION)

// Estatísticas
const completedPomodoros = ref(0)
const totalWorkTime = ref(0)

// Projetos
const projects = ref([])
const selectedProject = ref(null)

const formattedMinutes = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  return minutes.toString().padStart(2, '0')
})

const formattedSeconds = computed(() => {
  const seconds = remainingTime.value % 60
  return seconds.toString().padStart(2, '0')
})

const formatTotalWorkTime = computed(() => {
  const hours = Math.floor(totalWorkTime.value / 3600)
  const minutes = Math.floor((totalWorkTime.value % 3600) / 60)
  return `${hours}h ${minutes}m`
})

const selectProject = (project) => {
  selectedProject.value = project
}

const startTimer = () => {
  if (!isRunning.value && selectedProject.value) {
    isRunning.value = true
    timerId.value = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
        
        // Contabilizar tempo de trabalho
        if (currentMode.value === 'work') {
          totalWorkTime.value++
        }
      } else {
        // Trocar modo quando o tempo acabar
        if (currentMode.value === 'work') {
          completedPomodoros.value++
          
          // Adicionar sessão de trabalho ao projeto
          if (selectedProject.value) {
            const projectTrackerRef = getCurrentInstance()?.refs.projectTracker
            if (projectTrackerRef) {
              projectTrackerRef.addWorkSession(workDuration.value)
            }
          }
          
          switchMode('break')
        } else {
          switchMode('work')
        }
      }
    }, 1000)
  }
}

const pauseTimer = () => {
  if (timerId.value) {
    clearInterval(timerId.value)
    isRunning.value = false
  }
}

const resetTimer = () => {
  pauseTimer()
  remainingTime.value = currentMode.value === 'work' 
    ? workDuration.value 
    : breakDuration.value
}

const switchMode = (mode) => {
  pauseTimer()
  currentMode.value = mode
  remainingTime.value = mode === 'work' 
    ? workDuration.value 
    : breakDuration.value
}

const applySettings = () => {
  // Validar entradas
  settingsWorkDuration.value = Math.max(1, Math.min(60, settingsWorkDuration.value))
  settingsBreakDuration.value = Math.max(1, Math.min(30, settingsBreakDuration.value))

  // Atualizar durações
  workDuration.value = settingsWorkDuration.value * 60
  breakDuration.value = settingsBreakDuration.value * 60

  // Resetar timer no modo atual
  remainingTime.value = currentMode.value === 'work' 
    ? workDuration.value 
    : breakDuration.value

  pauseTimer()
}

// Carregar dados salvos
onMounted(() => {
  // Carregar dados de pomodoro
  const savedData = localStorage.getItem('pomodoroData')
  if (savedData) {
    const data = JSON.parse(savedData)
    completedPomodoros.value = data.completedPomodoros || 0
    totalWorkTime.value = data.totalWorkTime || 0
  }

  // Carregar projetos
  const savedProjects = localStorage.getItem('productivityProjects')
  if (savedProjects) {
    projects.value = JSON.parse(savedProjects)
  }

  // Definir título da página
  if (getCurrentInstance()?.appContext.config.globalProperties.$setPageTitle) {
    getCurrentInstance().appContext.config.globalProperties.$setPageTitle('Pomodoro')
  } else {
    document.title = 'Pomodoro | Productivity App'
  }
})

// Salvar dados ao desmontar
onUnmounted(() => {
  if (timerId.value) {
    clearInterval(timerId.value)
  }
  
  localStorage.setItem('pomodoroData', JSON.stringify({
    completedPomodoros: completedPomodoros.value,
    totalWorkTime: totalWorkTime.value
  }))
})
</script>

<style scoped>
.pomodoro-container {
  background-color: var(--background-dark);
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  color: var(--text-color);
}

.pomodoro-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: var(--background-mid-dark);
  padding: 15px;
  border-radius: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
}

.timer-mode {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.timer-mode button {
  margin: 0 10px;
  padding: 10px 20px;
  background-color: var(--background-mid-dark);
  border: none;
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.timer-mode button.active {
  background-color: var(--primary-color);
  color: white;
}

.timer-display {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  margin-bottom: 30px;
}

.timer-display .minutes,
.timer-display .seconds {
  background-color: var(--background-mid-dark);
  padding: 10px 20px;
  border-radius: 10px;
  margin: 0 10px;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background-color: #4CAF50;
  color: white;
}

.pause-btn {
  background-color: #FFC107;
  color: black;
}

.reset-btn {
  background-color: #F44336;
  color: white;
}

.timer-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.timer-settings label {
  margin-bottom: 5px;
}

.timer-settings input {
  width: 100px;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  background-color: var(--background-mid-dark);
  color: var(--text-color);
}

.settings-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.project-selection {
  background-color: var(--background-mid-dark);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.project-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.project-item {
  background-color: var(--background-dark);
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-item:hover {
  background-color: var(--primary-color);
  color: white;
}

.project-item.selected {
  background-color: var(--primary-color);
  color: white;
}
</style>
