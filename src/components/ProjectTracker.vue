<template>
  <div class="project-tracker">
    <div class="projects-header">
      <h2>Projetos</h2>
      <button @click="showProjectModal = true">+ Novo Projeto</button>
    </div>

    <div class="projects-list">
      <div 
        v-for="project in projects" 
        :key="project.id" 
        class="project-card"
        @click="selectProject(project)"
        :class="{ 'active-project': selectedProject?.id === project.id }"
      >
        <div class="project-info">
          <h3>{{ project.name }}</h3>
          <div class="project-stats">
            <div class="project-hours">
              <span>Horas Dedicadas:</span>
              <strong>{{ formatHours(project.totalHours) }}</strong>
            </div>
            <div class="project-streak">
              <span>Streak:</span>
              <strong>{{ project.streak }} dias</strong>
            </div>
          </div>
        </div>
        <div class="project-actions">
          <button @click.stop="editProject(project)">Editar</button>
          <button @click.stop="deleteProject(project)">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Modal de Novo/Editar Projeto -->
    <div v-if="showProjectModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingProject ? 'Editar' : 'Novo' }} Projeto</h2>
        <input 
          v-model="projectForm.name" 
          placeholder="Nome do Projeto"
        />
        <textarea 
          v-model="projectForm.description" 
          placeholder="Descrição do Projeto"
        ></textarea>
        <div class="modal-actions">
          <button @click="saveProject">Salvar</button>
          <button @click="closeProjectModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Detalhes do Projeto Selecionado -->
    <div v-if="selectedProject" class="project-details">
      <h3>{{ selectedProject.name }}</h3>
      <p>{{ selectedProject.description }}</p>
      
      <div class="project-work-sessions">
        <h4>Sessões de Trabalho</h4>
        <div 
          v-for="session in selectedProject.workSessions" 
          :key="session.id" 
          class="work-session"
        >
          <span>{{ formatDate(session.date) }}</span>
          <span>{{ formatHours(session.duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

// Projetos
const projects = ref([])
const showProjectModal = ref(false)
const editingProject = ref(null)
const selectedProject = ref(null)

const projectForm = ref({
  name: '',
  description: ''
})

// Função para adicionar/editar projeto
const saveProject = () => {
  if (editingProject.value) {
    // Editar projeto existente
    const index = projects.value.findIndex(p => p.id === editingProject.value.id)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        name: projectForm.value.name,
        description: projectForm.value.description
      }
    }
  } else {
    // Adicionar novo projeto
    const newProject = {
      id: Date.now(),
      name: projectForm.value.name,
      description: projectForm.value.description,
      totalHours: 0,
      streak: 0,
      workSessions: [],
      lastWorkDate: null
    }
    projects.value.push(newProject)
  }
  
  saveProjects()
  closeProjectModal()
}

// Selecionar projeto
const selectProject = (project) => {
  selectedProject.value = project
}

// Editar projeto
const editProject = (project) => {
  editingProject.value = project
  projectForm.value = {
    name: project.name,
    description: project.description || ''
  }
  showProjectModal.value = true
}

// Excluir projeto
const deleteProject = (project) => {
  projects.value = projects.value.filter(p => p.id !== project.id)
  if (selectedProject.value?.id === project.id) {
    selectedProject.value = null
  }
  saveProjects()
}

// Fechar modal
const closeProjectModal = () => {
  showProjectModal.value = false
  editingProject.value = null
  projectForm.value = {
    name: '',
    description: ''
  }
}

// Adicionar sessão de trabalho
const addWorkSession = (duration) => {
  if (!selectedProject.value) return

  const today = new Date().toDateString()
  const lastWorkDate = selectedProject.value.lastWorkDate 
    ? new Date(selectedProject.value.lastWorkDate).toDateString() 
    : null

  // Atualizar sessões de trabalho
  const workSession = {
    id: Date.now(),
    date: new Date(),
    duration: duration / 60 // converter segundos para minutos
  }
  selectedProject.value.workSessions.push(workSession)

  // Atualizar total de horas
  selectedProject.value.totalHours += duration / 3600 // converter segundos para horas

  // Atualizar streak
  if (lastWorkDate !== today) {
    selectedProject.value.streak++
    selectedProject.value.lastWorkDate = new Date()
  }

  saveProjects()
}

// Formatar horas
const formatHours = (hours) => {
  return hours.toFixed(2) + 'h'
}

// Formatar data
const formatDate = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Salvar projetos
const saveProjects = () => {
  localStorage.setItem('productivityProjects', JSON.stringify(projects.value))
  console.log('Projetos salvos:', projects.value)
}

// Carregar dados salvos
onMounted(() => {
  const savedProjects = localStorage.getItem('productivityProjects')
  if (savedProjects) {
    projects.value = JSON.parse(savedProjects).map(project => ({
      ...project,
      workSessions: project.workSessions || [],
      lastWorkDate: project.lastWorkDate ? new Date(project.lastWorkDate) : null
    }))
    console.log('Projetos carregados:', projects.value)
  }

  // Definir título da página
  if (getCurrentInstance()?.appContext.config.globalProperties.$setPageTitle) {
    getCurrentInstance().appContext.config.globalProperties.$setPageTitle('Projetos')
  } else {
    document.title = 'Projetos | Productivity App'
  }
})

// Expor função para adicionar sessão de trabalho
defineExpose({
  addWorkSession
})
</script>

<style scoped>
.project-tracker {
  background-color: var(--background-dark);
  color: var(--text-color);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.projects-header button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.project-card {
  background-color: var(--background-mid-dark);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-card:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.project-card.active-project {
  border: 2px solid var(--primary-color);
}

.project-info h3 {
  margin-bottom: 10px;
}

.project-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.project-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.project-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.project-actions button:first-child {
  background-color: var(--primary-color);
  color: white;
}

.project-actions button:last-child {
  background-color: #f44336;
  color: white;
}

.project-details {
  margin-top: 20px;
  background-color: var(--background-mid-dark);
  padding: 15px;
  border-radius: 10px;
}

.project-work-sessions {
  margin-top: 15px;
}

.work-session {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: var(--background-dark);
  margin-bottom: 5px;
  border-radius: 5px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--background-dark);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  background-color: var(--background-mid-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: var(--primary-color);
  color: white;
}

.modal-actions button:last-child {
  background-color: #f44336;
  color: white;
}
</style>
