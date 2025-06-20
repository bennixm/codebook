import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';


import Home from '../views/Home.vue';
import Authentication from '../views/Authentication.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import Blogs from '../views/Blogs.vue';
import NotFound from '../views/404.vue';


import Panel from '../views/panel/Panel.vue';
import Dashboard from '../views/panel/Dashboard.vue';
import CreateBlog from '../views/panel/blog/CreateBlog.vue';
import EditBlog from '../views/panel/blog/EditBlog.vue';
import MyBlogs from '../views/panel/blog/MyBlogs.vue';
import BlogPage from '../views/BlogPage.vue';
import Notifications from '../views/panel/Notifications.vue';


import Profile from '../views/panel/Profile.vue';
import ProfileSettings from '../views/panel/settings/ProfileSettings.vue';
import ChangePassword from '../views/panel/settings/ChangePassword.vue';
import SetPassword from '../views/panel/settings/SetPassword.vue';
import SecuritySettings from '../views/panel/settings/SecuritySettings.vue';
import Performance from '../views/panel/settings/Performance.vue';
import ActivateAccount from '../views/ActivationPage.vue'; 
import ResendActivationPage from '../views/ResendActivationPage.vue';
import UserProfile from '../views/UserProfile.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth', name: 'Authentication', component: Authentication },
  { path: '/reset-password/:token', name: 'ResetPassword', component: ResetPassword },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/blogs', name: 'Blogs', component: Blogs },
  { path: '/blog/:slug', name: 'BlogPage', component: BlogPage,rops: true},
  { path: '/activate/:userId/:token', name: 'ActivateAccount', component: ActivateAccount },
  { path: '/resend-activation', name: 'ResendActivation', component: ResendActivationPage },
  { path: '/user/profile/:username', name: 'UserProfile', component: UserProfile },
  {
    path: '/panel',
    component: Panel,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/panel/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'create-blog',
        name: 'CreateBlog',
        component: CreateBlog,
      },
      {
        path: 'edit-blog/:id',
        name: 'EditBlog',
        component: EditBlog,
      },
      {
        path: 'my-blogs',
        name: 'MyBlogs',
        component: MyBlogs,
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: Notifications,
      },
      {
        path: 'profile',
        component: Profile,
        redirect: '/panel/profile/settings',
        children: [
          {
            path: 'settings',
            name: 'ProfileSettings',
            component: ProfileSettings,
          },
          {
            path: 'change-password',
            name: 'ChangePassword',
            component: ChangePassword,
            meta: { requiresLocal: true }
          },
          {
            path: 'set-password',
            name: 'SetPassword',
            component: SetPassword,
            meta: { requiresGoogle: true }
          },

          {
            path: 'security',
            name: 'SecuritySettings',
            component: SecuritySettings,
          },
          {
            path: 'performance',
            name: 'Performance',
            component: Performance,
          },
        ],
      },
    ],
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuth()

  if (!auth.authReady) {
    await auth.fetchProfile()
  }

  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/auth')
  }

  
  if (to.meta.requiresLocal && auth.user?.provider !== 'local') {
    return next('/panel/dashboard')
  }

  
  if (to.meta.requiresGoogle && auth.user?.provider !== 'google') {
    return next('/panel/dashboard')
  }

  
  if (to.path === '/auth' && auth.isAuthenticated) {
    return next('/')
  }

  
  next()
})

export default router;
