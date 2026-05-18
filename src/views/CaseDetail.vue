<template>
  <div class="flex h-screen font-poppins bg-slate-50 *:text-xs">

    <main class="flex-1 p-6 overflow-auto">
      <div v-if="loading" class="flex flex-col items-center gap-3 py-16 text-gray-400">
        <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <p>Loading case…</p>
      </div>
      <div v-else-if="error" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{{ error }}</div>

      <div v-else-if="caseData">
        <!-- Header -->
        <div class="mb-6 border-b pb-4 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1 text-gray-400">
              <router-link to="/cases" class="hover:text-sky-600 transition-colors">Cases</router-link>
              <span>/</span>
              <span class="font-mono">{{ caseData.case_number }}</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">{{ caseData.case_name }}</h1>
            <p class="text-gray-500 mt-0.5">{{ caseData.description }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="px-2 py-1 rounded text-[0.65rem] font-medium"
              :class="caseData.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
              {{ caseData.status }}
            </span>
            <button @click="showUploadModal = true" class="px-4 py-2 bg-sky-600 text-white font-medium rounded-md hover:bg-sky-700 transition-colors">
              + Upload Evidence
            </button>
          </div>
        </div>

        <!-- Meta cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="p-4 bg-white rounded-lg shadow-md">
            <p class="text-gray-500">Created by</p>
            <p class="font-semibold text-gray-800 mt-1 truncate">{{ caseData.created_by_email }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow-md">
            <p class="text-gray-500">Date created</p>
            <p class="font-semibold text-gray-800 mt-1">{{ formatDate(caseData.created_at) }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow-md">
            <p class="text-gray-500">Evidence files</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ caseData.evidence?.length || 0 }}</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow-md">
            <p class="text-gray-500">Deepfakes detected</p>
            <p class="text-2xl font-bold mt-1" :class="deepfakeCount > 0 ? 'text-red-600' : 'text-gray-800'">{{ deepfakeCount }}</p>
          </div>
        </div>

        <!-- Evidence table -->
        <div class="bg-white rounded-lg shadow-md mb-6">
          <div class="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800">Evidence Files</h2>
            <button @click="showUploadModal = true" class="text-sky-600 hover:underline font-medium">+ Upload</button>
          </div>
          <div v-if="caseData.evidence?.length">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">File</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Uploaded by</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th class="px-5 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Verdict</th>
                  <th class="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="ev in caseData.evidence" :key="ev.id" class="hover:bg-gray-50">
                  <td class="px-5 py-3 font-medium text-gray-800">{{ ev.file_name }}</td>
                  <td class="px-5 py-3 text-gray-500">{{ ev.uploaded_by_email }}</td>
                  <td class="px-5 py-3 text-gray-400">{{ formatDate(ev.uploaded_at) }}</td>
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" :class="ev.is_fake ? 'bg-red-500' : 'bg-green-500'" :style="{ width: `${Math.round((ev.confidence ?? 0) * 100)}%` }"></div>
                      </div>
                      <span class="text-gray-500 w-9">{{ ev.confidence != null ? scoreDisplay(ev.confidence, ev.is_fake) : '—' }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3">
                    <span class="px-2 py-1 rounded text-[0.65rem] font-medium"
                      :class="ev.result?.verdict === 'UNCERTAIN' || ev.requires_review
                        ? 'bg-amber-100 text-amber-700'
                        : ev.is_fake ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
                      {{ ev.result?.verdict === 'UNCERTAIN' || ev.requires_review
                        ? '⚠ Review Required'
                        : ev.is_fake ? 'Deepfake' : 'Authentic' }}
                    </span>
                  </td>
                  <td class="px-5 py-3">
                    <button @click="viewEvidence(ev.id)" class="text-sky-600 hover:underline font-medium">View →</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-5 py-10 text-center text-gray-400">
            No evidence uploaded yet. <button @click="showUploadModal = true" class="text-sky-600 hover:underline">Upload evidence</button> to get started.
          </div>
        </div>

        <!-- Activity log ─────────────────────────────────────────────────────
          Three fixes applied here, nothing else changed:

          FIX 1 — :key
            Was:  :key="log.created_at"
            Why broken: created_at doesn't exist on normalised logs — all keys
            resolve to undefined, Vue can't track rows, duplicates appear.
            Fix:  compound key from action + user_email + timestamp + index.

          FIX 2 — v-if on details
            Was:  v-if="log.details"
            Why broken: falsy for empty string "", so nothing ever rendered.
            Fix:  v-if="detailsText(log.details)" — only hides truly empty.

          FIX 3 — rendering details
            Was:  {{ log.details }}
            Why broken: if details is a dict {}, Vue prints "[object Object]".
            Fix:  {{ detailsText(log.details) }} — flattens dicts to strings.
        ──────────────────────────────────────────────────────────────────── -->
        <div class="bg-white rounded-lg shadow-md">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800">Activity Log</h2>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-if="!caseData.audit_logs?.length" class="px-5 py-4 text-gray-400">
              No activity logged yet.
            </li>
            <li
              v-for="(log, idx) in caseData.audit_logs"
              :key="`${log.action}-${log.user_email}-${log.timestamp}-${idx}`"
              class="px-5 py-3 flex items-start justify-between gap-4"
            >
              <div class="flex items-start gap-2.5">
                <div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" :class="dotClass(log.action)"></div>
                <div>
                  <p class="text-gray-700">
                    <strong>{{ log.user_email || '—' }}</strong>
                    {{ actionText(log.action) }}
                  </p>
                  <p v-if="detailsText(log.details)" class="text-gray-400 mt-0.5">
                    {{ detailsText(log.details) }}
                  </p>
                </div>
              </div>
              <span class="text-gray-400 shrink-0 whitespace-nowrap">{{ formatDate(log.timestamp) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Upload modal -->
      <Teleport to="body">
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showUploadModal = false">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-base font-bold text-gray-800">Upload Evidence</h2>
              <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <UploadEvidence :caseId="caseId" @upload-success="handleUploadSuccess" />
          </div>
        </div>
      </Teleport>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Sidebar from '@/components/Sidebar.vue'
import UploadEvidence from '@/components/UploadEvidence.vue'

const route = useRoute()
const router = useRouter()
const caseId = route.params.id as string
const caseData = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showUploadModal = ref(false)

const deepfakeCount = computed(() =>
  (caseData.value?.evidence || []).filter((e: any) => e.is_fake).length
)

async function fetchCase() {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    const res = await axios.get(`http://localhost:5000/api/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    caseData.value = res.data
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to load case'
  } finally {
    loading.value = false
  }
}

function handleUploadSuccess() { showUploadModal.value = false; fetchCase() }
function viewEvidence(id: string) { router.push(`/casefiles/${id}`) }

function actionText(action: string): string {
  const m: Record<string, string> = {
    VIEW_CASE:        'viewed this case',
    CREATE_CASE:      'created this case',
    UPLOAD_EVIDENCE:  'uploaded evidence',
    ANALYZE_EVIDENCE: 'analysed evidence',
    EXPORT_REPORT:    'exported a report',
    UPDATE_CASE:      'updated case information',
  }
  return m[action] ?? action.toLowerCase().replace(/_/g, ' ')
}

function dotClass(action: string): string {
  if (['UPLOAD_EVIDENCE', 'ANALYZE_EVIDENCE'].includes(action)) return 'bg-sky-500'
  if (action === 'CREATE_CASE')   return 'bg-green-500'
  if (action === 'EXPORT_REPORT') return 'bg-amber-400'
  return 'bg-gray-300'
}

/**
 * Display score as deepfake probability for fakes, authenticity score for authentic.
 * Mirrors the displayConfidence() logic in CaseFileDetail.vue.
 */
function scoreDisplay(confidence: number, isFake: boolean): string {
  const displayed = isFake ? confidence : 1 - confidence
  return (displayed * 100).toFixed(0) + '%'
}

function formatDate(ts: any): string {
  if (!ts) return '—'
  try { return new Date(ts).toLocaleString('en-KE') } catch { return '—' }
}

/**
 * Safely converts any details value to a displayable string.
 *
 * Handles three cases from your data:
 *   1. New AuditLogger  → plain string  "video.mp4 uploaded"         ✓ pass through
 *   2. Old AuditLogger  → dict          { file_name: "video.mp4" }   → flatten to string
 *   3. Missing/empty    → null / ""                                   → return "" (hidden by v-if)
 */
function detailsText(details: any): string {
  if (!details) return ''
  if (typeof details === 'string') return details.trim()
  if (typeof details === 'object') {
    return Object.entries(details)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join('  ·  ')
  }
  return String(details)
}

onMounted(fetchCase)
</script>