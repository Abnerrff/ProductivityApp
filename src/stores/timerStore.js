import { ref, computed } from 'vue'
import NotificationService from '@/services/notificationService'
import SoundService from '@/services/soundService'

const TIMER_STATE_KEY = 'pomodoroState'

export const useTimerStore = () => {
  // Configurações de tempo
  const WORK_DURATION = 25 * 60  // 25 minutos
  const BREAK_DURATION = 5 * 60  // 5 minutos

  // Estados
  const currentMode = ref('work')
  const timeRemaining = ref(WORK_DURATION)
  const isRunning = ref(false)
  const completedCycles = ref(0)
  const totalFocusTime = ref(0)

  // Tempo formatado
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const loadTimerState = () => {
    const savedState = localStorage.getItem(TIMER_STATE_KEY)
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

  const saveTimerState = () => {
    try {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
        currentMode: currentMode.value,
        timeRemaining: timeRemaining.value,
        completedCycles: completedCycles.value,
        totalFocusTime: totalFocusTime.value
      }))
    } catch (error) {
      console.error('Erro ao salvar estado do Pomodoro:', error)
    }
  }

  const startTimer = (onCycleComplete, projectName = '') => {
    if (isRunning.value) return null

    isRunning.value = true
    const timer = setInterval(() => {
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
          
          // Notificar e tocar som de conclusão de trabalho
          NotificationService.workSessionComplete(projectName)
          SoundService.playWorkComplete()
          
          onCycleComplete()
        } else {
          // Notificar e tocar som de conclusão de pausa
          NotificationService.breakSessionComplete(projectName)
          SoundService.playBreakComplete()
        }

        // Alternar entre trabalho e pausa
        currentMode.value = currentMode.value === 'work' ? 'break' : 'work'
        timeRemaining.value = currentMode.value === 'work' ? WORK_DURATION : BREAK_DURATION
      }
    }, 1000)

    return timer
  }

  const pauseTimer = (timer) => {
    if (timer) {
      clearInterval(timer)
    }
    isRunning.value = false
  }

  const resetTimer = () => {
    isRunning.value = false
    currentMode.value = 'work'
    timeRemaining.value = WORK_DURATION
    saveTimerState()
  }

  const setMode = (mode) => {
    currentMode.value = mode
    timeRemaining.value = mode === 'work' ? WORK_DURATION : BREAK_DURATION
  }

  return {
    currentMode,
    timeRemaining,
    isRunning,
    completedCycles,
    totalFocusTime,
    formattedTime,
    WORK_DURATION,
    BREAK_DURATION,
    loadTimerState,
    saveTimerState,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode
  }
}
