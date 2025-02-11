<template>
  <div class="pomodoro-container">
    <div class="pomodoro-header">
      <h2>Pomodoro Timer</h2>
      <div class="project-selector">
        <select 
          v-model="selectedProject" 
          @change="globalLog(`Projeto Selecionado: ${selectedProject?.title}`, { projectId: selectedProject?.id })"
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
    </div>

    <div class="timer-display">
      <div 
        class="timer-circle" 
        :class="{
          'work-mode': currentMode === 'work',
          'break-mode': currentMode === 'break'
        }"
      >
        <div class="timer-content">
          <span class="timer-minutes">
            {{ Math.floor(timeRemaining / 60).toString().padStart(2, '0') }}
          </span>
          <span class="timer-separator">:</span>
          <span class="timer-seconds">
            {{ (timeRemaining % 60).toString().padStart(2, '0') }}
          </span>
        </div>
        <div class="timer-mode">
          {{ currentMode === 'work' ? 'Trabalho' : 'Intervalo' }}
        </div>
      </div>
    </div>

    <div class="timer-controls">
      <button 
        @click="startTimer" 
        :disabled="isRunning"
        class="btn btn-start"
      >
        Iniciar
      </button>
      <button 
        @click="pauseTimer" 
        :disabled="!isRunning"
        class="btn btn-pause"
      >
        Pausar
      </button>
      <button 
        @click="stopTimer" 
        :disabled="!isRunning"
        class="btn btn-stop"
      >
        Parar
      </button>
    </div>

    <div class="timer-stats">
      <div class="stat-item">
        <span>Pomodoros Concluídos:</span>
        <strong>{{ completedPomodoros }}</strong>
      </div>
      <div class="stat-item">
        <span>Tempo Total no Projeto:</span>
        <strong>
          {{ 
            selectedProject?.totalTime 
              ? `${selectedProject.totalTime} min` 
              : '0 min' 
          }}
        </strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

// Função de log global
const globalLog = (message, data = {}) => {
  console.warn(`🌍 [GLOBAL LOG] ${message}`, JSON.stringify(data))
}

// Definir nome do componente
const COMPONENT_NAME = 'PomodoroComponent'

// Stores e estados
const projectsStore = useProjectsStore()
const projects = ref([])
const selectedProject = ref(null)

// Log de diagnóstico dos projetos
const initializeProjects = () => {
  try {
    // Tentar carregar projetos do store
    projects.value = projectsStore.projects || []
    
    globalLog(`${COMPONENT_NAME}: Projetos Carregados`, {
      projectCount: projects.value.length
    })

    // Se não houver projetos, tentar recuperar do localStorage
    if (projects.value.length === 0) {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        try {
          projects.value = JSON.parse(storedProjects)
          globalLog(`${COMPONENT_NAME}: Projetos Recuperados do LocalStorage`, {
            projectCount: projects.value.length
          })
        } catch (error) {
          console.error(`❌ ${COMPONENT_NAME}: Erro ao recuperar projetos`, error)
        }
      }
    }

    // Selecionar primeiro projeto automaticamente
    if (projects.value.length > 0 && !selectedProject.value) {
      selectedProject.value = projects.value[0]
      globalLog(`${COMPONENT_NAME}: Projeto Selecionado Automaticamente`, {
        project: selectedProject.value.title
      })
    }
  } catch (error) {
    console.error(`❌ ${COMPONENT_NAME}: Erro na inicialização de projetos`, error)
  }
}

// Estados do timer
const timerWorker = ref(null)
const isRunning = ref(false)
const timeRemaining = ref(25 * 60) // 25 minutos padrão
const totalDuration = ref(25 * 60)
const currentMode = ref('work')
const workDuration = ref(25)
const breakDuration = ref(5)
const completedPomodoros = ref(0)
const startTime = ref(0)

// Computed para nome do projeto
const selectedProjectName = computed(() => {
  return selectedProject.value 
    ? selectedProject.value.title 
    : 'Selecionar Projeto'
})

