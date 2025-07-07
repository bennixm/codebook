import api from '../api';

export const fetchComments = async (blogId) => {
  try {
    const res = await api.get(`/blog/comments/${blogId}`);
    return res.data.comments;
  } catch (err) {
    console.error('Failed to fetch comments:', err.response?.data || err.message);
    throw err;
  }
};

export const addComment = async (blogId, payload) => {
  try {
    const res = await api.post(`/blog/add-comment/${blogId}`, payload);
    return res.data;
  } catch (err) {
    console.error('Failed to add comment:', err.response?.data || err.message);
    throw err;
  }
};

export const deleteComment = async (commentId, blogId) => {
  try {
    const res = await api.delete(`/blog/delete-comment/${commentId}/blog/${blogId}`);
    return res.data;
  } catch (err) {
    console.error('Failed to delete comment:', err.response?.data || err.message);
    throw err;
  }
};
