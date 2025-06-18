<template>
    <div v-if="userBlogs.length" class="user-blogs-slider">
      <el-carousel height="200px" :interval="4000" arrow="always" indicator-position="outside" type="card">
        <el-carousel-item v-for="blog in userBlogs" :key="blog._id">
          <div class="blog-slide p-4 border rounded-lg cursor-pointer" @click="$router.push(`/blog/${blog.slug}`)">
            <h3 class="font-semibold text-lg mb-2 truncate">{{ blog.title }}</h3>
            <p class="text-sm text-gray-600 line-clamp-3">{{ blog.description }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { ElCarousel, ElCarouselItem } from 'element-plus';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  
  const props = defineProps({
    userId: String,
    currentBlogId: String,
  });
  
  const userBlogs = ref([]);
  const auth = useAuth();
  const router = useRouter();
  
  const fetchUserBlogs = async () => {
    if (!props.userId) return;
    try {
      const blogs = await auth.fetchBlogsByUser(props.userId);
      userBlogs.value = blogs
        .filter(blog => blog._id !== props.currentBlogId)
        .slice(0, 3);
    } catch (error) {
      console.error('Failed to load user blogs:', error);
    }
  };
  
  watch(() => props.userId, fetchUserBlogs, { immediate: true });
  </script>
  
  <style scoped>
  .blog-slide {
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-box-orient: vertical;  
    overflow: hidden;
  }
  </style>
  