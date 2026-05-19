<template>
  <div class="flex h-screen font-poppins bg-slate-50">
    <main class="flex-1 overflow-y-auto px-10 py-8 *:text-xs">

      <!-- Header -->
      <div class="flex items-end justify-between border-b-2 border-slate-200 pb-5 mb-6">
        <div>
          <span class="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1">
            Administration
          </span>
          <h1 class="text-[2rem] font-bold text-slate-700 leading-tight" style="letter-spacing:-0.035em">
            Manage Users
          </h1>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-sky-700 text-slate-50 font-semibold px-5 py-2.5 rounded-md hover:bg-sky-500 transition-colors"
        >
          ＋ New User
        </button>
      </div>

      <!-- Role counters -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div v-for="stat in roleStats" :key="stat.role"
          class="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex flex-col gap-1">
          <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400">
            {{ ROLE_LABELS[stat.role] }}
          </span>
          <span class="text-2xl font-extrabold leading-none" :class="stat.color">{{ stat.count }}</span>
        </div>
      </div>

      <!-- Users table -->
      <div v-if="loading" class="py-20 text-center text-slate-400">Loading users…</div>
      <div v-else-if="error" class="text-red-600 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded">
        {{ error }}
      </div>
      <div v-else class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full" style="border-collapse:collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Name</th>
              <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Email</th>
              <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Role</th>
              <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Badge #</th>
              <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Status</th>
              <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Joined</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50">
              <td class="px-5 py-3 font-semibold text-slate-700">{{ u.full_name }}</td>
              <td class="px-5 py-3 text-slate-500">{{ u.email }}</td>
              <td class="px-5 py-3">
                <select
                  :value="u.role"
                  @change="changeRole(u, ($event.target as HTMLSelectElement).value)"
                  :disabled="u.id === currentUserId"
                  class="border border-slate-200 bg-white rounded px-2 py-1 text-slate-700 outline-none font-poppins disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option v-for="r in ALL_ROLES" :key="r" :value="r">{{ ROLE_LABELS[r] }}</option>
                </select>
              </td>
              <td class="px-5 py-3 font-mono text-[0.65rem] text-slate-500">{{ u.badge_number || '—' }}</td>
              <td class="px-5 py-3">
                <span
                  class="text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded-sm"
                  :class="u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >{{ u.is_active ? 'Active' : 'Inactive' }}</span>
              </td>
              <td class="px-5 py-3 text-slate-400">{{ formatDate(u.created_at) }}</td>
              <td class="px-5 py-3 text-right">
                <button
                  @click="toggleStatus(u)"
                  :disabled="u.id === currentUserId"
                  class="text-sky-600 hover:underline font-medium disabled:text-slate-300 disabled:no-underline"
                >
                  {{ u.is_active ? 'Deactivate' : 'Reactivate' }}
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="px-5 py-12 text-center text-slate-400">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Create user modal -->
    <Teleport to="body">
      <div v-if="showCreateModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
        @click.self="showCreateModal = false">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-base font-bold text-slate-700">New User</h2>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          <div class="space-y-4">
            <input v-model="newUser.full_name" placeholder="Full name"
              class="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-slate-700 font-poppins" />
            <input v-model="newUser.email" type="email" placeholder="Email"
              class="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-slate-700 font-poppins" />
            <select v-model="newUser.role"
              class="w-full px-3 py-2 border border-slate-200 rounded-md outline-none bg-white font-poppins">
              <option value="">Select role</option>
              <option v-for="r in ALL_ROLES" :key="r" :value="r">{{ ROLE_LABELS[r] }}</option>
            </select>
            <input v-model="newUser.badge_number" placeholder="Badge number (optional)"
              class="w-full px-3 py-2 border border-slate-200 rounded-md outline-none font-poppins" />
            <input v-model="newUser.password" type="password" placeholder="Temporary password"
              class="w-full px-3 py-2 border border-slate-200 rounded-md outline-none font-poppins" />
            <div v-if="createError" class="text-red-600 text-[0.7rem] px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              {{ createError }}
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showCreateModal = false"
              class="px-4 py-2 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">Cancel</button>
            <button @click="createUser" :disabled="creating"
              class="px-5 py-2 font-semibold bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-40">
              {{ creating ? 'Creating…' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '@/services/auth'
import { ROLE_LABELS, type Role } from '@/services/permissions'
import { adminUsersService } from '@/services/adminUsers'

const { user } = useAuth()
const currentUserId = computed(() => user.value?.id)

const ALL_ROLES: Role[] = ['clerk', 'analyst', 'judge', 'admin']

const users         = ref<any[]>([])
const loading       = ref(true)
const error         = ref<string | null>(null)
const showCreateModal = ref(false)
const creating      = ref(false)
const createError   = ref<string | null>(null)
const newUser = reactive({ full_name: '', email: '', role: '', badge_number: '', password: '' })

const roleStats = computed(() => [
  { role: 'clerk',   count: users.value.filter(u => u.role === 'clerk').length,   color: 'text-slate-700' },
  { role: 'analyst', count: users.value.filter(u => u.role === 'analyst').length, color: 'text-sky-600' },
  { role: 'judge',   count: users.value.filter(u => u.role === 'judge').length,   color: 'text-amber-600' },
  { role: 'admin',   count: users.value.filter(u => u.role === 'admin').length,   color: 'text-red-600' },
])

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

async function fetchUsers() {
  try {
    loading.value = true
    users.value = await adminUsersService.getUsers()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

async function changeRole(u: any, newRole: string) {
  if (newRole === u.role) return

  if (!confirm(`Change ${u.email} from ${u.role} to ${newRole}?`)) {
    await fetchUsers()
    return
  }

  try {
    await adminUsersService.updateRole(u.id, newRole)
    await fetchUsers()
  } catch (e: any) {
    alert(e.response?.data?.error || 'Failed to change role')
    await fetchUsers()
  }
}

async function toggleStatus(u: any) {
  try {
    await adminUsersService.updateStatus(u.id, !u.is_active)
    await fetchUsers()
  } catch (e: any) {
    alert(e.response?.data?.error || 'Failed to toggle status')
  }
}

async function createUser() {
  createError.value = null

  try {
    creating.value = true

    await adminUsersService.createUser(newUser)

    showCreateModal.value = false

    Object.assign(newUser, {
      full_name: '',
      email: '',
      role: '',
      badge_number: '',
      password: '',
    })

    await fetchUsers()
  } catch (e: any) {
    createError.value = e.response?.data?.error || 'Failed to create user'
  } finally {
    creating.value = false
  }
}

function formatDate(ts: any) {
  if (!ts) return '—'
  try { return new Date(ts).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

onMounted(fetchUsers)
</script>