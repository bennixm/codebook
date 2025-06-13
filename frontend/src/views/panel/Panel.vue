<template>
  <el-container style="min-height: 100vh" class="side-menu">
    <el-aside width="220px" class="side-menu-nav">
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        text-color="black"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/panel/dashboard">
          <el-icon><LayoutDashboard /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <el-sub-menu index="/panel/my-blogs">
          <template #title>
            <el-icon><BookOpen /></el-icon>
            <span>Blogging</span>
          </template>
          <el-menu-item index="/panel/create-blog">Create Blog</el-menu-item>
          <el-menu-item index="/panel/my-blogs">My Blogs</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/panel/notifications">
          <el-icon><Bell /></el-icon>
          <span>Notifications</span>
        </el-menu-item>

        <el-sub-menu index="/panel/profile">
          <template #title>
            <el-icon><ShieldUser /></el-icon>
            <span>Profile</span>
          </template>
          <el-menu-item index="/panel/profile/settings">Settings</el-menu-item>
          <el-menu-item index="/panel/profile/change-password">Change Password</el-menu-item>
          <el-menu-item index="/panel/profile/security">Security</el-menu-item>
          <el-menu-item index="/panel/profile/performance">Performance</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- Main content -->
    <el-container class="panel">
      <el-main style="padding: 20px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import 'element-plus/es/components/menu/style/css'
import 'element-plus/es/components/container/style/css'
import 'element-plus/es/components/header/style/css'
import 'element-plus/es/components/main/style/css'
import 'element-plus/es/components/aside/style/css'
import 'element-plus/es/components/sub-menu/style/css'
import 'element-plus/es/components/icon/style/css'

import { LayoutDashboard, BookOpen, Bell, ShieldUser } from 'lucide-vue-next';


</script>
