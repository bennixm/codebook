import { ref } from 'vue';
import { ElMessage } from 'element-plus';

export const user = ref(null);
export const isAuthenticated = ref(false);
export const authReady = ref(false);

export const blogUrl = window.location.href;

export const shareOnTwitter = () => {
  const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const shareOnFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(blogUrl);
    ElMessage.success('Link copied to clipboard!');
  } catch (err) {
    ElMessage.error('Failed to copy link.');
  }
};