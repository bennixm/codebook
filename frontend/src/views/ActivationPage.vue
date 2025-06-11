<template>
    <div>
      <el-empty
        v-if="status === 'loading'"
        description="Activating your account..."
      >
        <el-button type="primary" disabled>Activating…</el-button>
      </el-empty>
  
      <el-empty
        v-else-if="status === 'success'"
        description="Your account has been activated!"
      >
      </el-empty>
  
      <el-empty
        v-else-if="status === 'already'"
        description="Your account was already activated."
      >
      </el-empty>
  
      <el-empty
        v-else
        :description="message || 'Activation link is invalid or has expired.'"
        class="form-buttons"
      >
        <el-button type="primary" @click="router.push('/resend-activation')">
          Resend Activation Email
        </el-button>
      </el-empty>
      <el-button @click="router.push('/auth')">Login</el-button>
    </div>
  </template>
  
  <script setup>
  defineOptions({
    name: 'ActivationPage'
  })
  
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import api from '../api'
  
  const route = useRoute()
  const router = useRouter()
  
  const status = ref('loading')
  const message = ref('')
  
  async function activate() {
    try {
      const { userId, token } = route.params
      const res = await api.get(`/auth/activate/${userId}/${token}`)
      const msg = res.data.message || ''
      message.value = msg
      if (/already activated/i.test(msg)) {
        status.value = 'already'
      } else {
        status.value = 'success'
      }
    } catch (err) {
      message.value =
        err.response?.data?.error ||
        'Something went wrong. Please try again.'
      status.value = 'error'
    }
  }
  
  onMounted(activate)

  </script>
  