<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md px-8 py-6 bg-white rounded-md shadow-md">
      <div class="text-center">
        <img class="h-12 mx-auto mb-4" :src="logo" alt="Deepfake Detection Logo" />
        <h1 class="text-2xl font-bold text-gray-800">Sign in to your account</h1>
        <p class="mt-2 text-sm text-gray-600">
          Authenticate to access the deepfake detection system
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
        <div v-if="error" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {{ error }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.remember"
              type="checkbox"
              class="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label for="remember-me" class="block ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <router-link
              to="/forgot-password"
              class="font-medium text-sky-600 hover:text-sky-500"
            >
              Forgot your password?
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <span v-if="!loading">Sign in</span>
            <span v-else>Signing in...</span>
          </button>
        </div>
      </form>

      <div class="mt-4 text-sm text-center text-gray-600">
        Don't have an account?
        <router-link to="/register" class="font-medium text-sky-600 hover:text-sky-500">
          Register
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'
import logo from '@/assets/aires logo.svg'

const router = useRouter()
const { login } = useAuth()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const loggedInUser = await login(form.email, form.password)

    // Now router works here because we’re inside <script setup>
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

</script>