<template>
    <div v-if="blog" class="blog-page" v-loading="loading">
      <div class="blog-primary">
      <div class="mx-auto space-y-6">

      <el-page-header :icon="ArrowLeft" @back="router.back()" class="page-header-blog">
        <template #content>
         <router-link :to="`/blog/${blog.slug}`" class="page-header-slug text-large font-600 mr-3 text-primary hover:underline">
        {{ blog.slug }}
         </router-link>
        </template>
      </el-page-header>
  
      <h1 class="main-title text-3xl font-bold">{{ blog.title }}</h1>
      <span class="main-desc text-2xl">{{ blog.description }}</span>
    
       <el-divider />

       <div class="profile-section-blog-heading text-gray-500 text-sm flex items-center gap-4 justify-between">
        <div class="flex items-center gap-2">
          <el-avatar :src="blog.userId.avatar || ''" size="small" />
          <span>by <strong>{{ blog.userId.name }} on {{ formatDate(blog.publishedAt || blog.createdAt) }}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <el-button circle @click="shareOnTwitter"><Twitter :size="15" /></el-button>
          <el-button circle @click="shareOnFacebook"><Facebook :size="15" /></el-button>
          <el-button circle @click="copyLink"><Share2 :size="15" /></el-button>
        </div>
       </div>

      <div v-if="blog.coverImage" class="cover-image rounded-xl overflow-hidden" style="width:100%;height:70vh;">
        <el-image
          :src="blog.coverImage"
          fit="cover"
          class="w-full h-full object-cover"
          alt="Blog cover image"
          lazy
        />
      </div>
  
        <div class="blog-content text-base leading-relaxed" v-html="blog.content" />

        <el-divider />

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

      <el-divider />

      <div class="comments-section mt-6">
        <h2 class="text-lg font-semibold mb-4">Comments</h2>

        <el-empty v-if="!comments.length" description="No comments yet." />
          <CommentCard
            v-for="comment in structuredComments"
            :key="comment._id"
            :comment="comment"
            :blog-id="blog._id"
            :on-reply-submitted="handleReplySubmitted"
            :is-authenticated="isAuthenticated.value"
          />

          <el-form @submit.prevent class="mt-4" :model="newComment">
            <el-form-item>
              <el-input
                type="textarea"
                v-model="newComment.text"
                placeholder="Write a comment..."
                :rows="3"
              />
            </el-form-item>
            <el-form-item v-if="!isAuthenticated">
              <el-input
                v-model="newComment.guestName"
                placeholder="Your name"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                :disabled="!newComment.text.trim() || (!isAuthenticated.value && !newComment.guestName?.trim())" 
                @click="submitComment"
              >
                Submit
              </el-button>
            </el-form-item>
          </el-form>
      </div>
     </div>
    </div>
    <div class="blog-secondary">

    </div>

    </div>
      <div v-else-if="!loading" class="text-center text-gray-500">
        <el-empty description="Blog not found." />
      </div>
  </template>
  
<script setup>
    import { ref, onMounted, nextTick, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus';
    import { useAuth } from '../composables/useAuth';
    import EditorJSHTML from 'editorjs-html';
    import Prism from 'prismjs';
    import CommentCard from '../components/CommentCard.vue';
    

    import { Share2, Twitter, Facebook, ArrowLeft} from 'lucide-vue-next';

    const route = useRoute();
    const router = useRouter();
    const auth = useAuth();

    const blog = ref(null);

    const loading = ref(true);

    const blogUrl = window.location.href; 

    const shareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const copyLink = async () => {
        try {
          await navigator.clipboard.writeText(blogUrl);
          ElMessage.success('Link copied to clipboard!');
        } catch (err) {
          ElMessage.error('Failed to copy link.');
        }
    };


    const likes = ref(0);
    const comments = ref([]);

    const newComment = ref({ text: '', guestName: '' })

    const isAuthenticated = computed(() => auth.authReady && auth.isAuthenticated)

    const handleReplySubmitted = async () => {
      const refreshed = await auth.fetchComments(blog.value._id)
      comments.value = refreshed
    }

    const structuredComments = computed(() => {
        const commentMap = {};
        const roots = [];

        comments.value.forEach(comment => {
          comment.children = [];
          commentMap[comment._id] = comment;
        });

        comments.value.forEach(comment => {
          if (comment.replyid && commentMap[comment.replyid]) {
            commentMap[comment.replyid].children.push(comment);
          } else {
            roots.push(comment);
          }
        });
        console.log(roots);

        return roots;
      });

      const submitComment = async () => {
        if (!newComment.value.text.trim()) return;

        const payload = { text: newComment.value.text.trim() }
        if (!isAuthenticated.value) payload.guestName = newComment.value.guestName.trim()

        try {
          await auth.addComment(blog.value._id, payload)
          const refreshedComments = await auth.fetchComments(blog.value._id)
          comments.value = refreshedComments
          newComment.value.text = ''
          newComment.value.guestName = ''
        } catch (err) {
          ElMessage.error('Failed to post comment.')
        }
      };

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

          return `
            <div class="code-block-wrapper relative">
              <button class="copy-button absolute top-2 right-2 text-xs px-2 py-1 bg-gray-700 text-white rounded z-10">Copy</button>
              <pre class="language-javascript"><code class="language-javascript">${highlighted}</code></pre>
            </div>`;
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
          const commentData = await auth.fetchComments(blog.value._id);
          comments.value = commentData;

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
  fetchBlog().then(() => {
    nextTick(() => {
      Prism.highlightAll();

      document.querySelectorAll('.blog-content pre').forEach((block) => {
        if (block.parentElement?.classList.contains('code-block-wrapper')) return;

        const btn = document.createElement('button');
        btn.className = 'copy-button';
        btn.innerText = 'Copy';

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        block.parentNode.insertBefore(wrapper, block);
        wrapper.appendChild(block);
        wrapper.appendChild(btn);

        btn.addEventListener('click', () => {
          const code = block.textContent || '';
          navigator.clipboard.writeText(code).then(() => {
            btn.innerText = 'Copied!';
            setTimeout(() => (btn.innerText = 'Copy'), 1500);
          });
        });
      });
    });
  });
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
.blog-content :deep(.token.comment) { color: #999988; font-style: italic; }
.blog-content :deep(.token.punctuation) { color: #ccc; }
.blog-content :deep(.token.keyword) { color: #cc99cd; }
.blog-content :deep(.token.function) { color: #f08d49; }
.blog-content :deep(.token.string) { color: #7ec699; }

.blog-content :deep(pre) {
  border-left: 4px solid #00a76f;
}
.blog-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 2rem 0;
}

.blog-content :deep(.code-block-wrapper pre) {
  margin: 0 !important;
}

.blog-content :deep(.copy-button) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: #4b5563;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  z-index: 10;
  transition: opacity 0.2s ease-in-out;
}

.blog-content :deep(.copy-button:hover) {
  opacity: 1;
}
.comments-section {
  padding-bottom: 2rem;
}
  </style>
  