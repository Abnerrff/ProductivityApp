import { createRouter, createWebHistory } from 'vue-router'
import TaskManager from '@/components/TaskManager.vue'
import Pomodoro from '@/components/Pomodoro.vue'
import Settings from '@/components/Settings.vue'
import Agenda from '@/components/Agenda.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TaskManager
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: Pomodoro
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/agenda',
    name: 'Agenda',
    component: Agenda
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
