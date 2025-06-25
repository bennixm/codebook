<template>
  <div class="dashboard panel-container">
    <el-row :gutter="20" class="dashboard-grid">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <div class="profile dash-element">
          <el-avatar :size="60" title="User Image" alt="User Image"
            :src="auth.user.avatar || 'https://ik.imagekit.io/codebook/tr:w-600,f-auto/user.png'" />

          <div class="info">
            <h2>{{ auth.user.name }}</h2>
            <span class="handle">@{{ auth.user.username }}</span>
            <el-divider direction="vertical" />
            <span class="handle">Blogger</span>
          </div>
          <div class="profile-buttons">
            <el-button @click="router.push('/panel/profile/settings')" round>
              <Pencil :size="20" class="icon-nav-dropmenu" /> Edit
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-grid">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/my-blogs')">
          <el-icon size="28">
            <Document />
          </el-icon>
          <h3>My Blogs</h3>
          <p>{{ stats.blogs }} blogs published</p>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/create-blog')">
          <el-icon size="28">
            <EditPen />
          </el-icon>
          <h3>Create Blog</h3>
          <p>Start a new post</p>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/notifications')">
          <div class="icon-badge">
            <el-icon size="28">
              <Bell />
            </el-icon>
            <el-badge :value="stats.unreadNotifications" class="badge" />
          </div>
          <h3>Notifications</h3>
          <p>{{ stats.unreadNotifications }} unread</p>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="dashboard-card" @click="router.push('/panel/profile/settings')">
          <el-icon size="28">
            <Setting />
          </el-icon>
          <h3>Profile Settings</h3>
          <p>Manage your account</p>
        </div>
      </el-col>
    </el-row>


    <el-row :gutter="20" class="dashboard-grid">
      <el-col :xs="24" :sm="12">
        <div class="recent-activity dash-element">
          <span class="dash-title">Recent activity</span>
          <el-timeline v-if="recentBlogs.length">
            <el-timeline-item v-for="(activity, index) in recentBlogs" :key="index" :timestamp="activity.date"
              placement="top">
              <strong>{{ activity.title }}</strong> — {{ activity.status }}
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="No activity from you." />
        </div>
      </el-col>
    </el-row>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { Document, EditPen, Bell, Setting } from '@element-plus/icons-vue';
import { Pencil } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const auth = useAuth();
const router = useRouter();

const stats = ref({
  blogs: 0,
  unreadNotifications: 3,
});

const recentBlogs = ref([]);

const fetchStats = async () => {
  try {
    const blogs = await auth.fetchMyBlogs();
    stats.value.blogs = blogs.length;

    recentBlogs.value = blogs
      .sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt))
      .slice(0, 3)
      .map(blog => ({
        title: blog.title,
        status: blog.isPublished ? 'Published' : 'Draft',
        date: new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(),
      }));
  } catch (error) {
    console.error('Failed to fetch blog stats:', error);
  }
};





onMounted(() => {
  fetchStats();
});
</script>


<style scoped></style>