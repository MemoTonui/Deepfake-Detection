<template>
  <div class="flex h-screen font-poppins bg-slate-50">

    <main class="flex-1 overflow-y-auto px-10 py-8 *:text-xs">

      <!-- ── Header ─────────────────────────────────────────────────────────── -->
      <div class="flex items-end justify-between border-b-2 border-slate-200 pb-5 mb-6">
        <div>
          <span class="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1">
            Forensic Management System
          </span>
          <h1 class="text-[2rem] font-bold text-slate-700 leading-tight" style="letter-spacing:-0.035em">Cases</h1>
        </div>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-1.5 bg-sky-700 text-slate-50 font-semibold px-5 py-2.5 rounded-md hover:bg-sky-500 transition-colors"
        >
          ＋ New Case
        </button>
      </div>

      <!-- ── Stat counters ───────────────────────────────────────────────────── -->
      <div v-if="!loading && !error" class="grid grid-cols-4 gap-4 mb-6">
        <div
          v-for="stat in stats" :key="stat.label"
          class="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex flex-col gap-1"
        >
          <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400">{{ stat.label }}</span>
          <span class="text-2xl font-extrabold leading-none" :class="stat.color">{{ stat.val }}</span>
        </div>
      </div>

      <!-- ── Search + filter bar ────────────────────────────────────────────── -->
      <div class="flex items-center gap-3 mb-4">
        <!-- Search input -->
        <div class="relative flex-1 max-w-sm">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search by case number, name or description…"
            class="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 bg-white rounded-lg text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 placeholder:text-slate-300 font-poppins"
          />
          <button
            v-if="search"
            @click="search = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >✕</button>
        </div>

        <!-- Status filter pills -->
        <div class="flex gap-1">
          <button
            v-for="tab in statusTabs" :key="tab.val"
            @click="activeStatus = tab.val"
            class="px-3 py-1.5 rounded-md font-semibold border transition-all"
            :class="activeStatus === tab.val
              ? 'bg-slate-700 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'"
          >
            {{ tab.label }}
            <span
              class="ml-1.5 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm"
              :class="activeStatus === tab.val ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'"
            >{{ tab.count }}</span>
          </button>
        </div>

        <!-- Sort -->
        <div class="flex items-center gap-2 text-xs ml-auto">
          <span class="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-slate-400">Sort</span>
          <select
            v-model="sortBy"
            class="border border-slate-200 text-xs bg-white rounded px-4 py-1.5 text-slate-600 outline-none font-poppins cursor-pointer"
          >
            <option value="created_at">Date created</option>
            <option value="case_number">Case number</option>
            <option value="evidence_count">Evidence count</option>
            <option value="case_name">Name A–Z</option>
          </select>
          <button
            @click="sortAsc = !sortAsc"
            class="border border-slate-200 bg-white rounded px-2 py-1.5 text-slate-400 hover:bg-slate-50 flex items-center"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              :style="{ transform: sortAsc ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }">
              <path d="M5 15l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ── Results summary ────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between mb-3 text-slate-400">
        <span>
          Showing <strong class="text-slate-600">{{ paginated.length }}</strong>
          of <strong class="text-slate-600">{{ filtered.length }}</strong>
          {{ filtered.length === 1 ? 'case' : 'cases' }}
          <span v-if="search"> matching "<em>{{ search }}</em>"</span>
        </span>
        <span v-if="filtered.length > pageSize">
          Page {{ currentPage }} / {{ totalPages }}
        </span>
      </div>

      <!-- ── Loading / error ────────────────────────────────────────────────── -->
      <div v-if="loading" class="flex flex-col items-center gap-3 py-20 text-slate-400">
        <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p>Loading cases…</p>
      </div>
      <div v-else-if="error" class="text-red-600 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded">{{ error }}</div>

      <!-- ── Case list ───────────────────────────────────────────────────────── -->
      <div v-else class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        <!-- Table header -->
        <div class="grid gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200"
          style="grid-template-columns: 2rem 7rem 1fr 6rem 5rem 5rem 2rem">
          <span></span>
          <span class="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Case #</span>
          <span class="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Name / Description</span>
          <span class="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Created by</span>
          <span class="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400 text-center">Evidence</span>
          <span class="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Date</span>
          <span></span>
        </div>

        <!-- Rows -->
        <div
          v-for="(c, i) in paginated" :key="c.id"
          class="grid gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group items-center"
          style="grid-template-columns: 2rem 7rem 1fr 6rem 5rem 5rem 2rem"
          @click="viewCase(c.id)"
        >
          <!-- Row number -->
          <span class="font-mono text-[0.62rem] font-bold text-slate-300">
            {{ String(pageOffset + i + 1).padStart(2, '0') }}
          </span>

          <!-- Case number + status badge -->
          <div class="flex flex-col gap-1">
            <code class="font-mono text-[0.65rem] font-semibold text-slate-600 truncate">{{ c.case_number }}</code>
            <span
              class="text-[0.55rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm w-fit"
              :class="c.status === 'open'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'"
            >{{ c.status }}</span>
          </div>

          <!-- Name + description -->
          <div class="min-w-0">
            <p class="font-semibold text-slate-700 mb-0.5 truncate">{{ c.case_name }}</p>
            <p class="text-slate-400 truncate">{{ c.description || 'No description provided.' }}</p>
          </div>

          <!-- Created by -->
          <span class="text-slate-400 truncate">{{ c.created_by_email || '—' }}</span>

          <!-- Evidence count -->
          <div class="text-center">
            <span
              class="inline-block font-bold px-2.5 py-1 rounded-md"
              :class="(c.evidence_count || 0) > 0
                ? 'bg-sky-50 text-sky-700'
                : 'bg-slate-100 text-slate-400'"
            >{{ c.evidence_count || 0 }}</span>
          </div>

          <!-- Date -->
          <span class="text-slate-400">{{ formatDate(c.created_at) }}</span>

          <!-- Arrow -->
          <span class="text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
        </div>

        <!-- Empty state -->
        <div v-if="paginated.length === 0" class="py-16 text-center text-slate-400">
          <svg class="w-10 h-10 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
          </svg>
          <p class="font-semibold text-slate-500 mb-1">
            {{ search ? 'No cases match your search' : 'No cases yet' }}
          </p>
          <p v-if="search">
            Try a different search term or
            <button @click="search = ''" class="text-sky-600 hover:underline">clear the search</button>.
          </p>
          <p v-else>Create your first forensic case to get started.</p>
        </div>
      </div>

      <!-- ── Pagination ──────────────────────────────────────────────────────── -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          ← Previous
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in pageNumbers" :key="page"
            @click="page !== '…' && (currentPage = Number(page))"
            class="min-w-[32px] h-8 flex items-center justify-center rounded-md font-semibold transition-colors"
            :class="page === currentPage
              ? 'bg-slate-700 text-white'
              : page === '…'
                ? 'text-slate-400 cursor-default'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'"
          >{{ page }}</button>
        </div>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Next →
        </button>
      </div>

    </main>

    <!-- ── Create case modal ───────────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-base font-bold text-slate-700">New Case</h2>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-500 mb-1.5">
                Case Number <span class="text-red-400">*</span>
              </label>
              <input
                v-model="newCase.case_number"
                placeholder="CASE-2025-001"
                class="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-700 font-medium outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 font-poppins"
              />
            </div>
            <div>
              <label class="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-500 mb-1.5">
                Case Name <span class="text-red-400">*</span>
              </label>
              <input
                v-model="newCase.case_name"
                placeholder="Brief title…"
                class="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-700 font-medium outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 font-poppins"
              />
            </div>
            <div>
              <label class="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-500 mb-1.5">Description</label>
              <textarea
                v-model="newCase.description"
                rows="3"
                placeholder="Details and context…"
                class="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-700 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-700/10 resize-none font-poppins"
              ></textarea>
            </div>
            <div v-if="createError" class="text-red-600 text-[0.7rem] px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              {{ createError }}
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showCreateModal = false"
              class="px-4 py-2 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
            >Cancel</button>
            <button
              @click="createCase"
              :disabled="creating || !newCase.case_number.trim() || !newCase.case_name.trim()"
              class="px-5 py-2 font-semibold bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              {{ creating ? 'Creating…' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// ── State ─────────────────────────────────────────────────────────────────────
