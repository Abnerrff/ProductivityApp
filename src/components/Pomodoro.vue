<template>
  <div class="pomodoro-container">
    <div class="pomodoro-header">
      <h2>Pomodoro Timer</h2>
      
      <!-- Seletor de Projeto -->
      <div class="project-selector">
        <select 
          v-model="selectedProject" 
          @change="updateProjectTime"
        >
          <option 
            v-for="project in projects" 
            :key="project.id" 
            :value="project"
          >
            {{ project.title }}
          </option>
        </select>
      </div>

      <!-- Botão de Configurações -->
      <button 
        @click="openConfigModal" 
        class="config-button"
      >
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <!-- Timer Circular -->
    <div 
      class="timer-circle" 
      :class="{
        'work-mode': currentMode === 'work',
        'break-mode': currentMode === 'break'
      }"
    >
      <svg viewBox="0 0 100 100" class="progress-ring">
        <circle 
          class="progress-ring-background" 
          cx="50" 
          cy="50" 
          r="45"
        />
        <circle 
          class="progress-ring-circle" 
          cx="50" 
          cy="50" 
          r="45"
          :stroke-dashoffset="progressDashOffset"
        />
      </svg>
      
      <div class="timer-content">
        <span class="timer-minutes">
          {{ formatTime(timeRemaining) }}
        </span>
        <span class="timer-mode">
          {{ currentMode === 'work' ? 'Trabalho' : 'Descanso' }}
        </span>
      </div>
    </div>

    <!-- Controles -->
    <div class="timer-controls">
      <button 
        @click="toggleTimer" 
        class="btn-control"
      >
        {{ isRunning ? 'Pausar' : 'Iniciar' }}
      </button>
      <button 
        @click="stopTimer" 
        class="btn-control btn-stop"
      >
        Parar
      </button>
    </div>

    <!-- Modal de Configurações -->
    <div 
      v-if="showConfigModal" 
      class="config-modal"
    >
      <div class="config-modal-content">
        <h3>Configurações do Pomodoro</h3>
        
        <div class="config-section">
          <label>Tempo de Trabalho (minutos)</label>
          <input 
            type="number" 
            v-model.number="workDuration" 
            min="1" 
            max="60"
          />
        </div>
        
        <div class="config-section">
          <label>Tempo de Descanso (minutos)</label>
          <input 
            type="number" 
            v-model.number="breakDuration" 
            min="1" 
            max="30"
          />
        </div>
        
        <div class="config-actions">
          <button 
            @click="saveConfig" 
            class="btn-save"
          >
            Salvar
          </button>
          <button 
            @click="closeConfigModal" 
            class="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'
import { useAchievementsStore } from '@/stores/achievementsStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'

const projectsStore = useProjectsStore()
const achievementsStore = useAchievementsStore()
const pomodoroStore = usePomodoroStore()

const projects = computed(() => projectsStore.projects)

// Estado do Timer
const timeRemaining = ref(25 * 60)  // 25 minutos
const isRunning = ref(false)
const currentMode = ref('work')
const showConfigModal = ref(false)

// Configurações
const workDuration = ref(25)
const breakDuration = ref(5)

// Projetos
const selectedProject = ref(null)
const currentSession = ref(null)

// Inicializar com primeiro projeto, se existir
onMounted(() => {
  if (projects.value.length > 0) {
    selectedProject.value = projects.value[0]
  }
  resetTimer()
})

// Timer
let timerInterval = null

// Cálculo de Progresso
const progressDashOffset = computed(() => {
  const totalTime = currentMode.value === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
  const progress = timeRemaining.value / totalTime
  return (1 - progress) * 283  // Circunferência do círculo
})

// Formatar tempo
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Métodos de Controle
function toggleTimer() {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    startTimer()
  } else {
    pauseTimer()
  }
}

