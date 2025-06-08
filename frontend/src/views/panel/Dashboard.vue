<template>
  <div class="dashboard panel-container">
   <el-row :gutter="20" class="dashboard-grid">
    <el-col :span="8">
    <div class="profile dash-element">
      <el-avatar :size="60" :src="auth.user.avatar || 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f'" />
      <div class="info">
        <h2>{{ auth.user.name }}</h2>
        <span class="handle">@{{ auth.user.username }}</span>
        <el-divider direction="vertical" />
        <span class="handle">Blogger</span>
      </div>
      <div class="profile-buttons">
        <el-button round><Pencil :size="20" class="icon-nav-dropmenu"/> Edit</el-button>
      </div>
    </div>
    </el-col>
    <el-col :span="8">
    <div class="profile dash-element">
      <div class="bio-status">
        <div class="icon-bio"><MessageCircle /></div>
        <span class="bio">{{ auth.user.bio }}</span>
      </div>
       <div class="profile-buttons">
        <el-button round><Pencil :size="20" class="icon-nav-dropmenu"/> Edit</el-button>
      </div>
    </div>
    </el-col>
   </el-row>

     <el-row :gutter="20" class="dashboard-grid">
      <el-col :span="6">
        <div class="dashboard-card" @click="navigate('my-blogs')">
          <el-icon size="28"><Document /></el-icon>
          <h3>My Blogs</h3>
          <p>{{ stats.blogs }} blogs published</p>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="dashboard-card" @click="navigate('create-blog')">
          <el-icon size="28"><EditPen /></el-icon>
          <h3>Create Blog</h3>
          <p>Start a new post</p>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="dashboard-card" @click="navigate('notifications')">
          <div class="icon-badge">
            <el-icon size="28"><Bell /></el-icon>
            <el-badge :value="stats.unreadNotifications" class="badge" />
          </div>
          <h3>Notifications</h3>
          <p>{{ stats.unreadNotifications }} unread</p>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="dashboard-card" @click="navigate('profile-settings')">
          <el-icon size="28"><Setting /></el-icon>
          <h3>Profile Settings</h3>
          <p>Manage your account</p>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-grid">
      <el-col :span="6">
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
    import { Pencil,MessageCircle } from 'lucide-vue-next';
    const auth = useAuth()

    const navigate = (routeName) => {
        router.push({ name: routeName })
    }

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
  