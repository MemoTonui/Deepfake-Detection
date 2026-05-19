<template>
  <div class="flex h-screen font-poppins bg-slate-50 items-center justify-center">
    <div class="text-center max-w-md px-6">

      <!-- Icon -->
      <div class="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
        <span class="text-red-600 text-3xl font-bold">!</span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-slate-700 mb-2">
        Access Denied
      </h1>

      <p class="text-slate-500 mb-6 text-sm">
        You don’t have permission to access this page.
        Contact an administrator if you believe this is a mistake.
      </p>

      <!-- Role badge -->
      <div class="mb-6">
        <span class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded bg-slate-200 text-slate-600">
          Role: {{ role || 'Unknown' }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <router-link
          to="/dashboard"
          class="px-5 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-600 transition"
        >
          Go to Dashboard
        </router-link>

        <button
          @click="logout"
          class="px-5 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-slate-100"
        >
          Logout
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/services/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, logout: doLogout } = useAuth()

const role = computed(() => user.value?.role)

function logout() {
  doLogout()
  router.push('/login')
}
</script>