function startTimer() {
  // Iniciar nova sessão se não existir
  if (!currentSession.value) {
    currentSession.value = pomodoroStore.startSession({
      projectId: selectedProject.value?.id,
      workDuration: workDuration.value,
      breakDuration: breakDuration.value
    })
  }

  timerInterval = setInterval(() => {
    timeRemaining.value--
    
    if (timeRemaining.value <= 0) {
      completeTimer()
    }
  }, 1000)
}

function pauseTimer() {
  clearInterval(timerInterval)
  
  // Pausar sessão atual
  if (currentSession.value) {
    pomodoroStore.pauseSession(currentSession.value.id)
  }
}

function stopTimer() {
  clearInterval(timerInterval)
  
  // Interromper sessão
  if (currentSession.value) {
    pomodoroStore.stopSession(currentSession.value.id)
  }
  
  resetTimer()
}

function completeTimer() {
  clearInterval(timerInterval)
  
  // Completar sessão atual
  if (currentSession.value) {
    pomodoroStore.completeSession(currentSession.value.id, {
      mode: currentMode.value,
      totalTime: workDuration.value
    })
  }
  
  // Registrar tempo no projeto
  if (selectedProject.value) {
    const timeSpent = currentMode.value === 'work' 
      ? workDuration.value 
      : breakDuration.value
    
    projectsStore.updateProjectTime(
      selectedProject.value.id, 
      timeSpent
    )
  }
  
  // Verificar conquistas
  achievementsStore.checkPomodoroAchievements()
  
  // Alterna modo
  currentMode.value = currentMode.value === 'work' 
    ? 'break' 
    : 'work'
  
  resetTimer()
}

function resetTimer() {
  timeRemaining.value = currentMode.value === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
  isRunning.value = false
  currentSession.value = null
}

function updateProjectTime() {
  console.log('Projeto selecionado:', selectedProject.value)
}

function openConfigModal() {
  showConfigModal.value = true
}

function closeConfigModal() {
  showConfigModal.value = false
}

function saveConfig() {
  // Salva configurações
  closeConfigModal()
  resetTimer()
}
</script>

<style scoped>
:root {
  --bg-darkest: #0a0a0a;
  --bg-dark: #101010;
  --bg-medium-dark: #1a1a1a;
  --text-primary: #c0c0c0;
  --text-secondary: #808080;
  --accent-primary: #2c3e50;
  --accent-secondary: #34495e;
}

.pomodoro-container {
  max-width: 500px;
  margin: 0 auto;
  background-color: var(--bg-dark);
  border-radius: 15px;
  padding: 30px;
  position: relative;
  color: var(--text-primary);
}

.pomodoro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.config-button {
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.config-button:hover {
  color: #4a9eff;
}

.timer-circle {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.progress-ring {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-ring-background {
  fill: none;
  stroke: rgba(255,255,255,0.05);
  stroke-width: 5;  /* Reduzido pela metade */
}

.progress-ring-circle {
  fill: none;
  stroke: var(--accent-primary);
  stroke-width: 5;  /* Reduzido pela metade */
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s;
  stroke-dasharray: 283;
}

.work-mode .progress-ring-circle {
  stroke: var(--accent-secondary);
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-minutes {
  display: block;
  font-size: 4rem;
  color: var(--text-primary);
}

.timer-mode {
  display: block;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-control {
  padding: 15px 30px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-stop {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.config-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.config-modal-content {
  background: var(--bg-dark);
  padding: 30px;
  border-radius: 15px;
  width: 400px;
}

.config-section {
  margin-bottom: 20px;
}

.config-section label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.config-section input {
  width: 100%;
  padding: 10px;
  background: var(--bg-medium-dark);
  border: 1px solid var(--bg-darkest);
  color: var(--text-primary);
  border-radius: 5px;
}

.config-actions {
  display: flex;
  justify-content: space-between;
}

.btn-save, .btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-save {
  background: var(--accent-primary);
  color: white;
}

.btn-cancel {
  background: #e74c3c;
  color: white;
}
</style>
