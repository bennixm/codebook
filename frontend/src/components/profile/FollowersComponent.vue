<template>
  <div v-if="loaded" class="profile-subcomponent">
    <span class="title-subcomp">Followers</span>
    <div v-if="hasFollowers" class="profile-subcomp-body followers">
      <div v-for="(follower, index) in paginatedFollowers" :key="follower._id" class="follower-card">
        <div class="flex flex-row">
          <el-avatar :size="64" :src="follower.avatar || auth.defaultAvatar" />
          <div class="flex flex-col">
            <span class="name-follower cursor-pointer">{{ follower.name }}</span>
            <span class="username-follower cursor-pointer">@{{ follower.username }}</span>
          </div>
        </div>

        <div v-if="follower._id !== auth.user._id">
          <el-button v-if="!isFollowingMap[follower._id]" type="default" size="small"
            @click="handleFollow(follower._id)">
            <UserRoundPlus :size="20" style="margin-right: 3px;" /> Follow
          </el-button>

          <el-button v-else type="default" size="small" @click="handleunFollow(follower._id)">
            <UserRoundMinus :size="20" style="margin-right: 3px;" /> Unfollow
          </el-button>
        </div>
      </div>
      <el-pagination
        v-if="followers.value && Array.isArray(followers.value.followers) && followers.value.followers.length > pageSize"
        class="mt-4" background layout="prev, pager, next" :total="followers.value.followers.length"
        :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
    </div>
    <div v-else>
      <el-empty description="No followers." />
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuth } from '../../composables/useAuth'
import { UserRoundPlus, UserRoundMinus } from 'lucide-vue-next'

const currentPage = ref(1)
const pageSize = 15

const paginatedFollowers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return followers.value?.followers?.slice(start, end) || []
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const auth = useAuth()
const followers = ref(null);
const loaded = ref(false);

const isFollowingMap = ref({})

watchEffect(() => {
  if (!followers.value?.followers) return;
  const map = {}
  followers.value.followers.forEach(follower => {
    map[follower._id] = auth.user?.following?.includes(follower._id)
  })
  isFollowingMap.value = map
})


const hasFollowers = computed(() => {
  return Array.isArray(followers.value?.followers) && followers.value.followers.length > 0;
});

const props = defineProps({
  userId: String,
});

const fetchFollowers = async () => {
  try {
    followers.value = await auth.getFollowers(props.userId)
    loaded.value = true;
  } catch (err) {
    const message =
      err?.response?.data?.errors?.[0]?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to fetch followers.'
    ElMessage.error(message)
  }
}

const handleFollow = async (selectedUser) => {
  try {
    const res = await auth.follow(selectedUser)
    isFollowingMap.value[selectedUser] = true
    ElMessage.success(res.message)
  } catch (err) {
    ElMessage.error(err?.response?.data?.message || 'Failed to follow user.')
  }
}

const handleunFollow = async (selectedUser) => {
  try {
    const res = await auth.unfollow(selectedUser)
    isFollowingMap.value[selectedUser] = false
    ElMessage.success(res.message)
  } catch (err) {
    ElMessage.error(err?.response?.data?.message || 'Failed to unfollow user.')
  }
}


onMounted(() => {
  fetchFollowers();
});
</script>
