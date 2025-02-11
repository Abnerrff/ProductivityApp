<template>
  <div class="projects-container">
    <div class="projects-header">
      <h2>Meus Projetos</h2>
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
          <span 
            :class="['project-status', getProjectStatusClass(project)]"
          >
            {{ project.status }}
          </span>
        </div>
        
        <div class="project-card-body">
          <p class="project-description">{{ project.description || 'Sem descrição' }}</p>
          
          <div class="project-dates">
            <div class="start-date">
              <i class="fas fa-calendar-alt"></i>
              Início: {{ formatDate(project.startDate) }}
            </div>
            <div class="end-date">
              <i class="fas fa-clock"></i>
              Tempo dedicado: {{ formatTime(project.timeSpent) }}
            </div>
          </div>
          
          <div class="project-progress">
            <div 
              class="progress-bar" 
              :style="{ width: `${project.progress}%` }"
            ></div>
            <span>{{ project.progress }}% concluído</span>
          </div>
        </div>
        
        <div class="project-card-actions">
          <button 
            @click="editProject(project)" 
            class="btn-edit"
          >
            <i class="fas fa-edit"></i> Editar
          </button>
          <button 
            @click="confirmDeleteProject(project)" 
            class="btn-delete"
          >
            <i class="fas fa-trash"></i> Excluir
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
  --primary-color: #3C3C3C;        /* Cinza escuro para substituir azul */
  --secondary-color: #2C2C2C;      /* Cinza mais escuro para substituir verde */
  --danger-color: #4C1C1C;         /* Tom de vermelho escuro */
  --text-color: #E0E0E0;           /* Texto claro para contraste */
  --background-color: #121212;     /* Fundo escuro */
  --card-background: #1C1C1C;      /* Fundo de cartão */
  --border-color: #2C2C2C;         /* Cor de borda */
  --input-background: #2A2A2A;     /* Fundo de input mais contrastante */
  --modal-background: #161616;     /* Fundo do modal mais escuro */
  --silver-border: #A0A0A0;        /* Cor prata para borda */
  --modal-overlay: rgba(0, 0, 0, 0.9);  /* Fundo do overlay mais opaco */
}

.projects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;  /* Aumentei para 40px para mais espaço */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--modal-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: var(--modal-background);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 50px;  /* Aumentei o padding */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
  color: var(--text-color);
  position: relative;
  border: 3px solid var(--silver-border);
  animation: fadeIn 0.4s ease-out;
}

.project-card {
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--border-color);
}

.project-card-header h3 {
  margin: 0;
  color: var(--text-color);
}

.project-card-actions {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-edit:hover {
  color: var(--primary-color);
}

.btn-delete:hover {
  color: var(--danger-color);
}

.project-card-body {
  padding: 15px;
}

.project-description {
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 15px;
}

.project-dates {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: var(--text-color);
}

.project-dates i {
  margin-right: 8px;
  opacity: 0.6;
}

.project-progress {
  background-color: var(--border-color);
  border-radius: 10px;
  height: 20px;
  margin-bottom: 15px;
  position: relative;
}

.progress-bar {
  background-color: var(--primary-color);
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color);
  font-size: 0.8rem;
}

.project-status-badge {
  text-align: center;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
}

.status-not-started {
  background-color: #3C3C3C;
  color: var(--text-color);
}

.status-in-progress {
  background-color: #2C2C2C;
  color: var(--text-color);
}

.status-completed {
  background-color: #1C1C1C;
  color: var(--text-color);
}

.no-projects-placeholder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  background-color: var(--card-background);
  border-radius: 8px;
  color: var(--text-color);
}

.no-projects-placeholder i {
  font-size: 3rem;
  color: var(--border-color);
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 25px;  /* Aumentei o gap entre os campos */
  margin-bottom: 25px;  /* Espaçamento maior entre linhas de formulário */
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 12px;
  color: var(--text-color);
  font-weight: 500;
  font-size: 1rem;
  opacity: 0.8;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 15px;
  background-color: var(--input-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--silver-border);
  box-shadow: 0 0 10px rgba(160, 160, 160, 0.4);
  transform: translateY(-2px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;  /* Espaçamento maior no cabeçalho */
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
  font-weight: 600;
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.modal-close-btn:hover {
  opacity: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.projects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
}

.projects-header h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.8rem;
}

.btn-new-project-container {
  position: absolute;
  top: 0;
  right: 0;
}

.btn-new-project {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3C3C3C, #2C2C2C);
  color: var(--text-color);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Resto do CSS de botão permanece igual */
.btn-secondary, 
.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: linear-gradient(135deg, #2C2C2C, #1C1C1C);
  color: var(--text-color);
}

.btn-danger {
  background: linear-gradient(135deg, #4C1C1C, #3C0C0C);
  color: #FF6B6B;
}

.btn-secondary::before,
.btn-danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg, 
    transparent, 
    rgba(255,255,255,0.1), 
    transparent
  );
  transition: all 0.5s ease;
}

.btn-secondary:hover::before,
.btn-danger:hover::before {
  left: 100%;
}

.btn-secondary:hover,
.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 8px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-secondary i,
.btn-danger i {
  font-size: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
