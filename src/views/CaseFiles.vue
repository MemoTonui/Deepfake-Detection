<template>
  <div class="flex h-screen font-poppins bg-slate-50">

    <main class="flex-1 overflow-y-auto px-10 py-8 *:text-xs">

      <!-- Header -->
      <div class="border-b-2 border-slate-200 pb-5 mb-7">
        <span class="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1">Evidence Repository</span>
        <h1 class="text-[2rem] font-bold text-slate-700 leading-tight" style="letter-spacing:-0.035em">Evidence Files</h1>
      </div>

      <div v-if="loading" class="flex flex-col items-center gap-3 py-20 text-slate-400">
        <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p>Loading evidence…</p>
      </div>
      <div v-else-if="error" class="text-red-600 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded">{{ error }}</div>

      <template v-else>
        <!-- Stats strip -->
        <div class="flex items-center gap-8 py-5 border-b border-slate-200 mb-6">
          <div class="flex flex-col gap-2">
            <span class="text-3xl font-bold text-slate-700 leading-none">{{ stats.total }}</span>
            <span class="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-slate-400">Total</span>
          </div>
          <div class="w-px h-9 bg-slate-200"></div>
          <div class="flex flex-col gap-0.5">
            <span class="text-3xl font-bold text-red-500 leading-none">{{ stats.fake }}</span>
            <span class="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-slate-400">Deepfakes</span>
          </div>
          <div class="w-px h-9 bg-slate-200"></div>
          <div class="flex flex-col gap-0.5">
            <span class="text-3xl font-bold text-emerald-600 leading-none">{{ stats.authentic }}</span>
            <span class="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-slate-400">Authentic</span>
          </div>
          <div class="w-px h-9 bg-slate-200"></div>
          <div class="flex flex-col gap-0.5">
            <span class="text-3xl font-bold text-sky-600 leading-none">{{ fakeRate }}%</span>
            <span class="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-slate-400">Detection rate</span>
          </div>
          <div class="ml-auto text-slate-400 font-medium">{{ filteredCaseFiles.length }} / {{ caseFiles.length }}</div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-6 mb-5">
          <div class="flex items-center gap-2.5">
            <span class="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-slate-400">Filter</span>
            <div class="flex gap-1">
              <button v-for="opt in filterOpts" :key="opt.val" @click="filterVerdict = opt.val as any"
                class="px-3 py-1.5 font-semibold rounded border transition-all"
                :class="filterVerdict === opt.val ? 'bg-slate-700 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'">
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-slate-400">Sort</span>
            <select v-model="sortBy" class="border border-slate-200 bg-white rounded px-2 py-1.5 text-slate-700 outline-none cursor-pointer font-poppins text-xs">
              <option value="date" class="text-xs">Date</option>
              <option value="caseNumber" class="text-xs">Case #</option>
              <option value="verdict" class="text-xs">Verdict</option>
            </select>
            <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              class="border border-slate-200 bg-white rounded px-2 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                :style="{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }">
                <path d="M5 15l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- White card table -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table class="w-full" style="border-collapse:collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400 w-10">#</th>
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Case</th>
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">File</th>
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Submitted by</th>
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Date</th>
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Score</th>
                <th class="px-4 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Verdict</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(file, i) in filteredCaseFiles" :key="file.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-mono text-[0.62rem] font-bold text-slate-300">{{ String(i + 1).padStart(2, '0') }}</td>
                <td class="px-4 py-3"><code class="font-mono text-[0.65rem] text-slate-500">{{ file.caseNumber }}</code></td>
                <td class="px-4 py-3 font-semibold text-slate-700 max-w-[160px] truncate">{{ file.fileName || '—' }}</td>
                <td class="px-4 py-3 text-slate-400">{{ file.uploadedBy }}</td>
                <td class="px-4 py-3 text-slate-400">{{ formatDate(file.uploadDate) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-14 h-[5px] bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" :class="file.isFake ? 'bg-red-500' : 'bg-emerald-500'"
                        :style="{ width: `${Math.round((file.confidence ?? 0) * 100)}%` }"></div>
                    </div>
                    <span class="text-slate-400 min-w-[36px]">{{ file.confidence != null ? (file.confidence * 100).toFixed(1) + '%' : '—' }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-[0.6rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm"
                    :class="file.isFake ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'">
                    {{ file.isFake ? 'Deepfake' : 'Authentic' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <router-link :to="`/casefiles/${file.id}`" class="font-bold text-sky-600 hover:underline">View →</router-link>
                </td>
              </tr>
              <tr v-if="filteredCaseFiles.length === 0">
                <td colspan="8" class="px-4 py-12 text-center text-slate-400">No evidence files match the current filter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { CaseFile } from '@/services/caseFile'

const caseFiles = ref<CaseFile[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const sortBy = ref<'date' | 'caseNumber' | 'verdict'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')
const filterVerdict = ref<'all' | 'fake' | 'authentic'>('all')
const filterOpts = [{ val: 'all', label: 'All' }, { val: 'fake', label: 'Deepfakes' }, { val: 'authentic', label: 'Authentic' }]

const filteredCaseFiles = computed(() => {
  let list = [...caseFiles.value]
  if (filterVerdict.value !== 'all') list = list.filter(f => filterVerdict.value === 'fake' ? f.isFake : !f.isFake)
  list.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'date') cmp = new Date(a.uploadDate || 0).getTime() - new Date(b.uploadDate || 0).getTime()
    else if (sortBy.value === 'caseNumber') cmp = (a.caseNumber || '').localeCompare(b.caseNumber || '')
    else cmp = a.isFake === b.isFake ? 0 : a.isFake ? 1 : -1
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
  return list
})

const stats = computed(() => ({
  total: caseFiles.value.length,
  fake: caseFiles.value.filter(f => f.isFake).length,
  authentic: caseFiles.value.filter(f => !f.isFake).length,
}))
const fakeRate = computed(() => stats.value.total ? ((stats.value.fake / stats.value.total) * 100).toFixed(1) : '0.0')

async function fetchCaseFiles() {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    const res = await axios.get('http://localhost:5000/api/casefiles/', { headers: { Authorization: `Bearer ${token}` } })
    caseFiles.value = (res.data.casefiles || []).map((cf: any) => new CaseFile(cf))
  } catch (e: any) { error.value = e.response?.data?.error || 'Failed to load evidence' }
  finally { loading.value = false }
}

function formatDate(d: any) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}
onMounted(fetchCaseFiles)
</script>