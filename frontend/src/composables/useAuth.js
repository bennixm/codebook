import { ref } from 'vue';
import { useRouter } from 'vue-router';
import secureApi from '../secureApi';

const user = ref(null);
const authReady = ref(false); 

export function useAuth() {
  const router = useRouter();

  const fetchProfile = async () => {
    authReady.value = false;
    try {
      const res = await secureApi.get('/user/profile');
      user.value = res.data;
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      user.value = null;
      router.push('/auth');
    } finally {
      authReady.value = true;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    user.value = null;
    router.push('/auth');
  };

  return {
    user,
    authReady,
    fetchProfile,
    handleLogout,
  };
}
