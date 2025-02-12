import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: null,
    tasks: [],
    events: [],
    pomodoroSessions: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setTasks(state, tasks) {
      state.tasks = tasks
    },
    setEvents(state, events) {
      state.events = events
    },
    setPomodoroSessions(state, sessions) {
      state.pomodoroSessions = sessions
    }
  },
  actions: {
    async fetchTasks({ commit }) {
      try {
        const response = await axios.get('/api/tasks')
        commit('setTasks', response.data)
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error)
      }
    },
    async fetchEvents({ commit }) {
      try {
        const response = await axios.get('/api/events')
        commit('setEvents', response.data)
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
      }
    },
    async fetchPomodoroSessions({ commit }) {
      try {
        const response = await axios.get('/api/pomodoro-sessions')
        commit('setPomodoroSessions', response.data)
      } catch (error) {
        console.error('Erro ao buscar sessões Pomodoro:', error)
      }
    }
  }
})
