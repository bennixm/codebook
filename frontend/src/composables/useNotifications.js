import { reactive, onMounted, onUnmounted, watch } from 'vue'
import secureApi      from '../secureApi'
import socket         from '../plugins/socket'
import { useAuth }    from './useAuth'

export function useNotifications() {
  const auth  = useAuth()
  const state = reactive({ list: [] })

 
  async function fetchAll() {
    try {
      const res = await secureApi.get('/notifications')
      state.list = res.data
      console.log(state.list);
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
    () => auth.authReady && auth.isAuthenticated,
    readyAndAuthed => {
      if (readyAndAuthed) {
        fetchAll()
      } else {
        state.list = []
      }
    },
    { immediate: true }
  )

  
  function handleNotif(notif) {
    if (auth.isAuthenticated) {
      state.list.unshift(notif)
    }
  }

  onMounted(() => {
    socket.on('notification', handleNotif)
  })

  onUnmounted(() => {
    socket.off('notification', handleNotif)
  })

  return { state, fetchAll, markRead, markAll }
}
