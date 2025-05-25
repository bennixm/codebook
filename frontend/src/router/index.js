import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Authentication from '../views/Authentication.vue'
import Blogs from '../views/Blogs.vue'
import Profile from '../views/Profile.vue'
import ProfileSettings from '../views/ProfileSettings.vue'

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
        path: '',
        name: 'ProfileHome',
        component: Profile, 
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: ProfileSettings,
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router
