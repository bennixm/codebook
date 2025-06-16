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
import socket           from './plugins/socket';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// provide the single socket instance from your plugin
app.provide('socket', socket);

app.mount('#app');
