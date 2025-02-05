class NotificationService {
  constructor() {
    this.requestPermission()
  }

  requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações')
      return false
    }

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Permissão de notificação concedida')
        }
      })
    }

    return Notification.permission === 'granted'
  }

  send(title, options = {}) {
    if (!this.requestPermission()) return null

    const defaultOptions = {
      body: '',
      icon: '/favicon.ico',
      silent: false
    }

    const mergedOptions = { ...defaultOptions, ...options }

    return new Notification(title, mergedOptions)
  }

  workSessionComplete(projectName) {
    this.send('Sessão de Foco Concluída', {
      body: `Projeto: ${projectName}\nDescanse um pouco!`,
      icon: '/icons/work-complete.png'
    })
  }

  breakSessionComplete(projectName) {
    this.send('Pausa Concluída', {
      body: `Projeto: ${projectName}\nHora de voltar ao trabalho!`,
      icon: '/icons/break-complete.png'
    })
  }
}

export default new NotificationService()
