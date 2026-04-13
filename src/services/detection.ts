export interface FrameAnalysis {
  frame_number: number
  is_fake: boolean
  confidence: number
  xception_score: number
  resnet_score: number
  anomaly_score: number
}

export interface ConfusionMatrix {
  true_positive: number
  false_positive: number
  true_negative: number
  false_negative: number
}

export interface ConfidenceStats {
  mean: number
  std: number
  min: number
  max: number
}

export interface DetectionResult {
  caseName: string
  caseNumber: string
  description: string
  evidence_type: string
  file_name: string
  file_path: string
  file_url: string
  heatmap_url: string
  processed_at: string
  submittedBy: string
  uploader_id: string
  verification_hash: string

  result: {
    confidence: number
    heatmap_url: string
    is_fake: boolean
    explanation: string
    components: {
      xception: number
      resnet: number
      anomaly: number
    }
    frame_analysis: FrameAnalysis[]
    frame_thumbnails: string[]
    confidence_stats: ConfidenceStats
    confusion_matrix: ConfusionMatrix
    metadata: {
      frames_processed: number
      detection_method: string
      model_accuracy: string
      false_positive_rate: string
      false_negative_rate: string
      auc_score: string
    }
  }

  metadata: {
    frames_processed: number
    warning?: string
  }
}

export interface CaseMetadata {
  caseId: string
  caseName?: string
  description?: string
  submittedBy?: string
}

export function useDetection() {
  const analyzeVideo = async (file: File, metadata: CaseMetadata): Promise<DetectionResult> => {
    const formData = new FormData()
    formData.append('video', file)
    formData.append('caseNumber', metadata.caseId)
    if (metadata.caseName) formData.append('caseName', metadata.caseName)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.submittedBy) formData.append('submittedBy', metadata.submittedBy)

    try {
      const response = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Analysis failed')

      return (await response.json()) as DetectionResult
    } catch (error) {
      console.error('Detection error:', error)
      throw error
    }
  }

  return { analyzeVideo }
}