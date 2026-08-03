/**
 * Types for Planarian Neoblast Regeneration & Drug Effect Simulator
 */

export type CutLocation = 'anterior' | 'trunk' | 'posterior';
export type CutType = 'transverse' | 'longitudinal' | 'tripartite';
export type DeliveryMethod = 'submersion' | 'targeted';

export interface DrugInfo {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  categoryKo?: string;
  defaultUnit: string;
  minConc: number;
  maxConc: number;
  stepConc: number;
  typicalConc: number;
  description: string;
  descriptionKo: string;
  mechanismDirect: string; // Stem cell / neoblast pathway
  mechanismIndirect: string; // Neuro-muscular / stress pathway
  molecularFormula?: string;
}

export interface LiteratureEntry {
  id: string;
  drugId: string;
  drugName: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi?: string;
  pubmedId?: string;
  concentration: string;
  minConcValue: number;
  maxConcValue: number;
  cutLocation: CutLocation;
  findings: {
    regenerationRateDay7: number; // %
    regenerationRateDay14: number; // %
    stemCellActivityIndex: number; // 0-100
    eyeSpotEtaDays: number;
    completeEtaDays: number;
    scrunchingFrequency: number; // events/min
    hyperkinesiaScore: number; // 0-100
    survivalRate: number; // %
    stressIndex: number; // 0-100
  };
  notes: string;
  isRealData: boolean;
}

export interface ExperimentConfig {
  drugId: string;
  concentration: number; // in drug's unit (e.g. uM, mM, %)
  unit: string;
  exposureHours: number; // e.g. 24, 48, 72, continuous (168)
  cutLocation: CutLocation;
  cutType?: CutType;
  deliveryMethod: DeliveryMethod;
}

export interface DailyMetric {
  day: number;
  regenerationRate: number; // 0-100%
  blastemaSizeScore: number; // 0-100
  stemCellActivity: number; // 0-100
  eyeSpotVisible: boolean;
  scrunchingFreq: number; // events/min (C-shape repetitive longitudinal contractions)
  hyperkinesiaScore: number; // 0-100
  hyperkinesiaType: 'C-like' | 'Snake-like' | 'Screw-like' | 'Normal' | 'Hypokinesia';
  hyperkinesiaTypeLabelKo: string;
  glidingSpeed: number; // 0-100% (smooth ciliary gliding locomotion mm/s efficiency)
  stressIndex: number; // 0-100
  survivalRate: number; // %

  // Detailed Nicotine & Behavioral Metrics
  totalDistance?: number; // 총 이동 거리 (mm / min)
  turnCount?: number; // 방향 전환 횟수 (회 / min)
  bodyBendingDegree?: number; // 몸체 굽힘 정도 (°)
  spasmFrequency?: number; // 경련/떨림 빈도 (회 / min)
  lightAvoidanceResponse?: number; // 빛 회피 반응성 (0-100%)
  motorRecoveryTimeHours?: number; // 운동 기능 회복 필요 시간 (hours)
}

export interface SimulationResult {
  config: ExperimentConfig;
  drug: DrugInfo;
  confidence: 'high' | 'moderate' | 'low'; // 높음, 보통, 낮음
  confidenceLabelKo: string;
  matchingPaper?: LiteratureEntry;
  
  // Single-value endpoints
  finalRegenerationRate: number; // % at Day 14
  blastemaFormationScore: number; // 0-100
  stemCellActivityIndex: number; // 0-100
  eyeSpotEtaDays: number;
  completeEtaDays: number;
  scrunchingFrequency: number; // events/min (근육 C-shape 수축)
  hyperkinesiaScore: number; // 0-100 (신경 과운동증 지표)
  hyperkinesiaType: 'C-like' | 'Snake-like' | 'Screw-like' | 'Normal' | 'Hypokinesia';
  hyperkinesiaTypeLabelKo: string;
  glidingSpeed: number; // 0-100% (ciliary locomotion efficiency)
  survivalRate: number; // %
  stressIndex: number; // 0-100
  
  // Detailed Nicotine & Behavioral Metrics (Endpoints)
  totalDistance: number; // 총 이동 거리 (mm)
  turnCount: number; // 방향 전환 횟수 (회/분)
  bodyBendingDegree: number; // 몸체 굽힘 정도 (°)
  spasmFrequency: number; // 경련/떨림 빈도 (회/분)
  lightAvoidanceResponse: number; // 빛 회피 반응성 (%)
  motorRecoveryTimeHours: number; // 운동 기능 회복 필요 시간 (시간)
  
  // Direct vs Indirect separation
  directNeoblastImpactScore: number; // 0-100 (mitosis & migration impairment)
  indirectNeuroStressScore: number; // 0-100 (neuro-muscular hyper-excitation / scrunching)
  primaryDriver: 'direct' | 'indirect' | 'balanced' | 'severe_toxic';
  
  // Time-series metrics (Day 0 - 14)
  timeSeries: DailyMetric[];
}

export interface ComparisonResults {
  submersion: SimulationResult;
  targeted: SimulationResult;
}

export interface ExperimentTab {
  id: string;
  title: string;
  config: ExperimentConfig;
}

export interface TargetedDeliveryTechParams {
  biomaterial: string; // e.g. "Photo-crosslinkable GelMA / Chitosan Hydrogel Patch"
  releaseKinetics: string; // e.g. "Zero-order local matrix diffusion (24-72h release)"
  neuroShieldingEfficiency: number; // e.g. 75% reduction in systemic CNS exposure
  blastemaTargetingAffinity: number; // e.g. 90% localized accumulation at wound site
  diffusionRate: number; // e.g. 100% (40% - 200% dynamic drug diffusion coefficient)
  mmpCleavageTrigger: boolean; // Matrix Metalloproteinase wound-cleavable bonds
}

export interface GeminiAnalysisResponse {
  literatureMatchSummary: string;
  directNeoblastMechanism: string;
  indirectNeuroStressMechanism: string;
  deliveryMethodComparison: string;
  scientificConclusion: string;
  references: {
    title: string;
    authors: string;
    year: number;
    journal: string;
    doi?: string;
    pubmedId?: string;
    isRealData: boolean;
  }[];
}
