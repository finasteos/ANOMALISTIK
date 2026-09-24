export type TrackCode = 'A/B' | 'G-Series' | 'R-Series' | 'N-Series';

export type VerdictStatus = 
  | 'STRUCTURE_SIGNAL' 
  | 'SEQUENCE_STRUCTURE' 
  | 'DIP_STRUCTURE' 
  | 'CLAIM_FAILS_NULL' 
  | 'UNDERDETERMINED' 
  | 'NEVER_ATTEMPTED' 
  | 'INSTRUMENT_SYSTEMATICS';

export interface DataDomain {
  id: string;
  code: string;
  track: TrackCode;
  title: string;
  category: string;
  description: string;
  keySources: string[];
  metrics: string[];
  verdict: VerdictStatus;
  zScore?: number | string;
  keyHighlights: string[];
  yearRange?: string;
  severityScore?: number;
}

export interface EpigraphicCorpus {
  id: string;
  name: string;
  code: string;
  origin: string;
  sampleSize: string;
  zScore: number;
  condEntropy: number;
  shuffleNullEntropy: number;
  ic: number; // Index of Coincidence
  refrains?: string[];
  verdict: VerdictStatus;
  keyFindings: string;
  yearBCEorCE?: string;
}

export interface BiophysicalMarker {
  id: string;
  name: string;
  category: 'Anatomical' | 'Mineralogical' | 'Germinal' | 'Cellular';
  mechanism: string;
  metric: string;
  anomalousBaseline: string;
  naturalBaseline: string;
  caseStudies: string[];
  hoaxReplicationDifficulty: 'Impossible with planks' | 'Requires high heat' | 'Unreplicated';
  description: string;
}

export interface MEngine {
  id: string;
  code: 'M1' | 'M2' | 'M3' | 'M4';
  title: string;
  subtitle: string;
  streamA: string;
  streamB: string;
  analyticalTool: string;
  primaryHypothesis: string;
  status: VerdictStatus;
  description: string;
  keyMetrics: string[];
  severityLevel?: 'Low' | 'Moderate' | 'High' | 'Extreme';
}

export interface LabMission {
  id: string;
  code: string;
  title: string;
  domain: string;
  targetObject: string;
  methodology: string;
  status: VerdictStatus;
  zScoreOrMetric: string;
  summary: string;
  year?: number;
  yearRange?: string;
  severityScore?: number; // 0-100 scale for filtering by severity
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchGroundedResponse {
  answer: string;
  groundingChunks: GroundingChunk[];
  queryTime: string;
}

export interface HighThinkingResponse {
  reasoningText?: string;
  answer: string;
  thinkingLevel: 'HIGH';
  modelUsed: string;
  queryTime: string;
}

// Canonical project schema (TASKLIST F3) — single source of truth.
// AtlasOverview uses the base; ProjectTrackerSection extends with tasks/logs.
export interface ActiveProjectSchema {
  anomaly_id: string;
  code: string;
  title: string;
  domain: string;
  target_tab: string;
  status: 'STRUCTURE_SIGNAL' | 'SEQUENCE_STRUCTURE' | 'DIP_STRUCTURE' | 'UNDERDETERMINED' | 'INSTRUMENT_SYSTEMATICS' | 'CLAIM_FAILS_NULL';
  progress_percentage: number;
  last_anomaly_timestamp: string;
  metrics: {
    z_score?: number | string;
    conditional_entropy?: number | string;
    snr_db?: number;
    periodicity_days?: number;
    elongation_pct?: number;
    synchronicity_ly?: string;
    [key: string]: any;
  };
  negative_controls_applied: string[];
  repo_file_path: string;
  summary: string;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  completed: boolean;
  assigned_role: string;
}

export interface ProjectLogEntry {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

export interface TrackedProject extends ActiveProjectSchema {
  tasks: ProjectTaskItem[];
  logs: ProjectLogEntry[];
}
