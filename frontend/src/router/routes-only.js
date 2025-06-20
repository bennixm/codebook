
export const routes = [
    { path: '/', meta: { public: true } },
    { path: '/blogs', meta: { public: true } },
    { path: '/blog/:slug', meta: { public: true } },
    { path: '/user/profile/:username', meta: { public: true } },
    { path: '/activate/:userId/:token', meta: { public: true } },
    { path: '/resend-activation', meta: { public: true } },
  ];
  