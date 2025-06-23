<template>
    <div class="external-component container p-6">
        <h1 class="title-extern">Your Bookmarked Blogs</h1>

        <div v-if="bookmarkedBlogs.length === 0" class="text-gray-500">
            <el-empty description="You haven't bookmarked any blogs yet." />
        </div>

        <div class="bookmarks-component" v-else>
            <div v-for="(blog, index) in bookmarkedBlogs" :key="blog.slug">
                <el-card class="bookmark-component" shadow="hover">
                    <div class="flex">
                        <div class="w-[30%] pr-4">
                            <img :src="blog.coverImage" alt="Blog image"
                                class="w-full h-auto rounded-md object-cover" />
                        </div>
                        <div class="bookmark-content w-[70%]">
                            <div class="flex justify-between items-center">
                                <router-link :to="`/blog/${blog.slug}`" class="text-lg font-semibold hover:underline">
                                    {{ blog.title }}
                                </router-link>
                                <el-button @click="removeAndRefresh(blog.slug)" type="default" size="large" circle>
                                    <BookmarkMinus />
                                </el-button>
                            </div>
                            <p class="text-gray-700">{{ blog.description }}</p>
                        </div>
                    </div>
                </el-card>
                <el-divider v-if="index < bookmarkedBlogs.length - 1" />
            </div>
        </div>
    </div>
</template>



<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { BookmarkMinus }      from 'lucide-vue-next';
import { useBookmarks } from '../composables/useBookmarks'
import { useBlogFilter } from '../composables/useBlogs'

const { bookmarks, removeBookmark } = useBookmarks()
const { blogs, filterBlogs } = useBlogFilter()

const bookmarkedBlogs = ref([])

async function fetchBookmarkedBlogs() {
    if (bookmarks.value.length === 0) {
        bookmarkedBlogs.value = []
        return
    }

    try {
        await filterBlogs({ slugs: bookmarks.value })
        bookmarkedBlogs.value = blogs.value
    } catch (e) {
        ElMessage.error('Failed to fetch bookmarked blogs.')
    }
}

function removeAndRefresh(slug) {
    removeBookmark(slug)
    fetchBookmarkedBlogs()
}

onMounted(fetchBookmarkedBlogs)
watch(bookmarks, fetchBookmarkedBlogs)
</script>
