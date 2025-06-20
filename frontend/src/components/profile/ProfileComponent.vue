<template>
  <div class="profile-left-component">
    <div class="stats-card">
      <div class="stats-component">
        <span>{{ userData.followers.length }}</span>
        <span class="stats-title">Followers</span>
      </div>
      <el-divider direction="vertical" border-style="dashed" />
      <div class="stats-component">
        <span>{{ userData.following.length }}</span>
        <span class="stats-title">Following</span>
      </div>
    </div>
    <div class="about-card">
      <div class="title-about-card">
        About
      </div>
      <div class="content-about-card">
        <el-descriptions column="1">
          <el-descriptions-item label="Email">{{ userData.email }}</el-descriptions-item>
          <el-descriptions-item label="Member since">{{ auth.formatDate(userData.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="Role">
            <el-tag size="small">Blogger</el-tag>
          </el-descriptions-item>
          <el-divider />
          <el-descriptions-item v-if="userData.bio">
            <div class="info-bio">{{ userData.bio }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
  <div class="profile-right-component">

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UserRoundPlus, UserRoundMinus } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'
const auth = useAuth()

const props = defineProps({
  userId: String,
  userData: Object,
})


</script>