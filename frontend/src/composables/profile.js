import api from '../api';
import { user, isAuthenticated, authReady } from './state';
import { logout } from './authActions';

export const fetchProfile = async () => {
  if (authReady.value) return;

  if (!localStorage.getItem('isLoggedIn')) {
    authReady.value = true;
    logout(false);
    return;
  }

  authReady.value = false;
  try {
    const res = await api.get('/user/profile');
    
    user.value = { ...res.data, _id: res.data._id, id: res.data._id };
   
    isAuthenticated.value = true;
  } catch (err) {
    logout(false);
  } finally {
    authReady.value = true;
  }
};

export const getProfileByUsername = async (username) => {
  if (!username) throw new Error("Username is required");
  try {
    const res = await api.get(`/user/get-profile/${username}`);
    return res.data;
  } catch (err) {
    console.error('Failed getting user profile:', err);
    throw err;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const res = await api.post('/user/update-profile', profileData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchProfile();
    return { success: true };
  } catch (err) {
    console.error('Update profile error:', err);
    throw err;
  }
};

export const setBio = async (bioData) => {
  try {
    const res = await api.post('/user/set-bio', bioData);
    user.value.bio = res.data.user.bio;
    return { success: true };
  } catch (err) {
    console.error('Set bio error:', err);
    throw err;
  }
};
