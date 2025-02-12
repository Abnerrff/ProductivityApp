import { ref, onMounted } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const PROJECTS_STORAGE_KEY = 'productivityProjects_v1'
const PROJECTS_BACKUP_KEY = 'productivityProjects_backup'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])

  // Função para migrar dados antigos ou corruptos
  const migrateProjects = (savedProjects) => {
    console.group('🔄 Migrando Projetos')
    console.log('Projetos salvos:', savedProjects)
    
    // Validar e transformar projetos
    const migratedProjects = savedProjects.map(project => ({
      id: project.id || String(Date.now()),
      title: project.title?.trim() || 'Projeto sem título',
      description: project.description || '',
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      endDate: project.endDate || '',
      status: project.status || 'não iniciado',
      progress: project.progress || 0,
      // Novo campo para tempo gasto
      timeSpent: project.timeSpent || 0  // Em minutos
    })).filter(project => project.title !== 'Projeto sem título')

    console.log('Projetos migrados:', migratedProjects)
    console.groupEnd()
    
    return migratedProjects
  }

  // Carregar projetos do localStorage com múltiplas camadas de fallback
  const loadProjects = () => {
    try {
      console.group('🔍 Carregando Projetos')
      
      // Tentar carregar da chave principal
      let savedProjects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]')
      
      // Se estiver vazio, tentar backup
      if (savedProjects.length === 0) {
        console.warn('⚠️ Carregando do backup')
        savedProjects = JSON.parse(localStorage.getItem(PROJECTS_BACKUP_KEY) || '[]')
      }
      
      // Migrar e validar projetos
      const validProjects = migrateProjects(savedProjects)
      
      console.log('✅ Projetos carregados:', validProjects)
      projects.value = validProjects
      
      // Salvar projetos migrados
      saveProjects()
      
      console.groupEnd()
    } catch (error) {
      console.error('🚨 Erro crítico ao carregar projetos:', error)
      projects.value = []
    }
  }

  // Salvar projetos no localStorage com backup
  const saveProjects = () => {
    try {
      console.group('💾 Salvando Projetos')
      
      // Filtrar projetos válidos
      const validProjects = projects.value.filter(project => 
        project && 
        project.title && 
        project.title.trim() !== ''
      )
      
      console.log('Projetos para salvar:', validProjects)
      
      // Salvar na chave principal
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(validProjects))
      
      // Criar backup
      localStorage.setItem(PROJECTS_BACKUP_KEY, JSON.stringify(validProjects))
      
      console.log('✅ Projetos salvos com sucesso')
      console.groupEnd()
    } catch (error) {
      console.error('🚨 Erro ao salvar projetos:', error)
      
      // Último recurso: tentar salvar lista vazia
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, '[]')
        localStorage.setItem(PROJECTS_BACKUP_KEY, '[]')
      } catch (fallbackError) {
        console.error('❌ Falha total de salvamento', fallbackError)
      }
    }
  }

  // Adicionar projeto
  const addProject = (project) => {
    console.group('➕ Adicionando Projeto')
    
    // Garantir dados completos
    const projectToAdd = {
      id: project.id || String(Date.now()),
      title: project.title.trim(),
      description: project.description || '',
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      endDate: project.endDate || '',
      status: project.status || 'não iniciado',
      progress: project.progress || 0,
      timeSpent: project.timeSpent || 0
    }
    
    console.log('Projeto a adicionar:', projectToAdd)
    
    projects.value.push(projectToAdd)
    saveProjects()
    
    console.log('✅ Projeto adicionado')
    console.groupEnd()
    
    return projectToAdd
  }

  // Atualizar projeto
  const updateProject = (id, updatedProject) => {
    console.group('🔄 Atualizando Projeto')
    
    const index = projects.value.findIndex(p => p.id === id)
    
    if (index !== -1) {
      // Manter o ID original e garantir dados completos
      const projectToUpdate = {
        id: id,
        title: updatedProject.title.trim(),
        description: updatedProject.description || '',
        startDate: updatedProject.startDate || new Date().toISOString().split('T')[0],
        endDate: updatedProject.endDate || '',
        status: updatedProject.status || 'não iniciado',
        progress: updatedProject.progress || 0,
        timeSpent: updatedProject.timeSpent || 0
      }
      
      projects.value[index] = projectToUpdate
      saveProjects()
      
      console.log('✅ Projeto atualizado')
      console.groupEnd()
      
      return projectToUpdate
    } else {
      // Se não encontrar, adiciona como novo
      console.warn('⚠️ Projeto não encontrado, adicionando como novo')
      const newProject = addProject(updatedProject)
      console.groupEnd()
      return newProject
    }
  }

  // Excluir projeto
  const deleteProject = (id) => {
    console.group('🗑️ Excluindo Projeto')
    
    const initialLength = projects.value.length
    projects.value = projects.value.filter(p => p.id !== id)
    
    if (projects.value.length < initialLength) {
      saveProjects()
      console.log('✅ Projeto excluído com sucesso')
    } else {
      console.warn('❌ Projeto não encontrado para exclusão')
    }
    
    console.groupEnd()
  }

  // Limpar todos os projetos
  const clearAllProjects = () => {
    console.group('🧹 Limpando Todos os Projetos')
    projects.value = []
    saveProjects()
    console.log('✅ Todos os projetos removidos')
    console.groupEnd()
  }

  // Adicionar tempo gasto ao projeto
  const addProjectTime = (projectId, minutes) => {
    const projectIndex = projects.value.findIndex(p => p.id === projectId)
    
    if (projectIndex !== -1) {
      projects.value[projectIndex].timeSpent += minutes
      
      // Atualizar localStorage
      saveProjects()
      
      console.log(`⏱️ Adicionado ${minutes} minutos ao projeto ${projects.value[projectIndex].title}`)
      
      return projects.value[projectIndex]
    }
    
    return null
  }

  // Atualizar tempo do projeto
  const updateProjectTime = async (projectId, minutes) => {
    try {
      const response = await axios.patch(`/api/projects/${projectId}/time`, { minutes })
      
      // Atualizar projeto localmente
      const projectIndex = projects.value.findIndex(p => p.id === projectId)
      if (projectIndex !== -1) {
        projects.value[projectIndex] = {
          ...projects.value[projectIndex],
          totalWorkTime: response.data.totalWorkTime,
          totalPomodoroSessions: response.data.totalPomodoroSessions
        }
      }

      return response.data
    } catch (error) {
      console.error('Erro ao atualizar tempo do projeto:', error)
      return null
    }
  }

  // Inicializar carregamento de projetos
  loadProjects()

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    clearAllProjects,
    loadProjects,
    addProjectTime,
    updateProjectTime
  }
}, {
  // Configurações de persistência do Pinia
  persist: {
    enabled: true,
    strategies: [
      {
        key: PROJECTS_STORAGE_KEY,
        storage: localStorage
      }
    ]
  }
})
