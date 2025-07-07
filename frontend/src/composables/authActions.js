import api from '../api';
import { user, isAuthenticated, authReady } from './state';
import { useRouter } from 'vue-router';

const router = useRouter();

export const logout = async (shouldRedirect = true, router = null) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  }

  localStorage.removeItem('isLoggedIn');
  user.value = null;
  isAuthenticated.value = false;
  authReady.value = false;

  if (shouldRedirect && router) {
    router.push('/auth');
  }
};

export const changePassword = async (passwordData, router = null) => {
  try {
    await api.post('/user/change-password', passwordData);
    setTimeout(() => {
      logout(true, router);
    }, 1200);
  } catch (err) {
    const serverMsg = err.response?.data?.error
      || err.response?.data?.message
      || 'Failed to change password';
    throw new Error(serverMsg);
  }
};

export const setPassword = async ({ newPassword, confirmPassword }, router = null) => {
  try {
    await api.post('/user/set-password', { newPassword, confirmPassword });
    setTimeout(() => {
      logout(true, router);
    }, 1200);
  } catch (err) {
    const serverMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      'Failed to set password';
    throw new Error(serverMsg);
  }
};