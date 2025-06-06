<template>
  <el-card class="profile-settings-card">
    <template #header>
      <div class="card-header">
        <span>Change Password</span>
      </div>
    </template>

    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-position="top"
      class="profile-form"
    >
      <el-form-item label="Old Password" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          placeholder="Enter your old password"
          show-password
        />
      </el-form-item>

      <el-form-item label="New Password" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="Enter your new password"
          show-password
        />
      </el-form-item>

      <el-form-item label="Confirm New Password" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="Re-enter your new password"
          show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">Save Changes</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please confirm your new password'))
  } else if (value !== form.value.newPassword) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: 'Old password is required', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'New password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('Password changed successfully!')
      // Handle submission logic here
    } else {
      ElMessage.error('Please correct the errors in the form.')
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
