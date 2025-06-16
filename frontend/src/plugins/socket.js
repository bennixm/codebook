// src/plugins/socket.js
import { io } from 'socket.io-client';

export default {
  install(app, { userId, token }) {
    const socket = io(process.env.VITE_API_BASE_URL, {
      auth: { token }
    });

    socket.on("connect", () => {
      socket.emit("join", { userId });
    });

    // provide globally
    app.config.globalProperties.$socket = socket;
    app.provide("socket", socket);
  }
};
