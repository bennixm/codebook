<template>
  <nav class="navbar">
    <router-link to="/" class="logo nav-left" aria-label="CodeBook Home">
      <img src="../assets/img/logo.png" alt="CodeBook logo" />
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

  <el-menu-item index="/panel/notifications" v-if="auth.authReady && auth.isAuthenticated" class="notification-menu-item">
    <el-dropdown trigger="hover" placement="bottom" @command="handleNotificationCommand">
      <span class="nav-link no-select">
        <router-link to="/panel/notifications" class="notification-link">
          <Inbox aria-hidden="true" />
          <span class="sr-only">Notifications</span>
        </router-link>
      </span>

      <template #dropdown>
        <el-dropdown-menu class="notification-dropdown">
          <div v-if="notifications.length === 0" class="empty">No notifications</div>
          <div v-else>
            <div
              v-for="(n, index) in notifications.slice(0, 5)"
              :key="index"
              class="notification-item"
            >
              {{ n.text }}
            </div>
            <el-dropdown-item divided class="no-padding"></el-dropdown-item>
            <el-dropdown-item class="see-all" command="view-all">
              ... See all
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
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
          <router-link to="/panel/drafts" class="dropdown-link">
            <el-dropdown-item command="drafts">Drafts</el-dropdown-item>
          </router-link>

          <el-dropdown-item divided class="no-padding"></el-dropdown-item>

          <div class="dropdown-header">Profile</div>


          <router-link to="/panel/profile/settings" class="dropdown-link">
            <el-dropdown-item command="profile">Settings</el-dropdown-item>
          </router-link>
          <router-link to="/panel/profile/change-password" class="dropdown-link">
            <el-dropdown-item command="preferences">Change Password</el-dropdown-item>
          </router-link>
          <router-link to="/panel/profile/security" class="dropdown-link">
            <el-dropdown-item command="security">Security</el-dropdown-item>
          </router-link>
          <router-link to="/panel/profile/performance" class="dropdown-link">
            <el-dropdown-item command="performance">Performance</el-dropdown-item>
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
    rows="4"
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
import { ref,watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { ElMessage } from 'element-plus'
import { User, LogOut, SmilePlus, Inbox, LayoutDashboard } from 'lucide-vue-next';

const auth = useAuth();
const {setBio} = useAuth();

const showBioDialog = ref(false);
const bioText =  ref('');
const notifications = ref([
  { text: 'New comment on your blog' },
  { text: 'Follower liked your post' },
  { text: 'New message received' },
  { text: 'Analytics report ready' },
  { text: 'Password changed successfully' },
  { text: 'You have a new follower' }
])

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

</style>
