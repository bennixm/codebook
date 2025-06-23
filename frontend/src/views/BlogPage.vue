<template>
  <div v-if="blog" class="blog-page" v-loading="loading">
    <div class="blog-primary">
      <div class="mx-auto space-y-6">

        <el-page-header :icon="ArrowLeft" @back="router.back()" class="page-header-blog">
          <template #content>
            <router-link :to="`/blogs/`" class="page-header-slug text-large font-600 ml-2 text-primary hover:underline" :aria-label="blog?.categories?.[0]?.name || 'Blog category'">
              {{ blog.categories[0].name }}
            </router-link>
            <el-divider direction="vertical" />
            <router-link :to="`/blog/${blog.slug}`"
              class="page-header-slug text-large font-600 ml-2 text-primary hover:underline" :aria-label="`Go to blog ${blog.slug || 'post'}`">
              {{ blog.slug }}
            </router-link>
          </template>
        </el-page-header>


        <h1 class="main-title text-3xl font-bold">{{ blog.title }}</h1>
        <span class="main-desc text-2xl">{{ blog.description }}</span>

        <el-divider />

        <div class="profile-section-blog-heading text-gray-500 text-sm flex items-center gap-4 justify-between">
          <div class="flex items-center gap-2">
            <el-avatar :src="blog.userId.avatar || auth.defaultAvatar" size="small"   :title="`Avatar of ${blog.userId.name}`"   referrerpolicy="no-referrer"
            crossorigin="anonymous"  :alt="`Avatar of ${blog.userId.name}`" />
            <span class="cursor-pointer" @click="auth.seeProfile(blog.userId.username)">by <strong>{{ blog.userId.name
            }} on {{
                  auth.formatDate(blog.publishedAt || blog.createdAt) }}</strong> <span v-if="blog.updatedAt"> <el-divider
                  direction="vertical" /> updated on {{
                    auth.formatDate(blog.updatedAt) }}</span></span>
          </div>
          <div class="flex items-center gap-2">
            <el-button circle @click="auth.shareOnTwitter" aria-label="Share on Twitter">
              <Twitter :size="15" />
            </el-button>
            <el-button circle @click="auth.shareOnFacebook" aria-label="Share on Facebook">
              <Facebook :size="15" />
            </el-button>
            <el-button circle @click="auth.copyLink" aria-label="Copy link to clipboard">
              <Share2 :size="15" />
            </el-button>
            <el-button circle :type="isBookmarked(blog.slug) ? 'success' : 'default'" aria-label="Bookmark" @click="handleToggleBookmark">
              <Bookmark :size="15" />
            </el-button>
          </div>
        </div>

        <div v-if="blog.coverImage" class="cover-image rounded-xl overflow-hidden" style="width:100%;height:70vh;">
          <el-image :src="blog.coverImage" fit="cover" class="w-full h-full object-cover"  referrerpolicy="no-referrer"
          crossorigin="anonymous" :alt="`Cover image for blog post: ${blog.title}`" lazy />
        </div>

        <div class="blog-content text-base leading-relaxed" v-html="blog.content" />

        <el-divider>
          Tags
        </el-divider>

        <div class="tags">
          <el-tag v-for="tag in blog.tags" :key="tag._id" size="small" type="info" class="mr-2">
            {{ tag.name }}
          </el-tag>
        </div>

        <el-divider />

        <div class="interaction-section flex justify-between">
          <div class="stats">
            <span class="views">{{ blog.totalViews || blog.views.length }}
              <Eye :size="20" style="margin-left: 10px;" />
            </span>
            <span class="likes">
              {{ blog.likesCount }}
              <ThumbsUp :size="20" style="margin-left: 10px;" />
            </span>
          </div>
          <div class="stats">
            <el-button v-if="!userLiked && isAuthenticated" @click="likePost">
              <ThumbsUp :size="15" style="margin-right: 3px;" />
              Like
            </el-button>
            <el-button v-if="userLiked && isAuthenticated" @click="dislikePost" type="primary" plain>
              <ThumbsDown :size="15" style="margin-right: 3px;" />
              Unlike
            </el-button>
            <el-button v-if="isAuthenticated && authorId === auth.user?._id" @click="editBlog(blog._id)" type="default" plain>
              <Edit :size="15" style="margin-right: 3px;" />
              Edit
            </el-button>
          </div>
        </div>

        <div class="comments-section mt-6">
          <el-form @submit.prevent class="mt-4" :model="newComment">
            <div class="comment-user-header mt-2 flex items-center gap-3" v-if="isAuthenticated">
              <el-avatar
                :src="auth.authReady && isAuthenticated && auth.user.avatar ? auth.user.avatar : auth.defaultAvatar"
                :alt="auth.user?.name ? `Avatar of ${auth.user.name}` : 'Default user avatar'"
                 :title="auth.user?.name ? `Avatar of ${auth.user.name}` : 'Default user avatar'"
                  referrerpolicy="no-referrer"
                  crossorigin="anonymous"
                size="small" />
              <span class="font-semibold text-gray-700">
                Comment as {{ auth.user.name }}
              </span>
            </div>
            <el-form-item v-else>
              <el-input v-model="newComment.guestName" placeholder="Your name" />
            </el-form-item>

            <el-form-item>
              <el-input type="textarea" v-model="newComment.text" placeholder="Write a comment..." :rows="3" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary"
                :disabled="!newComment.text.trim() || (!isAuthenticated && !newComment.guestName?.trim())"
                @click="submitComment">
                Submit
              </el-button>
            </el-form-item>
          </el-form>

          <h2 class="text-lg font-semibold mb-4">Comments ({{ flatStructuredComments.length }})</h2>
          <el-empty v-if="!comments.length" description="No comments yet." />
          <div v-for="comment in paginatedRootComments" :key="comment._id" class="root-comment">
            <CommentCard :comment="comment" :blog-id="blog._id" :is-authenticated="isAuthenticated"
              :user-name="comment.userName" :username="comment.username" :authorId="authorId"
              :on-reply-submitted="handleReplySubmitted" :show-replies="shownRepliesMap[comment._id] || false"
              @update:showReplies="val => shownRepliesMap[comment._id] = val" :newComment="newComment" />
            <div v-if="shownRepliesMap[comment._id] && comment.replies?.length" class="replies ml-6 mt-2">
              <CommentCard v-for="reply in comment.replies" :key="reply._id" :comment="reply" :blog-id="blog._id"
                :authorId="authorId" :user-name="reply.userName" :is-authenticated="isAuthenticated"
                :on-reply-submitted="handleReplySubmitted" :newComment="newComment" />
            </div>
          </div>
          <div class="flex justify-center mt-6">
            <el-pagination v-if="totalPages > 1" class="mt-6" background layout="prev, pager, next"
              :current-page="currentPage" :page-size="COMMENTS_PER_PAGE" :total="flatStructuredComments.length"
              :savedGuestName="savedGuestName" @current-change="val => currentPage = val" />
          </div>
        </div>
      </div>
    </div>
    <div class="blog-secondary">
      <div class="sticky top-6">
        <MiniProfileCard :key="blog.slug" :userData="blog?.userId" :authorId="authorId" />
        <UserBlogsSlider :key="blog.slug" :userData="blog?.userId" :currentBlogId="blog?._id" />
      </div>
    </div>

  </div>
  <div v-else-if="!loading" class="text-center text-gray-500">
    <el-empty description="Blog not found." />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watchEffect, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import EditorJSHTML from 'editorjs-html';
