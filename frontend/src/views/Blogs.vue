<template>
  <div class="search-page container p-6">
    <div class="search-component">
      <div class="search-left">
        <el-row class="search-controls">
          <el-col :xs="24" :sm="16">
            <el-autocomplete v-model="searchQuery" :fetch-suggestions="fetchFromBackend" value-key="value"
              @select="onSuggestionSelect" placeholder="Search blogs…" clearable class="w-full" />
          </el-col>

          <el-col :xs="24" :sm="7">
            <el-button type="primary" @click="onSearch" class="w-full">
              <Search /> Search
            </el-button>
          </el-col>
        </el-row>

      </div>
      <div class="search-right">
        <el-row class="search-controls">
          <el-col>
            <el-select v-model="selectedTags" multiple collapse-tags clearable filterable placeholder="Filter by tags"
              @change="onSearch" class="w-full" :loading="tagsLoading" empty-text="No tags">
              <el-option v-for="t in allTags" :key="t._id" :label="t.name" :value="t._id" />
            </el-select>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="search-component">
      <div class="search-left">
        <div v-loading="loading" class="blogs-feed flex">
          <el-card v-for="(blog, index) in blogs" :key="blog._id" class="blog-card cursor-pointer" shadow="hover">
            <div class="tags mb-3">
              <el-tag v-for="tag in blog.tags" :key="tag._id" class="tiny-tag mr-1" effect="light" type="info">
                {{ tag.name }}
              </el-tag>
            </div>
            <div class="cover-image mb-3" @click="goTo(blog.slug)">
              <el-image v-if="blog.coverImage" :src="blog.coverImage" fit="cover" />
              <div v-else class="no-image-placeholder">
                No Image
              </div>
            </div>

            <h3 class="title mb-1" @click="goTo(blog.slug)">{{ blog.title }}</h3>
            <div class="blog-profile-header-card">
              <div class="profile-user-blog-slider flex flex-row items-center"
                @click="auth.seeProfile(blog.userId.username)">
                <img class="w-7 h-7 rounded-full object-cover cursor-pointer"
                  :src="blog.userId.avatar || auth.defaultAvatar"
                  :alt="blog.userId?.name ? `Avatar of ${blog.userId.name}` : 'User avatar'"
                  :title="blog.userId?.name ? `Avatar of ${blog.userId.name}` : 'User avatar'" width="96" height="96"
                  loading="lazy" />
                <span class="cursor-pointer" style="margin-left:10px;">
                  <strong>{{ blog.userId.name
                    }} <span class="int-word">on</span> {{
                      auth.formatDate(blog.publishedAt || blog.createdAt) }}</strong></span>
              </div>
              <div class="tags category-tag mb-3">
                <el-tag v-for="category in blog.categories" :key="category._id" size="small" effect="light"
                  type="primary" class="mr-1">
                  {{ category.name }}
                </el-tag>
              </div>
            </div>

            <el-divider />

            <div class="blog-buttons mb-3 flex items-center justify-between text-sm">
              <div class="stats">
                <span class="views flex flex-row">{{ blog.views.length || 0 }}
                  <Eye :size="20" style="margin-left: 10px;" />
                </span>
                <span class="likes flex flex-row">
                  {{ blog.likes.length || 0 }}
                  <ThumbsUp :size="20" style="margin-left: 10px;" />
                </span>
              </div>
              <el-button circle :type="isBookmarked(blog.slug) ? 'success' : 'default'" aria-label="Bookmark"
                @click="handleToggleBookmark(blog.slug)">
                <Bookmark :size="15" />
              </el-button>
            </div>
          </el-card>
        </div>
        <div v-if="blogs.length === 0 && !loading" class="text-center mt-6 text-gray-500">
          <el-empty description="No blogs match your filters." />
        </div>
        <el-pagination v-if="totalPages > 1" style="text-align:center; margin-top:2rem;" :current-page="page"
          :page-size="perPage" :total="total" layout="prev, pager, next" @current-change="onPageChange" />
      </div>
      <div class="search-right">
        <div class="popular-blogs mt-6">
          <h3 class="text-lg font-semibold mb-2" style="margin-bottom: 1rem;">Top Picks</h3>
          <SmallCardBlog v-for="blog in topLikedBlogs" :key="blog._id" :blog="blog" />
        </div>
        <div class="popular-blogs mt-6">
          <h3 class="text-lg font-semibold mb-2" style="margin-bottom: 1rem;">Most Relevant Blogger</h3>
          <UserBlogsSlider :userData="topUserFromTopLikedBlogs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBlogFilter } from '../composables/useBlogs';
import { useTags } from '../composables/useTags';
import { useAuth } from '../composables/useAuth';
import { useBookmarks } from '../composables/useBookmarks';
import UserBlogsSlider from '../components/blog/UserBlogsSlider.vue';
import SmallCardBlog from '../components/blog/SmallCardBlog.vue';

const { isBookmarked, toggleBookmark } = useBookmarks();

const handleToggleBookmark = (slug) => {
  toggleBookmark(slug);
};

import { Search, Bookmark, ThumbsUp, Eye } from 'lucide-vue-next';

const auth = useAuth();

const topLikedBlogs = computed(() => {
  return [...blogs.value]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 4);
});


const topUserFromTopLikedBlogs = computed(() => {
  const userFrequency = new Map();

  topLikedBlogs.value.forEach(blog => {
    const userId = blog.userId._id;
    if (!userFrequency.has(userId)) {
      userFrequency.set(userId, { count: 1, user: blog.userId });
    } else {
      userFrequency.get(userId).count += 1;
    }
  });
  const sorted = [...userFrequency.values()].sort((a, b) => b.count - a.count);
  return sorted[0]?.user || null;
});



const router = useRouter();
const {
  blogs,
  page,
  perPage,
  totalPages,
  total,
  filterBlogs
} = useBlogFilter();
const { tags: allTags, loading: tagsLoading } = useTags();

const searchQuery = ref('');
const selectedTags = ref([]);


const fetchFromBackend = async (q, cb) => {
  if (!q) { cb([]); return; }
  await filterBlogs({ search: q, tags: selectedTags.value, newPage: 1 });
  cb(blogs.value.map(b => ({ value: b.title, slug: b.slug })));
  console.log(blogs.value);
};

function onSuggestionSelect(item) {
  router.push(`/blog/${item.slug}`);
}

function onSearch() {
  filterBlogs({ search: searchQuery.value, tags: selectedTags.value, newPage: 1 });
}

function onPageChange(newPage) {
  filterBlogs({ search: searchQuery.value, tags: selectedTags.value, newPage });
}

function goTo(slug) {
  router.push(`/blog/${slug}`);
}

filterBlogs({ search: '', tags: [], newPage: 1 });
</script>

<style scoped></style>
