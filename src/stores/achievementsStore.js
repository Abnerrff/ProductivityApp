import { defineStore } from 'pinia'
import axios from 'axios'

export const useAchievementsStore = defineStore('achievements', {
  state: () => ({
    achievements: [],
    unlockedAchievements: []
  }),

  actions: {
    async fetchAchievements() {
      try {
        const response = await axios.get('/api/achievements')
        this.achievements = response.data
      } catch (error) {
        console.error('Erro ao buscar conquistas:', error)
      }
    },

    async checkPomodoroAchievements() {
      try {
        const response = await axios.post('/api/achievements/check-pomodoro')
        const newUnlockedAchievements = response.data

        if (newUnlockedAchievements.length > 0) {
          this.unlockedAchievements.push(...newUnlockedAchievements)
          
          // Notificar usuário sobre novas conquistas
          newUnlockedAchievements.forEach(achievement => {
            this.showAchievementNotification(achievement)
          })
        }
      } catch (error) {
        console.error('Erro ao verificar conquistas de Pomodoro:', error)
      }
    },

    showAchievementNotification(achievement) {
      // Implementar lógica de notificação
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Nova Conquista Desbloqueada!', {
            body: achievement.title,
            icon: '/path/to/achievement/icon.png'
          })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Nova Conquista Desbloqueada!', {
                body: achievement.title,
                icon: '/path/to/achievement/icon.png'
              })
            }
          })
        }
      }
    }
  }
})
