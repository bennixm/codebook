<template>
  <el-card class="mb-4" shadow="hover">
    <div class="comment">
    <el-avatar class="avatar-comment" :src="comment.userId?.avatar || defaultAvatar" size="large" />
    <div class="comment-body">
      <div class="comment-header">
        <span class="comment-subheader">{{ comment.userId?.name || guestName }}<span class="name-comment"></span> <span class="date-comment">{{ formattedDate }}</span> 
          <span v-if="comment.replyToName" class="text-green-600 font-medium mr-1"> reply for @{{ comment.replyToName }}</span>
       </span>
       <div class="comment-buttons">
        <div v-if="isAuthenticated && canDelete" class="actions">
          <el-button size="small" type="danger" @click="emitDelete">
            <Trash2 :size="15"/>
          </el-button>
        </div>
        <el-button size="small" text @click="toggleReplyForm"><MessageCircleReply :size="15" style="margin-right:5px;"/> Reply</el-button>
      </div>
      </div>
      <p class="paragraph-comment text-gray-700">
        {{ comment.text }}
      </p>
      <div v-if="comment.replies?.length" class="ml-1 mt-2">
        <el-button size="small" text @click="toggleReplies">
          {{ showReplies ? 'Hide Replies' : `View Replies (${comment.replies.length})` }}
        </el-button>
      </div>
    </div>
    </div>

    <div v-if="showReplyForm" class="mt-2 ml-4">
      <div class="comment-user-header mt-2 flex items-center gap-3" v-if="isAuthenticated">
            <el-avatar
            :src="auth.authReady && isAuthenticated && auth.user.avatar ? auth.user.avatar : defaultAvatar"
              size="small"
            />
            <span class="font-semibold text-gray-700">
              Reply as {{ auth.user.name }}
            </span>
          </div>
          <el-form-item v-else>
            <el-input
              v-model="newComment.guestName"
              placeholder="Your name"
            />
          </el-form-item>
      <el-input
        type="textarea"
        v-model="replyText"
        placeholder="Write a reply..."
        rows="2"
      />
      <el-button
        size="small"
        style="margin-top: 10px;"
        type="primary"
        class="mt-2"
        @click="submitReply"
        :disabled="!replyText.trim() || (!isAuthenticated && !guestName.trim())"
      >
        Submit Reply
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref , computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { getCookie } from '../composables/getCookie';
import { ElMessage } from 'element-plus';
import { MessageCircleReply, Trash2 } from 'lucide-vue-next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ElMessageBox } from 'element-plus';

dayjs.extend(relativeTime)

const props = defineProps({
  comment: Object,
  blogId: String,
  isAuthenticated: Boolean,
  onReplySubmitted: Function,
  canDelete: Boolean,
  showReplies: {
    type: Boolean,
    default: false,
  },
});

const canDelete = computed(() => {
  if (!auth.authReady || !auth.isAuthenticated || !props.comment?.userId?._id) {
    return false;
  }
  return auth.user._id === props.comment.userId._id || auth.user.role === 'admin';
});


const emitDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this comment? This action cannot be undone.',
      'Delete Confirmation',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    await auth.deleteComment(props.comment._id, props.blogId);
    ElMessage.success('Comment deleted successfully');

    if (props.onReplySubmitted) {
      props.onReplySubmitted(); 
    }
  } catch (err) {
    if (err !== 'cancel') {
      const message =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete comment.';
      ElMessage.error(message);
    }
  }
};

const emit = defineEmits(['update:showReplies'])

const toggleReplies = () => {
  emit('update:showReplies', !props.showReplies)
}

const formattedDate = computed(() => {
  return dayjs(props.comment.createdAt).fromNow()
})

const auth = useAuth();

const defaultAvatar = auth.defaultAvatar;

const isAuthenticated = computed(() => auth.authReady && auth.isAuthenticated)

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
      guestName: !props.isAuthenticated ? guestName.value : undefined
    };
    console.log('🕵️‍♂️ submitReply payload:', payload);

    await auth.addComment(props.blogId, payload);

    replyText.value = '';
    guestName.value = '';
    showReplyForm.value = false;

    if (props.onReplySubmitted) {
      props.onReplySubmitted();
    }
    emit('update:showReplies', true);

  } catch (err) {
    const message =
      err?.response?.data?.errors?.[0]?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to post comment.';
    ElMessage.error(message)
  }
};
</script>
