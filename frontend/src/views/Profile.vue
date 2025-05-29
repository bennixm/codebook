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

      <el-menu
        class="el-menu-vertical-demo"
        :default-active="activeMenu"
        :router="true"
      >
        <el-menu-item index="/profile/settings">
          <User />
          <span class="profile-nav-txt">Profile Settings</span>
        </el-menu-item>

        <el-menu-item index="/profile/reset-password">
          <Lock />
          <span class="profile-nav-txt">Password Change</span>
        </el-menu-item>

        <el-menu-item index="/profile/security">
          <KeySquare  />
          <span class="profile-nav-txt">Account Security</span>
        </el-menu-item>

        <el-menu-item index="/profile/performance">
          <ChartNoAxesCombined  />
          <span class="profile-nav-txt">Performance</span>
        </el-menu-item>
      </el-menu>

      <router-view class="profile-page" />
  </div>
  </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { computed, onMounted } from 'vue';
  import { useAuth } from '../composables/useAuth';

  import { User, Lock, KeySquare, ChartNoAxesCombined } from 'lucide-vue-next';

  const { user, fetchProfile} = useAuth();
  const route = useRoute()
  const activeMenu = computed(() => route.path)

  onMounted(() => {
    if (!user.value) {
      fetchProfile();
    }
  });
  
  </script>
  
  <style scoped>
 
  </style>
  