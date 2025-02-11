<template>
  <div class="pomodoro-container">
    <div class="pomodoro-grid">
      <div class="timer-section">
        <div class="pomodoro-layout">
          <div class="project-selector">
            <button 
              @click="openProjectModal" 
              class="project-select-btn"
            >
              <span class="project-icon">📋</span>
              <span class="project-name">{{ selectedProjectName }}</span>
              <span class="dropdown-icon">▼</span>
            </button>
          </div>

          <div class="timer-content">
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
                  :disabled="!selectedProject"
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
      </div>
    </div>

    <!-- Modal de Seleção de Projeto -->
    <div 
      v-if="showProjectModal" 
      class="project-modal-overlay"
      @click.self="closeProjectModal"
    >
      <div class="project-modal-content" @click.stop>
        <div class="project-modal-header">
          <h3>Selecionar Projeto</h3>
          <button @click="closeProjectModal" class="close-btn">✕</button>
        </div>
        
        <div class="project-list" v-if="projects.length > 0">
          <div 
            v-for="project in projects" 
            :key="project.id" 
            class="project-item"
            :class="{ 'selected': selectedProject && selectedProject.id === project.id }"
            @click="selectProject(project)"
          >
            <div class="project-info">
              <div class="project-name-container">
                <span class="project-name">{{ project.title }}</span>
                <div class="project-details">
                  <span class="project-progress">
                    {{ project.timeSpent ? project.timeSpent.toFixed(1) : '0.0' }} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-projects">
          <p>Nenhum projeto encontrado</p>
        </div>
      </div>
    </div>

    <!-- Modal de Configurações -->
    <div 
      v-if="showSettingsModal" 
      class="settings-modal-overlay"
      @click.self="closeSettingsModal"
    >
      <div class="settings-modal-content" @click.stop>
        <div class="settings-modal-header">
          <h3>Configurações do Pomodoro</h3>
          <button @click="closeSettingsModal" class="close-btn">✕</button>
        </div>
        
        <div class="settings-group">
          <label>Tempo de Foco</label>
          <div class="settings-input">
            <button @click="workDuration > 1 ? workDuration-- : null">-</button>
            <input 
              type="number" 
              v-model.number="workDuration" 
              min="1" 
              max="60"
            />
            <button @click="workDuration < 60 ? workDuration++ : null">+</button>
            <span>minutos</span>
          </div>
        </div>

        <div class="settings-group">
          <label>Tempo de Pausa</label>
          <div class="settings-input">
            <button @click="breakDuration > 1 ? breakDuration-- : null">-</button>
            <input 
              type="number" 
              v-model.number="breakDuration" 
              min="1" 
              max="30"
            />
            <button @click="breakDuration < 30 ? breakDuration++ : null">+</button>
            <span>minutos</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

// Stores
const projectsStore = useProjectsStore()

// Estados do timer
const workDuration = ref(25)  // Minutos de foco
const breakDuration = ref(5)  // Minutos de pausa
const currentMode = ref('work')
const timeRemaining = ref(workDuration.value * 60)
const isRunning = ref(false)
const timerInterval = ref(null)

// Estados do projeto
const selectedProject = ref(null)
const showProjectModal = ref(false)
const showSettingsModal = ref(false)

// Projetos disponíveis
const projects = computed(() => {
  return projectsStore.projects || []
})

// Nome do projeto selecionado
const selectedProjectName = computed(() => {
  return selectedProject.value ? selectedProject.value.title : 'Selecionar Projeto'
})

// Computados para progresso do timer
const progressStrokeDashoffset = computed(() => {
  const totalTime = currentMode.value === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
  const progress = timeRemaining.value / totalTime
  return (1 - progress) * 282.6
})

const progressColor = computed(() => {
  return currentMode.value === 'work' 
    ? 'var(--primary-color)' 
    : 'var(--success-color)'
})

