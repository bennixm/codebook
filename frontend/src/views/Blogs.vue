<template>
  <div class="search-page container p-6">
    <el-row :gutter="20" class="search-controls">
      <el-col :xs="24" :sm="12" :md="8">
        <el-autocomplete
          v-model="searchQuery"
          :fetch-suggestions="fetchFromBackend"
          value-key="value"
          @select="onSuggestionSelect"
          placeholder="Search blogs…"
          clearable
          class="w-full"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :md="4">
        <el-button type="primary" @click="onSearch" class="w-full">
          <Search /> Search
        </el-button>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12">
        <el-select
          v-model="selectedTags"
          multiple
          collapse-tags
          clearable
          filterable
          placeholder="Filter by tags"
          @change="onSearch"
          class="w-full"
          :loading="tagsLoading"
          empty-text="No tags"
        >
          <el-option
            v-for="t in allTags"
            :key="t._id"
            :label="t.name"
            :value="t._id"
          />
        </el-select>
      </el-col>
    </el-row>

  
<el-row :gutter="30" class="results-list" style="margin-top:1.5rem;">
  <el-col
    v-for="blog in blogs"
    :key="blog._id"
    :xs="24" :sm="12" :md="8"
  >
    <el-card shadow="hover" class="blog-card">
      
      <img
        v-if="blog.coverImage"
        :src="blog.coverImage"
        class="cover-image"
      />

      
      <h3 class="blog-title" @click="goTo(blog.slug)">
        {{ blog.title }}
      </h3>

    
      <p class="blog-description">
        {{ blog.description }}
      </p>
     
  <div class="tags" style="margin-top: 0.5rem;">
    <el-tag
      v-for="tag in blog.tags"
      :key="tag._id"
      type="info"
      effect="dark"
      size="small"
      style="margin-right: 5px;"
    >
      {{ tag.name }}
    </el-tag>
  </div>
   
     

      
      <div class="author-info" style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
        <span><strong>Author:</strong> {{ blog.userId?.name }} ({{ blog.userId?.username }})</span>
      </div>
    </el-card>
  </el-col>
</el-row>



    <el-pagination
      v-if="totalPages > 1"
      style="text-align:center; margin-top:2rem;"
      :current-page="page"
      :page-size="perPage"
      :total="total"
      layout="prev, pager, next"
      @current-change="onPageChange"
    />
  </div>
</template>

<script setup>
import { ref }         from 'vue';
import { useRouter }   from 'vue-router';
import { Search }      from 'lucide-vue-next';
import { useBlogFilter } from '../composables/useBlogs';
import { useTags }       from '../composables/useTags';

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

const searchQuery   = ref('');
const selectedTags  = ref([]);


const fetchFromBackend = async (q, cb) => {
  if (!q) { cb([]); return; }
  await filterBlogs({ search: q, tags: selectedTags.value, newPage: 1 });
  cb(blogs.value.map(b => ({ value: b.title, slug: b.slug })));
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
filterBlogs({ search:'', tags: [], newPage: 1 });
</script>

<style scoped>
.search-controls { margin-bottom:1rem; }
.cover-image     { width:100%; height:160px; object-fit:cover; border-radius:6px; margin-bottom:.75rem; }
.blog-title      { cursor:pointer; font-size:1.125rem; font-weight:600; margin:.5rem 0; }
.block-image     { max-width:100%; margin:.5rem 0; }
.blog-card       { padding:1rem; }
.results-list    { margin-top:1.5rem; }
</style>
