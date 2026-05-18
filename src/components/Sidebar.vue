<template>
  <div class="flex flex-col w-60 h-full bg-slate-900 shrink-0">

    <!-- Logo -->
    <div class="flex items-center justify-center h-16 border-b border-slate-800 px-5">
      <img class="h-7" :src="logo" alt="AIRES Logo" />
    </div>

    <!-- Nav -->
    <div class="flex flex-col flex-grow px-3 py-4 overflow-y-auto">
      <nav class="flex-1 space-y-0.5">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          active-class="bg-slate-800 text-white"
          class="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-slate-100 transition-colors group"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0 transition-colors" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- Sign out -->
      <div class="mt-auto pt-3 border-t border-slate-800">
        <button
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-medium text-left text-slate-400 rounded-md hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const navigation = [
  { name: 'Dashboard',      to: '/dashboard', icon: DashboardIcon },
  { name: 'Cases',          to: '/cases',     icon: CasesIcon     },
  { name: 'Evidence Files', to: '/casefiles', icon: EvidenceIcon  },
  { name: 'Reports',        to: '/reports',   icon: ReportsIcon   },
  { name: 'Settings',       to: '/settings',  icon: SettingsIcon  },
]

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>