<template>
  <div class="auth-form">
    <div class="auth-container">
      <el-alert
        type="info"
        title="Reset Your Password"
        description="Please enter an associated email address to reset your password. If the email is correct, you should receive a reset link shortly."
        show-icon
        class="mb-4"
      />

      <el-form ref="emailFormRef" label-width="120px" class="form-box" :model="form" :rules="rules">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter your email" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitResetEmail">Send Reset Link</el-button>
        </el-form-item>
      </el-form>
      <el-alert
        v-if="showSuccessAlert"
        title="Success"
        type="success"
        description="Check your email for the reset link."
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
import { ref, reactive } from 'vue';
import api from '../api'; 

const emailFormRef = ref(null);
const form = reactive({
  email: ''
});

const rules = {
  email: [{ required: true, message: 'Please enter your email', trigger: 'blur' }]
};

const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref('');



const submitResetEmail = () => {
  emailFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      await api.post('/auth/forgot-password', {
        email: form.email
      });

      showSuccessAlert.value = true;
      showErrorAlert.value = false;
    } catch (error) {
      showErrorAlert.value = true;
      if (error.response?.status === 429) {
        errorMessage.value = 'Too many requests. Please wait a while before trying again.';
      } else {
        errorMessage.value = error.response?.data?.message || 'Failed to send reset email.';
      }
    }
  });
};
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>
