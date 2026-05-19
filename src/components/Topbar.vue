<template>
  <header class="h-12 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">

    <div class="flex items-center gap-4">

      <!-- Notification bell -->
      <button
        @click="showNotifications = !showNotifications"
        class="relative p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
        <span
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center leading-none"
          style="font-size:0.5rem; font-weight:700"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Notification dropdown -->
      <div
        v-if="showNotifications"
        class="absolute right-8 top-12 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-900">Notifications</span>
          <button @click="markAllRead" class="text-sky-600 hover:underline font-medium" style="font-size:0.65rem">
            Mark all read
          </button>
        </div>
        <div class="max-h-72 overflow-y-auto divide-y divide-slate-50">
          <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-slate-400" style="font-size:0.72rem">
            No notifications
          </div>
          <div
            v-for="n in notifications" :key="n.id"
            class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
            :class="!n.read ? 'bg-sky-50/40' : ''"
            @click="n.read = true"
          >
            <div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              :class="!n.read ? 'bg-sky-500' : 'bg-transparent'">
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800 leading-snug" style="font-size:0.72rem">{{ n.title }}</p>
              <p class="text-slate-400 truncate mt-0.5" style="font-size:0.65rem">{{ n.body }}</p>
              <p class="text-slate-300 mt-1" style="font-size:0.6rem">{{ n.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-px h-5 bg-slate-200"></div>

      <!-- User pill -->
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
          <span class="text-white font-bold uppercase" style="font-size:0.6rem">{{ initials }}</span>
        </div>
        <div class="flex flex-col leading-none gap-0.5">
          <span class="font-semibold text-slate-800" style="font-size:0.72rem">{{ displayName }}</span>
          <span class="text-slate-400 capitalize" style="font-size:0.62rem">{{ userRole }}</span>
        </div>
      </div>

    </div>
  </header>

  <!-- Backdrop -->
  <div v-if="showNotifications" class="fixed inset-0 z-40" @click="showNotifications = false"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/services/auth'

const { user } = useAuth()
const showNotifications = ref(false)

const displayName = computed(() => {
  if (!user.value) return 'Guest'
  return user.value.email?.split('@')[0] || 'User'
})

const userRole = computed(() => user.value?.role || 'analyst')

const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
)

const notifications = ref([
  { id: 1, title: 'Analysis complete',    body: 'CASE-2025-003 · evidence_final.mp4',                  time: '2 min ago',  read: false },
  { id: 2, title: 'Deepfake detected',    body: 'CASE-2025-001 · video_clip.mp4 flagged at 94.2%',     time: '18 min ago', read: false },
  { id: 3, title: 'New evidence uploaded', body: 'CASE-2025-002 · Added by prosecutor@court.ke',       time: '1 hr ago',   read: true  },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function markAllRead() {
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))
}
</script>