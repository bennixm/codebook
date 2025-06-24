<template>
    <el-card class="small-blog-card cursor-pointer mb-4" shadow="hover" @click="goTo(blog.slug)">
      <div class="flex items-start gap-4 items-center">
        <el-image
          v-if="blog.coverImage"
          :src="blog.coverImage"
          fit="cover"
          class="img-cover-popularity-blog w-24 h-16 rounded object-cover"
        />
        <div class="flex flex-col justify-between">
          <h4 class="text-sm font-semibold">{{ blog.title }}</h4>
          <div class="profile-user-blog-popularity text-xs text-gray-500 flex gap-2 mt-1">
            <img class="w-5 h-5 rounded-full object-cover cursor-pointer"
                  :src="blog.userId.avatar || auth.defaultAvatar"
                  :alt="blog.userId?.name ? `Avatar of ${blog.userId.name}` : 'User avatar'"
                  :title="blog.userId?.name ? `Avatar of ${blog.userId.name}` : 'User avatar'" width="96" height="96"
                  loading="lazy" />
            <span>{{ blog.userId.name }}</span> ·
            <span>{{ blog.likes.length }} likes</span>
          </div>
        </div>
      </div>
    </el-card>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
    blog: Object
  });
  
  const router = useRouter();
  
  function goTo(slug) {
    router.push(`/blog/${slug}`);
  }
  </script>
  
  <style scoped>
  .small-blog-card {
    transition: transform 0.2s ease;
  }
  .small-blog-card:hover {
    transform: translateY(-2px);
  }
  </style>
  