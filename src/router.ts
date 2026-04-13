// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Authentication/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Authentication/SignUp.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/components/DashboardLayout.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cases',
      name: 'Cases',
      component: () => import('@/views/Cases.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cases/:id',
      name: 'CaseDetail',
      component: () => import('@/views/CaseDetail.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/casefiles',
      name: 'CaseFiles',
      component: () => import('@/views/CaseFiles.vue'),
      meta: { requiresAuth: true },
    },
    { 
      path: '/casefiles/:id',
      name: 'CaseFileDetail',
      component: () => import('@/views/CaseFileDetail.vue'),
      meta: { requiresAuth: true }, 
      props: true
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const { user } = useAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !user.value) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && user.value) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router