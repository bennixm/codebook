<template>
  <nav class="navbar">
    <router-link to="/" class="logo nav-left" aria-label="CodeBook Home">
      <img src="https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/logo.png?alt=media&token=3ca2bb58-59af-482a-8cd8-f869b060c5b1" alt="CodeBook logo" />
    </router-link>
  <el-menu
    :default-active="$route.path"
    class="el-menu-demo nav-center"
    mode="horizontal"
    text-color="#27ae60"
    active-text-color="#27ae60"
    router
  >
    <el-menu-item index="/">
      <router-link to="/" class="nav-link">Home</router-link>
    </el-menu-item>

    <el-menu-item index="/blogs">
      <router-link to="/blogs" class="nav-link">Blogs</router-link>
    </el-menu-item>

  </el-menu>
   <el-menu
    :default-active="$route.path"
    class="el-menu-demo nav-right"
    mode="horizontal"
        text-color="#27ae60"
    active-text-color="#27ae60"
    :ellipsis="false"
    router
  >

<el-menu-item
  index="/panel/notifications"
  v-if="auth.authReady && auth.isAuthenticated"
  class="notification-menu-item"
>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @command="onNotifCommand"
  >
  
    <span class="nav-link no-select">
      <Inbox aria-hidden="true" />
      <el-badge :value="unreadCount" class="badge" />
    </span>

    <template #dropdown>
      <el-scrollbar style="max-height: 300px; width: 300px;">
        <div v-if="!state.list.length" class="empty">
          No notifications
        </div>
        <div v-else>
          <el-dropdown-item
            v-for="n in state.list.slice(0,5)"
            :key="n._id"
            :command="n"                                
            
            :class="['notification-item', n.read ? 'read' : 'unread']"
          >
            <div class="notif-content">
              <strong>{{ n.actorUser?.name || n.actorGuest?.guestName }}</strong>


              {{ messageText(n) }}
            </div>
            <div class="notif-time">
              {{ new Date(n.createdAt).toLocaleTimeString() }}
            </div>
          </el-dropdown-item>
          <el-divider />
          <el-dropdown-item command="view-all" class="see-all">
            ... See all
          </el-dropdown-item>
        </div>
      </el-scrollbar>
    </template>
  </el-dropdown>
</el-menu-item>


  

  <el-menu-item v-if="auth.authReady && auth.isAuthenticated">
    <el-dropdown >
      <span class="user-dropdown">
        <el-avatar :src="auth.user.avatar || 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f'" />

        <span class="username">{{ auth.user.name }}</span>
      </span>

      <template #dropdown>
        <el-dropdown-menu class="dropdown-menu">

          <router-link to="/panel/dashboard" class="dropdown-link">
            <el-dropdown-item command="dashboard"><LayoutDashboard :size="20" class="icon-nav-dropmenu"/>  Dashboard</el-dropdown-item>
          </router-link>

          <div class="dropdown-header">Blog Options</div>

          <router-link to="/panel/create-blog" class="dropdown-link">
            <el-dropdown-item command="create">Create Blog</el-dropdown-item>
          </router-link>
          <router-link to="/panel/my-blogs" class="dropdown-link">
            <el-dropdown-item command="myBlogs">My Blogs</el-dropdown-item>
          </router-link>

          <el-dropdown-item divided class="no-padding"></el-dropdown-item>

          <div class="dropdown-header">Profile</div>


          <router-link to="/panel/profile/settings" class="dropdown-link">
            <el-dropdown-item command="profile">Settings</el-dropdown-item>
          </router-link>
          <router-link to="/panel/profile/change-password" class="dropdown-link">
            <el-dropdown-item command="preferences">Change Password</el-dropdown-item>
          </router-link>

          <div class="dropdown-header">Bio</div>

          <el-dropdown-item @click="showBioDialog = true"><SmilePlus :size="20" class="icon-nav-dropmenu"/> Set Status</el-dropdown-item>

          <el-dropdown-item divided class="no-padding"></el-dropdown-item>

          <el-dropdown-item @click="auth.logout" class="logout"><LogOut :size="20" class="icon-nav-dropmenu" /> Logout</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu-item>

  <el-menu-item v-if="!auth.isAuthenticated" index="/auth" class="login-item-nav">
    <router-link to="/auth" class="nav-link"><User />  Login</router-link>
  </el-menu-item>

</el-menu>

<el-dialog
  v-model="showBioDialog"
  title="Set Your Bio"
  width="30%"
>
  <span>Set your status:</span>
  <el-input
    type="textarea"
    v-model="bioText"
    placeholder="Type your bio here..."
    :rows="4"
    maxlength="200"
    show-word-limit
    style="margin-top: 10px;"
  />
  <template #footer>
    <el-button type="danger" @click="showBioDialog = false">Cancel</el-button>
    <el-button type="primary" @click="saveBio">Save</el-button>
  </template>
</el-dialog>
</nav>

</template>

<script setup>
import { ref,watch,computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { ElMessage } from 'element-plus'
import { User, LogOut, SmilePlus, Inbox, LayoutDashboard } from 'lucide-vue-next';
import { useNotifications } from '../composables/useNotifications';
import { useRouter } from 'vue-router';

const {state,markRead,markAll } = useNotifications();
const unreadCount = computed(
  () => state.list.filter(n => !n.read).length
);
const router = useRouter();


const auth = useAuth();
const {setBio,fetchBlogById} = useAuth();

const showBioDialog = ref(false);
const bioText =  ref('');

async function onNotifCommand(payload) {
  if (payload === 'view-all') {
    return router.push('/panel/notifications');
  }


  const { _id, targetType, targetId } = payload;


  await markRead(_id)


  switch (targetType) {
    case 'Blog':
    const blog = await fetchBlogById(targetId);
      if (blog) {
       return router.push(`/blog/${blog.slug}`);
     } else {
       console.log('Blog not found for notification:', targetId);
     }
     
    case 'User':
    
    return router.push(`/users/${targetId}`);
       
    case 'Comment':
 
      
    return router.push(`/blog/${targetId}`);

    case 'Guest':
      // Handle guest notifications if needed
      return router.push(`/guests/${targetId}`);
     
      
    default:
      return;
  }
}


function messageText(n) {
  switch (n.type) {
    case 'comment':   return 'commented on your post';
    case 'reply':     return 'replied to your comment';
    case 'like':      return 'liked your post';
    case 'follow':    return 'started following you';
    case 'new_blog':  return 'published a new blog';
    case 'view':   return 'has viewed your blog';
    default:          return 'did something';
  }
}
const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f';
watch(showBioDialog, async (open) => {
   if (!open) return;
   bioText.value = auth.user?.bio ?? '';

 });

async function saveBio() {
 
  try {
    await setBio({ bio: bioText.value });
    ElMessage.success('Bio updated!');
   
    
  } catch (error) {
    console.error('Error saving bio:', error);
  }
  showBioDialog.value = false;
}

function handleNotificationCommand(command) {
  if (command === 'view-all') {
    router.push('/notifications')
  }
}


</script>

<style scoped>
.badge {
  margin-left: 4px;
}
.notification-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  cursor: pointer;
}
.notification-item.unread {
  background-color: #f0f9eb;
}
.notification-item.read {
  color: #909399;
}
.see-all {
  text-align: center;
  font-weight: bold;
}
.notif-content {
  flex: 1;
  margin-right: 8px;
}
.notif-time {
  font-size: 0.75rem;
  color: #c0c4cc;
}
</style>
