<template>
    <div class="profile-page">
      <h2>User Profile</h2>
  
      <el-card v-if="user" class="profile-card">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <el-button type="primary" @click="handleLogout">Logout</el-button>
      </el-card>
      <el-skeleton v-else animated rows="4" />
    </div>

     <router-view />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import secureApi from '../secureApi';
  
  const user = ref(null);
  const router = useRouter();
  
  const fetchProfile = async () => {
    try {
      const res = await secureApi.get('/user/profile'); 
      user.value = res.data;
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
       router.push('/auth'); 
    }
  };

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };
  
  onMounted(fetchProfile);
  
  </script>
  
  <style scoped>
  .profile-page {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
  }
  .profile-card {
    margin-top: 1rem;
  }
  </style>
  