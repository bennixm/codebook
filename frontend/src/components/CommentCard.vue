<template>
  <el-card class="mb-4" shadow="hover">
    <div class="comment">
    <el-avatar class="avatar-comment" :src="comment.userId?.avatar || ''" size="large" />
    <div class="comment-body">
      <div class="comment-header">
        <span>{{ comment.userId?.name || comment.guestName || 'Anonymous' }}<span class="name-comment"></span> <el-divider direction="vertical" /> <span class="date-comment"></span></span>
        <el-button size="small" text @click="toggleReplyForm">Reply</el-button>
      </div>
        <p class="text-gray-700">{{ comment.text }}</p>
    </div>
    </div>

    <div v-if="showReplyForm" class="mt-2 ml-4">
      <el-input
        v-if="!isAuthenticated && !guestName"
        v-model="guestName"
        placeholder="Your name"
        class="mt-2"
      />
      <div v-if="!isAuthenticated && guestName" class="mt-2 text-sm text-gray-600">
        Replying as <strong>{{ guestName }}</strong>
      </div>
      <el-input
        type="textarea"
        v-model="replyText"
        placeholder="Write a reply..."
        rows="2"
      />
      <el-button
        size="small"
        type="primary"
        class="mt-2"
        @click="submitReply"
        :disabled="!replyText.trim() || (!isAuthenticated && !guestName.trim())"
      >
        Submit Reply
      </el-button>
    </div>

            <div class="ml-4 mt-2 border-l-2 pl-4" v-if="comment.children?.length">
            <CommentCard
                v-for="child in comment.children"
                :key="child._id"
                :comment="child"
                :blog-id="blogId"
                :on-reply-submitted="onReplySubmitted"
                :is-authenticated="isAuthenticated"
            />
            </div>
  </el-card>
</template>

<script setup>
import { ref , computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getCookie } from '../composables/getCookie';


const auth = useAuth();

const isAuthenticated = computed(() => auth.authReady && auth.isAuthenticated)


const props = defineProps({
  comment: Object,
  blogId: String,
  isAuthenticated: Boolean,
  onReplySubmitted: Function
});


const replyText = ref('')
const guestName = ref(!isAuthenticated.value ? getCookie('guestName') || '' : '')
const showReplyForm = ref(false)

const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
}

const submitReply = async () => {
  try {
    const payload = {
      text: replyText.value,
      replyid: props.comment._id,
      guestname: !props.isAuthenticated ? guestName.value : undefined
    };

    await auth.addComment(props.blogId, payload);
    
    replyText.value = '';
    guestName.value = '';
    showReplyForm.value = false;

    if (props.onReplySubmitted) {
      props.onReplySubmitted();
    }
  } catch (err) {
    console.error('Error submitting reply:', err);
  }
};


</script>
