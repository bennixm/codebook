<template>
  <nav class="navbar">
    <router-link to="/" class="logo nav-left" aria-label="CodeBook Home">
      <img src="https://ik.imagekit.io/codebook/tr:w-200,f-auto/logo.png" width="120" height="40" alt="CodeBook logo" />

    </router-link>
    <el-menu :default-active="$route.path" class="el-menu-demo nav-center" mode="horizontal" text-color="#27ae60"
      active-text-color="#27ae60" router>
      <el-menu-item index="/">
        <router-link to="/" class="nav-link">Home</router-link>
      </el-menu-item>

      <el-menu-item index="/blogs">
        <router-link to="/blogs" class="nav-link">Blogs</router-link>
      </el-menu-item>

    </el-menu>
    <el-menu :default-active="$route.path" class="el-menu-demo nav-right" mode="horizontal" text-color="#27ae60"
      active-text-color="#27ae60" :ellipsis="false" router>

      <el-menu-item aria-label="Go to bookmarks" index="/bookmarks">
        <router-link to="/bookmarks" aria-label="Bookmarks" class="nav-link">
          <Bookmark />
        </router-link>
      </el-menu-item>

      <el-menu-item v-if="auth.authReady && auth.isAuthenticated" class="notification-menu-item notification-link">
        <div class="icon-badge nav-link" @click="showNotificationDrawer = true" style="cursor: pointer;">
          <el-badge :value="unreadCount" class="item">
            <Inbox aria-hidden="true" />
          </el-badge>
        </div>
      </el-menu-item>

      <el-drawer v-model="showNotificationDrawer" title="Notifications" direction="rtl" size="400px"
        class="drawer-notifications">
        <el-scrollbar style="max-height: calc(100vh - 100px);">
          <div v-if="!state.list.length" class="empty">
            No notifications
          </div>
          <div v-else>
            <div v-for="n in state.list.slice(0, 5)" :key="n._id" @click="onNotifCommand(n)"
              :class="['notification-item', n.read ? 'read' : 'unread']">
              <div class="notif-content">
                <div class="notif-user">
                  <div class="w-12 h-12 rounded-full overflow-hidden">
                    <img class="w-full h-full object-cover" :src="n.actorUser?.avatar || auth.defaultAvatar"
                      :alt="n.actorUser?.name ? `Avatar of ${n.actorUser?.name}` : 'User avatar'"
                      :title="n.actorUser?.name ? `Avatar of ${n.actorUser?.name}` : 'User avatar'" loading="lazy" />
                  </div>
                </div>
                <div class="notif-message">
                  <div class="flex flex-wrap">
                    <span class="name">{{ n.actorUser?.name || n.actorGuest?.guestName }}</span>
                    {{ messageText(n) }}
                  </div>
                  <div class="notif-time">
                    {{ auth.formattedDate(n.createdAt) }}
                  </div>
                </div>
                <div class="notif-message">
                  <el-badge :is-dot="!n.read" class="item">
                  </el-badge>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="flex flex-row justify-evenly">
              <el-button text type="primary" @click="onNotifCommand('view-all')" class="see-all">
                View all
              </el-button>
              <el-button text type="primary" @click="onNotifCommand('mark-all')" class="see-all">
                <CheckCheck :size="20" />
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </el-drawer>

      <el-menu-item v-if="auth.authReady && auth.isAuthenticated">
        <el-dropdown>
          <span class="user-dropdown">
            <el-avatar
              :src="auth.user.avatar || 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f'"
              alt="avatar" />

            <span class="username">{{ auth.user.name }}</span>
          </span>

          <template #dropdown>
            <el-dropdown-menu class="dropdown-menu">

              <router-link to="/panel/dashboard" class="dropdown-link">
                <el-dropdown-item command="dashboard">
                  <LayoutDashboard :size="20" class="icon-nav-dropmenu" /> Dashboard
                </el-dropdown-item>
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

              <router-link v-if="auth.authReady && auth.user.provider === 'local'" to="/panel/profile/change-password"
                class="dropdown-link">
                <el-dropdown-item command="preferences">Change Password</el-dropdown-item>
              </router-link>

              <router-link v-if="auth.authReady && auth.user.provider === 'google'" to="/panel/profile/set-password"
                class="dropdown-link">
                <el-dropdown-item command="preferences">Set Local Password</el-dropdown-item>
              </router-link>

              <div class="dropdown-header">Bio</div>

              <el-dropdown-item @click="showBioDialog = true">
                <SmilePlus :size="20" class="icon-nav-dropmenu" /> Set Status
              </el-dropdown-item>

              <el-dropdown-item divided class="no-padding"></el-dropdown-item>

              <el-dropdown-item @click="auth.logout" class="logout">
                <LogOut :size="20" class="icon-nav-dropmenu" /> Logout
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-menu-item>

      <el-menu-item v-if="!auth.isAuthenticated" index="/auth" class="login-item-nav">
        <router-link to="/auth" class="nav-link">
          <User /> Login
        </router-link>
      </el-menu-item>

    </el-menu>

    <el-dialog v-model="showBioDialog" title="Set Your Bio" width="30%">
      <span>Set your status:</span>
      <el-input type="textarea" v-model="bioText" placeholder="Type your bio here..." :rows="4" maxlength="200"
        show-word-limit style="margin-top: 10px;" />
      <template #footer>
        <el-button type="danger" @click="showBioDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveBio">Save</el-button>
      </template>
    </el-dialog>
  </nav>

</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { ElMessage } from 'element-plus'
import { User, LogOut, SmilePlus, Inbox, LayoutDashboard, Bookmark, CheckCheck } from 'lucide-vue-next';
import { useNotifications } from '../composables/useNotifications';
import { useRouter } from 'vue-router';
import { messageText } from '../utils/messageText';

const { state, markRead, markAll } = useNotifications();

const unreadCount = computed(
  () => state.list.filter(n => !n.read).length
);

const router = useRouter();
const showNotificationDrawer = ref(false);
const auth = useAuth();
const { setBio, fetchBlogById } = useAuth();
const showBioDialog = ref(false);
const bioText = ref('');

async function onNotifCommand(payload) {

  if (payload === 'view-all') {
    showNotificationDrawer.value = false;
    return router.push('/panel/notifications');
  }

  if (payload === 'mark-all') {
    await markAll();
    showNotificationDrawer.value = false;
    return router.push('/panel/notifications');
  }
  console.log('Notification Payload:', payload);

  const { _id, targetType, targetId,actorUser} = payload;

  await markRead(_id)

  showNotificationDrawer.value = false;

  switch (targetType) {
    case 'Comment':
    case 'Blog':
      const blog = await fetchBlogById(targetId);
      if (blog) {
        return router.push(`/blog/${blog.slug}`);
      } else {
        console.log('Blog not found for notification:', targetId);
      }
    case 'User':
      return router.push(`/user/profile/${actorUser.username}`);
    case 'Guest':
      return router.push(`/guests/${targetId}`);


    default:
      return;
  }
}


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


</script>

<style scoped></style>
