<template>
    <div class="external-component container p-6">
        <h1 class="title-extern">Your Bookmarked Blogs</h1>

        <div v-if="bookmarkedBlogs.length === 0" class="text-gray-500">
            <el-empty description="You haven't bookmarked any blogs yet." />
        </div>

        <div class="bookmarks-component" v-else>
            <div v-for="(blog, index) in paginatedBlogs" :key="blog.slug">
                <el-card class="bookmark-component" shadow="hover">
                    <div class="bookmark-component-content flex">
                        <div class="image-cover w-[30%] pr-4">
                            <img :src="blog.coverImage" alt="Blog image"
                                class="w-full h-auto rounded-md object-cover" />
                        </div>
                        <div class="bookmark-content w-[70%]">
                            <div class="bookmark-subcontent flex justify-between items-start">
                                <router-link :to="`/blog/${blog.slug}`" class="text-lg font-semibold hover:underline">
                                    {{ blog.title }}
                                </router-link>
                                <el-button @click="removeAndRefresh(blog.slug)" type="default" aria-label="bookmark"
                                    size="medium" circle>
                                    <BookmarkMinus :type="success" :size="20" />
                                </el-button>
                            </div>
                            <div class="bookmark-subcontent">
                                <p class="text-gray-700 w-[70%]">{{ blog.description }}</p>
                                <div class="bookmark-buttons w-[30%]">
                                    <el-button circle @click="auth.copyLink" aria-label="Copy link to clipboard">
                                        <Share2 :size="15" />
                                    </el-button>
                                </div>
                            </div>
                            <div class="avatar-section-bookmark">
                                <div class="profile-bookmark">
                                    <img class="w-10 h-10 rounded-full object-cover cursor-pointer"
                                        @click="auth.seeProfile(blog.userId.username)"
                                        :src="blog.userId.avatar || auth.defaultAvatar"
                                        :alt="blog.userId?.name ? `Avatar of ${blog.userId.name}` : 'User avatar'"
                                        :title="blog.userId?.name ? `Avatar of ${blog.userId.name}` : 'User avatar'"
                                        width="96" height="96" loading="lazy" />
                                    <span class="cursor-pointer" @click="auth.seeProfile(blog.userId.username)">by
                                        <strong>{{ blog.userId.name
                                            }} on {{
                                                auth.formatDate(blog.publishedAt || blog.createdAt) }}</strong> <span
                                            v-if="blog.updatedAt"> <el-divider direction="vertical" /> updated on {{
                                                auth.formatDate(blog.updatedAt) }}</span></span>
                                </div>
                                <div clas="stats-bookmark">
                                    <el-tag type="primary">{{ blog.categories[0].name }}</el-tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>
            <div class="flex justify-center mt-6">
                <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page="currentPage"
                    :total="bookmarkedBlogs.length" @current-change="handlePageChange" />
            </div>
        </div>
    </div>
</template>



<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { BookmarkMinus, Share2 } from 'lucide-vue-next';
import { useBookmarks } from '../composables/useBookmarks'
import { useBlogFilter } from '../composables/useBlogs'
import { useAuth } from '../composables/useAuth'

const { bookmarks, removeBookmark } = useBookmarks()
const { blogs, filterBlogs } = useBlogFilter()
const auth = useAuth()

const bookmarkedBlogs = ref([])

const pageSize = 6
const currentPage = ref(1)

const paginatedBlogs = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return bookmarkedBlogs.value.slice(start, start + pageSize)
})

function handlePageChange(newPage) {
    currentPage.value = newPage
}

async function fetchBookmarkedBlogs() {
    if (bookmarks.value.length === 0) {
        bookmarkedBlogs.value = []
        return
    }

    try {
        await filterBlogs({ slugs: bookmarks.value })
        bookmarkedBlogs.value = blogs.value
        currentPage.value = 1 
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
