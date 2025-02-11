<template>
  <div class="projects-container">
    <div class="projects-header">
      <h2>Tempo Dedicado</h2>
      <div class="btn-new-project-container">
        <button 
          @click="openCreateProjectModal" 
          class="btn-new-project"
        >
          <i class="fas fa-plus"></i> Novo Projeto
        </button>
      </div>
    </div>

    <div v-if="projects.length === 0" class="no-projects-placeholder">
      <img src="@/assets/images/empty-projects.svg" alt="Sem projetos" />
      <p>Você ainda não tem projetos. Que tal criar um?</p>
      <button 
        @click="openCreateProjectModal" 
        class="btn-create-first-project"
      >
        Criar Primeiro Projeto
      </button>
    </div>

    <div v-else class="projects-grid">
      <div 
        v-for="project in sortedProjects" 
        :key="project.id" 
        class="project-card"
      >
        <div class="project-card-header">
          <h3>{{ project.title }}</h3>
        </div>
        
        <div class="project-card-body">
          <div class="project-time-focus">
            <div class="time-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="time-details">
              <span class="time-label">Tempo Total</span>
              <strong class="time-value">
                {{ formatTime(project.timeSpent) }}
              </strong>
            </div>
          </div>
          
          <div class="project-progress">
            <div 
              class="progress-bar" 
              :style="{ width: `${project.progress}%` }"
            ></div>
          </div>
        </div>
        
        <div class="project-card-actions">
          <button 
            @click="editProject(project)" 
            class="btn-edit"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            @click="confirmDeleteProject(project)" 
            class="btn-delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Criação/Edição de Projeto -->
    <div 
      v-if="showProjectModal" 
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Projeto' : 'Novo Projeto' }}</h2>
        
        <form @submit.prevent="saveProject" class="project-form">
          <div class="form-row">
            <div class="form-group">
              <label for="projectTitle">Título do Projeto</label>
              <input 
                type="text" 
                id="projectTitle"
                v-model="currentProject.title" 
                required 
                placeholder="Digite o título do projeto"
              />
            </div>
            
            <div class="form-group">
              <label for="projectDescription">Descrição</label>
              <textarea 
                id="projectDescription"
                v-model="currentProject.description" 
                placeholder="Descreva brevemente o projeto"
              ></textarea>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Data de Início</label>
              <input 
                type="date" 
                id="startDate"
                v-model="currentProject.startDate" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="endDate">Data de Conclusão</label>
              <input 
                type="date" 
                id="endDate"
                v-model="currentProject.endDate" 
                required
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="status">Status</label>
              <select 
                id="status"
                v-model="currentProject.status"
              >
                <option value="não iniciado">Não Iniciado</option>
                <option value="em andamento">Em Andamento</option>
                <option value="concluído">Concluído</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="progress">Progresso (%)</label>
              <input 
                type="number" 
                id="progress"
                v-model.number="currentProject.progress" 
                min="0" 
                max="100"
                placeholder="0-100"
              />
            </div>
            
            <div class="form-group">
              <label for="timeSpent">Tempo dedicado (minutos)</label>
              <input 
                type="number" 
                id="timeSpent"
                v-model.number="currentProject.timeSpent" 
                min="0"
                placeholder="Tempo dedicado"
              />
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              type="button" 
              @click="closeModal" 
              class="btn-secondary"
            >
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-danger"
            >
              <i class="fas fa-save"></i> {{ isEditing ? 'Atualizar' : 'Criar' }} Projeto
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div 
      v-if="showDeleteConfirmModal" 
      class="modal-overlay"
      @click.self="cancelDelete"
    >
      <div class="modal-content delete-confirm">
        <h2>Confirmar Exclusão</h2>
        <p>Tem certeza que deseja excluir o projeto "{{ projectToDelete?.title }}"?</p>
        
        <div class="modal-actions">
          <button 
            @click="cancelDelete" 
            class="btn-secondary"
          >
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button 
            @click="confirmDelete" 
            class="btn-danger"
          >
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { useProjectsStore } from '@/stores/projectsStore'

