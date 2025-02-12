import { defineStore } from 'pinia'
import axios from 'axios'

export const usePomodoroStore = defineStore('pomodoro', {
  state: () => ({
    sessions: [],
    currentSession: null
  }),

  actions: {
    async startSession(sessionData) {
      try {
        const response = await axios.post('/api/pomodoro/session', sessionData)
        const session = response.data

        this.currentSession = session
        this.sessions.push(session)

        return session
      } catch (error) {
        console.error('Erro ao iniciar sessão de Pomodoro:', error)
        return null
      }
    },

    async pauseSession(sessionId) {
      try {
        const response = await axios.patch(`/api/pomodoro/session/${sessionId}/pause`)
        const updatedSession = response.data

        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = updatedSession
        }

        return updatedSession
      } catch (error) {
        console.error('Erro ao pausar sessão de Pomodoro:', error)
        return null
      }
    },

    async stopSession(sessionId) {
      try {
        const response = await axios.patch(`/api/pomodoro/session/${sessionId}/stop`)
        const updatedSession = response.data

        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = updatedSession
        }

        this.currentSession = null

        return updatedSession
      } catch (error) {
        console.error('Erro ao parar sessão de Pomodoro:', error)
        return null
      }
    },

    async completeSession(sessionId, completionData) {
      try {
        const response = await axios.patch(`/api/pomodoro/session/${sessionId}/complete`, completionData)
        const updatedSession = response.data

        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = updatedSession
        }

        this.currentSession = null

        return updatedSession
      } catch (error) {
        console.error('Erro ao completar sessão de Pomodoro:', error)
        return null
      }
    },

    async fetchSessions() {
      try {
        const response = await axios.get('/api/pomodoro/sessions')
        this.sessions = response.data
      } catch (error) {
        console.error('Erro ao buscar sessões de Pomodoro:', error)
      }
    }
  }
})
