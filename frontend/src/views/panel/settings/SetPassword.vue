<template>
    <el-card class="profile-settings-card dash-element">
      <template #header>
        <div class="card-header">
          <span>Set Local Password</span>
        </div>
      </template>
  
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-position="top"
        class="profile-form"
      >
        <el-form-item label="New Password" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="Enter your new password"
            show-password
          />
        </el-form-item>
  
        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            show-password
          />
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" @click="submitForm">Set Password</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useAuth } from '../../../composables/useAuth'
  
  const { setPassword } = useAuth()
  
  const formRef = ref(null)
  const form = ref({
    newPassword: '',
    confirmPassword: ''
  })
  
  
  const validateNew = (_, value, callback) => {
    if (!value) return callback(new Error('New password is required'))
    if (value.length < 6) return callback(new Error('Password must be at least 6 characters'))
    callback()
  }
  
  
  const validateConfirm = (_, value, callback) => {
    if (!value) return callback(new Error('Please confirm your new password'))
    if (value !== form.value.newPassword) {
      return callback(new Error('Passwords do not match'))
    }
    callback()
  }
  
  const rules = {
    newPassword: [
      { validator: validateNew, trigger: 'blur' }
    ],
    confirmPassword: [
      { validator: validateConfirm, trigger: 'blur' }
    ]
  }
  
  const submitForm = () => {
    formRef.value.validate(async valid => {
      if (!valid) {
        return ElMessage.error('Please fix the errors')
      }
  
      try {
        await ElMessageBox.confirm(
          'Please confirm setting your new password',
          'Set Password',
          { confirmButtonText: 'Yes', cancelButtonText: 'Cancel', type: 'warning' }
        )
      } catch {
        return // user cancelled
      }
  
      try {
        await setPassword({
          newPassword: form.value.newPassword,
          confirmPassword: form.value.confirmPassword
        })
        ElMessage.success('Password set successfully! Please log in again.')
  
       
        form.value.newPassword = ''
        form.value.confirmPassword = ''
      } catch (err) {
        ElMessage.error(err.message || 'Failed to set password')
      }
    })
  }
  </script>
  
  <style scoped>
  .profile-settings-card {
    max-width: 600px;
    margin: 0 auto;
  }
  </style>
  