<!-- src/views/ResendActivationEmail.vue -->
<template>
    <div class="auth-form">
      <div class="auth-container">
        <el-form
          ref="resendFormRef"
          label-width="120px"
          class="form-box"
          :model="form"
          :rules="rules"
        >
          <el-form-item label="Email" prop="email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
            />
          </el-form-item>
  
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="onSubmit"
            >
              Send Link
            </el-button>
            <el-button @click="goToLogin">Back to Login</el-button>
          </el-form-item>
        </el-form>
  
        <el-alert
          v-if="showSuccessAlert"
          title="Success"
          type="success"
          description="If that email was registered, you’ll receive a new activation link shortly."
          show-icon
          closable
          @close="showSuccessAlert = false"
        />
  
        <el-alert
          v-if="showErrorAlert"
          title="Error"
          type="error"
          :description="errorMessage"
          show-icon
          closable
          @close="showErrorAlert = false"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter }   from 'vue-router'
  import api             from '../api'
  
  const router = useRouter()
  
  const resendFormRef   = ref(null)
  const form            = reactive({ email: '' })
  const loading         = ref(false)
  const showSuccessAlert = ref(false)
  const showErrorAlert   = ref(false)
  const errorMessage    = ref('')
  
  const rules = {
    email: [
      { required: true, message: 'Please enter your email', trigger: 'blur' },
      { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
    ]
  }
  
  const onSubmit = () => {
    resendFormRef.value.validate(async valid => {
      if (!valid) return
  
      loading.value = true
      showSuccessAlert.value = false
      showErrorAlert.value   = false
  
      try {
        const res = await api.post(
          '/auth/resend-activation',
          { email: form.email },
          { withCredentials: true }
        )
        showSuccessAlert.value = true
      } catch (err) {
        showErrorAlert.value = true
        errorMessage.value =
          err.response?.data?.error ||
          'Something went wrong. Please try again.'
      } finally {
        loading.value = false
      }
    })
  }
  
  const goToLogin = () => {
    router.push({ name: 'Login' })
  }
  </script>
  
  <style scoped>
  .auth-form {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
  }
  
  .auth-container {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  
  .form-box {
    margin-bottom: 1rem;
  }
  
  /* Optional tweaks to space the buttons */
  .el-form-item:last-of-type {
    display: flex;
    gap: 1rem;
  }
  </style>
  