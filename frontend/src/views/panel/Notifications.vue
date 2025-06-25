<template>
    <div class="notifications-page panel-container">
      <h2 class="text-2xl font-bold mb-4">All Notifications</h2>
  
      <div class="flex justify-end mb-4" style="margin-bottom: 2rem;">
        <el-button type="primary" @click="markAllRead">
          Mark All as Read
        </el-button>
      </div>
  
      <el-scrollbar height="auto">
        <div v-if="paginatedList.length === 0" class="text-gray-500">No notifications found.</div>
        <div v-else>
          <div
            v-for="n in paginatedList"
            :key="n._id"
            class="notification-item flex items-center justify-between p-4 rounded-lg mb-3"
            style="margin-bottom: 1rem;"
            :class="n.read ? 'bg-white text-gray-500' : 'bg-green-50'"
          >
            <div class="flex items-center space-x-4">
              <img
                class="w-12 h-12 rounded-full object-cover"
                :src="n.actorUser?.avatar || auth.defaultAvatar"
                :alt="n.actorUser?.name || n.actorGuest?.guestName"
                loading="lazy"
                style="margin-right:1rem;"
              />
              <div>
                <div class="font-medium">
                  {{ n.actorUser?.name || n.actorGuest?.guestName }} {{ messageText(n) }}
                </div>
                <div class="text-sm text-gray-400">{{ auth.formattedDate(n.createdAt) }}</div>
              </div>
            </div>
  
            <el-button v-if="!n.read" size="small" @click="markAsRead(n)"><Check :size="20" />  Mark as Read</el-button>
          </div>
        </div>
      </el-scrollbar>
  
      <div class="flex justify-center mt-6">
        <el-pagination
          layout="prev, pager, next"
          :total="state.list.length"
          :page-size="pageSize"
          @current-change="handlePageChange"
          :current-page="currentPage"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useNotifications } from '../../composables/useNotifications';
  import { useAuth } from '../../composables/useAuth';
  import { ElMessage } from 'element-plus';
  import { Check } from 'lucide-vue-next';
  
  const { state, markRead, markAll, fetchAll } = useNotifications();
  const auth = useAuth();
  
  const pageSize = 15;
  const currentPage = ref(1);
  
  const paginatedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return state.list.slice(start, start + pageSize);
  });
  
  function messageText(n) {
    switch (n.type) {
      case 'comment': return 'commented on your post';
      case 'reply': return 'replied to your comment';
      case 'like': return 'liked your post';
      case 'follow': return 'started following you';
      case 'new_blog': return 'published a new blog';
      case 'view': return 'viewed your blog';
      default: return 'did something';
    }
  }
  
  async function markAsRead(notification) {
    try {
      await markRead(notification._id);
      ElMessage.success('Notification marked as read');
    } catch (error) {
      ElMessage.error('Failed to mark as read');
    }
  }
  
  async function markAllRead() {
    try {
      await markAll();
      ElMessage.success('All notifications marked as read');
    } catch (error) {
      ElMessage.error('Failed to mark all as read');
    }
  }
  
  function handlePageChange(page) {
    currentPage.value = page;
  }
  
  onMounted(fetchAll);
  </script>
  
  <style scoped>
  .notification-item {
    transition: background-color 0.3s ease;
  }
  </style>
  