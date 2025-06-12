<template>
  <div class="dashboard panel-container">
   <el-row :gutter="20" class="dashboard-grid">
    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
    <div class="profile dash-element">
      <el-avatar :size="60" :src="auth.user.avatar || 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f'" />
      <div class="info">
        <h2>{{ auth.user.name }}</h2>
        <span class="handle">@{{ auth.user.username }}</span>
        <el-divider direction="vertical" />
        <span class="handle">Blogger</span>
      </div>
      <div class="profile-buttons">
        <el-button @click="router.push('/panel/profile/settings')" round><Pencil :size="20" class="icon-nav-dropmenu"/> Edit</el-button>
      </div>
    </div>
    </el-col>
   </el-row>

   <el-row :gutter="20" class="dashboard-grid">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/my-blogs')">
          <el-icon size="28"><Document /></el-icon>
          <h3>My Blogs</h3>
          <p>{{ stats.blogs }} blogs published</p>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/create-blog')">
          <el-icon size="28"><EditPen /></el-icon>
          <h3>Create Blog</h3>
          <p>Start a new post</p>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/notifications')">
          <div class="icon-badge">
            <el-icon size="28"><Bell /></el-icon>
            <el-badge :value="stats.unreadNotifications" class="badge" />
          </div>
          <h3>Notifications</h3>
          <p>{{ stats.unreadNotifications }} unread</p>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/profile/settings')">
          <el-icon size="28"><Setting /></el-icon>
          <h3>Profile Settings</h3>
          <p>Manage your account</p>
        </div>
      </el-col>
    </el-row>


    <el-row :gutter="20" class="dashboard-grid">
      <el-col :xs="24" :sm="12">
        <div class="recent-activity dash-element">
          <span class="dash-title">Recent activity</span>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in recentBlogs"
              :key="index"
              :timestamp="activity.date"
              placement="top"
            >
              <strong>{{ activity.title }}</strong> — {{ activity.status }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>


  </div>
  </template>
  
  <script setup>
    import { useAuth } from '../../composables/useAuth';
    import { Document, EditPen, Bell, Setting } from '@element-plus/icons-vue';
    import { Pencil } from 'lucide-vue-next';
    import { useRouter } from 'vue-router'
    const auth = useAuth()
    const router = useRouter()

    const stats = {
    blogs: 12,
    unreadNotifications: 3
    }

    const recentBlogs = [
    { title: 'Top 5 Vue Tips', status: 'Published', date: '2025-06-05' },
    { title: 'Behind the Scenes of Blogging', status: 'Draft saved', date: '2025-06-04' },
    { title: 'Productivity with Markdown', status: 'Published', date: '2025-06-01' }
    ]

  </script>
  
  <style scoped>
 
  </style>
  