const cases           = ref<any[]>([])
const loading         = ref(true)
const error           = ref<string | null>(null)
const showCreateModal = ref(false)
const creating        = ref(false)
const createError     = ref<string | null>(null)
const newCase         = ref({ case_number: '', case_name: '', description: '' })

const search       = ref('')
const activeStatus = ref<'all' | 'open' | 'closed'>('all')
const sortBy       = ref<'created_at' | 'case_number' | 'evidence_count' | 'case_name'>('created_at')
const sortAsc      = ref(false)
const currentPage  = ref(1)
const pageSize     = 20

// ── Reset page when search/filter/sort changes ─────────────────────────────────
watch([search, activeStatus, sortBy, sortAsc], () => { currentPage.value = 1 })

// ── Derived data ──────────────────────────────────────────────────────────────
const stats = computed(() => [
  { label: 'All cases',         val: cases.value.length,                                         color: 'text-slate-700' },
  { label: 'Open',              val: cases.value.filter(c => c.status === 'open').length,        color: 'text-emerald-600' },
  { label: 'Closed',            val: cases.value.filter(c => c.status !== 'open').length,        color: 'text-slate-400' },
  { label: 'Total evidence',    val: cases.value.reduce((a, c) => a + (c.evidence_count || 0), 0), color: 'text-sky-600' },
])

