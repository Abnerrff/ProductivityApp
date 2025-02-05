import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Diagnóstico de importação
console.log(' INÍCIO DO MAIN.JS ')

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faListCheck, 
  faFolderOpen, 
  faChartSimple, 
  faTrophy, 
  faClock, 
  faGear,
  faHome 
} from '@fortawesome/free-solid-svg-icons'

// Adicionar ícones à biblioteca
library.add(
  faListCheck, 
  faFolderOpen, 
  faChartSimple, 
  faTrophy, 
  faClock, 
  faGear,
  faHome
)

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Registrar componente do Font Awesome globalmente
app.component('FontAwesomeIcon', FontAwesomeIcon)

// Função para alterar título dinamicamente
app.config.globalProperties.$setPageTitle = (title) => {
  document.title = `${title} | Productivity App`
}

app.mount('#app')