// Função para criar o worker
const createTimerWorker = () => {
  try {
    globalLog(`${COMPONENT_NAME}: Criando Web Worker`, {
      workerPath: '../workers/timer.worker.js'
    })
    
    // Usar import.meta.url para caminho correto
    const workerUrl = new URL('../workers/timer.worker.js', import.meta.url)
    
    // Criar worker
    timerWorker.value = new Worker(workerUrl, { type: 'module' })
    
    if (!timerWorker.value) {
      console.error(`❌ ${COMPONENT_NAME}: Falha crítica - Worker não criado`)
      return false
    }

    globalLog(`${COMPONENT_NAME}: Worker Criado com Sucesso`, {
      workerUrl: workerUrl.toString()
    })

    // Configurar listeners
    timerWorker.value.onmessage = (event) => {
      const { 
        type, 
        remainingTime, 
        mode, 
        totalDuration: workerTotalDuration, 
        startTime: workerStartTime,
        totalTime 
      } = event.data

      globalLog(`${COMPONENT_NAME}: Mensagem do Worker`, { 
        type, 
        remainingTime, 
        mode
      })

      // Processamento de mensagens do worker
      switch (type) {
        case 'tick':
          timeRemaining.value = remainingTime
          currentMode.value = mode
          totalDuration.value = workerTotalDuration
          startTime.value = workerStartTime
          saveTimerState()
          break
        case 'completed':
          isRunning.value = false
          registerProjectTime(totalTime)
          handleTimerCompletion(mode)
          saveTimerState()
          break
        case 'pause':
          timeRemaining.value = remainingTime
          currentMode.value = mode
          totalDuration.value = workerTotalDuration
          startTime.value = workerStartTime
          saveTimerState()
          break
        case 'stopped':
          timeRemaining.value = currentMode.value === 'work' 
            ? workDuration.value * 60 
            : breakDuration.value * 60
          totalDuration.value = timeRemaining.value
          saveTimerState()
          break
      }
    }

    // Tratamento de erros
    timerWorker.value.onerror = (error) => {
      console.error(`❌ ${COMPONENT_NAME}: Erro crítico no Worker`, error)
    }

    return true
  } catch (error) {
    console.error(`❌ ${COMPONENT_NAME}: Erro fatal ao criar Worker`, error)
    return false
  }
}

// Métodos auxiliares
const registerProjectTime = (timeSpent) => {
  if (!selectedProject.value) return

  try {
    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    
    if (projectIndex !== -1) {
      const timeSpentMinutes = Math.floor(timeSpent / 60)
      
      projects.value[projectIndex].totalTime = (projects.value[projectIndex].totalTime || 0) + timeSpentMinutes
      
      globalLog(`${COMPONENT_NAME}: Tempo Registrado no Projeto`, {
        project: selectedProject.value.title,
        timeSpent: timeSpentMinutes
      })
      
      localStorage.setItem('projects', JSON.stringify(projects.value))
    }
  } catch (error) {
    console.error(`❌ ${COMPONENT_NAME}: Erro ao registrar tempo no projeto`, error)
  }
}

const handleTimerCompletion = (mode) => {
  if (mode === 'work') {
    completedPomodoros.value++
    setMode('break')
  } else {
    setMode('work')
  }
}

const setMode = (mode) => {
  currentMode.value = mode
  timeRemaining.value = mode === 'work' 
    ? workDuration.value * 60 
    : breakDuration.value * 60
  totalDuration.value = timeRemaining.value
}

// Métodos de persistência
const saveTimerState = () => {
  try {
    const state = {
      remainingTime: timeRemaining.value,
      currentMode: currentMode.value,
      totalDuration: totalDuration.value,
      isRunning: isRunning.value,
      projectId: selectedProject.value?.id,
      workDuration: workDuration.value,
      breakDuration: breakDuration.value,
      completedPomodoros: completedPomodoros.value,
      startTime: startTime.value
    }
    
    localStorage.setItem('pomodoro_timer_state', JSON.stringify(state))
    globalLog(`${COMPONENT_NAME}: Estado Salvo`, state)
  } catch (error) {
    console.error(`❌ ${COMPONENT_NAME}: Erro ao salvar estado`, error)
  }
}

const loadTimerState = () => {
  try {
    const savedState = localStorage.getItem('pomodoro_timer_state')
    
    if (savedState) {
      const state = JSON.parse(savedState)
      
      globalLog(`${COMPONENT_NAME}: Estado Carregado`, state)
      
      // Restaurar projeto
      if (state.projectId) {
        const project = projects.value.find(p => p.id === state.projectId)
        if (project) {
          selectedProject.value = project
        }
      }
      
      // Restaurar estados
      timeRemaining.value = state.remainingTime
      currentMode.value = state.currentMode
      totalDuration.value = state.totalDuration
      isRunning.value = state.isRunning
      workDuration.value = state.workDuration
      breakDuration.value = state.breakDuration
      completedPomodoros.value = state.completedPomodoros
      startTime.value = state.startTime
      
      return state
    }
  } catch (error) {
    console.error(`❌ ${COMPONENT_NAME}: Erro ao carregar estado`, error)
  }
  
  return null
}

