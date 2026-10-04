import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { installAnalytics } from './services/analytics'
import './assets/styles/main.css'
import './assets/styles/flowers.css'
import './assets/styles/platform.css'
installAnalytics(router)
createApp(App).use(createPinia()).use(router).mount('#app')
