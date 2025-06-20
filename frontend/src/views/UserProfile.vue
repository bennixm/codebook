<template>
    <div v-if="hasProfile" class="user-profile container">
        <div class="user-profile-header">
            <div class="user-profile-header-top">
                <div class="user-identity">
                    <div class="avatar-container">
                        <el-avatar :size="110" :src="profile.avatar || auth.defaultAvatar" />
                    </div>
                    <div class="info-container">
                        <span class="name">{{ profile.name }}</span>
                        <span class="usernametag">@{{ profile.username }} 
                            <el-button v-if="!userFollowed" :size="15" :icon="UserRoundPlus" @click="handleFollow(profile._id)" circle/>
                            <el-button v-else :size="15" :icon="UserRoundMinus" @click="handleunFollow(profile._id)" circle/>
                        </span>
                    </div>
                </div>
            </div>
            <div class="user-profile-header-bottom">
                <div class="custom-segmented">
                    <div v-for="item in options" :key="item.value"
                        :class="['segment-item', { active: item.value === value }]" @click="value = item.value">
                        <el-icon size="20">
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.label }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="user-profile-body mt-6">
            <div class="user-profile-body-left">
                <ProfilePage :key="profile._id + value" :userId="profile._id" :userData="profile"/>
            </div>
            <div class="user-profile-body-right">
                <component :is="currentComponent" :key="profile._id + value" :userId="profile._id" :userData="profile"/>
            </div>
        </div>
    </div>
    <div v-else>
        <el-empty description="Profile not found." :image-size="200" />
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { Heart, BookUser, NotebookText,  UserRoundPlus, UserRoundMinus } from 'lucide-vue-next'
import { ElMessage } from 'element-plus';
import FollowersPage from '../components/profile/FollowersComponent.vue';
import ProfilePage from '../components/profile/ProfileComponent.vue';
import BlogsPage from '../components/profile/BlogsListComponent.vue';
import { useAuth } from '../composables/useAuth'

const auth = useAuth()
const route = useRoute();
const username = computed(() => route.params.username);

const profile = ref(null);
const value = ref('Blogs')

const options = [
    { label: 'Blogs', value: 'Blogs', icon: NotebookText },
    { label: 'Followers', value: 'Followers', icon: Heart },
]

const componentMap = {
    Blogs: BlogsPage,
    Followers: FollowersPage,
}

const currentComponent = computed(() => componentMap[value.value])

const hasProfile = computed(() => {
    return profile.value && typeof profile.value === 'object' && 'username' in profile.value;
});

const loadUserProfile = async () => {
    if (!username.value || typeof username.value !== 'string' || username.value.trim() === '') {
        ElMessage.error('Username is missing or invalid');
        return;
    }
    try {
        profile.value = await auth.getProfileByUsername(username.value);
        if (!profile.value) {
            ElMessage.error('Profile not found.');
        }
    } catch (err) {
        ElMessage.error('Error fetching profile.');
    }
};


const handleFollow = async (selectedUser) => {
  try {
    const res = await auth.follow(selectedUser)
    userFollowed.value = true
    ElMessage.success(res.message)
  } catch (err) {
    ElMessage.error(err?.response?.data?.message || 'Failed to follow user.')
  }
}

const handleunFollow = async (selectedUser) => {
  try {
    const res = await auth.unfollow(selectedUser)
    userFollowed.value = false
    ElMessage.success(res.message)
  } catch (err) {
    ElMessage.error(err?.response?.data?.message || 'Failed to unfollow user.')
  }
}

const userFollowed = ref(false)

watchEffect(() => {
  if (auth.isAuthenticated && profile.value) {
    userFollowed.value = profile.value.followers?.includes(auth.user._id)
  }
})

onMounted(() => {
    loadUserProfile();
});

watch(
  () => route.params.username,
  async (newUsername, oldUsername) => {
    if (newUsername !== oldUsername) {
      await loadUserProfile();
    }
  }
);
</script>


<style scoped></style>
