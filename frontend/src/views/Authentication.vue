<template>
  <div class="auth-form">
  <div class="auth-container">
    <el-form-item >
      <el-button  @click="onGoogleAuth" class="google-btn">
        <el-icon style="width: 20px;">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/Google__G__logo.svg.png?alt=media&token=9e718bb9-582e-444a-b7fc-0b5d691d8290" 
            alt="Google logo" 
            style="width: 100%; margin-right: 8px;"
          />
        </el-icon>
        Continue with Google
      </el-button>
    </el-form-item>

    <el-divider>
      <el-icon>or</el-icon>
    </el-divider>

    <div class="form-switch">
      <el-button
        :type="activeForm === 'login' ? 'primary' : 'default'"
        @click="activeForm = 'login'"
      >
        Login
      </el-button>
      <el-button
        :type="activeForm === 'register' ? 'primary' : 'default'"
        @click="activeForm = 'register'"
      >
        Register
      </el-button>
    </div>

    <el-form
      v-if="activeForm === 'login'"
      :model="loginForm"
      :rules="loginRules"
      ref="loginFormRef"
      label-width="100px"
      class="form-box"
      @submit.prevent="handleLogin"
    >
      <el-form-item label="Email" prop="email">
        <el-input v-model="loginForm.email" placeholder="Enter your email" />
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="Enter your password"
          show-password
        />
      </el-form-item>

    <el-form-item>
      <router-link to="/forgot-password" class="forgot-password">Forgot Password?</router-link>
    </el-form-item>
    <el-form-item v-if="showResendActivation">
       <router-link to="/resend-activation" class="forgot-password">
         Didn’t get your activation email? Resend it.
      </router-link>
    </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Login</el-button>
        
      </el-form-item>
    </el-form>

    <el-form
      v-if="activeForm === 'register'"
      :model="registerForm"
      :rules="registerRules"
      ref="registerFormRef"
      label-width="100px"
      class="form-box"
      @submit.prevent="handleRegister"
    >
      <el-form-item label="Email" prop="email">
        <el-input v-model="registerForm.email" placeholder="Enter your email" />
      </el-form-item>

      <el-form-item label="Name" prop="name">
        <el-input v-model="registerForm.name" placeholder="Enter your name" />
      </el-form-item>

      <el-form-item label="Username" prop="username">
        <el-input v-model="registerForm.username" placeholder="Choose a username" />
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="Create a password"
          show-password
        />
      </el-form-item>

      <el-form-item prop="accepted">
        <el-checkbox v-model="registerForm.accepted">
          I agree to the <a href="#" target="_blank">Terms and Conditions</a>
        </el-checkbox>
      </el-form-item>


    <el-form-item>
      <el-button type="primary" native-type="submit">Register</el-button>
    </el-form-item>
  </el-form>
     <el-alert
      v-if="showSuccessAlert"
      title="Success"
      type="success"
      description="Check your email to confirm the account!"
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
import { ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';


const { fetchProfile } = useAuth();
const router = useRouter();
const activeForm = ref('login')

const loginFormRef = ref()

const loginForm = ref({
  email: '',
  password: '',
})

const loginRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      await api.post('/auth/login', loginForm.value);

      localStorage.setItem('isLoggedIn', 'true');

      showErrorAlert.value = false;
      showResendActivation.value = false;

      router.push('/panel/dashboard');

    } catch (err) {
      const errCode = err.response?.data?.error
      errorMessage.value = errCode === 'ACCOUNT_NOT_ACTIVATED'
        ? err.response.data.message
        : 'Login failed: ' + (err.response?.data?.error || err.message)

    
      showResendActivation.value = errCode === 'ACCOUNT_NOT_ACTIVATED'
      showErrorAlert.value = true;
      showSuccessAlert.value = false;
    }
  });
};

const registerFormRef = ref();
const registerForm = ref({
  email: '',
  name: '',
  username: '',
  password: '',
  accepted: false, 
})
const showResendActivation = ref(false)
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref('');

const registerRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: ['blur', 'change'] },
  ],
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  username: [
    { required: true, message: 'Username is required', trigger: 'blur' },
    { min: 10, message: 'Username must be at least 10 characters', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
      trigger: 'blur',
    },
  ],
  accepted: [
    { required: true, validator: (_, val, callback) => {
        if (!val) return callback(new Error('You must accept the terms'))
        callback()
      }, trigger: 'change'
    }
  ]
}

const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      const formData = registerForm.value; 

      try {
        const res = await api.post('/auth/register', formData);
        showErrorAlert.value = false;
        registerForm.value = {
          email: '',
          name: '',
          username: '',
          password: '',
          accepted: false,
        };
          activeForm.value = 'login';
          showSuccessAlert.value = true;
      } catch (err) {
        errorMessage.value = 'Registration failed: ' + (err.response?.data?.error || err.message);
        showErrorAlert.value = true;
        showSuccessAlert.value = false;
      }
    }
  });
};
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;



function onGoogleAuth() {
  localStorage.setItem('isLoggedIn', 'true')
  const params = new URLSearchParams({
    client_id:     GOOGLE_ID,
    redirect_uri:  `${API_BASE}/auth/google/callback`,
    response_type: 'code',
    scope:         'openid profile email',
    prompt:        'select_account'
  });
  window.location = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
</script>

<style scoped>

</style>
