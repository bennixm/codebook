import secureApi from '../secureApi';
import { user, isAuthenticated, authReady } from './state';
import { useRouter } from 'vue-router';

const router = useRouter();

export const logout = async (shouldRedirect = true) => {
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

export const changePassword = async (passwordData) => {
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

export const setPassword = async ({ newPassword, confirmPassword }) => {
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