// Configurações do store
const projectsStore = useProjectsStore()
const projects = ref(projectsStore.projects)

// Função para formatar tempo em horas e minutos
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`
  }
  
  return `${minutes}min`
}

// Sincronização robusta de projetos
watch(() => projectsStore.projects, (newProjects) => {
  console.log('🔄 Store de projetos atualizado:', newProjects)
  projects.value = [...newProjects]
}, { deep: true })

// Garantir que projetos sejam carregados na inicialização
onMounted(() => {
  console.group('🚀 Inicialização do Componente de Projetos')
  
  // Forçar carregamento de projetos
  projectsStore.loadProjects()
  
  // Atualizar lista local
  projects.value = [...projectsStore.projects]
  
  console.log('📋 Projetos carregados:', projects.value)
  console.groupEnd()
})

// Estados do modal
const showProjectModal = ref(false)
const showDeleteConfirmModal = ref(false)
const isEditing = ref(false)

// Projeto atual para edição/criação
const currentProject = ref({
  id: null,
  title: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'não iniciado',
  progress: 0,
  timeSpent: 0
})

// Projeto para exclusão
const projectToDelete = ref(null)

// Projetos ordenados por data de início
const sortedProjects = computed(() => {
  return [...projects.value].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  )
})

// Métodos de formatação
const formatDate = (dateString) => {
  try {
    return dateString 
      ? format(parseISO(dateString), 'dd/MM/yyyy') 
      : 'Não definido'
  } catch {
    return 'Data inválida'
  }
}

// Determinar classe de status do projeto
const getProjectStatusClass = (project) => {
  const statusClasses = {
    'não iniciado': 'status-not-started',
    'em andamento': 'status-in-progress',
    'concluído': 'status-completed'
  }
  return statusClasses[project.status] || ''
}

// Abrir modal para criar projeto
const openCreateProjectModal = () => {
  currentProject.value = {
    id: null,
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'não iniciado',
    progress: 0,
    timeSpent: 0
  }
  isEditing.value = false
  showProjectModal.value = true
}

// Editar projeto existente
const editProject = (project) => {
  console.log('📝 Editando projeto:', project)
  currentProject.value = { ...project }
  isEditing.value = true
  showProjectModal.value = true
}

// Salvar projeto
const saveProject = () => {
  console.group('💾 Salvando Projeto')
  console.log('Dados do projeto:', JSON.parse(JSON.stringify(currentProject.value)))
  
  // Validações rigorosas
  const validationErrors = []
  
  if (!currentProject.value.title || currentProject.value.title.trim() === '') {
    validationErrors.push('Título é obrigatório')
  }
  
  if (!currentProject.value.startDate) {
    validationErrors.push('Data de início é obrigatória')
  }
  
  if (!currentProject.value.endDate) {
    validationErrors.push('Data final é obrigatória')
  }
  
  if (validationErrors.length > 0) {
    console.error('❌ Erros de validação:', validationErrors)
    alert(validationErrors.join('\n'))
    console.groupEnd()
    return
  }

  // Preparar projeto para salvar
  const projectToSave = {
    id: currentProject.value.id || String(Date.now()),
    title: currentProject.value.title.trim(),
    description: currentProject.value.description || '',
    startDate: currentProject.value.startDate,
    endDate: currentProject.value.endDate,
    status: currentProject.value.status || 'não iniciado',
    progress: currentProject.value.progress || 0,
    timeSpent: currentProject.value.timeSpent || 0
  }

  console.log('📝 Projeto preparado para salvar:', projectToSave)

  try {
    // Usar método específico de adição ou atualização
    let savedProject
    if (isEditing.value) {
      savedProject = projectsStore.updateProject(projectToSave.id, projectToSave)
    } else {
      savedProject = projectsStore.addProject(projectToSave)
    }

    console.log('✅ Projeto salvo:', savedProject)
    
    // Atualizar lista local de projetos
    const index = projects.value.findIndex(p => p.id === savedProject.id)
    if (index !== -1) {
      projects.value[index] = savedProject
      console.log('🔄 Projeto atualizado na lista local')
    } else {
      projects.value.push(savedProject)
      console.log('➕ Novo projeto adicionado à lista local')
    }

    // Forçar salvamento no localStorage
    localStorage.setItem('productivityProjects', JSON.stringify(projects.value))
    console.log('💾 Projetos salvos no localStorage')

    closeModal()
    console.groupEnd()
  } catch (error) {
    console.error('❌ Erro crítico ao salvar projeto:', error)
    alert('Erro ao salvar o projeto. Detalhes no console.')
    console.groupEnd()
  }
}

// Confirmar exclusão de projeto
const confirmDeleteProject = (project) => {
  console.log('🗑️ Confirmando exclusão de projeto:', project)
  projectToDelete.value = project
  showDeleteConfirmModal.value = true
}

// Cancelar exclusão
const cancelDelete = () => {
  projectToDelete.value = null
  showDeleteConfirmModal.value = false
}

// Confirmar exclusão
const confirmDelete = () => {
  if (projectToDelete.value) {
    console.log('🗑️ Excluindo projeto:', projectToDelete.value)
    
    try {
      projectsStore.deleteProject(projectToDelete.value.id)
      
      // Remover projeto da lista local
      projects.value = projects.value.filter(p => p.id !== projectToDelete.value.id)
      
      // Atualizar localStorage
      localStorage.setItem('productivityProjects', JSON.stringify(projects.value))
      
      cancelDelete()
    } catch (error) {
      console.error('❌ Erro ao excluir projeto:', error)
      alert('Erro ao excluir o projeto. Tente novamente.')
    }
  }
}

// Fechar modal
const closeModal = () => {
  showProjectModal.value = false
  showDeleteConfirmModal.value = false
  currentProject.value = {
    id: null,
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'não iniciado',
    progress: 0,
    timeSpent: 0
  }
}
</script>

<style scoped>
:root {
  --bg-dark: #121212;
  --bg-card: #1c1c1c;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --accent-blue: #4a9eff;
  --accent-green: #2ecc71;
  --accent-orange: #f39c12;
}

.projects-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  background-color: var(--bg-dark);
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 2px solid rgba(74, 158, 255, 0.2);
  padding-bottom: 15px;
}

.projects-header h2 {
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 300;
  margin: 0;
}

.btn-new-project {
  background-color: rgba(74, 158, 255, 0.1);
  color: var(--accent-blue);
  border: 2px solid var(--accent-blue);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 300;
  transition: all 0.3s ease;
}

.btn-new-project:hover {
  background-color: rgba(74, 158, 255, 0.2);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.project-card {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--accent-blue), var(--accent-green));
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.project-card-header h3 {
  color: var(--accent-blue);
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.project-card:hover .project-card-header h3 {
  color: var(--accent-green);
}

.project-time-focus {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.time-icon {
  background-color: rgba(74, 158, 255, 0.1);
  color: var(--accent-blue);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  border: 2px solid var(--accent-blue);
  transition: all 0.3s ease;
}

.time-details {
  display: flex;
  flex-direction: column;
}

.time-label {
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 5px;
  letter-spacing: 1px;
}

.time-value {
  color: var(--accent-green);
  font-size: 1.8rem;
  font-weight: 400;
}

.project-progress {
  background-color: rgba(46, 204, 113, 0.1);
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 15px;
}

.progress-bar {
  background: linear-gradient(to right, var(--accent-blue), var(--accent-green));
  height: 100%;
  transition: width 0.5s ease;
}

.project-card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.btn-edit:hover {
  color: var(--accent-blue);
  opacity: 1;
}

.btn-delete:hover {
  color: var(--accent-orange);
  opacity: 1;
}
</style>
