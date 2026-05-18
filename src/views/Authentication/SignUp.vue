<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-50 font-poppins py-8">
    <div class="w-full max-w-md px-8 py-8 bg-white rounded-md shadow-md">

      <div class="text-center mb-6">
        <img class="h-10 mx-auto mb-4" :src="logo" alt="AIRES Logo" />
        <h1 class="text-xl font-bold text-gray-800">Create your account</h1>
        <p class="mt-1 text-xs text-gray-500">Register to access the deepfake detection system</p>
      </div>

      <div v-if="error" class="mb-4 px-3 py-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
        <svg class="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        {{ error }}
      </div>

      <form class="space-y-4 text-xs" @submit.prevent="handleRegister">
        <div>
          <label class="block font-medium text-gray-700 mb-1">Full Name</label>
          <input
            v-model="form.full_name"
            type="text"
            required
            placeholder="Jane Doe"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Email address</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="you@example.com"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="form.role"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-gray-800 bg-white"
          >
            <option value="">Select your role</option>
            <option value="judge">Judge</option>
            <option value="lawyer">Lawyer</option>
            <option value="analyst">Forensic Analyst</option>
          </select>
        </div>

        <div v-if="requiresBadge" class="animate-[fadeIn_0.2s_ease]">
          <label class="block font-medium text-gray-700 mb-1">Badge Number</label>
          <input
            v-model="form.badge_number"
            type="text"
            required
            placeholder="e.g. KE-2024-0091"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              required
              minlength="8"
              placeholder="Min. 8 characters"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-gray-800 pr-9"
            />
            <button type="button" @click="showPwd = !showPwd" class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600">
              <svg v-if="!showPwd" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
            </button>
          </div>
          <!-- password strength -->
          <div v-if="form.password" class="mt-1.5 flex gap-1">
            <div v-for="n in 4" :key="n" class="h-0.5 flex-1 rounded-full transition-colors" :class="passwordStrength >= n ? strengthColor : 'bg-gray-200'"></div>
          </div>
          <p v-if="form.password" class="mt-1 text-gray-400" style="font-size:0.6rem">{{ strengthLabel }}</p>
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            v-model="form.confirm_password"
            type="password"
            required
            placeholder="Re-enter password"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-gray-800"
            :class="pwMismatch ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''"
          />
          <p v-if="pwMismatch" class="mt-1 text-red-500" style="font-size:0.65rem">Passwords do not match</p>
        </div>

        <button
          type="submit"
          :disabled="loading || pwMismatch"
          class="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
        >
          <svg v-if="loading" class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="mt-5 text-xs text-center text-gray-500">
        Already have an account?
        <router-link to="/login" class="font-medium text-sky-600 hover:text-sky-700">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'
import logo from '@/assets/aires logo.svg'

const router = useRouter()
const { register } = useAuth()

const form = reactive({ email: '', password: '', confirm_password: '', full_name: '', role: '', badge_number: '' })
const error = ref('')
const loading = ref(false)
const showPwd = ref(false)

const requiresBadge = computed(() => ['judge', 'lawyer', 'analyst'].includes(form.role))
const pwMismatch = computed(() => !!form.confirm_password && form.password !== form.confirm_password)

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-400'
  if (passwordStrength.value === 2) return 'bg-amber-400'
  if (passwordStrength.value === 3) return 'bg-yellow-400'
  return 'bg-green-500'
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value] || ''
})

const handleRegister = async () => {
  if (pwMismatch.value) return
  try {
    loading.value = true
    error.value = ''
    await register({
      email: form.email,
      password: form.password,
      role: form.role,
      full_name: form.full_name,
      ...(requiresBadge.value && { badge_number: form.badge_number }),
    })
    router.push('/login')
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>