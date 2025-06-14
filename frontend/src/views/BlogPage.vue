<template>
    <div class="blog-page panel-container" v-loading="loading">
      <div v-if="blog">
      <div v-if="blog.coverImage" class="cover-image rounded-xl overflow-hidden" style="width:100%;height:288px;">
        <el-image
          :src="blog.coverImage"
          fit="cover"
          class="w-full h-full object-cover"
          alt="Blog cover image"
          lazy
        />
      </div>
        <div class="blog-container-content max-w-4xl mx-auto space-y-6">
  
        <h1 class="main-title text-3xl font-bold">{{ blog.title }}</h1>
  
        <div class="blog-content text-base leading-relaxed" v-html="blog.content" />

        <el-divider border-style="dotted" />

          <div class="tags">
                <el-tag
                  v-for="tag in blog.tags"
                  :key="tag._id"
                  size="small"
                  type="info"
                  class="mr-2"
                >
                  {{ tag.name }}
                </el-tag>
        </div>

        <el-divider border-style="dotted" />

      <div class="text-gray-500 text-sm flex items-center gap-4 justify-end">
        <span>Published on {{ formatDate(blog.publishedAt || blog.createdAt) }}</span>
      </div>
  
        <div class="mt-10">
          <el-button @click="router.back()" type="primary" plain>← Back</el-button>
        </div>
        </div>
      </div>
  
      <div v-else-if="!loading" class="text-center text-gray-500">
        <el-empty description="Blog not found." />
      </div>
    </div>
  </template>
  
<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { useAuth } from '../composables/useAuth';
    import EditorJSHTML from 'editorjs-html';
    import Prism from 'prismjs';

    const route = useRoute();
    const router = useRouter();
    const auth = useAuth();

    const blog = ref(null);
    const loading = ref(true);

    const parseEditorContent = (editorData) => {
      try {
        const edjsParser = EditorJSHTML();
        const parsed = edjsParser.parse(editorData);
        const htmlBlocks = Object.values(parsed).flat();

        const enhancedHtml = htmlBlocks.map(html => {
          if (html.startsWith('<pre><code')) {
            const codeMatch = html.match(/<code.*?>([\s\S]*?)<\/code>/);
            const rawCode = codeMatch?.[1]
              ?.replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&') || '';

            const highlighted = Prism.highlight(rawCode, Prism.languages.javascript, 'javascript');
            return `<pre class="language-javascript"><code class="language-javascript">${highlighted}</code></pre>`;
          }
          return html;
        });

        return enhancedHtml.join('');
      } catch (error) {
        console.error('❌ Failed to parse Editor.js content:', error);
        return '<p>Error rendering blog content.</p>';
      }
    };

      const fetchBlog = async () => {
        loading.value = true;
        try {
          const slug = route.params.slug;
          const data = await auth.fetchBlogBySlug(slug);

          const isCreator = auth.authReady && auth.isAuthenticated && data.userId._id === auth.user._id;      

          if (!data.isPublished && !isCreator) {
            blog.value = null;
            ElMessage.warning('This blog draft is private.');
            return;
          }

          if (data.content) {
            const raw = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
            data.content = parseEditorContent(raw);
          }

          blog.value = data;
          nextTick(() => Prism.highlightAll());
        } catch (err) {
          console.error(err);
          ElMessage.error('Failed to load the blog.');
        } finally {
          loading.value = false;
        }
      };

    const formatDate = (date) => {
      if (!date) return '—';
      return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    onMounted(() => {
      fetchBlog();
    });
</script>

  
  <style scoped>
.blog-content :deep(p) {
  margin-bottom: 1rem;
}

.blog-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.blog-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}

.blog-content :deep(pre) {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 2rem 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
.blog-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
  font-family: inherit;
}

/* Additional Prism-specific overrides */
.blog-content :deep(.token.comment) { color: #999988; font-style: italic; }
.blog-content :deep(.token.punctuation) { color: #ccc; }
.blog-content :deep(.token.keyword) { color: #cc99cd; }
.blog-content :deep(.token.function) { color: #f08d49; }
.blog-content :deep(.token.string) { color: #7ec699; }

.blog-content :deep(pre) {
  border-left: 4px solid #00a76f;
}

  </style>
  