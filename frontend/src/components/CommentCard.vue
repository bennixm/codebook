<template>
  <el-card class="mb-4" shadow="hover">
    <div class="comment">
    <el-avatar class="avatar-comment" :src="comment.userId?.avatar || ''" size="large" />
    <div class="comment-body">
      <div class="comment-header">
        <span class="comment-subheader">{{ comment.userId?.name || comment.guestName || 'Anonymous' }}<span class="name-comment"></span> <span class="date-comment">{{ formattedDate }}</span> 
          <span v-if="comment.replyToName" class="text-blue-600 font-medium mr-1">@{{ comment.replyToName }}</span>
       </span>
        <el-button size="small" text @click="toggleReplyForm"><MessageCircleReply :size="15" style="margin-right:5px;"/> Reply</el-button>
      </div>
      <p class="paragraph-comment text-gray-700">
        {{ comment.text }}
      </p>

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

            <div class="comment-card-sub ml-4 mt-2 pl-4" v-if="comment.children?.length">
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

import { MessageCircleReply} from 'lucide-vue-next';

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const formattedDate = computed(() => {
  return dayjs(props.comment.createdAt).fromNow()
})



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
    const message =
    err?.response?.data?.errors?.[0]?.msg ||
    err?.response?.data?.message ||         
    err?.message ||                          
    'Failed to post comment.'                
      ElMessage.error(message)
  }
};


</script>
