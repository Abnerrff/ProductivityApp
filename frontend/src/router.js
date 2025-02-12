import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Agenda from './views/Agenda.vue'
import Pomodoro from './views/Pomodoro.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/agenda',
    name: 'Agenda',
    component: Agenda
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: Pomodoro
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
