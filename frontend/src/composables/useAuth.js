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
  };
});
