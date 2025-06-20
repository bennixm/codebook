<template>
  <el-card class="mini-card-profile w-96 p-4 shadow-md rounded-xl relative overflow-hidden bg-white">
    <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#00a76f] to-[#005c3d] z-0 rounded-t-xl" />

    <div class="relative z-10">
      <div class="mini-card-header flex items-center space-x-4">
        <el-avatar class="cursor-pointer" @click="auth.seeProfile(userData.username)" :size="94" :src="userData.avatar || auth.defaultAvatar" />
        <div class="flex flex-col items-center" style="margin-bottom: 1rem; margin-top:1rem;">
          <h2 class="text-lg font-semibold cursor-pointer" @click="auth.seeProfile(userData.username)">{{ userData.name }}</h2>
          <p class="text-sm text-gray-500 cursor-pointer" @click="auth.seeProfile(userData.username)">@{{ userData.username }}</p>
        </div>
        <div v-if="auth.user && authorId !== auth.user._id">
        <el-button v-if="!userFollowed" type="default" size="small" @click="handleFollow">
          <UserRoundPlus :size="20" style="margin-right: 3px;" /> Follow
        </el-button>
        <el-button v-else type="default" size="small" @click="handleunFollow">
          <UserRoundMinus :size="20" style="margin-right: 3px;" /> Unfollow
        </el-button>
      </div>
      </div>

      <div class="mt-4">
        <el-descriptions column="1">
          <el-descriptions-item label="Email">{{ userData.email }}</el-descriptions-item>
          <el-descriptions-item label="Member since">{{ auth.formatDate(userData.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="Role">
            <el-tag size="small">Blogger</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="userData.bio">
            <div class="info-bio">{{ userData.bio }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <div class="mt-4">
        <el-row :gutter="20" class="profile-stats">
        <el-col :span="8">
          <div class="column flex flex-col items-center">
              <span class="stat-text">Following</span>
              {{ userData.following.length }}
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column flex flex-col items-center">
            <span class="stat-text">Followers</span>
            {{ followersCount }}
          </div>
        </el-col>
        <el-col :span="8">
          <div class="column flex flex-col items-center">
            <span class="stat-text">Total posts</span>
            {{ userData.postsCount }}
          </div>
        </el-col>
      </el-row>
      </div>
    </div>
  </el-card>
</template>


<script setup>

import { ref, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import { UserRoundPlus, UserRoundMinus } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'

const auth = useAuth()

const props = defineProps({
  userData: Object,
  authorId: String,
})

const userFollowed = ref(false)
const followersCount = ref(props.userData.followers.length);

watchEffect(() => {
  if (auth.isAuthenticated && props.userData) {
    userFollowed.value = props.userData.followers?.includes(auth.user._id)
    followersCount.value = props.userData.followers?.length || 0
  }
})

const handleFollow = async () => {
  try {
    const res = await auth.follow(props.userData._id)
    userFollowed.value = true
    followersCount.value = res.followersCount ?? followersCount.value + 1
    ElMessage.success(res.message)
  } catch (err) {
    const message =
      err?.response?.data?.errors?.[0]?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to follow user.'
    ElMessage.error(message)
  }
}

const handleunFollow = async () => {
  try {
    const res = await auth.unfollow(props.userData._id)
    userFollowed.value = false
    followersCount.value = res.followersCount ?? Math.max(0, followersCount.value - 1)
    ElMessage.success(res.message)
  } catch (err) {
    const message =
      err?.response?.data?.errors?.[0]?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to unfollow user.'
    ElMessage.error(message)
  }
}


</script>

<style scoped>
.el-carousel__item h3 {
  display: flex;
  color: #475669;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>