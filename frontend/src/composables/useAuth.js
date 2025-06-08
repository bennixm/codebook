import { defineStore } from 'pinia';
import { ref } from 'vue';
import secureApi from '../secureApi';
import { useRouter } from 'vue-router';

export const useAuth = defineStore('auth', () => {
  const router = useRouter();
  const user = ref(null);
  const isAuthenticated = ref(false);
  const authReady = ref(false);
  

  const fetchProfile = async () => {

    if (authReady.value) return;
    
    authReady.value = false;
    try {
      const res = await secureApi.get('/user/profile');
      user.value = res.data;
      isAuthenticated.value = true;
    } catch (err) {
        logout(false);

    } finally {
      authReady.value = true;
    }
  };
  const updateProfile = async (profileData) => {
    try {
      const res = await secureApi.post('/user/update-profile', profileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      throw err; 
    }
  };
  const setBio = async (bioData) => {
        try {
          const res = await secureApi.post('/user/set-bio', bioData);
          user.value.bio = res.data.user.bio;
          
          return { success: true };
        } catch (err) {
          console.error('Set bio error:', err);
          throw err; 
        }
    }
  const changePassword = async (passwordData) => {
        try {
          await secureApi.post('/user/change-password', passwordData);
         
            await logout(true);
         
      
        } catch (err) {
         
      const serverMsg = err.response?.data?.error 
      || err.response?.data?.message 
      || 'Failed to change password'
        throw new Error(serverMsg)
        }
    };

  const logout = async (shouldRedirect = true) => {
        try {
          await secureApi.post('/auth/logout');
        } catch (err) {
          console.error('Logout error:', err);
        }

        user.value = null;
        isAuthenticated.value = false;
        authReady.value = false;

        if (shouldRedirect) {
          router.push('/auth');
        }
    };

  return {
    user,
    isAuthenticated,
    authReady,
    fetchProfile,
    updateProfile,
    changePassword,
    setBio,
    logout,
  };
});