const statusTabs = computed(() => [
  { val: 'all',    label: 'All',    count: cases.value.length },
  { val: 'open',   label: 'Open',   count: cases.value.filter(c => c.status === 'open').length },
  { val: 'closed', label: 'Closed', count: cases.value.filter(c => c.status !== 'open').length },
])

const filtered = computed(() => {
  let list = [...cases.value]

  // Status filter
  if (activeStatus.value !== 'all') {
    list = list.filter(c =>
      activeStatus.value === 'open' ? c.status === 'open' : c.status !== 'open'
    )
  }

  // Search — case number, name, description, created_by_email
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(c =>
      (c.case_number  || '').toLowerCase().includes(q) ||
      (c.case_name    || '').toLowerCase().includes(q) ||
      (c.description  || '').toLowerCase().includes(q) ||
      (c.created_by_email || '').toLowerCase().includes(q)
    )
  }

  // Sort
  list.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'created_at') {
      cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    } else if (sortBy.value === 'evidence_count') {
      cmp = (a.evidence_count || 0) - (b.evidence_count || 0)
    } else {
      cmp = (a[sortBy.value] || '').localeCompare(b[sortBy.value] || '')
    }
    return sortAsc.value ? cmp : -cmp
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageOffset = computed(() => (currentPage.value - 1) * pageSize)
const paginated  = computed(() =>
  filtered.value.slice(pageOffset.value, pageOffset.value + pageSize)
)

// Smart page number list: always show first, last, current ±1, with … gaps
const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]
  if (cur > 3) pages.push('…')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchCases() {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    const res   = await axios.get('http://localhost:5000/api/cases/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    cases.value = res.data.cases || []
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to load cases'
  } finally {
    loading.value = false
  }
}

async function createCase() {
  createError.value = null
  if (!newCase.value.case_number.trim() || !newCase.value.case_name.trim()) return
  try {
    creating.value = true
    const token = localStorage.getItem('token')
    const res   = await axios.post('http://localhost:5000/api/cases/', newCase.value, {
      headers: { Authorization: `Bearer ${token}` },
    })
    showCreateModal.value = false
    newCase.value         = { case_number: '', case_name: '', description: '' }
    router.push(`/cases/${res.data.case_id}`)
  } catch (e: any) {
    createError.value = e.response?.data?.error || 'Failed to create case'
  } finally {
    creating.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function viewCase(id: string) { router.push(`/cases/${id}`) }

function formatDate(ts: any): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return '—' }
}

onMounted(fetchCases)
</script>