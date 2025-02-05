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
        projects.value = JSON.parse(savedProjects)
        
        // Restaurar projeto selecionado
        const lastSelectedProjectId = localStorage.getItem(SELECTED_PROJECT_KEY)
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

  const saveProjects = () => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects.value))
      
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

    // Atualizar streak
    const lastWorkDate = project.lastWorkDate
    if (!lastWorkDate || 
        (today.getDate() === lastWorkDate.getDate() + 1 && 
         today.getMonth() === lastWorkDate.getMonth() && 
         today.getFullYear() === lastWorkDate.getFullYear())) {
      project.streak = lastWorkDate ? project.streak + 1 : 1
    } else if (!lastWorkDate || 
               today.getDate() !== lastWorkDate.getDate() || 
               today.getMonth() !== lastWorkDate.getMonth() || 
               today.getFullYear() !== lastWorkDate.getFullYear()) {
      project.streak = 1
    }

    project.lastWorkDate = today
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
    updateProjectWorkSession
  }
}
