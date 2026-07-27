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
  modelUsed: 'gemini-3.1-pro-preview';
  queryTime: string;
}
