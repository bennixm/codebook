<template>
  <el-empty description="Oops! We couldn't find the page you're looking for.">
    <el-button type="primary" @click="goHome">Go Home</el-button>
  </el-empty>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>
