<template>
  <div class="task-manager">
    <div class="calendar-section">
      <h2>Agenda de Eventos</h2>
      <div class="calendar-controls">
        <button @click="showEventModal = true">+ Novo Evento</button>
        <select v-model="selectedView">
          <option value="month">Mês</option>
          <option value="week">Semana</option>
          <option value="day">Dia</option>
        </select>
      </div>
      
      <div class="calendar">
        <div 
          v-for="event in fixedEvents" 
          :key="event.id" 
          class="calendar-event"
          :class="{ 'past-event': isPastEvent(event) }"
        >
          <div class="event-date">{{ formatDate(event.date) }}</div>
          <div class="event-details">
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
            <div class="event-actions">
              <button @click="editEvent(event)">Editar</button>
              <button @click="deleteEvent(event)">Excluir</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="daily-tasks-section">
      <h2>Tarefas Diárias</h2>
      <div class="daily-tasks-input">
        <input 
          v-model="newDailyTask" 
          @keyup.enter="addDailyTask"
          placeholder="Adicionar tarefa diária"
        />
        <button @click="addDailyTask">Adicionar</button>
      </div>

      <div class="daily-tasks-list">
        <div 
          v-for="task in tasks" 
          :key="task.id" 
          class="daily-task"
          :class="{ 'completed': task.completed }"
        >
          <input 
            type="checkbox" 
            :checked="task.completed"
            @change="toggleTaskCompletion(task.id)"
          />
          <span>{{ task.text }}</span>
          <button @click="removeTask(task.id)">Remover</button>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Evento -->
    <div v-if="showEventModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingEvent ? 'Editar' : 'Novo' }} Evento</h2>
        <input 
          v-model="eventForm.title" 
          placeholder="Título do Evento"
        />
        <input 
          v-model="eventForm.description" 
          placeholder="Descrição"
        />
        <input 
          type="datetime-local" 
          v-model="eventForm.date"
        />
        <div class="modal-actions">
          <button @click="saveEvent">Salvar</button>
          <button @click="closeEventModal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import { useTaskStore } from '../stores/taskStore'

// Eventos Fixos
const fixedEvents = ref([])
const showEventModal = ref(false)
const selectedView = ref('month')
const editingEvent = ref(null)

const eventForm = ref({
  title: '',
  description: '',
  date: ''
})

const addEvent = () => {
  const newEvent = {
    id: Date.now(),
    title: eventForm.value.title,
    description: eventForm.value.description,
    date: new Date(eventForm.value.date)
  }
  fixedEvents.value.push(newEvent)
  saveEvents()
  closeEventModal()
}

const editEvent = (event) => {
  editingEvent.value = event
  eventForm.value = {
    title: event.title,
    description: event.description,
    date: formatDateForInput(event.date)
  }
  showEventModal.value = true
}

const saveEvent = () => {
  if (editingEvent.value) {
    // Atualizar evento existente
    const index = fixedEvents.value.findIndex(e => e.id === editingEvent.value.id)
    if (index !== -1) {
      fixedEvents.value[index] = {
        ...editingEvent.value,
        title: eventForm.value.title,
        description: eventForm.value.description,
        date: new Date(eventForm.value.date)
      }
    }
  } else {
    // Adicionar novo evento
    addEvent()
  }
  saveEvents()
  closeEventModal()
}

const deleteEvent = (event) => {
  fixedEvents.value = fixedEvents.value.filter(e => e.id !== event.id)
  saveEvents()
}

const closeEventModal = () => {
  showEventModal.value = false
  editingEvent.value = null
  eventForm.value = {
    title: '',
    description: '',
    date: ''
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateForInput = (date) => {
  const d = new Date(date)
  return d.toISOString().slice(0, 16)
}

const isPastEvent = (event) => {
  return new Date(event.date) < new Date()
}

const saveEvents = () => {
  localStorage.setItem('productivityEvents', JSON.stringify(fixedEvents.value))
  console.log('Eventos salvos:', fixedEvents.value)
}

// Tarefas Diárias
const { tasks, addTask, removeTask, toggleTaskCompletion } = useTaskStore()
const newDailyTask = ref('')

const addDailyTask = () => {
  const taskText = newDailyTask.value.trim()
  if (taskText) {
    addTask(taskText)
    newDailyTask.value = ''
  }
}

onMounted(() => {
  // Carregar eventos
  const savedEvents = localStorage.getItem('productivityEvents')
  if (savedEvents) {
    fixedEvents.value = JSON.parse(savedEvents).map(event => ({
      ...event,
      date: new Date(event.date)
    }))
    console.log('Eventos carregados:', fixedEvents.value)
  }
})

// Remover listener quando o componente é desmontado
onUnmounted(() => {
})

// Observar mudanças nas tarefas para salvar automaticamente
watch(tasks, () => {
  localStorage.setItem('productivityDailyTasks', JSON.stringify(tasks.value))
}, { deep: true })
</script>

<style scoped>
.task-manager {
  display: flex;
  gap: 20px;
  background-color: var(--background-dark);
  color: var(--text-color);
  padding: 20px;
  border-radius: 10px;
}

.calendar-section, 
.daily-tasks-section {
  flex: 1;
  background-color: var(--background-mid-dark);
  padding: 20px;
  border-radius: 10px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.calendar-controls button,
.daily-tasks-input button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.calendar-event {
  background-color: var(--background-dark);
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
}

.past-event {
  opacity: 0.6;
}

.daily-tasks-input {
  display: flex;
  margin-bottom: 15px;
}

.daily-tasks-input input {
  flex-grow: 1;
  margin-right: 10px;
  padding: 8px;
  background-color: var(--input-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
}

.daily-tasks-list {
  max-height: 300px;
  overflow-y: auto;
}

.daily-task {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: var(--card-background);
  border-radius: 5px;
}

.daily-task input[type="checkbox"] {
  margin-right: 10px;
}

.daily-task span {
  flex-grow: 1;
}

.daily-task.completed span {
  text-decoration: line-through;
  color: var(--text-muted);
}

.daily-task button {
  background-color: var(--danger-color);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
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

.modal-content input {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  background-color: var(--input-background);
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
