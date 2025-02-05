<template>
  <div class="pomodoro-container">
    <div class="pomodoro-grid">
      <div class="timer-section">
        <div class="mode-selector">
          <button 
            @click="setMode('work')" 
            :class="{ active: currentMode === 'work' }"
          >
            Foco
          </button>
          <button 
            @click="setMode('break')" 
            :class="{ active: currentMode === 'break' }"
          >
            Pausa
          </button>
        </div>

        <div class="timer-display">
          <div class="progress-timer">
            <svg viewBox="0 0 100 100" class="progress-svg">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                class="timer-background"
                fill="none"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                class="timer-progress"
                fill="none"
                :style="{
                  strokeDashoffset: progressStrokeDashoffset,
                  stroke: progressColor
                }"
              />
            </svg>
            <div class="time-overlay">{{ formattedTime }}</div>
          </div>
        </div>
        
        <div class="timer-controls">
          <div class="action-buttons">
            <button 
              v-if="!isRunning" 
              @click="startTimer" 
              class="start-btn"
            >
              Iniciar
            </button>
            <button 
              v-if="isRunning" 
              @click="pauseTimer" 
              class="pause-btn"
            >
              Pausar
            </button>
            <button 
              @click="resetTimer" 
              class="reset-btn"
            >
              Resetar
            </button>
            <button 
              @click="openSettingsModal" 
              class="settings-btn"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Configurações -->
    <div v-if="showSettingsModal" class="settings-modal">
      <div class="settings-modal-content">
        <h2>Configurações do Pomodoro</h2>
        
        <div class="settings-group">
          <label>Tempo Padrão de Foco</label>
          <div class="settings-input">
            <button @click="decrementDefaultWorkDuration">-</button>
            <input 
              type="number" 
              v-model.number="defaultWorkDuration" 
              min="1" 
              max="60"
            />
            <button @click="incrementDefaultWorkDuration">+</button>
            <span>minutos</span>
          </div>
        </div>

        <div class="settings-group">
          <label>Tempo Padrão de Pausa</label>
          <div class="settings-input">
            <button @click="decrementDefaultBreakDuration">-</button>
            <input 
              type="number" 
              v-model.number="defaultBreakDuration" 
              min="1" 
              max="30"
            />
            <button @click="incrementDefaultBreakDuration">+</button>
            <span>minutos</span>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="saveSettings" class="save-btn">Salvar</button>
          <button @click="closeSettingsModal" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const workDuration = ref(25)  // Tempo atual de foco
const breakDuration = ref(5)  // Tempo atual de pausa
const defaultWorkDuration = ref(25)  // Tempo padrão de foco
const defaultBreakDuration = ref(5)  // Tempo padrão de pausa
const currentMode = ref('work')
const timeRemaining = ref(workDuration.value * 60)
const isRunning = ref(false)
const timer = ref(null)
const showSettingsModal = ref(false)

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const totalTime = computed(() => 
  currentMode.value === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
)

const progressStrokeDashoffset = computed(() => {
  const circumference = 2 * Math.PI * 45
  const progress = timeRemaining.value / totalTime.value
  return circumference * (1 - progress)
})

const progressColor = computed(() => {
  const progress = 1 - (timeRemaining.value / totalTime.value)
  return `rgba(var(--primary-color-rgb), ${progress})`
})

// Métodos de incremento/decremento para configurações padrão
const incrementDefaultWorkDuration = () => {
  if (defaultWorkDuration.value < 60) {
    defaultWorkDuration.value++
  }
}

const decrementDefaultWorkDuration = () => {
  if (defaultWorkDuration.value > 1) {
    defaultWorkDuration.value--
  }
}

const incrementDefaultBreakDuration = () => {
  if (defaultBreakDuration.value < 30) {
    defaultBreakDuration.value++
  }
}

const decrementDefaultBreakDuration = () => {
  if (defaultBreakDuration.value > 1) {
    defaultBreakDuration.value--
  }
}

// Métodos para abrir/fechar modal de configurações
const openSettingsModal = () => {
  showSettingsModal.value = true
}

const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const saveSettings = () => {
  // Salvar configurações no localStorage
  localStorage.setItem('pomodoroDefaultWorkDuration', defaultWorkDuration.value.toString())
  localStorage.setItem('pomodoroDefaultBreakDuration', defaultBreakDuration.value.toString())
  
  // Atualizar tempos atuais se não estiver rodando
  if (!isRunning.value) {
    workDuration.value = defaultWorkDuration.value
    breakDuration.value = defaultBreakDuration.value
    timeRemaining.value = workDuration.value * 60
  }
  
  closeSettingsModal()
}

const startTimer = () => {
  if (isRunning.value) return

  isRunning.value = true
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      switchMode()
    }
  }, 1000)
}

const pauseTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    isRunning.value = false
  }
}

const resetTimer = () => {
  pauseTimer()
  currentMode.value = 'work'
  timeRemaining.value = workDuration.value * 60
}

const switchMode = () => {
  pauseTimer()
  
  if (currentMode.value === 'work') {
    currentMode.value = 'break'
    timeRemaining.value = breakDuration.value * 60
  } else {
    currentMode.value = 'work'
    timeRemaining.value = workDuration.value * 60
  }
  
  startTimer()
}

const setMode = (mode) => {
  if (!isRunning.value) {
    currentMode.value = mode
    timeRemaining.value = mode === 'work' 
      ? workDuration.value * 60 
      : breakDuration.value * 60
  }
}

// Carregar configurações salvas
onMounted(() => {
  const savedWorkDuration = localStorage.getItem('pomodoroDefaultWorkDuration')
  const savedBreakDuration = localStorage.getItem('pomodoroDefaultBreakDuration')
  
  if (savedWorkDuration) {
    defaultWorkDuration.value = Number(savedWorkDuration)
    workDuration.value = Number(savedWorkDuration)
  }
  
  if (savedBreakDuration) {
    defaultBreakDuration.value = Number(savedBreakDuration)
    breakDuration.value = Number(savedBreakDuration)
  }
  
  timeRemaining.value = workDuration.value * 60
})
</script>

<style scoped>
.pomodoro-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: var(--bg-secondary);
  padding: 20px;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 400px;
}

.mode-selector {
  display: flex;
  gap: 15px;
  background-color: var(--bg-primary);
  border-radius: 50px;
  padding: 5px;
  margin-bottom: 20px;
}

.mode-selector button {
  background: none;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-selector button.active {
  background-color: var(--primary-color);
  color: var(--text-color);
}

.timer-display {
  position: relative;
  width: 250px;
  height: 250px;
  margin-bottom: 30px;
}

.progress-timer {
  position: relative;
  width: 100%;
  height: 100%;
}

.progress-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.timer-background {
  stroke: var(--bg-primary);
  stroke-width: 10;
}

.timer-progress {
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s linear;
}

.time-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color);
  z-index: 10;
}

.timer-controls {
  display: flex;
  justify-content: center;
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  background-color: var(--bg-primary);
  border-radius: 50px;
  padding: 10px 20px;
}

.action-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.start-btn, .pause-btn {
  background-color: var(--primary-color);
  color: var(--text-color);
}

.reset-btn {
  color: var(--text-muted);
}

.settings-btn {
  color: var(--text-muted);
  font-size: 1.2rem;
}

.action-buttons button:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

/* Modal styles mantidos anteriormente */
</style>