import Prism from 'prismjs';
import { Share2, Twitter, Facebook, ArrowLeft, ThumbsDown, ThumbsUp, Eye, Bookmark, Edit, Trash } from 'lucide-vue-next';
import CommentCard from '../components/blog/CommentCard.vue';
import MiniProfileCard from '../components/blog/MiniProfileCard.vue'
import UserBlogsSlider from '../components/blog/UserBlogsSlider.vue'
import { getCookie } from '../composables/getCookie';
import { useAuth } from '../composables/useAuth';
import { useBookmarks } from '../composables/useBookmarks';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const blog = ref(null);
const loading = ref(true);
const comments = ref([]);
const shownRepliesMap = ref({});
const newComment = ref({ text: '', guestName: '' })
const savedGuestName = ref(getCookie('guestName') || '');
const isAuthenticated = computed(() => auth.authReady && auth.isAuthenticated)
const authorId = ref('');
const userLiked = ref(false);
const currentPage = ref(1);
const COMMENTS_PER_PAGE = 5;
const { isBookmarked, toggleBookmark } = useBookmarks();

watchEffect(() => {
  if (auth.isAuthenticated && blog.value) {
    userLiked.value = blog.value.likes?.includes(auth.user._id);
  }
});

const handleToggleBookmark = () => {
  toggleBookmark(blog.value.slug);
};

