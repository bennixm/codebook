import { useRouter } from 'vue-router';

const router = useRouter();

export const seeProfile = (username) => {
  if (!username) return;
  router.push(`/user/profile/${username}`);
};
