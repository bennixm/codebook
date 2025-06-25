<template>
    <el-notification
      :title="title"
      :message="message"
      :duration="duration"
      :type="type"
      :position="position"
      :icon="icon"
      :dangerouslyUseHTMLString="true"
    />
  </template>
  
  <script setup>
  import { ElNotification } from 'element-plus'
  import 'element-plus/es/components/notification/style/css'
  
  defineProps({
    title: { type: String, default: 'Notification' },
    message: { type: String, required: true },
    duration: { type: Number, default: 5000 },
    type: { type: String, default: 'info' },
    position: { type: String, default: 'bottom-right' },
    icon: { type: [String, Object], default: null },
  })
  </script>
  