const editBlog = (id) => {
  router.push(`/panel/edit-blog/${id}`);
};

const likePost = async () => {
  try {
    const likedata = await auth.likeBlog(blog.value._id);
    blog.value.likesCount = likedata.likesCount;
    blog.value.likers = likedata.likers;
    userLiked.value = true;
  } catch (err) {
    ElMessage.error('Failed to like the post.');
  }
};
const dislikePost = async () => {
  try {
    const likedata = await auth.unlikeBlog(blog.value._id);
    blog.value.likesCount = likedata.likesCount;
    blog.value.likers = likedata.likers;
    userLiked.value = false;
  } catch (err) {
    ElMessage.error('Failed to dislike the post.');
  }
};

const paginatedRootComments = computed(() => {
  const start = (currentPage.value - 1) * COMMENTS_PER_PAGE;
  const end = start + COMMENTS_PER_PAGE;
  return flatStructuredComments.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(flatStructuredComments.value.length / COMMENTS_PER_PAGE)
);

const handleReplySubmitted = async () => {
  const refreshed = await auth.fetchComments(blog.value._id)
  comments.value = refreshed
}

const flatStructuredComments = computed(() => {
  const commentMap = {};
  const rootComments = [];

  comments.value.forEach(comment => {
    const userName = comment.userId?.name || comment.guestId?.guestName || 'Anonymous';
    const username = comment.userId?.username || null;

    commentMap[comment._id] = {
      ...comment,
      userName,
      username,
      replies: []
    };
  });

  comments.value.forEach(comment => {
    const { userName, username } = commentMap[comment._id];

    if (!comment.replyid || !commentMap[comment.replyid]) {
      rootComments.push(commentMap[comment._id]);
    } else {
      let parent = commentMap[comment.replyid];
      while (parent.replyid && commentMap[parent.replyid]) {
        parent = commentMap[parent.replyid];
      }

      const immediateParent = commentMap[comment.replyid];
      const showMention = immediateParent._id !== parent._id;

      commentMap[parent._id].replies.push({
        ...comment,
        userName,
        username,
        replyToName: showMention ? immediateParent.userName : null,
        replyToUsername: showMention ? immediateParent.username : null,
      });
    }
  });

  return rootComments;
});


const submitComment = async () => {
  if (!newComment.value.text.trim()) return;

  const payload = { text: newComment.value.text.trim() }
  if (!isAuthenticated.value) payload.guestName = newComment.value.guestName.trim()

  try {
    await auth.addComment(blog.value._id, payload)
    const refreshedComments = await auth.fetchComments(blog.value._id)
    comments.value = [...refreshedComments];
    newComment.value.text = ''
  } catch (err) {

    const message =
      err?.response?.data?.errors?.[0]?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to post comment.'
    ElMessage.error(message)

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

    authorId.value = data.userId._id;

    blog.value = data;

    const commentData = await auth.fetchComments(blog.value._id);
    comments.value = commentData;

    const viewsdata = await auth.incrementViews(blog.value._id);
    blog.value.views = viewsdata.viewers;
    blog.value.totalViews = viewsdata.totalViews;
    blog.value.likesCount = blog.value.likes.length;

    nextTick(() => Prism.highlightAll());

  } catch (err) {
    console.error(err);
    ElMessage.error('Failed to load the blog.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const savedGuestName = getCookie('guestName');
  if (savedGuestName && !isAuthenticated.value) {
    newComment.value.guestName = savedGuestName;
  }
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

watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      loading.value = true;
      await fetchBlog();
      loading.value = false;
      if (!blog.value && isBookmarked(newSlug)) {
        ElMessage.warning('This bookmarked blog was deleted or is no longer available.');
      }
    }
  },
  { immediate: true }
);


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

.blog-content :deep(.token.comment) {
  color: #999988;
  font-style: italic;
}

.blog-content :deep(.token.punctuation) {
  color: #ccc;
}

.blog-content :deep(.token.keyword) {
  color: #cc99cd;
}

.blog-content :deep(.token.function) {
  color: #f08d49;
}

.blog-content :deep(.token.string) {
  color: #7ec699;
}

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
