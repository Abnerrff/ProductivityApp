import { ref, computed } from 'vue'

// Chave para localStorage
const STORAGE_KEY = 'productivityDailyTasks'
const STATS_KEY = 'productivityTaskStats'

// Categorias padrão
const DEFAULT_CATEGORIES = [
  'Trabalho', 
  'Estudo', 
  'Pessoal', 
  'Saúde', 
  'Outros'
]

// Função para carregar tarefas do localStorage
const loadTasks = () => {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY)
    let tasks = savedTasks ? JSON.parse(savedTasks) : []
    
    // Filtrar tarefas em branco
    tasks = tasks.filter(task => 
      task.title && task.title.trim() !== ''
    )
    
    // Se ainda houver tarefas em branco, limpar completamente
    if (tasks.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
    
    return tasks
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error)
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

// Função para carregar estatísticas do localStorage
const loadStats = () => {
  try {
    const savedStats = localStorage.getItem(STATS_KEY)
    return savedStats ? JSON.parse(savedStats) : {
      totalTasksCompleted: 0,
      dailyStreak: 0,
      totalPoints: 0,
      categoryCounts: DEFAULT_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = { total: 0, completed: 0 }
        return acc
      }, {})
    }
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    localStorage.removeItem(STATS_KEY)
    return {
      totalTasksCompleted: 0,
      dailyStreak: 0,
      totalPoints: 0,
      categoryCounts: DEFAULT_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = { total: 0, completed: 0 }
        return acc
      }, {})
    }
  }
}

export const useTaskStore = () => {
  // Estado das tarefas
  const tasks = ref(loadTasks())
  const stats = ref(loadStats())

  // Salvar tarefas no localStorage
  const saveTasks = () => {
    try {
      // Filtrar tarefas em branco antes de salvar
      const validTasks = tasks.value.filter(task => 
        task.title && task.title.trim() !== ''
      )
      
      if (validTasks.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validTasks))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error)
    }
  }

  // Salvar estatísticas no localStorage
  const saveStats = () => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats.value))
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error)
    }
  }

  // Adicionar nova tarefa com categoria e pontuação
  const addTask = (title, category = 'Outros', difficulty = 'Média') => {
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
      category,
      difficulty,
      createdAt: new Date().toISOString()
    }
    
    tasks.value.push(newTask)
    
    // Atualizar contagem de categorias
    stats.value.categoryCounts[category].total++
    
    saveTasks()
    return newTask
  }

  // Remover tarefa
  const removeTask = (taskId) => {
    const taskIndex = tasks.value.findIndex(task => task.id === taskId)
    if (taskIndex !== -1) {
      const removedTask = tasks.value[taskIndex]
      
      // Atualizar contagem de categorias
      stats.value.categoryCounts[removedTask.category].total--
      if (removedTask.completed) {
        stats.value.categoryCounts[removedTask.category].completed--
      }
      
      tasks.value.splice(taskIndex, 1)
      saveTasks()
      saveStats()
    }
  }

  // Alternar status da tarefa
  const toggleTask = (taskId) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      
      // Calcular pontos baseado na dificuldade
      const pointsMap = {
        'Fácil': 1,
        'Média': 2,
        'Difícil': 3
      }
      
      if (task.completed) {
        // Incrementar estatísticas
        stats.value.totalTasksCompleted++
        stats.value.totalPoints += pointsMap[task.difficulty] || 2
        stats.value.categoryCounts[task.category].completed++
      } else {
        // Decrementar estatísticas se a tarefa for desmarcada
        stats.value.totalTasksCompleted--
        stats.value.totalPoints -= pointsMap[task.difficulty] || 2
        stats.value.categoryCounts[task.category].completed--
      }
      
      saveTasks()
      saveStats()
    }
  }

  // Reordenar tarefas
  const reorderTasks = (newOrder) => {
    tasks.value = newOrder
    saveTasks()
  }

  // Computar estatísticas
  const taskStats = computed(() => ({
    totalTasks: tasks.value.length,
    completedTasks: tasks.value.filter(t => t.completed).length,
    completionRate: tasks.value.length > 0 
      ? (tasks.value.filter(t => t.completed).length / tasks.value.length * 100).toFixed(2) 
      : 0,
    categoryCounts: stats.value.categoryCounts,
    totalPoints: stats.value.totalPoints
  }))

  // Filtrar tarefas por categoria
  const filterTasksByCategory = (category) => {
    return tasks.value.filter(task => task.category === category)
  }

  return {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    taskStats,
    filterTasksByCategory,
    reorderTasks,
    categories: DEFAULT_CATEGORIES
  }
}
