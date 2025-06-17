// src/plugins/socket.js
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => {
  console.log('✅ Client Socket connected:', socket.id);
  // emit join when you know the user ID; your App.vue watcher will do that
});

export default socket;
