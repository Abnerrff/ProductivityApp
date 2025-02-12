<template>
  <div class="agenda-container">
    <div class="agenda-header">
      <h2>Agenda e Calendário</h2>
      <div class="agenda-actions">
        <button @click="openNewEventModal" class="add-event-btn">
          + Novo Evento
        </button>
        <div class="view-toggle">
          <button 
            @click="currentView = 'calendar'"
            :class="{ active: currentView === 'calendar' }"
          >
            Calendário
          </button>
          <button 
            @click="currentView = 'list'"
            :class="{ active: currentView === 'list' }"
          >
            Lista
          </button>
        </div>
      </div>
    </div>

    <!-- Visualização de Calendário -->
    <div v-if="currentView === 'calendar'" class="calendar-view">
      <div class="calendar-navigation">
        <button @click="previousMonth">&lt;</button>
        <h3>{{ currentMonthYear }}</h3>
        <button @click="nextMonth">&gt;</button>
      </div>

      <div class="agenda-grid">
        <div 
          v-for="day in calendarDays" 
          :key="day.date" 
          class="day-card"
          :class="{
            'current-month': day.isCurrentMonth,
            'has-events': day.events.length > 0
          }"
          @click="selectDay(day)"
        >
          <span class="day-number">{{ day.dayNumber }}</span>
          <div 
            v-if="day.events.length > 0" 
            class="day-events"
          >
            <span 
              v-for="event in day.events" 
              :key="event.id"
              class="event-dot"
              :style="{ backgroundColor: getEventColor(event) }"
            ></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização de Lista -->
    <div v-else-if="currentView === 'list'" class="agenda-list-view">
      <div 
        v-for="(dayEvents, date) in groupedEvents" 
        :key="date" 
        class="agenda-list-day"
      >
        <h4>{{ formatListDate(date) }}</h4>
        <div 
          v-for="event in dayEvents" 
          :key="event.id" 
          class="agenda-list-event"
        >
          <div class="event-time">{{ formatTime(event.startTime) }}</div>
          <div class="event-details">
            <span 
              class="event-color-dot" 
              :style="{ backgroundColor: getEventColor(event) }"
            ></span>
            <span class="event-title">{{ event.title }}</span>
            <span class="event-location">{{ event.location || 'Sem local' }}</span>
          </div>
          <div class="event-actions">
            <button @click="editEvent(event)">Editar</button>
            <button @click="deleteEvent(event)">Excluir</button>
            <div 
              class="event-status-badge" 
              :class="event.status"
              @click="toggleEventStatus(event)"
            >
              {{ event.status }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Evento -->
    <div v-if="showNewEventModal" class="modal">
      <div class="modal-content">
        <h2>Novo Evento</h2>
        <form @submit.prevent="createEvent">
          <div class="form-group">
            <label>Título</label>
            <input 
              v-model="newEvent.title" 
              type="text" 
              required 
              placeholder="Nome do evento"
            >
          </div>
          <div class="form-group">
            <label>Data</label>
            <input 
              v-model="newEvent.date" 
              type="date" 
              required
            >
          </div>
          <div class="form-group">
            <label>Hora de Início</label>
            <input 
              v-model="newEvent.startTime" 
              type="time"
            >
          </div>
          <div class="form-group">
            <label>Hora de Término</label>
            <input 
              v-model="newEvent.endTime" 
              type="time"
            >
          </div>
          <div class="form-group">
            <label>Local</label>
            <input 
              v-model="newEvent.location" 
              type="text" 
              placeholder="Local do evento (opcional)"
            >
          </div>
          <div class="form-group">
            <label>Cor do Evento</label>
            <select v-model="newEvent.color">
              <option value="#FF6B6B">Vermelho</option>
              <option value="#4ECDC4">Verde</option>
              <option value="#45B7D1">Azul</option>
              <option value="#FDCB6E">Amarelo</option>
              <option value="#6C5CE7">Roxo</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status do Evento</label>
            <select v-model="newEvent.status">
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluído">Concluído</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea 
              v-model="newEvent.description" 
              placeholder="Detalhes do evento (opcional)"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit">Salvar Evento</button>
            <button type="button" @click="closeNewEventModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Estado do componente
const currentDate = ref(new Date())
const currentView = ref('calendar')
const showNewEventModal = ref(false)
const events = ref([])

// Novo evento
const newEvent = ref({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  color: '#FF6B6B',
  description: '',
  status: 'pendente'
})

// Computados
const currentMonthYear = computed(() => 
  format(currentDate.value, 'MMMM yyyy', { locale: ptBR })
)

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const monthEnd = endOfMonth(currentDate.value)
  
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(date => ({
    date: date,
    dayNumber: date.getDate(),
    isCurrentMonth: date.getMonth() === currentDate.value.getMonth(),
    events: events.value.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    )
  }))
  
  return days
})

const groupedEvents = computed(() => {
  return events.value.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = []
    }
    acc[event.date].push(event)
    return acc
  }, {})
})

// Métodos de navegação
const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
}

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
}

