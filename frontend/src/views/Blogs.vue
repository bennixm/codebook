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
        <div v-loading="loading" class="blogs-feed grid grid-cols-2 gap-2">
          <el-card v-for="blog in blogs" :key="blog._id" class="blog-card cursor-pointer" shadow="hover" @click="goTo(blog.slug)">
            <div class="blog-profile-header-card">
              <div class="tags category-tag mb-3">
                <el-tag v-for="category in blog.categories" :key="category._id" size="small" effect="light"
                  type="primary" class="mr-1">
                  {{ category.name }}
                </el-tag>
              </div>
              <div class="tags mb-3">
                <el-tag v-for="tag in blog.tags" :key="tag._id" size="small" effect="light" type="info" class="mr-1">
                  {{ tag.name }}
                </el-tag>
              </div>
            </div>
            <div class="cover-image mb-3">
              <el-image v-if="blog.coverImage" :src="blog.coverImage" fit="cover" />
              <div v-else class="no-image-placeholder">
                No Image
              </div>
            </div>

            <h3 class="title mb-1">{{ blog.title }}</h3>

            <div v-if="!blog.updatedAt" class="status-date mb-4 flex items-center justify-between text-sm">
              <span class="text-gray-500">
                {{ auth.formatDate(blog.isPublished ? blog.publishedAt : blog.draftedAt) }}
              </span>
            </div>
            <div v-else class="status-date  mb-3 flex items-center justify-between text-sm">
              <span class="text-gray-500">{{ auth.formatDate(blog.publishedAt) }}</span>
            </div>
          </el-card>
        </div>

        <div v-if="blogs.length === 0 && !loading" class="text-center mt-6 text-gray-500">
          <el-empty description="No blogs match your filters." />
        </div>
        <el-pagination v-if="totalPages > 1" style="text-align:center; margin-top:2rem;" :current-page="page"
          :page-size="perPage" :total="total" layout="prev, pager, next" @current-change="onPageChange" />
      </div>
      <div class="search-right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from 'lucide-vue-next';
import { useBlogFilter } from '../composables/useBlogs';
import { useTags } from '../composables/useTags';
import { useAuth } from '../composables/useAuth';

const auth = useAuth();

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

function parseBlocks(content) {
  try {
    const obj = typeof content === 'string' ? JSON.parse(content) : content;
    return Array.isArray(obj.blocks) ? obj.blocks : [];
  } catch {
    return [];
  }
}

// initial
filterBlogs({ search: '', tags: [], newPage: 1 });
</script>

<style scoped></style>
