import { ref } from 'vue';
import { useRouter } from 'vue-router';
import secureApi from '../secureApi';

const user = ref(null);

export function useAuth() {
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await secureApi.get('/user/profile');
      user.value = res.data;
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      router.push('/auth');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return {
    user,
    fetchProfile,
    handleLogout,
  };
}
