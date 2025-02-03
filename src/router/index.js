import { createRouter, createWebHistory } from 'vue-router'
import TaskManager from '@/components/TaskManager.vue'
import Pomodoro from '@/components/Pomodoro.vue'
import ProjectTracker from '@/components/ProjectTracker.vue'
import Settings from '@/components/Settings.vue'

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
    path: '/projects',
    name: 'Projects',
    component: ProjectTracker
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
