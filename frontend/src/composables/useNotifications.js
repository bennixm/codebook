
import { reactive, inject, watch, onMounted } from 'vue'
import secureApi from '../secureApi'
import { useAuth } from './useAuth'

export function useNotifications() {
  const socket = inject('socket')
  if (!socket) console.warn('useNotifications: socket not provided')

  const auth = useAuth()
  const state = reactive({ list: [] })

  async function fetchAll() {
    try {
      const res = await secureApi.get('/notifications')
      state.list = res.data
    } catch (e) {
      console.error('useNotifications › fetchAll failed:', e)
    }
  }

  async function markRead(id) {
    try {
      await secureApi.post(`/notifications/${id}/read`)
      const n = state.list.find(x => x._id === id)
      if (n) n.read = true
    } catch (e) {
      console.error('useNotifications › markRead failed:', e)
    }
  }

  async function markAll() {
    try {
      await secureApi.post('/notifications/read-all')
      state.list.forEach(n => (n.read = true))
    } catch (e) {
      console.error('useNotifications › markAll failed:', e)
    }
  }

  watch(
    () => auth.authReady,
    ready => {
      if (!ready) return

      if (auth.isAuthenticated) {
      
        fetchAll()

    
        const userId = auth.user.id || auth.user._id
        socket.emit('join', { userId })

      
        socket.on('notification', notif => {
          state.list.unshift(notif)
        })
      } else {
       
        state.list = []
        socket.off('notification')
      }
    },
    { immediate: true }
  )

  return { state, markRead, markAll }
}
