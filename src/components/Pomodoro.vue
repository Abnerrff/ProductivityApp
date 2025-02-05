<template>
  <div class="pomodoro-container">
    <div class="timer-wrapper">
      <div class="timer-display">
        <span class="time">{{ formattedTime }}</span>
      </div>
      
      <div class="timer-controls">
        <div class="mode-selector">
          <button 
            @click="setMode('work')" 
            :class="{ active: currentMode === 'work' }"
          >
            🍅 Foco
          </button>
          <button 
            @click="setMode('break')" 
            :class="{ active: currentMode === 'break' }"
          >
            ☕ Pausa
          </button>
        </div>

        <div class="project-section">
          <div class="project-selector">
            <button 
              @click="showProjectModal = true" 
              class="project-select-btn"
            >
              {{ selectedProject ? selectedProject.name : '📁 Novo Projeto' }}
            </button>
          </div>

          <div class="project-actions">
            <button 
              @click="openNewProjectModal" 
              class="new-project-btn"
            >
              ➕ Criar Projeto
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            v-if="!isRunning" 
            @click="startTimer" 
            class="start-btn"
            :disabled="!selectedProject"
          >
            ▶️ Iniciar
          </button>
          <button 
            v-else 
            @click="pauseTimer" 
            class="pause-btn"
          >
            ⏸️ Pausar
          </button>
          <button 
            @click="resetTimer" 
            class="reset-btn"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      <div class="timer-stats">
        <div class="stat-item">
          <span>Ciclos Concluídos</span>
          <span class="stat-value">{{ completedCycles }}</span>
        </div>
        <div class="stat-item">
          <span>Tempo Total de Foco</span>
          <span class="stat-value">{{ totalFocusTime }} min</span>
        </div>
      </div>
    </div>

    <!-- Modal de Seleção de Projeto -->
    <div v-if="showProjectModal" class="project-modal">
      <div class="project-modal-content">
        <h2>Selecionar Projeto</h2>
        <div 
          v-if="projects.length === 0" 
          class="no-projects"
        >
          <p>Nenhum projeto encontrado.</p>
          <button @click="openNewProjectModal">Criar Primeiro Projeto</button>
        </div>
        <div 
          v-else
          v-for="project in projects" 
          :key="project.id" 
          class="project-option"
          :class="{ 'selected': selectedProject?.id === project.id }"
        >
          <div 
            class="project-info" 
            @click="selectProject(project)"
          >
            <span>{{ project.name }}</span>
            <span class="project-hours">{{ formatHours(project.totalHours) }}</span>
          </div>
          <button 
            class="delete-project-btn" 
            @click.stop="prepareDeleteProject(project)"
          >
            🗑️
          </button>
        </div>
        <div class="modal-actions">
          <button @click="showProjectModal = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Projeto -->
    <div v-if="showNewProjectModal" class="new-project-modal">
      <div class="new-project-modal-content">
        <h2>Novo Projeto</h2>
        <input 
          v-model="newProjectName" 
          placeholder="Nome do Projeto"
        />
        <textarea 
          v-model="newProjectDescription" 
          placeholder="Descrição (opcional)"
        ></textarea>
        <div class="modal-actions">
          <button 
            @click="createProject"
            :disabled="!newProjectName.trim()"
          >
            Criar
          </button>
          <button @click="closeNewProjectModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteConfirmModal" class="delete-confirm-modal">
      <div class="delete-confirm-modal-content">
        <h2>Excluir Projeto</h2>
        <p>Tem certeza que deseja excluir o projeto "{{ selectedProjectToDelete?.name }}"?</p>
        <div class="modal-actions">
          <button @click="confirmDeleteProject" class="delete-btn">Excluir</button>
          <button @click="cancelDeleteProject" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'

// Configurações de tempo
const WORK_DURATION = 25 * 60  // 25 minutos
const BREAK_DURATION = 5 * 60  // 5 minutos

// Estados
const currentMode = ref('work')
const timeRemaining = ref(WORK_DURATION)
const isRunning = ref(false)
const timer = ref(null)
const completedCycles = ref(0)
const totalFocusTime = ref(0)

