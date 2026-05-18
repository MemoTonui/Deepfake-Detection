// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Public routes (no sidebar/topbar) ──────────────────────────
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

    // ── Authenticated routes (wrapped in AppLayout) ────────────────
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/components/DashboardLayout.vue'),
        },
        {
          path: 'cases',
          name: 'Cases',
          component: () => import('@/views/Cases.vue'),
        },
        {
          path: 'cases/:id',
          name: 'CaseDetail',
          component: () => import('@/views/CaseDetail.vue'),
          props: true,
        },
        {
          path: 'casefiles',
          name: 'CaseFiles',
          component: () => import('@/views/CaseFiles.vue'),
        },
        {
          path: 'casefiles/:id',
          name: 'CaseFileDetail',
          component: () => import('@/views/CaseFileDetail.vue'),
          props: true,
        },
      ],
    },

    // ── Fallback ───────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach((to, _from, next) => {
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