// Métodos de eventos
const fetchEvents = async () => {
  try {
    // Simular busca de eventos
    events.value = [
      {
        id: '1',
        title: 'Reunião de Projeto',
        date: '2024-02-15',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Sala de Reuniões',
        color: '#4ECDC4',
        description: 'Revisão do progresso do projeto',
        status: 'pendente'
      },
      {
        id: '2',
        title: 'Almoço com Cliente',
        date: '2024-02-20',
        startTime: '12:30',
        endTime: '14:00',
        location: 'Restaurante Central',
        color: '#FF6B6B',
        description: 'Discutir novos requisitos',
        status: 'confirmado'
      }
    ]
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
  }
}

const createEvent = () => {
  const eventToAdd = {
    ...newEvent.value,
    id: String(events.value.length + 1),
    status: newEvent.value.status || 'pendente'
  }
  events.value.push(eventToAdd)
  closeNewEventModal()
}

const editEvent = (event) => {
  // Implementar lógica de edição
  console.log('Editando evento:', event)
}

const deleteEvent = (event) => {
  events.value = events.value.filter(e => e.id !== event.id)
}

const openNewEventModal = () => {
  showNewEventModal.value = true
  // Resetar novo evento
  newEvent.value = {
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    location: '',
    color: '#FF6B6B',
    description: '',
    status: 'pendente'
  }
}

const closeNewEventModal = () => {
  showNewEventModal.value = false
}

const selectDay = (day) => {
  if (day.isCurrentMonth) {
    newEvent.value.date = format(day.date, 'yyyy-MM-dd')
    openNewEventModal()
  }
}

const getEventColor = (event) => {
  return event.color || '#FF6B6B'
}

const toggleEventStatus = (event) => {
  const index = events.value.findIndex(e => e.id === event.id)
  if (index !== -1) {
    events.value[index] = {
      ...events.value[index],
      status: events.value[index].status === 'concluído' ? 'pendente' : 'concluído'
    }
  }
}

// Utilitários de formatação
const formatListDate = (dateString) => {
  return format(parseISO(dateString), 'dd/MM/yyyy (EEEE)', { locale: ptBR })
}

const formatTime = (timeString) => {
  return timeString || 'Sem horário'
}

// Carregar eventos ao montar
onMounted(() => {
  fetchEvents()
})
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

.agenda-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background-color: var(--bg-dark);
  border-radius: 12px;
}

.agenda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(74, 158, 255, 0.2);
  padding-bottom: 15px;
}

.agenda-header h2 {
  color: var(--accent-blue);
  font-size: 1.8rem;
  font-weight: 300;
  margin: 0;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-nav {
  background-color: rgba(74, 158, 255, 0.1);
  color: var(--accent-blue);
  border: 2px solid var(--accent-blue);
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-nav:hover {
  background-color: rgba(74, 158, 255, 0.2);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.3);
}

.current-date {
  color: var(--text-primary);
  font-weight: 300;
}

.agenda-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
}

.day-card {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.day-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--accent-blue), var(--accent-green));
}

.day-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.day-number {
  color: var(--accent-green);
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 300;
}

.day-events {
  margin-top: 15px;
}

.event-item {
  background-color: rgba(74, 158, 255, 0.1);
  border: 2px solid var(--accent-blue);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.event-item:hover {
  background-color: rgba(74, 158, 255, 0.2);
  box-shadow: 0 0 15px rgba(74, 158, 255, 0.2);
}

.event-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-right: 10px;
}

.event-title {
  color: var(--text-primary);
  font-weight: 300;
}

.event-icon {
  color: var(--accent-blue);
  margin-right: 10px;
}

.btn-add-event {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--accent-green);
  border: 2px solid var(--accent-green);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  display: block;
  text-align: center;
}

.btn-add-event:hover {
  background-color: rgba(46, 204, 113, 0.2);
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.3);
}

.agenda-list-view {
  background-color: var(--bg-card);
  border-radius: 10px;
  padding: 20px;
}

.agenda-list-day {
  margin-bottom: 20px;
}

.agenda-list-day h4 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.agenda-list-event {
  display: flex;
  align-items: center;
  background-color: var(--bg-dark);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.event-time {
  flex: 0 0 80px;
  color: var(--text-secondary);
}

.event-details {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.event-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.event-title {
  margin-right: 10px;
}

.event-location {
  color: var(--text-secondary);
}

.event-actions {
  display: flex;
  gap: 10px;
}

.event-actions button {
  background: none;
  border: 1px solid var(--text-secondary);
  color: var(--text-secondary);
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.event-actions button:hover {
  background-color: var(--bg-card);
}

.event-status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s;
}

.event-status-badge.pendente {
  background-color: #FF6B6B;
  color: white;
}

.event-status-badge.confirmado {
  background-color: #4ECDC4;
  color: white;
}

.event-status-badge.concluído {
  background-color: #45B7D1;
  color: white;
  text-decoration: line-through;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: var(--bg-dark);
  border-radius: 10px;
  padding: 30px;
  width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 15px 50px rgba(0,0,0,0.3);
  border: 2px solid var(--accent-blue);
  position: relative;
  transform: scale(1);
  transition: all 0.3s ease;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(45deg, 
    rgba(var(--accent-blue-rgb), 0.1), 
    rgba(var(--accent-blue-rgb), 0.05)
  );
  z-index: -1;
  border-radius: 15px;
  opacity: 0.8;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--text-secondary);
  border-radius: 5px;
  background-color: var(--bg-card);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal-actions button:first-child {
  background-color: var(--accent-blue);
  color: white;
}

.modal-actions button:last-child {
  background-color: var(--bg-card);
  color: var(--text-primary);
}
</style>