// Estados de projeto
const projects = ref([])
const selectedProject = ref(null)
const showProjectModal = ref(false)
const showNewProjectModal = ref(false)
const newProjectName = ref('')
const newProjectDescription = ref('')
const selectedProjectToDelete = ref(null)
const showDeleteConfirmModal = ref(false)

// Tempo formatado
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Formatar horas
const formatHours = (hours) => {
  return hours ? `${hours.toFixed(2)} h` : '0h'
}

// Carregar projetos do localStorage
const loadProjects = () => {
  try {
    const savedProjects = localStorage.getItem('productivityProjects')
    if (savedProjects) {
      projects.value = JSON.parse(savedProjects)
      
      // Restaurar projeto selecionado
      const lastSelectedProjectId = localStorage.getItem('selectedProjectId')
      if (lastSelectedProjectId) {
        const project = projects.value.find(p => p.id === parseInt(lastSelectedProjectId))
        if (project) {
          selectedProject.value = project
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar projetos:', error)
  }
}

// Salvar projetos no localStorage
const saveProjects = () => {
  try {
    localStorage.setItem('productivityProjects', JSON.stringify(projects.value))
    
    // Salvar ID do projeto selecionado
    if (selectedProject.value) {
      localStorage.setItem('selectedProjectId', selectedProject.value.id)
    }
  } catch (error) {
    console.error('Erro ao salvar projetos:', error)
  }
}

// Criar novo projeto
const createProject = () => {
  if (!newProjectName.value.trim()) {
    alert('Por favor, insira um nome para o projeto')
    return
  }

  const newProject = {
    id: Date.now(),
    name: newProjectName.value,
    description: newProjectDescription.value || '',
    totalHours: 0,
    streak: 0,
    workSessions: []
  }

  projects.value.push(newProject)
  selectProject(newProject)
  closeNewProjectModal()
  saveProjects()
}

// Abrir modal de novo projeto
const openNewProjectModal = () => {
  showNewProjectModal.value = true
  showProjectModal.value = false
}

// Fechar modal de novo projeto
const closeNewProjectModal = () => {
  showNewProjectModal.value = false
  newProjectName.value = ''
  newProjectDescription.value = ''
}

// Selecionar projeto
const selectProject = (project) => {
  selectedProject.value = project
  showProjectModal.value = false
  saveProjects()
}

// Preparar exclusão de projeto
const prepareDeleteProject = (project) => {
  selectedProjectToDelete.value = project
  showDeleteConfirmModal.value = true
}

// Confirmar exclusão de projeto
const confirmDeleteProject = () => {
  if (selectedProjectToDelete.value) {
    const index = projects.value.findIndex(p => p.id === selectedProjectToDelete.value.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      if (selectedProject.value?.id === selectedProjectToDelete.value.id) {
        selectedProject.value = null
      }
      saveProjects()
    }
  }
  cancelDeleteProject()
}

// Cancelar exclusão de projeto
const cancelDeleteProject = () => {
  selectedProjectToDelete.value = null
  showDeleteConfirmModal.value = false
}

// Carregar estado do Pomodoro
const loadTimerState = () => {
  const savedState = localStorage.getItem('pomodoroState')
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      currentMode.value = state.currentMode
      timeRemaining.value = state.timeRemaining
      completedCycles.value = state.completedCycles
      totalFocusTime.value = state.totalFocusTime
    } catch (error) {
      console.error('Erro ao carregar estado do Pomodoro:', error)
    }
  }
}

// Salvar estado do Pomodoro
const saveTimerState = () => {
  try {
    localStorage.setItem('pomodoroState', JSON.stringify({
      currentMode: currentMode.value,
      timeRemaining: timeRemaining.value,
      completedCycles: completedCycles.value,
      totalFocusTime: totalFocusTime.value
    }))
  } catch (error) {
    console.error('Erro ao salvar estado do Pomodoro:', error)
  }
}

// Iniciar timer
const startTimer = () => {
  if (!isRunning.value && selectedProject.value) {
    isRunning.value = true
    timer.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
        saveTimerState()
        
        // Contabilizar tempo de foco
        if (currentMode.value === 'work') {
          totalFocusTime.value = Math.floor((WORK_DURATION - timeRemaining.value) / 60)
        }
      } else {
        // Trocar modo quando o tempo acabar
        if (currentMode.value === 'work') {
          completedCycles.value++
          
          // Adicionar sessão de trabalho ao projeto selecionado
          if (selectedProject.value) {
            const workSession = {
              id: Date.now(),
              date: new Date(),
              duration: WORK_DURATION / 60  // duração em minutos
            }

            if (!selectedProject.value.workSessions) {
              selectedProject.value.workSessions = []
            }

            selectedProject.value.workSessions.push(workSession)
            selectedProject.value.totalHours += WORK_DURATION / 3600  // converter para horas
            selectedProject.value.lastWorkDate = new Date()

            // Atualizar streak
            const today = new Date()
            const lastWorkDate = selectedProject.value.lastWorkDate

            if (lastWorkDate && 
                today.getDate() === lastWorkDate.getDate() + 1 && 
                today.getMonth() === lastWorkDate.getMonth() && 
                today.getFullYear() === lastWorkDate.getFullYear()) {
              selectedProject.value.streak += 1
            } else if (!lastWorkDate || 
                       today.getDate() !== lastWorkDate.getDate() || 
                       today.getMonth() !== lastWorkDate.getMonth() || 
                       today.getFullYear() !== lastWorkDate.getFullYear()) {
              selectedProject.value.streak = 1
            }

            saveProjects()
          }

          // Mudar para modo de pausa
          currentMode.value = 'break'
          timeRemaining.value = BREAK_DURATION
        } else {
          // Voltar para modo de trabalho
          currentMode.value = 'work'
          timeRemaining.value = WORK_DURATION
        }
      }
    }, 1000)
  }
}

