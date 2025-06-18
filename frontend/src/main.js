// src/main.js
import { createApp }    from 'vue';
import { createPinia }  from 'pinia';
import './style.css';
import App              from './App.vue';
import router           from './router';
import ElementPlus      from 'element-plus';
import 'element-plus/dist/index.css';
import './element-variables.scss';

import socket           from './plugins/socket';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);


app.provide('socket', socket);

app.mount('#app');