<template>
    <el-card class="mini-card-profile w-96 p-4 shadow-md rounded-xl relative overflow-hidden bg-white">
      <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#00a76f] to-[#005c3d] z-0 rounded-t-xl" />
  
      <div class="relative z-10">
        <div class="mini-card-header flex items-center space-x-4">
          <el-avatar :size="94" :src="userData.avatar || auth.defaultAvatar" />
          <div>
            <h2 class="text-lg font-semibold">{{ userData.name }}</h2>
            <p class="text-sm text-gray-500">Blogger</p>
          </div>
        </div>
  
        <div class="mt-4">
          <el-descriptions column="1" border>
            <el-descriptions-item label="Email">{{ userData.email  }}</el-descriptions-item>
            <el-descriptions-item label="Location">{{ userData.avatar  }}</el-descriptions-item>
            <el-descriptions-item label="Joined">{{ userData.avatar  }}</el-descriptions-item>
          </el-descriptions>
        </div>
  
        <div class="mt-4 flex justify-end space-x-2">
          <el-button type="default" size="small">
            <UserRoundPlus :size="20" /> Follow
          </el-button>
        </div>
      </div>
    </el-card>
  </template>
  
  
  <script setup>
  import { ElCard, ElAvatar, ElDescriptions, ElDescriptionsItem, ElButton } from 'element-plus'
  import 'element-plus/es/components/avatar/style/css'
  import 'element-plus/es/components/card/style/css'
  import 'element-plus/es/components/descriptions/style/css'
  import 'element-plus/es/components/button/style/css'

  import { UserRoundPlus } from 'lucide-vue-next';

  import { useAuth } from '../composables/useAuth'
  const auth = useAuth();

  const props = defineProps({
    userData: Object,
  });

  console.log(props.userData);
  
  </script>
  
  <style scoped>
  /* Optional custom styles */
  </style>
  