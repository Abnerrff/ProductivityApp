import { ref } from 'vue'

const PROJECTS_STORAGE_KEY = 'productivityProjects'
const SELECTED_PROJECT_KEY = 'selectedProjectId'

export const useProjectStore = () => {
  const projects = ref([])
  const selectedProject = ref(null)

  const loadProjects = () => {
    try {
      const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects)
        
        // Filtrar projetos válidos (com nome)
        projects.value = parsedProjects.filter(p => p.name && p.name.trim() !== '')
        
        // Restaurar projeto selecionado
        const lastSelectedProjectId = localStorage.getItem(SELECTED_PROJECT_KEY)
        if (lastSelectedProjectId) {
          const project = projects.value.find(p => p.id.toString() === lastSelectedProjectId)
          if (project) {
            selectedProject.value = project
          }
        }
        
        // Salvar projetos filtrados
        saveProjects()
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
      projects.value = []
    }
  }

  const saveProjects = () => {
    try {
      // Filtrar projetos válidos antes de salvar
      const validProjects = projects.value.filter(p => p.name && p.name.trim() !== '')
      
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(validProjects))
      
      // Salvar ID do projeto selecionado
      if (selectedProject.value) {
        localStorage.setItem(SELECTED_PROJECT_KEY, selectedProject.value.id)
      }
    } catch (error) {
      console.error('Erro ao salvar projetos:', error)
    }
  }

  const createProject = (name, description = '') => {
    if (!name.trim()) {
      throw new Error('Nome do projeto não pode ser vazio')
    }

    const newProject = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      totalHours: 0,
      streak: 0,
      workSessions: []
    }

    projects.value.push(newProject)
    selectedProject.value = newProject
    saveProjects()

    return newProject
  }

  const selectProject = (project) => {
    selectedProject.value = project
    saveProjects()
  }

  const deleteProject = (projectId) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
      
      // Selecionar primeiro projeto se disponível
      if (projects.value.length > 0) {
        selectedProject.value = projects.value[0]
      } else {
        selectedProject.value = null
      }

      saveProjects()
    }
  }

  const clearAllProjects = () => {
    projects.value = []
    selectedProject.value = null
    localStorage.removeItem(PROJECTS_STORAGE_KEY)
    localStorage.removeItem(SELECTED_PROJECT_KEY)
  }

  const updateProjectWorkSession = (project, duration) => {
    const today = new Date()
    const workSession = {
      id: Date.now(),
      date: today,
      duration: duration
    }

    if (!project.workSessions) {
      project.workSessions = []
    }

    project.workSessions.push(workSession)
    project.totalHours += duration / 60  // converter para horas

    saveProjects()
  }

  return {
    projects,
    selectedProject,
    loadProjects,
    saveProjects,
    createProject,
    selectProject,
    deleteProject,
    clearAllProjects,
    updateProjectWorkSession
  }
}