// Pausar timer
const pauseTimer = () => {
  if (isRunning.value) {
    clearInterval(timer.value)
    isRunning.value = false
  }
}

// Resetar timer
const resetTimer = () => {
  clearInterval(timer.value)
  isRunning.value = false
  currentMode.value = 'work'
  timeRemaining.value = WORK_DURATION
  saveTimerState()
}

// Definir modo
const setMode = (mode) => {
  currentMode.value = mode
  timeRemaining.value = mode === 'work' ? WORK_DURATION : BREAK_DURATION
}

// Carregar projetos e estado ao montar
onMounted(() => {
  loadProjects()
  loadTimerState()
})

// Limpar timer ao desmontar
onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<style scoped>
.pomodoro-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-mid-dark);
  border-radius: 10px;
}

.timer-display {
  text-align: center;
  font-size: 4rem;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.mode-selector button {
  padding: 10px 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.mode-selector button.active {
  background-color: var(--primary-color);
  color: var(--background-darkest);
}

.project-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-select-btn, .new-project-btn {
  padding: 10px 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.project-select-btn:hover, .new-project-btn:hover {
  background-color: var(--accent-color);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.start-btn, .pause-btn, .reset-btn {
  padding: 10px 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-btn:hover, .pause-btn:hover, .reset-btn:hover {
  background-color: var(--accent-color);
}

.start-btn:disabled {
  background-color: var(--background-mid-dark);
  cursor: not-allowed;
}

.timer-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding: 10px;
  background-color: var(--background-dark);
  border-radius: 5px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-color);
}

.stat-value {
  font-weight: bold;
  color: var(--primary-color);
}

.project-modal, .new-project-modal, .delete-confirm-modal {
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

.project-modal-content, .new-project-modal-content, .delete-confirm-modal-content {
  background-color: var(--background-darker);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

.project-option {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;
}

.project-option:hover {
  background-color: var(--background-mid-dark);
}

.project-option.selected {
  background-color: var(--primary-color);
  color: var(--background-darkest);
}

.project-option .project-hours {
  color: var(--text-color-muted);
}

.project-info {
  flex: 1;
}

.delete-project-btn {
  padding: 10px;
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-project-btn:hover {
  background-color: var(--accent-color);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.no-projects {
  text-align: center;
  padding: 20px;
}

input, textarea {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  background-color: var(--background-mid-dark);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  color: var(--text-color);
}

.delete-btn, .cancel-btn {
  padding: 10px 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: var(--accent-color);
}

.cancel-btn:hover {
  background-color: var(--background-mid-dark);
}
</style>
