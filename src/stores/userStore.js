import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // Estados reativos
  const userName = ref('Usuário')
  const userAvatar = ref('@/assets/default-avatar.svg')
  const userLevel = ref(1)
  const totalPoints = ref(0)
  const currentStreak = ref(0)

  // Métodos e ações
  function updateUserName(name) {
    userName.value = name
  }

  function updateUserAvatar(avatarPath) {
    userAvatar.value = avatarPath
  }

  function incrementPoints(points) {
    totalPoints.value += points
  }

  function updateStreak(streak) {
    currentStreak.value = streak
  }

  function levelUp() {
    userLevel.value++
  }

  return {
    userName,
    userAvatar,
    userLevel,
    totalPoints,
    currentStreak,
    updateUserName,
    updateUserAvatar,
    incrementPoints,
    updateStreak,
    levelUp
  }
})
