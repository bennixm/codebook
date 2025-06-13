<template>
    <div class="blog-page panel-container" v-loading="loading">
      <div v-if="blog" class="max-w-4xl mx-auto space-y-6">
        <div v-if="blog.coverImage" class="cover-image rounded-xl overflow-hidden">
          <el-image :src="blog.coverImage" fit="cover" class="w-full h-72 object-cover" />
        </div>
  
        <h1 class="text-3xl font-bold">{{ blog.title }}</h1>
  
        <div class="text-gray-500 text-sm flex items-center gap-4">
          <span>Published on {{ formatDate(blog.publishedAt || blog.createdAt) }}</span>
          <el-tag :type="blog.isPublished ? 'success' : 'warning'" size="small">
            {{ blog.isPublished ? 'Published' : 'Draft' }}
          </el-tag>
        </div>
  
        <div class="tags">
          <el-tag
            v-for="tag in blog.tags"
            :key="tag._id"
            size="small"
            type="info"
            class="mr-2"
          >
            {{ tag.name }}
          </el-tag>
        </div>
  
        <div class="blog-content text-base leading-relaxed" v-html="blog.content" />
  
        <div class="mt-10">
          <el-button @click="router.back()" type="primary" plain>← Back</el-button>
        </div>
      </div>
  
      <div v-else-if="!loading" class="text-center text-gray-500">
        <el-empty description="Blog not found." />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useAuth } from '../composables/useAuth';
  
  const route = useRoute();
  const router = useRouter();
  const auth = useAuth();
  
  const blog = ref(null);
  const loading = ref(true);
  
  const fetchBlog = async () => {
    loading.value = true;
    try {
      const slug = route.params.slug;
      const data = await auth.fetchBlogBySlug(slug);
      blog.value = data;
    } catch (err) {
      console.error(err);
      ElMessage.error('Failed to load the blog.');
    } finally {
      loading.value = false;
    }
  };
  
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  onMounted(() => {
    fetchBlog();
  });
  </script>
  
  <style scoped>
  .blog-content :deep(p) {
    margin-bottom: 1rem;
  }
  .blog-content :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  .blog-content :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 1rem 0;
  }
  </style>
  