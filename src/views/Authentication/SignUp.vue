<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md px-8 py-6 bg-white rounded-md shadow-md">
      <div class="text-center">
        <img class="h-12 mx-auto mb-4" :src="logo" alt="Deepfake Detection Logo" />
        <h1 class="text-2xl font-bold text-gray-800">Create Your Account</h1>
        <p class="mt-2 text-sm text-gray-600">
          Register to access the deepfake detection system
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleRegister">
        <div v-if="error" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {{ error }}
        </div>

        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="fullName"
            v-model="form.full_name"
            type="text"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
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
            minlength="8"
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700"
            >Confirm Password</label
          >
          <input
            id="confirmPassword"
            v-model="form.confirm_password"
            type="password"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div v-if="form.role === 'judge'||form.role==='lawyer'|| form.role==='analyst'">
          <label for="badgeNumber" class="block text-sm font-medium text-gray-700"
            >Badge Number</label
          >
          <input
            id="badgeNumber"
            v-model="form.badge_number"
            type="text"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            id="role"
            v-model="form.role"
            required
            class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Select your role</option>
            <option value="judge">Judge</option>
            <option value="lawyer">Lawyer</option>
            <option value="analyst">Forensic Analyst</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <span v-if="!loading">Register</span>
            <span v-else>Registering...</span>
          </button>
        </div>
      </form>

      <div class="mt-4 text-sm text-center text-gray-600">
        Already have an account?
        <router-link to="/login" class="font-medium text-sky-600 hover:text-sky-500">
          Sign in
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
const { register } = useAuth()

const form = reactive({
  email: '',
  password: '',
  confirm_password: '',
  full_name: '',
  role: '',
  badge_number: '',
})

const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (form.password !== form.confirm_password) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    error.value = ''
    const userData = {
      email: form.email,
      password: form.password,
      role: form.role,
      full_name: form.full_name,
      ...(form.role === 'judge' && { badge_number: form.badge_number }),
    }

    await register(userData)
    router.push('/login')
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>