<template>
  <div class="container">
    <div class="profile">
      <el-avatar :size="60" src="https://example.com/avatar.jpg" />
      <div class="info">
        <h2>{{ user.name }} <span class="handle">@{{ user.username }}</span></h2>
        <p class="email">{{ user.email }}</p>
        <p class="tagline">Tinker. Write. Share your code journey.</p>
      </div>
    </div>

    <el-divider />

  <div class="profile-layout">
      <el-page-header content="Account Settings" class="mb-4" />

      <el-tabs v-model="activeTab" type="card" @tab-click="onTabChange">
        <el-tab-pane label="Profile Settings" name="settings" />
        <el-tab-pane label="Reset Password" name="reset-password" />
        <el-tab-pane label="Security" name="security" />
      </el-tabs>

      <router-view class="mt-4" />
  </div>
  </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router'
  import { useAuth } from '../composables/useAuth';

  const { user, fetchProfile} = useAuth();
  const route = useRoute()
  const router = useRouter()

  const activeTab = ref(route.name === 'ResetPassword' ? 'reset-password' :
                      route.name === 'SecuritySettings' ? 'security' : 'settings')

  watch(() => route.name, (newName) => {
    if (newName === 'ResetPassword') activeTab.value = 'reset-password'
    else if (newName === 'SecuritySettings') activeTab.value = 'security'
    else activeTab.value = 'settings'
  })

  function onTabChange(tab) {
    router.push(`/profile/${tab.name}`)
  }

  onMounted(() => {
    if (!user.value) {
      fetchProfile();
    }
  });
  
  </script>
  
  <style scoped>
 
  </style>
  