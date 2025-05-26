import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Authentication from '../views/Authentication.vue'
import Blogs from '../views/Blogs.vue'
import Profile from '../views/Profile.vue'
import ProfileSettings from '../views/settings/ProfileSettings.vue'
import ResetPassword from '../views/settings/ResetPassword.vue'
import SecuritySettings from '../views/settings/SecuritySettings.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth', name: 'Authentication', component: Authentication },
  { path: '/blogs', name: 'Blogs', component: Blogs },

  {
      path: '/profile',
      component: Profile,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'settings',
          name: 'ProfileSettings',
          component: ProfileSettings
        },
        {
          path: 'reset-password',
          name: 'ResetPassword',
          component: ResetPassword
        },
        {
          path: 'security',
          name: 'SecuritySettings',
          component: SecuritySettings
        }
      ]
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router
