export const seeProfile = async (username, router = null) => {
  if (!username) return;
  router.push(`/user/profile/${username}`);
};
