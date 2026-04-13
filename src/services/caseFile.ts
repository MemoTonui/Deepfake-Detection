// src/models/CaseFile.ts

export type CaseFileStatus = "pending" | "processing" | "complete";
export type CaseFileType = "case-file" | "evidence" | "video" | "image";

export interface FrameAnalysis {
  frame_number: number
  is_fake: boolean
  confidence: number
  xception_score: number
  resnet_score: number
  anomaly_score: number
}

export interface EnhancedResult {
  is_fake: boolean
  confidence: number
  heatmap_url: string
  explanation?: string
  components?: {
    xception: number
    resnet: number
    anomaly: number
  }
  frame_analysis?: FrameAnalysis[]
  frame_thumbnails?: string[]
  confidence_stats?: {
    mean: number
    std: number
    min: number
    max: number
  }
  confusion_matrix?: {
    true_positive: number
    false_positive: number
    true_negative: number
    false_negative: number
  }
  metadata?: {
    frames_processed: number
    detection_method: string
    model_accuracy: string
    false_positive_rate: string
    false_negative_rate: string
    auc_score: string
  }
}

export class CaseFile {
  id: string;
  caseNumber: string;
  caseDescription: string;
  caseName: string;
  uploadedBy: string;
  type: CaseFileType;
  uploadDate: string;
  isFake: boolean;
  status: CaseFileStatus;
  resultsLink?: string;
  confidence?: number;
  result?: EnhancedResult;

  constructor(data?: any) {
    this.id = data?.id ?? data?.evidence_id ?? "";
    this.caseNumber = data?.caseNumber ?? data?.case_id ?? "";
    this.caseDescription = data?.caseDescription ?? data?.description ?? "";
    this.caseName = data?.caseName ?? data?.case_name ?? "";
    this.uploadedBy = data?.submittedBy ?? data?.submitting_party ?? data?.uploadedBy ?? "";
    this.type = data?.evidence_type ?? data?.type ?? "video";
    
    // Handle date
    const dateValue = data?.processed_at ?? data?.uploadDate;
    this.uploadDate = dateValue
      ? new Date(dateValue).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    
    // ✅ CRITICAL: Properly parse is_fake from result object
    if (data?.result?.is_fake !== undefined) {
      this.isFake = Boolean(data.result.is_fake);
    } else if (data?.is_fake !== undefined) {
      this.isFake = Boolean(data.is_fake);
    } else {
      this.isFake = false;
    }
    
    this.confidence = data?.result?.confidence ?? data?.confidence;
    this.status = data?.status ?? "complete";
    this.resultsLink = data?.heatmap_url ?? data?.result?.heatmap_url ?? data?.resultsLink;
    
    // Store full enhanced result
    this.result = data?.result;
  }

  // Helpers
  isComplete(): boolean {
    return this.status === "complete";
  }

  hasEnhancedData(): boolean {
    return !!(this.result?.components && this.result?.frame_analysis);
  }
  
  getVerdictLabel(): string {
    return this.isFake ? 'DEEPFAKE' : 'AUTHENTIC';
  }
  
  getConfidenceLevel(): 'high' | 'moderate' | 'low' {
    if (!this.confidence) return 'low';
    if (this.confidence > 0.7) return 'high';
    if (this.confidence > 0.5) return 'moderate';
    return 'low';
  }
}