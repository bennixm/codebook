<template>
  <div class="auth-form">
    <div class="auth-container">
      <el-form ref="resetFormRef" label-width="120px" class="form-box" :model="form" :rules="rules">
        <el-form-item label="New Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter new password"
            show-password
          />
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm new password"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitNewPassword">Reset Password</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="showSuccessAlert"
        title="Success"
        type="success"
        description="Your password has been reset successfully."
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';

const route = useRoute();
const router = useRouter();

const token = ref('');
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref('');

const resetFormRef = ref(null);
const form = reactive({
  password: '',
  confirmPassword: ''
});

const rules = {
  password: [{ required: true, message: 'Please enter a new password', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('Passwords do not match'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

onMounted(() => {
  token.value = route.query.token || '';
});

const submitNewPassword = () => {
  resetFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      await api.post('/auth/reset-password', {
        token: token.value,
        newPassword: form.password
      });

      showSuccessAlert.value = true;
      showErrorAlert.value = false;
    } catch (error) {
      showErrorAlert.value = true;
      errorMessage.value = error.response?.data?.message || 'Failed to reset password.';
    }
  });
};
</script>

<style scoped>

</style>
