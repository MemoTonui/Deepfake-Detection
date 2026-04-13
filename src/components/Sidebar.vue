<template>
  <div class="flex flex-col w-64 h-full bg-white border-r border-gray-200">
    <div class="flex items-center justify-center h-16 border-b border-gray-200">
      <img class="h-8" :src="logo" alt="Deepfake Detection Logo" />
    </div>

    <div class="flex flex-col flex-grow p-4 overflow-y-auto">
      <nav class="flex-1 space-y-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          active-class="bg-sky-50 text-sky-600"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="mt-auto">
        <button
          @click="handleLogout"
          class="flex items-center w-full px-3 py-2 mt-4 text-sm font-medium text-left text-gray-700 rounded-md hover:bg-gray-100"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'
import {
  HomeIcon as DashboardIcon,
  FolderIcon as CasesIcon,
  DocumentMagnifyingGlassIcon as EvidenceIcon,
  ChartBarIcon as ReportsIcon,
  Cog6ToothIcon as SettingsIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import logo from '@/assets/aires logo.svg'

const router = useRouter()
const { logout } = useAuth()

const navigation = ref([
  { name: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
  { name: 'Cases', to: '/cases', icon: CasesIcon },
  { name: 'Evidence Files', to: '/casefiles', icon: EvidenceIcon },
  { name: 'Reports', to: '/reports', icon: ReportsIcon },
  { name: 'Settings', to: '/settings', icon: SettingsIcon },
])

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>
