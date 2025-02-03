import { ref } from 'vue'

// Chave para localStorage
const STORAGE_KEY = 'productivityDailyTasks'

// Função para carregar tarefas do localStorage
const loadTasks = () => {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY)
    return savedTasks ? JSON.parse(savedTasks) : []
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error)
    return []
  }
}

export const useTaskStore = () => {
  // Estado das tarefas
  const tasks = ref(loadTasks())

  // Salvar tarefas no localStorage
  const saveTasks = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error)
    }
  }

  // Adicionar tarefa
  const addTask = (taskText) => {
    if (taskText.trim()) {
      tasks.value.push({
        id: Date.now(),
        text: taskText.trim(),
        completed: false
      })
      saveTasks()
    }
  }

  // Remover tarefa
  const removeTask = (taskId) => {
    tasks.value = tasks.value.filter(task => task.id !== taskId)
    saveTasks()
  }

  // Alternar status da tarefa
  const toggleTaskCompletion = (taskId) => {
    const task = tasks.value.find(task => task.id === taskId)
    if (task) {
      task.completed = !task.completed
      saveTasks()
    }
  }

  return {
    tasks,
    addTask,
    removeTask,
    toggleTaskCompletion
  }
}
