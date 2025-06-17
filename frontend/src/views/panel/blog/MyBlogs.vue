<template>
  <div class="panel-container space-y-6">
    <div class="blog-block-header mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <span class="title">My Blogs</span>

      <div class="panel-filters">
        <el-input
          v-model="filters.search"
          placeholder="Search title or description"
          size="medium"
          class="panel-filter"
          clearable
        />

        <el-select v-model="filters.status" placeholder="Status" size="medium" class="panel-filter" clearable>
          <el-option label="Published" value="published" />
          <el-option label="Draft" value="draft" />
        </el-select>

        <el-select v-model="filters.tag" placeholder="Tag" size="medium" class="panel-filter" clearable>
          <el-option
            v-for="tag in allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>

        <el-select v-model="filters.sort" placeholder="Sort by date" class="panel-filter" size="medium">
          <el-option label="Newest" value="desc" />
          <el-option label="Oldest" value="asc" />
        </el-select>
      </div>
    </div>

    <div v-loading="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <el-card
        v-for="blog in paginatedBlogs"
        :key="blog._id"
        class="blog-card"
        shadow="hover"
      >
        <div class="cover-image mb-3">
          <el-image
            v-if="blog.coverImage"
            :src="blog.coverImage"
            fit="cover"
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
          <el-button type="primary" size="small" @click="viewBlog(blog.slug)" class="w-full">View</el-button>
          <el-button type="danger" :icon="Delete" circle @click="confirmDelete(blog)" />
        </div>

        <div class="status-date mb-3 flex items-center justify-between text-sm">
          <el-tag :type="blog.isPublished ? 'success' : 'warning'" size="small">
            {{ blog.isPublished ? 'Published' : 'Draft' }}
          </el-tag>
          <span class="text-gray-500">{{ formatDate(blog.publishedAt || blog.createdAt) }}</span>
        </div>
      </el-card>
    </div>

    <div v-if="filteredBlogs.length === 0 && !loading" class="text-center mt-6 text-gray-500">
      <el-empty description="No blogs match your filters." />
    </div>

    <div class="pagination-container flex justify-center mt-6" v-if="filteredBlogs.length > perPage">
      <el-pagination
        layout="prev, pager, next"
        :page-size="perPage"
        :current-page="currentPage"
        :total="filteredBlogs.length"
        @current-change="currentPage = $event"
      />
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { useAuth } from '../../../composables/useAuth';
import { Check, Delete, Edit } from '@element-plus/icons-vue';

const auth = useAuth();
const router = useRouter();

const blogs = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const perPage = 6;

const filters = ref({
  status: null,
  tag: null,
  search: '',
  sort: 'desc',
});

const fetchMyBlogs = async () => {
  loading.value = true;
  try {
    const data = await auth.fetchMyBlogs();
    blogs.value = data;
  } catch (err) {
    console.error(err);
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

const viewBlog = (slug) => {
  router.push(`/blog/${slug}`);
};

const confirmDelete = (blog) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${blog.title}"? This action is permanent`,
    'Confirm Deletion',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
      dangerouslyUseHTMLString: true,
    }
  )
    .then(() => deleteBlog(blog))
    .catch(() => {
    });
};

const deleteBlog = async (blog) => {
  try {
    await auth.deleteMyBlog(blog._id);
    blogs.value = blogs.value.filter((b) => b._id !== blog._id);
    ElMessage.success('Blog deleted successfully.');
  } catch (err) {
    console.error(err);
    ElMessage.error('Failed to delete the blog.');
  }
};

const allTags = computed(() => {
  const tagSet = new Set();
  blogs.value.forEach((blog) => {
    blog.tags.forEach((tag) => tagSet.add(tag.name));
  });
  return [...tagSet];
});

const filteredBlogs = computed(() => {
  return blogs.value
    .filter((blog) => {
      if (filters.value.status === 'published' && !blog.isPublished) return false;
      if (filters.value.status === 'draft' && blog.isPublished) return false;
      if (
        filters.value.search &&
        !`${blog.title} ${blog.description}`.toLowerCase().includes(filters.value.search.toLowerCase())
      )
        return false;
      if (filters.value.tag && !blog.tags.some((tag) => tag.name === filters.value.tag)) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return filters.value.sort === 'asc' ? dateA - dateB : dateB - dateA;
    });
});

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredBlogs.value.slice(start, start + perPage);
});

watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

onMounted(() => {
  fetchMyBlogs();
});
</script>



<style scoped>
</style>
