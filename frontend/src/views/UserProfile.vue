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
                        <span class="usernametag">@{{ profile.username }}</span>
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
            <component :is="currentComponent" :userId="profile._id"/>
        </div>
    </div>
    <div v-else>
        <el-empty description="Profile not found." :image-size="200" />
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue'
import { Heart, BookUser, NotebookText } from 'lucide-vue-next'
import { ElMessage } from 'element-plus';
import FollowersPage from '../components/profile/FollowersComponent.vue';
import ProfilePage from '../components/profile/ProfileComponent.vue';
import BlogsPage from '../components/profile/BlogsListComponent.vue';
import { useAuth } from '../composables/useAuth'

const auth = useAuth()
const route = useRoute();
const username = route.params.username;

const profile = ref(null);
const value = ref('Profile')

const options = [
    { label: 'Profile', value: 'Profile', icon: BookUser },
    { label: 'Blogs', value: 'Blogs', icon: NotebookText },
    { label: 'Followers', value: 'Followers', icon: Heart },
]

const componentMap = {
    Profile: ProfilePage,
    Blogs: BlogsPage,
    Followers: FollowersPage,
}

const currentComponent = computed(() => componentMap[value.value])

const hasProfile = computed(() => {
    return profile.value && typeof profile.value === 'object' && 'username' in profile.value;
});

const loadUserProfile = async () => {
    if (!username || typeof username !== 'string' || username.trim() === '') {
        ElMessage.error('Username is missing or invalid');
        return;
    }
    try {
        profile.value = await auth.getProfileByUsername(username);
        if (!profile.value) {
            ElMessage.error('Profile not found.');
        }
    } catch (err) {
        ElMessage.error('Error fetching profile.');
    }
};

onMounted(() => {
    loadUserProfile();
});
</script>


<style scoped></style>
