import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import * as state from './state.js';
import * as profile from './profile.js';
import * as blog from './blog.js';
import * as comments from './comments.js';
import * as social from './social.js';
import * as authActions from './authActions.js';
import * as utils from './utils.js';
import * as navigation from './navigation.js';

export const useAuth = defineStore('auth', () => {
  const router = useRouter();
  return {
    router,
    ...state,
    ...profile,
    ...blog,
    ...comments,
    ...social,
    ...authActions,
    ...utils,
    ...navigation,
    logout: (shouldRedirect = true) => authActions.logout(shouldRedirect, router),
    changePassword: (data) => authActions.changePassword(data, router),
    setPassword: (data) => authActions.setPassword(data, router),
    seeProfile: (username) => navigation.seeProfile(username, router),
  };
});
