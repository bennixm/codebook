<template>
  <div v-if="loaded" class="profile-subcomponent">
    <div class="title-subcomp"><span>Blogs ({{ filteredBlogs.length }})</span> <el-input v-model="searchQuery"
        placeholder="Search by title" class="mb-4" clearable /></div>

    <div v-if="hasBlogs" class="profile-subcomp-body">
      <div class="blogs-profile-grid">
        <router-link v-for="blog in paginatedBlogs" :key="blog._id" :to="`/blog/${blog.slug}`"
          class="blog-profile-card">
          <el-card :body-style="{ padding: '0' }" shadow="hover">
            <div class="blog-profile-header-card">
              <div class="category-header-profile-card" v-if="blog.categories[0]">
                <el-tag type="primary">{{ blog.categories[0].name }}</el-tag>
              </div>
              <div class="blog-small-stats">
                <span>{{ blog.views?.length || 0 }}
                  <Eye :size="14" style="margin-left:5px;"  aria-hidden="true"/>
                </span>
                <span>{{ blog.likes?.length || 0 }}
                  <ThumbsUp :size="14" style="margin-left:5px;" aria-hidden="true"/>
                </span>
              </div>
            </div>
            <div class="blog-cover-profile-card">
              <img v-if="blog.coverImage" :src="blog.coverImage" class="cover-img"  fetchpriority="high" loading="eager" :alt="`Cover image for blog post: ${blog.title}`" />
            </div>
            <div class="card-content">
              <div class="tags-profile-card mb-3">
                <el-tag v-for="tag in blog.tags" :key="tag._id" size="small" effect="light" type="info" class="mr-1">
                  {{ tag.name }}
                </el-tag>
              </div>
              <h3 class="blog-title">{{ blog.title }}</h3>
              <div class="blog-meta">
                <span>{{ auth.formatDate(blog.publishedAt) }}</span>
                <span v-if="blog.updatedAt">Edited: {{ auth.formatDate(blog.updatedAt) }}</span>
              </div>
            </div>
          </el-card>
        </router-link>
      </div>

      <el-pagination class="mt-4 flex justify-center" background layout="prev, pager, next"
        :total="filteredBlogs.length" :page-size="pageSize" :current-page="currentPage"
        @current-change="handlePageChange" />
    </div>
    <div v-else>
      <el-empty description="No blogs available." />
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { ElMessage } from 'element-plus'
import { ThumbsUp, Eye } from 'lucide-vue-next'

const pageSize = 8
const currentPage = ref(1)
const searchQuery = ref('') 

const auth = useAuth()
const blogs = ref([])
const loaded = ref(false)

const props = defineProps({
  userId: String,
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const filteredBlogs = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return blogs.value.filter((b) =>
    b.isPublished &&
    b.publishedAt &&
    b.title.toLowerCase().includes(query)
  )
})

const hasBlogs = computed(() => filteredBlogs.value.length > 0)

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredBlogs.value.slice(start, start + pageSize)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const fetchBlogsByUser = async () => {
  try {
    blogs.value = await auth.fetchBlogsByUser(props.userId)
    loaded.value = true

    console.log(blogs.value);
  } catch (err) {
    const message =
      err?.response?.data?.errors?.[0]?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to fetch blogs.'
    ElMessage.error(message)
  }
}

onMounted(() => {
  fetchBlogsByUser()
  
})
</script>


<style scoped></style>
