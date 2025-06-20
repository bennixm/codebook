import secureApi from '../secureApi';
import api from '../api';

export const follow = async (userId) => {
  try {
    const res = await secureApi.post(`/user/follow/${userId}`);
    return res.data;
  } catch (err) {
    console.error('❌ Follow error:', err);
    throw err;
  }
};

export const unfollow = async (userId) => {
  try {
    const res = await secureApi.post(`/user/unfollow/${userId}`);
    return res.data;
  } catch (err) {
    console.error('❌ Follow error:', err);
    throw err;
  }
};

export const getFollowers = async (id) => {
  try {
    const res = await api.get(`/user/followers/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ Follow error:', err);
    throw err;
  }
};