// Método de inicialização
const initializePomodoro = async () => {
  try {
    globalLog(`${COMPONENT_NAME}: Inicializando`, {
      timestamp: Date.now()
    })

    // Inicializar projetos
    initializeProjects()

    // Garantir renderização
    await nextTick()

    // Criar worker
    const workerCreated = createTimerWorker()
    
    if (!workerCreated) {
      console.error(`❌ ${COMPONENT_NAME}: Falha ao criar worker`)
      return false
    }

    // Carregar estado salvo
    const savedState = loadTimerState()
    
    globalLog(`${COMPONENT_NAME}: Estado Carregado`, {
      savedState: !!savedState
    })

    return true
  } catch (error) {
    console.error(`❌ ${COMPONENT_NAME}: Erro na inicialização`, error)
    return false
  }
}

// Ciclo de vida
onMounted(async () => {
  globalLog(`${COMPONENT_NAME}: Componente Montado`)
  
  // Inicialização com delay
  await nextTick()
  await initializePomodoro()
})

// Desmontar worker
onUnmounted(() => {
  globalLog(`${COMPONENT_NAME}: Componente Desmontado`)
  
  if (timerWorker.value) {
    timerWorker.value.terminate()
    timerWorker.value = null
  }
})

// Métodos de controle do timer
const startTimer = () => {
  if (timerWorker.value) {
    timerWorker.value.postMessage({
      type: 'start',
      duration: timeRemaining.value,
      mode: currentMode.value
    })
    isRunning.value = true
    globalLog(`${COMPONENT_NAME}: Timer Iniciado`, {
      mode: currentMode.value,
      duration: timeRemaining.value
    })
  }
}

const pauseTimer = () => {
  if (timerWorker.value) {
    timerWorker.value.postMessage({ type: 'pause' })
    isRunning.value = false
    globalLog(`${COMPONENT_NAME}: Timer Pausado`)
  }
}

const stopTimer = () => {
  if (timerWorker.value) {
    timerWorker.value.postMessage({ type: 'stop' })
    isRunning.value = false
    setMode(currentMode.value)
    globalLog(`${COMPONENT_NAME}: Timer Parado`)
  }
}
</script>

<style scoped>
.pomodoro-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #121212;  /* Muito escuro */
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  color: #b0b0b0;  /* Cinza claro para texto */
  border: 1px solid #1f1f1f;
}

.pomodoro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #1f1f1f;
  padding-bottom: 10px;
}

.pomodoro-header h2 {
  color: #4a9eff;  /* Azul suave */
  margin: 0;
  font-weight: 300;
}

.project-selector select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #1f1f1f;
  background-color: #1a1a1a;
  color: #b0b0b0;
  appearance: none;
  cursor: pointer;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.timer-circle {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
  position: relative;
  overflow: hidden;
  background-color: #1a1a1a;
  border: 2px solid #2a2a2a;
}

.work-mode {
  box-shadow: 0 0 30px rgba(74, 158, 255, 0.3);  /* Azul suave */
}

.break-mode {
  box-shadow: 0 0 30px rgba(46, 204, 113, 0.3);  /* Verde suave */
}

.timer-content {
  font-size: 4rem;
  font-weight: 200;
  color: #4a9eff;  /* Azul suave */
  z-index: 1;
}

.timer-mode {
  font-size: 1rem;
  margin-top: 10px;
  opacity: 0.7;
  color: #7a7a7a;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: #1f1f1f;
  color: #b0b0b0;
}

.btn-start {
  background-color: #2a2a2a;
  color: #4a9eff;
  border: 1px solid #4a9eff;
}

.btn-pause {
  background-color: #2a2a2a;
  color: #f39c12;
  border: 1px solid #f39c12;
}

.btn-stop {
  background-color: #2a2a2a;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timer-stats {
  display: flex;
  justify-content: space-between;
  background-color: #1a1a1a;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #1f1f1f;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item span {
  color: #7a7a7a;
  font-size: 0.8rem;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.stat-item strong {
  color: #4a9eff;
  font-size: 1rem;
  font-weight: 300;
}
</style>
