import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Função para alterar título dinamicamente
app.config.globalProperties.$setPageTitle = (title) => {
  document.title = `${title} | Productivity App`
}

app.mount('#app')
