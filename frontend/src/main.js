<<<<<<< Updated upstream
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { io }          from 'socket.io-client';
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './element-variables.scss';

const apiBase = import.meta.env.VITE_API_BASE_URL;
=======
// src/main.js
import { createApp }    from 'vue';
import { createPinia }  from 'pinia';
import './style.css';
import App              from './App.vue';
import router           from './router';
import ElementPlus      from 'element-plus';
import 'element-plus/dist/index.css';
import './element-variables.scss';

// only import your socket plugin, not io() here
import socket          from './plugins/socket';
>>>>>>> Stashed changes

<<<<<<< HEAD

=======
const app = createApp(App);

<<<<<<< Updated upstream
>>>>>>> 0181a8f (Start notification + auth refactor)
const app = createApp(App)


app.use(createPinia())
app.use(router)
app.use(ElementPlus)
=======
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// provide the single socket instance from your plugin
>>>>>>> Stashed changes
app.provide('socket', socket);

app.mount('#app');
