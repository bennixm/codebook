<template>
  <div v-if="loaded" class="profile-subcomponent">
    <div class="title-subcomp"><span>Followers ({{ filteredFollowers.length }})</span> <el-input v-model="searchQuery" placeholder="Username or name" class="mb-4" clearable /></div>

    <div v-if="hasFollowers" class="profile-subcomp-body followers">
      <div v-for="(follower, index) in paginatedFollowers" :key="follower._id" class="follower-card">
        <div class="flex flex-row" >
          <el-avatar :size="64" :src="follower.avatar || auth.defaultAvatar" :title="`Avatar of ${follower.username || 'User'}`"  alt="User avatar for {{ follower.username }}"/>
          <div class="flex flex-col">
            <span class="name-follower cursor-pointer" @click="auth.seeProfile(follower.username)">{{ follower.name
              }}</span>
            <span class="username-follower cursor-pointer" @click="auth.seeProfile(follower.username)">@{{
              follower.username }}</span>
          </div>
        </div>

        <div v-if="auth.isAuthenticated && follower._id !== auth.user._id">
          <el-button v-if="!isFollowingMap[follower._id]" type="default" size="small"
            @click="handleFollow(follower._id)" aria-label="Follow">
            <UserRoundPlus :size="20" style="margin-right: 3px;"  aria-hidden="true" /> Follow
          </el-button>

          <el-button v-else type="default" size="small" @click="handleunFollow(follower._id)" aria-label="Unfollow">
            <UserRoundMinus :size="20" style="margin-right: 3px;" aria-hidden="true" /> Unfollow
          </el-button>
        </div>
      </div>

      <el-pagination v-if="filteredFollowers.length > pageSize" class="mt-4 flex justify-center" background
        layout="prev, pager, next" :total="filteredFollowers.length" :page-size="pageSize" :current-page="currentPage"
        @current-change="handlePageChange" />
    </div>

    <div v-else>
      <el-empty description="No followers." />
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, computed, watchEffect, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuth } from '../../composables/useAuth'
import { UserRoundPlus, UserRoundMinus } from 'lucide-vue-next'

const currentPage = ref(1)
const pageSize = 15

const searchQuery = ref("");

const filteredFollowers = computed(() => {
  if (!followers.value?.followers) return [];
  const query = searchQuery.value.toLowerCase();
  return followers.value.followers.filter(f =>
    f.name.toLowerCase().includes(query) || f.username.toLowerCase().includes(query)
  );
});

const paginatedFollowers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredFollowers.value.slice(start, end);
});


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

watch(searchQuery, () => {
  currentPage.value = 1;
});

</script>
