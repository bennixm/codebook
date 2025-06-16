// src/composables/useNotifications.js
import { reactive, inject, onMounted } from 'vue';
import secureApi from '../secureApi';

export function useNotifications() {
  const socket = inject('socket');
  if (!socket) console.warn('useNotifications: socket not provided');

  const state = reactive({ list: [] });

  async function fetchAll() {
    try {
      const res = await secureApi.get('/notifications');
      state.list = res.data;
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }

  async function markRead(id) {
    try {
      await secureApi.post(`/notifications/${id}/read`);
      const n = state.list.find(x => x._id === id);
      if (n) n.read = true;
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  }

  async function markAll() {
    try {
      await secureApi.post('/notifications/read-all');
      state.list.forEach(n => (n.read = true));
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  }

  onMounted(() => {
    fetchAll();
    if (socket) {
      socket.emit('join', { userId: localStorage.getItem('userId') });
      socket.on('notification', notif => {
        state.list.unshift(notif);
      });
    }
  });

  return { state, markRead, markAll };
}
