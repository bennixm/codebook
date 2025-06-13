<template>
  <div class="panel-container space-y-6">
    <div class="blog-block-header mb-4">
      <div class="flex items-center">
        <span class="mr-3 title">My Blogs</span>
      </div>
    </div>

    <div v-loading="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <el-card
        v-for="blog in blogs"
        :key="blog._id"
        class="blog-card"
        shadow="hover"
      >
        <div class="cover-image mb-3">
          <el-image
            v-if="blog.coverImage"
            :src="blog.coverImage"
            fit="cover"
            style="width: 100%; height: 100%; border-radius: 6px;"
          />
          <div v-else class="no-image-placeholder">
            No Image
          </div>
        </div>

        <h3 class="title mb-1">{{ blog.title }}</h3>
        <p class="description mb-3 text-sm text-gray-600">{{ blog.description }}</p>

        <div class="tags mb-3">
          <el-tag
            v-for="tag in blog.tags"
            :key="tag._id"
            size="small"
            effect="light"
            type="info"
            class="mr-1"
          >
            {{ tag.name }}
          </el-tag>
        </div>


        <div class="blog-buttons mb-3 flex items-center justify-between text-sm">
          <el-button type="primary" :icon="Edit" circle />
          <el-button
              type="primary"
              size="small"
              @click="viewBlog(blog.slug)"
              class="w-full"
            >
              View
        </el-button>
        <el-button type="danger" :icon="Delete" circle />
        </div>
        <div class="status-date mb-3 flex items-center justify-between text-sm">
          <el-tag
            :type="blog.isPublished ? 'success' : 'warning'"
            size="small"
          >
            {{ blog.isPublished ? 'Published' : 'Draft' }}
          </el-tag>
          <span class="text-gray-500">{{ formatDate(blog.publishedAt || blog.createdAt) }}</span>
        </div>
      </el-card>
    </div>

    <div v-if="blogs.length === 0 && !loading" class="text-center mt-6 text-gray-500">
      You have not created any blogs yet.
    </div>
  </div>
</template>

<script setup>
import {
  Check,
  Delete,
  Edit,
} from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useAuth } from '../../../composables/useAuth';

const auth = useAuth();
const loading = ref(false);
const blogs = ref([]);

const fetchMyBlogs = async () => {
  loading.value = true;
  try {
    const data = await auth.fetchMyBlogs();
    blogs.value = data;
  } catch (err) {
    console.log(err);
    ElMessage.error('Failed to load your blogs.');
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const router = useRouter();
const viewBlog = (slug) => {
  router.push(`/blog/${slug}`);
};

onMounted(() => {
  fetchMyBlogs();
});
</script>

<style scoped>
</style>
