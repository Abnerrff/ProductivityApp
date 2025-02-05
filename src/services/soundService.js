class SoundService {
  constructor() {
    this.sounds = {
      workComplete: new Audio('/sounds/work-complete.mp3'),
      breakComplete: new Audio('/sounds/break-complete.mp3')
    }

    // Configurar volumes
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.5
    })
  }

  playWorkComplete() {
    try {
      this.sounds.workComplete.play()
    } catch (error) {
      console.warn('Erro ao reproduzir som de conclusão de trabalho:', error)
    }
  }

  playBreakComplete() {
    try {
      this.sounds.breakComplete.play()
    } catch (error) {
      console.warn('Erro ao reproduzir som de conclusão de pausa:', error)
    }
  }
}

export default new SoundService()
