import { defineStore } from 'pinia';
import { ref } from 'vue';
import secureApi from '../secureApi';
import api from '../api';
import { useRouter } from 'vue-router';

export const useAuth = defineStore('auth', () => {
  const router = useRouter();
  const user = ref(null);
  const isAuthenticated = ref(false);
  const authReady = ref(false);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f';


  const fetchProfile = async () => {

    if (authReady.value) return;

    if (!localStorage.getItem('isLoggedIn')) {
      authReady.value = true;
      logout(false);
      return;
    }

    authReady.value = false;
    try {
      const res = await secureApi.get('/user/profile');
      user.value = {
        ...res.data,
        _id: res.data._id,
        id: res.data._id
      };
      isAuthenticated.value = true;
    } catch (err) {
      logout(false);

    } finally {
      authReady.value = true;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await secureApi.post('/user/update-profile', profileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  const setBio = async (bioData) => {
    try {
      const res = await secureApi.post('/user/set-bio', bioData);
      user.value.bio = res.data.user.bio;

      return { success: true };
    } catch (err) {
      console.error('Set bio error:', err);
      throw err;
    }
  };

const changePassword = async (passwordData) => {
  try {
    await secureApi.post('/user/change-password', passwordData);
    setTimeout(() => {
      logout(true);
    }, 1200);
  } catch (err) {
    const serverMsg = err.response?.data?.error
      || err.response?.data?.message
      || 'Failed to change password';
    throw new Error(serverMsg);
  }
};

const setPassword = async ({ newPassword, confirmPassword }) => {
  try {
    await secureApi.post('/user/set-password', { newPassword, confirmPassword });
    setTimeout(() => {
      logout(true);
    }, 1200);
  } catch (err) {
    const serverMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      'Failed to set password';
    throw new Error(serverMsg);
  }
};

  const createBlogPost = async (postData) => {
    try {
      const res = await secureApi.post('/blog/create', postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      console.error('Create blog post server response:', err.response?.data || err.message);
      throw err;
    }
  };


  const deleteMyBlog = async (blogId) => {
    try {
      const res = await secureApi.delete(`/blog/delete/${blogId}`);
      return res.data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  };

  const fetchMyBlogs = async () => {
    try {
      const res = await secureApi.get('/blog/my-blogs');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user blogs:', err.response?.data || err.message);
      throw err;
    }
  };

  const fetchBlogBySlug = async (slug) => {
    try {
      const response = await api.get(`/blog/get-blog/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blog by slug:', error);
      throw error;
    }
  };
  const fetchBlogById = async (id) => {
    try {
      const response = await api.get(`/blog/get-blog-by/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all blogs:', error);
      throw error;
    }
  };
  const fetchBlogsByUser = async (foreignUser) => {
    try {
      const response = await api.get(`/blog/user-blogs/${foreignUser}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all blogs:', error);
      throw error;
    }
  };

  const fetchComments = async (blogId) => {
    try {
      const res = await api.get(`/blog/comments/${blogId}`);
      return res.data.comments;
    } catch (err) {
      console.error('Failed to fetch comments:', err.response?.data || err.message);
      throw err;
    }
  };

  const addComment = async (blogId, payload) => {
    try {
      const res = await secureApi.post(`/blog/add-comment/${blogId}`, payload);
      return res.data;
    } catch (err) {
      console.error('Failed to add comment:', err.response?.data || err.message);
      throw err;
    }
  };

  const deleteComment = async (commentId, blogId) => {
    try {
      const res = await secureApi.delete(`/blog/delete-comment/${commentId}/blog/${blogId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to delete comment:', err.response?.data || err.message);
      throw err;
    }
  };

  const incrementViews = async (blogId) => {
    try {
      const res = await api.post(`/blog/views/${blogId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to increment views:', err.response?.data || err.message);
    }
  };

  const likeBlog = async (blogId) => {
    try {
      const res = await secureApi.post(`/blog/like/${blogId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to like blog:', err.response?.data || err.message);
      throw err;
    }
  };

  const unlikeBlog = async (blogId) => {
    try {
      const res = await secureApi.post(`/blog/unlike/${blogId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to unlike blog:', err.response?.data || err.message);
      throw err;
    }
  };

  const follow = async (userId) => {
    try {
      const res = await secureApi.post(`/user/follow/${userId}`);
      return res.data;
    } catch (err) {
      console.error('❌ Follow error:', err)
      throw err;
    }
  };

  const unfollow = async (userId) => {
    try {
      const res = await secureApi.post(`/user/unfollow/${userId}`);
      return res.data;
    } catch (err) {
      console.error('❌ Follow error:', err)
      throw err;
    }
  };


  const logout = async (shouldRedirect = true) => {
    try {
      await secureApi.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('isLoggedIn');
    user.value = null;
    isAuthenticated.value = false;
    authReady.value = false;

    if (shouldRedirect) {
      router.push('/auth');
    }
  };

  return {
    user,
    follow,
    unfollow,
    formatDate,
    defaultAvatar,
    isAuthenticated,
    authReady,
    fetchProfile,
    updateProfile,
    changePassword,
    createBlogPost,
    deleteMyBlog,
    fetchMyBlogs,
    fetchBlogsByUser,
    fetchBlogById,
    fetchBlogBySlug,
    fetchComments,
    addComment,
    deleteComment,
    incrementViews,
    likeBlog,
    unlikeBlog,
    setPassword,
    setBio,
    logout,

  };
});
