console.log('🚀 Timer Worker: Inicializando')

let timerInterval = null
let remainingTime = 0
let totalDuration = 0
let isRunning = false
let mode = 'work'
let startTime = 0
let pausedTime = 0

// Função de log global
const globalLog = (message, data = {}) => {
  console.warn(`🌍 [GLOBAL LOG] ${message}`, JSON.stringify(data))
}

// Função de log
const debugLog = (message, data = {}) => {
  console.log(`🕒 [Worker] ${message}`, data)
}

// Adicionar log de inicialização do módulo
globalLog('Timer Worker Módulo Carregado', {
  timestamp: Date.now(),
  environment: 'development'
})

// Função para calcular tempo decorrido
const calculateElapsedTime = () => {
  const currentTime = Date.now()
  const elapsedTime = Math.floor((currentTime - startTime) / 1000)
  return elapsedTime
}

// Função para iniciar o timer
const startTimer = (duration, currentMode, savedStartTime = null) => {
  debugLog('Iniciando Timer', { duration, currentMode, savedStartTime })

  // Parar qualquer timer existente
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  // Resetar estados
  totalDuration = duration
  mode = currentMode
  isRunning = true

  // Definir tempo de início
  if (savedStartTime) {
    // Restaurar de estado salvo
    startTime = savedStartTime
    
    // Calcular tempo restante
    const elapsedTime = calculateElapsedTime()
    remainingTime = Math.max(totalDuration - elapsedTime, 0)
  } else {
    // Novo timer
    startTime = Date.now()
    remainingTime = duration
  }

  debugLog('Estado Inicial', { 
    remainingTime, 
    totalDuration, 
    mode, 
    isRunning,
    startTime
  })

  // Iniciar intervalo
  timerInterval = setInterval(() => {
    const elapsedTime = calculateElapsedTime()
    
    if (remainingTime > 0) {
      remainingTime = Math.max(totalDuration - elapsedTime, 0)
      
      debugLog('Tick', { 
        remainingTime, 
        totalDuration, 
        mode,
        elapsedTime
      })

      // Enviar estado atual
      self.postMessage({
        type: 'tick',
        remainingTime,
        mode,
        totalDuration,
        startTime
      })
    } else {
      debugLog('Timer Concluído', { mode })
      
      // Parar timer
      clearInterval(timerInterval)
      isRunning = false

      // Notificar conclusão
      self.postMessage({
        type: 'completed',
        mode,
        totalTime: totalDuration
      })
    }
  }, 1000)
}

// Função para pausar o timer
const pauseTimer = () => {
  debugLog('Pausando Timer')
  
  if (timerInterval) {
    clearInterval(timerInterval)
    pausedTime = Date.now()
    isRunning = false

    // Calcular tempo decorrido
    const elapsedTime = calculateElapsedTime()

    // Enviar estado atual
    self.postMessage({
      type: 'pause',
      remainingTime: Math.max(totalDuration - elapsedTime, 0),
      mode,
      totalDuration,
      startTime,
      pausedTime
    })
  }
}

// Função para parar o timer
const stopTimer = () => {
  debugLog('Parando Timer')
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
    remainingTime = 0
    isRunning = false

    // Notificar parada
    self.postMessage({
      type: 'stopped',
      mode,
      totalTime: totalDuration
    })
  }
}

// Listener de mensagens
self.addEventListener('message', (event) => {
  globalLog('Mensagem Recebida no Worker', {
    type: event.data.type,
    duration: event.data.duration,
    mode: event.data.mode,
    savedStartTime: event.data.savedStartTime
  })

  const { type, duration, mode: currentMode, savedStartTime } = event.data

  switch (type) {
    case 'start':
      startTimer(duration, currentMode, savedStartTime)
      break
    case 'pause':
      pauseTimer()
      break
    case 'stop':
      stopTimer()
      break
    default:
      globalLog('Tipo de Mensagem Desconhecido', { type })
  }
})

// Log de inicialização
debugLog('Timer Worker Pronto')
