import { createRouter, createWebHistory } from 'vue-router'
import TaskManager from '@/components/TaskManager.vue'
import Pomodoro from '@/components/Pomodoro.vue'
import Settings from '@/components/Settings.vue'
import Agenda from '@/components/Agenda.vue'
import Projects from '@/components/Projects.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TaskManager
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TaskManager
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects
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
  },
  // Rota de fallback para capturar rotas não encontradas
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: TaskManager  // Redireciona para página inicial
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Adicionar log de erro global
router.onError((error, to, from) => {
  console.error('Erro de navegação:', error)
  console.log('Tentando navegar para:', to.path)
  console.log('Vindo de:', from.path)
})

export default router
