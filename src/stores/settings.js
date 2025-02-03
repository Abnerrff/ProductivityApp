import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'dark',
    fontSize: Number(localStorage.getItem('fontSize')) || 16,
    compactMode: localStorage.getItem('compactMode') === 'true',
    notifications: localStorage.getItem('notifications') === 'true'
  }),
  
  actions: {
    setTheme(theme) {
      console.log('Definindo tema:', theme)
      this.theme = theme
      localStorage.setItem('theme', theme)
      this.applyTheme()
    },
    
    setFontSize(size) {
      console.log('Definindo tamanho da fonte:', size)
      this.fontSize = size
      localStorage.setItem('fontSize', size.toString())
      this.applyFontSize()
    },
    
    toggleCompactMode() {
      console.log('Alternando modo compacto')
      this.compactMode = !this.compactMode
      localStorage.setItem('compactMode', this.compactMode.toString())
      this.saveSettings()
    },
    
    toggleNotifications() {
      console.log('Alternando notificações')
      this.notifications = !this.notifications
      localStorage.setItem('notifications', this.notifications.toString())
      this.saveSettings()
    },
    
    applyTheme() {
      console.log('Aplicando tema:', this.theme)
      const root = document.documentElement
      
      if (this.theme === 'dark') {
        root.classList.add('dark-theme')
        root.classList.remove('light-theme')
      } else if (this.theme === 'light') {
        root.classList.remove('dark-theme')
        root.classList.add('light-theme')
      } else {
        root.classList.remove('dark-theme', 'light-theme')
      }
    },
    
    applyFontSize() {
      console.log('Aplicando tamanho da fonte:', this.fontSize)
      document.body.style.fontSize = `${this.fontSize}px`
    },
    
    saveSettings() {
      console.log('Salvando configurações:', {
        theme: this.theme,
        fontSize: this.fontSize,
        compactMode: this.compactMode,
        notifications: this.notifications
      })
      
      localStorage.setItem('theme', this.theme)
      localStorage.setItem('fontSize', this.fontSize.toString())
      localStorage.setItem('compactMode', this.compactMode.toString())
      localStorage.setItem('notifications', this.notifications.toString())
    },
    
    loadSettings() {
      console.log('Carregando configurações')
      this.applyTheme()
      this.applyFontSize()
    }
  },
  
  // Carregar configurações ao inicializar o store
  init() {
    this.loadSettings()
  }
})
