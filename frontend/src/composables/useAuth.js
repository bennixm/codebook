import { ref } from 'vue';
import { useRouter } from 'vue-router';
import secureApi from '../secureApi';

const user = ref(null);
const authReady = ref(false);
const isAuthenticated = ref(false);

export function useAuth() {
  const router = useRouter();

  const fetchProfile = async () => {
    authReady.value = false;
    try {
      const res = await secureApi.get('/user/profile');
      user.value = res.data;
      isAuthenticated.value = true;
    } catch (err) {
      console.error('Auth error:', err);
      logout();
    } finally {
      authReady.value = true;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    user.value = null;
    isAuthenticated.value = false;
    router.push('/auth');
  };

  return {
    user,
    authReady,
    isAuthenticated,
    fetchProfile,
    logout,
  };
}
