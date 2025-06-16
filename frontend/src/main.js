import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { io }          from 'socket.io-client';
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const apiBase = import.meta.env.VITE_API_BASE_URL;

const socket = io(apiBase, {
    auth: { token: localStorage.getItem('token') }
  });
  
  socket.on('connect', () => {
    socket.emit('join', { userId: localStorage.getItem('userId') });
  });

const app = createApp(App)


app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.provide('socket', socket);
app.mount('#app')
