<template>
  <header class="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
    <div class="flex items-center">
      <button
        @click="toggleSidebar"
        class="p-1 text-gray-500 rounded-md hover:text-gray-600 hover:bg-gray-100"
      >
        <MenuIcon class="w-6 h-6" />
      </button>
    </div>

    <div class="flex items-center space-x-4">
      <button
        class="p-1 text-gray-500 rounded-md hover:text-gray-600 hover:bg-gray-100"
        @click="toggleDarkMode"
      >
        <MoonIcon v-if="darkMode" class="w-5 h-5" />
        <SunIcon v-else class="w-5 h-5" />
      </button>

      <div class="relative">
        <button
          @click="toggleNotifications"
          class="p-1 text-gray-500 rounded-md hover:text-gray-600 hover:bg-gray-100"
        >
          <BellIcon class="w-5 h-5" />
          <span
            v-if="unreadNotifications"
            class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
          ></span>
        </button>
      </div>

      <div class="relative">
        <button
          @click="toggleUserMenu"
          class="flex items-center space-x-2 focus:outline-none"
        >
          <div class="w-8 h-8 overflow-hidden bg-gray-200 rounded-full">
            <img
              v-if="user?.photoURL"
              :src="user.photoURL"
              alt="User profile"
              class="w-full h-full"
            />
            <div v-else class="flex items-center justify-center w-full h-full text-gray-600">
              {{ userInitials }}
            </div>
          </div>
          <span class="text-sm font-medium text-gray-700">{{ user?.email }}</span>
        </button>

        <div
          v-if="userMenuOpen"
          class="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <router-link
            to="/profile"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Your Profile
          </router-link>
          <router-link
            to="/settings"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </router-link>
          <button
            @click="logout"
            class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/services/auth'
import {
  Bars3Icon as MenuIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/vue/24/outline'

const { user, logout } = useAuth()

const darkMode = ref(false)
const userMenuOpen = ref(false)
const notificationsOpen = ref(false)
const unreadNotifications = ref(3)
const sidebarOpen = ref(true)

const userInitials = computed(() => {
  if (!user.value?.email) return ''
  return user.value.email
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
})

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  // Implement dark mode logic
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  // Emit event to parent to toggle sidebar
}
</script>