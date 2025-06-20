<template>
  <div v-if="userBlogs.length" class="user-blogs-slider mt-4">
    <h2 class="text-lg font-semibold mb-4" style="margin-bottom: 1rem;">Other posts of {{ userData.name }}</h2>
    <el-carousel
      height="300px"
      :interval="4000"
      indicator-position="outside"
      :autoplay="true"
    >
      <el-carousel-item
        v-for="blog in userBlogs"
        :key="blog._id"
        class="flex items-center justify-center"
      >
        <div
          class="blog-slide relative rounded-lg overflow-hidden cursor-pointer w-full h-full bg-cover bg-center"
          :style="{ backgroundImage: `url(${blog.coverImage})` }"
          @click="$router.push(`/blog/${blog.slug}`)"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

          <div class="relative z-10 p-4 h-full flex flex-col justify-end text-white">
            <h3 class="text-lg font-semibold mb-2 truncate">{{ blog.title }}</h3>
            <p class="text-sm line-clamp-3 text-white">
              {{ blog.description }}
            </p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>

  <div v-else class="text-gray-400 italic text-sm mt-4">
    No other blogs from this user yet.
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { ElCarousel, ElCarouselItem } from 'element-plus'

const props = defineProps({
  userData: Object,
  currentBlogId: String,
})

const userBlogs = ref([])
const auth = useAuth()
const router = useRouter()

const fetchUserBlogs = async () => {
  if (!props.userData?._id) return
  try {
    const blogs = await auth.fetchBlogsByUser(props.userData?._id)
    userBlogs.value = blogs
      .filter((blog) => blog._id !== props.currentBlogId)
      .slice(0, 4)
  } catch (error) {
    console.error('Failed to load user blogs:', error)
  }
}

watch(() => props.userData?._id, fetchUserBlogs, { immediate: true })
</script>

<style scoped>
</style>