// Formatação do tempo
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Métodos de controle do timer
const startTimer = () => {
  if (!selectedProject.value) {
    alert('Selecione um projeto antes de iniciar')
    return
  }

  if (!isRunning.value) {
    isRunning.value = true
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        stopTimer()
        handleTimerCompletion()
      }
    }, 1000)
  }
}

const pauseTimer = () => {
  stopTimer()
}

const resetTimer = () => {
  stopTimer()
  timeRemaining.value = currentMode.value === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
    isRunning.value = false
  }
}

// Lógica de conclusão do timer
const handleTimerCompletion = () => {
  if (currentMode.value === 'work') {
    registerWorkTime()
    setMode('break')
  } else {
    setMode('work')
  }
}

// Registro de tempo
const registerWorkTime = () => {
  if (!selectedProject.value) return

  const minutesSpent = workDuration.value
  projectsStore.addProjectTime(selectedProject.value.id, minutesSpent)
}

// Métodos de modo
const setMode = (mode) => {
  currentMode.value = mode
  timeRemaining.value = mode === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
}

// Métodos de modal de projeto
const openProjectModal = () => {
  showProjectModal.value = true
}

const closeProjectModal = () => {
  showProjectModal.value = false
}

const selectProject = (project) => {
  selectedProject.value = project
  closeProjectModal()
}

// Métodos de configurações
const openSettingsModal = () => {
  showSettingsModal.value = true
}

const closeSettingsModal = () => {
  showSettingsModal.value = false
}

// Observador para ajustar tempo restante
watch(currentMode, (newMode) => {
  timeRemaining.value = newMode === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
})
</script>

<style scoped>
.pomodoro-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.pomodoro-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.timer-section {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pomodoro-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-selector {
  display: flex;
  justify-content: center;
}

.project-select-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 300px;
  padding: 12px 15px;
  background-color: var(--bg-primary);
  border: 2px solid transparent;
  border-radius: 12px;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.project-select-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg, 
    rgba(var(--primary-color-rgb), 0.1), 
    rgba(var(--primary-color-rgb), 0.05)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.project-select-btn:hover::before {
  opacity: 1;
}

.project-select-btn:hover {
  border-color: rgba(var(--primary-color-rgb), 0.3);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
}

.project-select-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.project-select-btn .project-icon {
  font-size: 1.2rem;
  margin-right: 10px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.project-select-btn:hover .project-icon {
  opacity: 1;
}

.project-select-btn .project-name {
  flex-grow: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.project-select-btn .dropdown-icon {
  font-size: 0.8rem;
  margin-left: 10px;
  opacity: 0.6;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.project-select-btn:hover .dropdown-icon {
  opacity: 0.9;
  transform: rotate(180deg);
}

.timer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mode-selector {
  display: flex;
  gap: 10px;
  background-color: var(--bg-primary);
  border-radius: 50px;
  padding: 5px;
}

.mode-selector button {
  background: none;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-muted);
}

.mode-selector button.active {
  background-color: var(--primary-color);
  color: white;
}

.timer-display {
  position: relative;
  width: 250px;
  height: 250px;
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
  stroke-dasharray: 282.6;
  stroke-width: 10;
  transition: stroke-dashoffset 0.5s ease;
}

.time-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: var(--text-color);
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.action-buttons button {
  background-color: var(--bg-primary);
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-muted);
}

.action-buttons button:hover {
  background-color: var(--bg-primary-light);
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-modal-overlay,
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.project-modal-content,
.settings-modal-content {
  background-color: var(--bg-secondary);
  border-radius: 15px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

.project-modal-header,
.settings-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.project-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.project-item:hover {
  background-color: var(--bg-primary-light);
}

.project-item.selected {
  background-color: var(--primary-color);
  color: white;
}

.project-name-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.project-details {
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-projects {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.settings-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-input button {
  background: none;
  border: 1px solid var(--text-muted);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.settings-input input {
  width: 60px;
  text-align: center;
  border: 1px solid var(--text-muted);
  border-radius: 5px;
  padding: 5px;
}

/* Responsividade */
@media (max-width: 600px) {
  .project-select-btn {
    max-width: 100%;
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
</style>
