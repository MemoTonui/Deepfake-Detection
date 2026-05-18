<template>
  <div class="flex h-screen font-poppins bg-slate-50">

    <main class="flex-1 overflow-y-auto px-10 py-8 *:text-xs">

      <!-- Header -->
      <div class="flex items-start justify-between border-b-2 border-slate-200 pb-5 mb-7">
        <div>
          <div class="flex items-center gap-2 mb-2 text-slate-400">
            <router-link to="/casefiles" class="hover:text-sky-600 transition-colors">Evidence</router-link>
            <span>/</span>
            <code class="font-mono text-[0.65rem] text-slate-500">{{ caseFile?.caseNumber }}</code>
          </div>
          <h1 class="text-[2rem] font-bold text-slate-700 leading-tight mb-1" style="letter-spacing:-0.035em">Case File Details</h1>
          <p class="text-slate-400">Forensic evidence analysis report</p>
        </div>
        <button @click="exportReport"
          class="bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-md hover:bg-sky-500 transition-colors shrink-0">
          ↓ Export PDF
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center gap-3 py-20 text-slate-400">
        <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p>Loading evidence…</p>
      </div>
      <div v-else-if="error" class="text-red-600 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded">{{ error }}</div>

      <div v-else-if="caseFile" class="space-y-5">

        <!-- Verdict strip — three tier: DEEPFAKE / UNCERTAIN / AUTHENTIC -->
        <div class="flex justify-between items-center px-8 py-6 rounded-lg gap-8"
          :class="verdictStripClass">
          <div class="flex-1">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1">Detection verdict</p>
            <p class="text-2xl font-extrabold tracking-tight mb-2" :class="verdictTextClass">
              {{ caseFile.verdict_label || (caseFile.isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC VIDEO') }}
            </p>

            <!-- Expert review warning banner -->
            <div v-if="caseFile.requires_review"
              class="flex items-start gap-2 mt-2 mb-2 px-3 py-2 rounded-md bg-amber-500/20 border border-amber-400/40">
              <span class="text-amber-300 text-sm mt-0.5">⚠️</span>
              <p class="text-amber-200 text-[0.7rem] leading-relaxed font-medium">
                This evidence requires review by a qualified forensic expert before any legal determination is made.
              </p>
            </div>

            <p v-if="caseFile.result?.explanation" class="text-slate-400 max-w-lg leading-relaxed">
              {{ caseFile.result.explanation }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1">
              {{ caseFile.requires_review ? 'Deepfake probability' : (caseFile.isFake ? 'Deepfake probability' : 'Confidence') }}
            </p>
            <p class="text-5xl font-extrabold tracking-tighter leading-none" :class="verdictTextClass">
              {{ displayConfidence(caseFile.confidence, caseFile.isFake) }}
            </p>
            <p class="text-slate-500 mt-1">
              {{ caseFile.requires_review ? 'inconclusive' : (caseFile.isFake ? 'deepfake probability' : 'authenticity score') }}
            </p>
          </div>
        </div>

        <!-- Case metadata -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 class="font-semibold text-slate-800 mb-4">Case Metadata</h2>
          <div class="grid grid-cols-3 gap-x-8 gap-y-3 text-slate-700">
            <div v-for="m in metaItems" :key="m.label">
              <span class="text-slate-400 block mb-0.5">{{ m.label }}</span>
              <span class="font-medium" :class="m.mono ? 'font-mono text-slate-500' : ''">{{ m.val }}</span>
            </div>
          </div>
        </div>

        <!-- Media row -->
        <div v-if="caseFile.fileUrl || caseFile.resultsLink || caseFile.result?.heatmap_url"
          class="grid gap-4" style="grid-template-columns: 3fr 2fr;">
          <div v-if="caseFile.fileUrl" class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">Evidence file</p>
            <video v-if="caseFile.type === 'video'" controls class="w-full max-h-72 rounded-lg object-contain border border-slate-100">
              <source :src="`http://localhost:5000${caseFile.fileUrl}`" type="video/mp4" />
            </video>
            <img v-else-if="caseFile.type === 'image'" :src="`http://localhost:5000${caseFile.fileUrl}`" class="w-full max-h-72 rounded-lg object-contain" />
            <a v-else :href="`http://localhost:5000${caseFile.fileUrl}`" target="_blank" class="font-semibold text-slate-700 hover:underline">↓ Download File</a>
          </div>
          <div v-if="caseFile.resultsLink || caseFile.result?.heatmap_url" class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Heatmap analysis</p>
            <p class="text-slate-400 mb-3">Warm regions = higher manipulation probability</p>
            <img :src="`http://localhost:5000${caseFile.result?.heatmap_url || caseFile.resultsLink}`" alt="Heatmap" class="w-full max-h-72 rounded-lg object-contain" />
          </div>
        </div>

        <template v-if="hasEnhancedData">

          <!-- Component scores — raw deepfake probability per model, always shown as-is -->
          <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 class="font-semibold text-slate-800 mb-0.5">Model Component Scores</h2>
            <p class="text-slate-400 mb-5">Ensemble weights: Xception 35% · ResNet50V2 40% · Anomaly Detector 25%</p>
            <div class="space-y-4">
              <div v-for="c in components" :key="c.key" class="flex items-center gap-4">
                <div class="w-36 shrink-0">
                  <p class="font-semibold text-slate-800">{{ c.name }}</p>
                  <p class="text-slate-400">{{ c.weight }}</p>
                </div>
                <div class="flex-1 h-[7px] bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    :style="{ width: `${(caseFile.result.components[c.key] ?? 0) * 100}%`, background: c.color }"></div>
                </div>
                <span class="font-bold min-w-[44px] text-right" :style="{ color: c.color }">{{ pct(caseFile.result.components[c.key]) }}</span>
                <span class="text-[0.6rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm min-w-[44px] text-center"
                  :class="(caseFile.result.components[c.key] ?? 0) > 0.5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'">
                  {{ (caseFile.result.components[c.key] ?? 0) > 0.5 ? 'Fake' : 'Real' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Temporal consistency analysis -->
          <div v-if="caseFile.result?.temporal_analysis"
            class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 class="font-semibold text-slate-800 mb-0.5">Temporal Consistency Analysis</h2>
            <p class="text-slate-400 mb-5">
              Frame-to-frame variation in model scores — high inconsistency indicates
              face-swap boundary artefacts flickering across sampled frames.
            </p>
            <div class="grid grid-cols-4 gap-1 bg-slate-200 border border-slate-200 rounded-lg overflow-hidden mb-4">
              <div class="bg-white px-5 py-4">
                <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 block mb-2">Temporal Score</span>
                <span class="text-2xl font-extrabold tracking-tight"
                  :class="caseFile.result.temporal_analysis.temporal_score > 0.35 ? 'text-amber-600' : 'text-emerald-600'">
                  {{ pct(caseFile.result.temporal_analysis.temporal_score) }}
                </span>
              </div>
              <div class="bg-white px-5 py-4">
                <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 block mb-2">Frame Flicker</span>
                <span class="text-2xl font-extrabold text-slate-700 tracking-tight">
                  {{ pct(caseFile.result.temporal_analysis.flicker) }}
                </span>
              </div>
              <div class="bg-white px-5 py-4">
                <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 block mb-2">Max Component Std</span>
                <span class="text-2xl font-extrabold text-slate-700 tracking-tight">
                  {{ pct(caseFile.result.temporal_analysis.max_component_std) }}
                </span>
              </div>
              <div class="bg-white px-5 py-4">
                <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 block mb-2">Verdict Reversals</span>
                <span class="text-2xl font-extrabold text-slate-700 tracking-tight">
                  {{ caseFile.result.temporal_analysis.reversals }}
                </span>
              </div>
            </div>
            <div v-if="caseFile.result.temporal_analysis.is_suspicious"
              class="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span class="text-amber-500 mt-0.5">⚠️</span>
              <p class="text-amber-700">
                <strong>Temporal inconsistency detected.</strong>
                Model scores fluctuate significantly between frames, which is characteristic
                of face-swap deepfakes where manipulation artefacts appear and disappear
                as different facial regions are sampled. This contributed to the UNCERTAIN verdict.
              </p>
            </div>
            <div v-else class="flex items-start gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span class="text-emerald-500 mt-0.5">✓</span>
              <p class="text-emerald-700">
                Scores are temporally consistent across frames — no flicker pattern detected.
              </p>
            </div>
          </div>

          <!-- Frame analysis — frame confidence is deepfake probability, shown as-is with clear label -->
          <div v-if="caseFile.result.frame_analysis" class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 class="font-semibold text-slate-800 mb-0.5">Frame-by-Frame Analysis</h2>
            <p class="text-slate-400 mb-5">{{ caseFile.result.frame_analysis.length }} frames · score = deepfake probability per frame</p>
            <div class="grid grid-cols-5 gap-3">
              <div v-for="(frame, idx) in caseFile.result.frame_analysis" :key="idx"
                class="border rounded-lg p-3"
                :class="frame.is_fake ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/50'">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-slate-400 uppercase tracking-wide" style="font-size:0.58rem">F{{ frame.frame_number }}</span>
                  <span class="text-[0.6rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
                    :class="frame.is_fake ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'">
                    {{ frame.is_fake ? 'Fake' : 'Real' }}
                  </span>
                </div>
                <p class="text-xl font-extrabold tracking-tight mb-2" :class="frame.is_fake ? 'text-red-500' : 'text-emerald-600'">
                  {{ pct(frame.confidence) }}
                </p>
                <div class="space-y-1.5">
                  <div v-for="b in frameBars(frame)" :key="b.k" class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-400 w-2.5" style="font-size:0.55rem">{{ b.k }}</span>
                    <div class="flex-1 h-1 bg-slate-100 rounded-sm overflow-hidden">
                      <div class="h-full rounded-sm" :style="{ width: `${(b.val ?? 0) * 100}%`, background: b.c }"></div>
                    </div>
                    <span class="text-slate-400 min-w-[24px] text-right" style="font-size:0.55rem">{{ pct(b.val, 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Score distribution -->
          <div v-if="caseFile.result.confidence_stats" class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 class="font-semibold text-slate-800 mb-0.5">Score Distribution</h2>
            <p class="text-slate-400 mb-5">Statistical summary of deepfake probability across all analysed frames</p>
            <div class="grid grid-cols-4 gap-1 bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              <div v-for="s in scoreStats" :key="s.label" class="bg-white px-5 py-4">
                <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 block mb-2">{{ s.label }}</span>
                <span class="text-2xl font-extrabold text-slate-700 tracking-tight">{{ pct(s.val, 2) }}</span>
              </div>
            </div>
          </div>

          <!-- System performance -->
          <div v-if="caseFile.result.confusion_matrix" class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 class="font-semibold text-slate-800 mb-0.5">System Performance Metrics</h2>
            <p class="text-slate-400 mb-5">
              Global rates from the 7,192-sample test set — characterises the system's reliability, not this specific video.
            </p>
            <div class="grid grid-cols-4 gap-4">
              <div v-for="m in perfMetrics" :key="m.label" class="rounded-lg p-4 border" :class="m.cls">
                <p class="text-[0.6rem] font-bold uppercase tracking-widest mb-2" :class="m.txtCls">{{ m.label }}</p>
                <p class="text-3xl font-extrabold tracking-tight mb-1" :class="m.txtCls">{{ pct(m.val, 2) }}</p>
                <p class="text-slate-400">{{ m.desc }}</p>
              </div>
            </div>
          </div>

          <!-- System info -->
          <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 class="font-semibold text-slate-800 mb-4">System Information</h2>
            <div class="grid grid-cols-3 gap-x-8 gap-y-3 text-slate-700">
              <div v-for="s in sysInfoItems" :key="s.label">
                <span class="text-slate-400 block mb-0.5">{{ s.label }}</span>
                <span class="font-medium">{{ s.val || '—' }}</span>
              </div>
            </div>
          </div>

        </template>

        <!-- Access logs -->
        <div v-if="caseFile.logs?.length" class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-800">Access Log</h2>
          </div>
          <table class="w-full" style="border-collapse:collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">User</th>
                <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Action</th>
                <th class="px-5 py-3 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-slate-400">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(log, i) in caseFile.logs" :key="i" class="hover:bg-slate-50">
                <td class="px-5 py-3 text-slate-700">{{ log.user || log.actor_id }}</td>
                <td class="px-5 py-3 text-slate-600 capitalize">{{ log.action || log.details }}</td>
                <td class="px-5 py-3 text-slate-400">{{ new Date(log.timestamp).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Sidebar from '@/components/Sidebar.vue'

const route    = useRoute()
const caseFile = ref<any>(null)
const loading  = ref(true)
const error    = ref<string | null>(null)

// Three-tier verdict computed classes
const verdictStripClass = computed(() => {
  const v = caseFile.value?.verdict
  if (v === 'DEEPFAKE')   return 'verdict-strip-fake'
  if (v === 'UNCERTAIN')  return 'verdict-strip-uncertain'
  return 'verdict-strip-real'
})

const verdictTextClass = computed(() => {
  const v = caseFile.value?.verdict
  if (v === 'DEEPFAKE')   return 'text-red-300'
  if (v === 'UNCERTAIN')  return 'text-amber-300'
  return 'text-emerald-300'
})

const hasEnhancedData = computed(() =>
  caseFile.value?.result?.frame_analysis &&
  caseFile.value?.result?.components &&
  caseFile.value?.result?.confusion_matrix
)

const metaItems = computed(() => [
  { label: 'Case number',   val: caseFile.value?.caseNumber, mono: true },
  { label: 'Case name',     val: caseFile.value?.caseName },
  { label: 'Evidence type', val: caseFile.value?.type },
  { label: 'Uploaded by',  val: caseFile.value?.uploadedBy },
  { label: 'Processed at', val: caseFile.value?.uploadDate },
  { label: 'Status',       val: caseFile.value?.status },
])

const components = [
  { key: 'xception', name: 'Xception',        weight: '35% weight', color: '#0ea5e9' },
  { key: 'resnet',   name: 'ResNet50V2',       weight: '40% weight', color: '#8b5cf6' },
  { key: 'anomaly',  name: 'Anomaly Detector', weight: '25% weight', color: '#f59e0b' },
]

const scoreStats = computed(() => {
  const s = caseFile.value?.result?.confidence_stats
  if (!s) return []
  return [
    { label: 'Mean',          val: s.mean },
    { label: 'Std deviation', val: s.std  },
    { label: 'Min',           val: s.min  },
    { label: 'Max',           val: s.max  },
  ]
})

const perfMetrics = computed(() => {
  const cm = caseFile.value?.result?.confusion_matrix
  if (!cm) return []
  return [
    { label: 'True positive rate',  val: cm.true_positive,  desc: 'Deepfakes correctly flagged',   cls: 'bg-emerald-50 border-emerald-200', txtCls: 'text-emerald-700' },
    { label: 'True negative rate',  val: cm.true_negative,  desc: 'Authentic correctly cleared',   cls: 'bg-sky-50 border-sky-200',         txtCls: 'text-sky-700'     },
    { label: 'False positive rate', val: cm.false_positive, desc: 'Authentic incorrectly flagged', cls: 'bg-amber-50 border-amber-200',     txtCls: 'text-amber-700'   },
    { label: 'False negative rate', val: cm.false_negative, desc: 'Deepfakes incorrectly cleared', cls: 'bg-red-50 border-red-200',         txtCls: 'text-red-600'     },
  ]
})

const sysInfoItems = computed(() => {
  const m = caseFile.value?.result?.metadata
  if (!m) return []
  return [
    { label: 'Detection method', val: m.detection_method },
    { label: 'Overall accuracy', val: m.model_accuracy   },
    { label: 'AUC-ROC',         val: m.auc_score         },
    { label: 'Precision',       val: m.precision         },
    { label: 'F1 score',        val: m.f1_score          },
    { label: 'Frames analysed', val: m.frames_processed  },
  ]
})

function frameBars(frame: any) {
  return [
    { k: 'X', val: frame.xception_score, c: '#0ea5e9' },
    { k: 'R', val: frame.resnet_score,   c: '#8b5cf6' },
    { k: 'A', val: frame.anomaly_score,  c: '#f59e0b' },
  ]
}

async function fetchCaseFile() {
  try {
    loading.value = true
    const res = await axios.get(`http://localhost:5000/api/casefiles/${route.params.id}`)
    const d = res.data
    caseFile.value = {
      id:          d.id,
      caseNumber:  d.caseNumber || 'N/A',
      caseName:    d.caseName   || 'Unknown',
      uploadedBy:  d.submittedBy || d.uploader_id,
      type:        d.evidence_type || d.type || 'video',
      uploadDate:  (d.processed_at || d.uploadDate)
        ? new Date(d.processed_at || d.uploadDate).toUTCString()
        : 'N/A',
      isFake:      d.result?.is_fake ?? d.isFake ?? false,
      verdict:      d.verdict || (d.result?.is_fake ? 'DEEPFAKE' : 'AUTHENTIC'),
      verdict_label: d.verdict_label || d.result?.verdict_label || null,
      requires_review: d.requires_review ?? false,
      status:      d.status || 'complete',
      fileUrl:     d.file_url || d.fileUrl || null,
      resultsLink: d.heatmap_url || d.resultsLink || null,
      // Raw deepfake probability from the model (0 = authentic, 1 = fake)
      confidence:  d.result?.confidence ?? null,
      result:      {
        ...(d.result || {}),
        temporal_analysis: d.temporal_analysis || d.result?.temporal_analysis || null,
      },
      logs:        d.logs   || [],
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to load case file'
  } finally {
    loading.value = false
  }
}

async function exportReport() {
  if (!caseFile.value) return
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`http://localhost:5000/api/casefiles/${route.params.id}/report`, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href    = url
    a.setAttribute('download', `Case_${caseFile.value.caseNumber}_Report.pdf`)
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    alert('Failed to generate report.')
  }
}

/**
 * Converts raw model confidence (always deepfake probability, 0–1) to the
 * correct display value depending on the verdict:
 *
 *   Fake video    → confidence as-is    0.871 → "87.1% deepfake probability"
 *   Authentic     → 1 – confidence      0.423 → "57.7% authenticity score"
 *
 * Your screenshot showed 42.3% on an authentic video because pct() was used
 * directly — it should have shown 100% – 42.3% = 57.7%.
 */
function displayConfidence(
  confidence: number | null | undefined,
  isFake: boolean,
  decimals = 1,
): string {
  if (confidence == null) return '—'
  const displayed = isFake ? confidence : 1 - confidence
  return (displayed * 100).toFixed(decimals) + '%'
}

/**
 * Raw percentage — used for component scores, frame bars, system metrics.
 * These are always deepfake probabilities and are shown as-is.
 */
function pct(val: number | null | undefined, d = 1): string {
  if (val == null) return '—'
  return (val * 100).toFixed(d) + '%'
}

onMounted(fetchCaseFile)
</script>