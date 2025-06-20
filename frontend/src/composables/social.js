import secureApi from '../secureApi';

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
