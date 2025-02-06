<template>
  <div class="agenda-container">
    <div class="agenda-header">
      <h2>Minha Agenda</h2>
      <div class="agenda-actions">
        <button @click="openNewEventModal" class="add-event-btn">
          + Novo Evento
        </button>
      </div>
    </div>

    <div class="calendar-view">
      <div class="calendar-navigation">
        <button @click="previousMonth">&lt;</button>
        <h3>{{ currentMonthYear }}</h3>
        <button @click="nextMonth">&gt;</button>
      </div>

      <div class="calendar-grid">
        <div 
          v-for="day in calendarDays" 
          :key="day.date" 
          class="calendar-day"
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
            />
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea 
              v-model="newEvent.description"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Data Início</label>
            <input 
              v-model="newEvent.start_time" 
              type="datetime-local" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Data Fim</label>
            <input 
              v-model="newEvent.end_time" 
              type="datetime-local" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Local</label>
            <input 
              v-model="newEvent.location" 
              type="text" 
            />
          </div>

          <div class="form-actions">
            <button type="submit">Salvar</button>
            <button type="button" @click="closeNewEventModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// Estado da agenda
const events = ref([])
const currentDate = ref(new Date())
const showNewEventModal = ref(false)

// Novo evento
const newEvent = ref({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: ''
})

// Navegação do calendário
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  })
})

// Gerar dias do calendário
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const days = []
  
  // Dias do mês anterior
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    days.push({ 
      dayNumber: null, 
      isCurrentMonth: false,
      events: []
    })
  }
  
  // Dias do mês atual
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const currentDay = new Date(year, month, day)
    const dayEvents = events.value.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === currentDay.toDateString()
    })
    
    days.push({ 
      dayNumber: day, 
      date: currentDay,
      isCurrentMonth: true,
      events: dayEvents
    })
  }
  
  return days
})

// Métodos de navegação
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(), 
    currentDate.value.getMonth() - 1, 
    1
  )
  fetchEvents()
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(), 
    currentDate.value.getMonth() + 1, 
    1
  )
  fetchEvents()
}

// Buscar eventos da API
const fetchEvents = async () => {
  try {
    const startDate = new Date(
      currentDate.value.getFullYear(), 
      currentDate.value.getMonth(), 
      1
    )
    const endDate = new Date(
      currentDate.value.getFullYear(), 
      currentDate.value.getMonth() + 1, 
      0
    )

    const response = await api.get('/events/', {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    })
    
    events.value = response.data
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
  }
}

// Criar novo evento
const createEvent = async () => {
  try {
    const response = await api.post('/events/', newEvent.value)
    events.value.push(response.data)
    closeNewEventModal()
    fetchEvents()
  } catch (error) {
    console.error('Erro ao criar evento:', error)
  }
}

// Métodos de modal
const openNewEventModal = () => {
  showNewEventModal.value = true
}

const closeNewEventModal = () => {
  showNewEventModal.value = false
  newEvent.value = {
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: ''
  }
}

// Selecionar dia
const selectDay = (day) => {
  if (day.isCurrentMonth) {
    // Lógica para mostrar detalhes do dia
    console.log('Dia selecionado:', day)
  }
}

// Utilitários
const getEventColor = (event) => {
  // Lógica para definir cor do evento
  return '#3498db'  // Cor padrão
}

// Carregar eventos ao montar
onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.agenda-container {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 16px;
}

.agenda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-event-btn {
  background-color: var(--primary-color);
  color: var(--text-color);
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
}

.calendar-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.calendar-day {
  background-color: var(--bg-primary);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.calendar-day.current-month {
  background-color: var(--bg-tertiary);
}

.calendar-day.has-events {
  border: 2px solid var(--primary-color);
}

.day-events {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 2px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-tertiary);
  padding: 30px;
  border-radius: 16px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.form-actions button:first-child {
  background-color: var(--primary-color);
  color: var(--text-color);
}

.form-actions button:last-child {
  background-color: var(--bg-primary);
  color: var(--text-muted);
}
</style>
