<template>
  <div v-if="userBlogs.length" class="user-blogs-slider mt-4">
    <h2 class="text-lg font-semibold mb-4" style="margin-bottom: 1rem;">Other posts of {{ userData.name }}</h2>
    <el-carousel
      height="500px"
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
          <img
            :src="blog.coverImage"
            :alt="`Cover image for blog titled ${blog.title}`"
            class="sr-only"
            width="700"
            height="200"
          />
        </div>
          <div class="blog-slide-content relative z-10 p-4 flex flex-col text-black" @click="$router.push(`/blog/${blog.slug}`)">
            <h3 class="text-lg font-semibold mb-2 truncate">{{ blog.title }}</h3>
            <p class="text-sm line-clamp-3 text-black">
              {{ blog.description }}
            </p>
          </div>
      </el-carousel-item>
    </el-carousel>
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
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

</style>
