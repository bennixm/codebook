import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Authentication from '../views/Authentication.vue'
import Blogs from '../views/Blogs.vue'
import Profile from '../views/Profile.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth', name: 'Authentication', component: Authentication },
  { path: '/blogs', name: 'Blogs', component: Blogs },
  { path: '/profile', name: 'Profile', component: Profile , meta: { requiresAuth: true }},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
