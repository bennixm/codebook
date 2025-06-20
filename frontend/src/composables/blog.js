import secureApi from '../secureApi';
import api from '../api';

export const createBlogPost = async (postData) => {
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

 export const editBlogPost = async (postData) => {
    try {

      const res = await secureApi.post('/blog/edit-blog', postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      console.error('Edit blog post server response:', err.response?.data || err.message);
      throw err;
    }
  };

export const deleteMyBlog = async (blogId) => {
  try {
    const res = await secureApi.delete(`/blog/delete/${blogId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

export const fetchMyBlogs = async () => {
  try {
    const res = await secureApi.get('/blog/my-blogs');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch user blogs:', err.response?.data || err.message);
    throw err;
  }
};

export const fetchBlogBySlug = async (slug) => {
  try {
    const response = await api.get(`/blog/get-blog/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog by slug:', error);
    throw error;
  }
};

export const fetchBlogById = async (id) => {
  try {
    const response = await api.get(`/blog/get-blog-by/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all blogs:', error);
    throw error;
  }
};

export const fetchBlogsByUser = async (foreignUser) => {
  try {
    const response = await api.get(`/blog/user-blogs/${foreignUser}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all blogs:', error);
    throw error;
  }
};

export const incrementViews = async (blogId) => {
  try {
    const res = await api.post(`/blog/views/${blogId}`);
    return res.data;
  } catch (err) {
    console.error('Failed to increment views:', err.response?.data || err.message);
    throw err;
  }
};

export const likeBlog = async (blogId) => {
  try {
    const res = await secureApi.post(`/blog/like/${blogId}`);
    return res.data;
  } catch (err) {
    console.error('Failed to like blog:', err.response?.data || err.message);
    throw err;
  }
};

export const unlikeBlog = async (blogId) => {
  try {
    const res = await secureApi.post(`/blog/unlike/${blogId}`);
    return res.data;
  } catch (err) {
    console.error('Failed to unlike blog:', err.response?.data || err.message);
    throw err;
  }
};
