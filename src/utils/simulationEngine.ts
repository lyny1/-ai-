import {
  ExperimentConfig,
  SimulationResult,
  ComparisonResults,
  DailyMetric,
  LiteratureEntry,
  CutLocation,
} from '../types';
import { INITIAL_DRUGS, INITIAL_LITERATURE_DATABASE } from '../data/literatureDatabase';

/**
 * Finds the best matching paper in the literature database
 */
export function findMatchingLiterature(
  config: ExperimentConfig,
  database: LiteratureEntry[] = INITIAL_LITERATURE_DATABASE
): { paper?: LiteratureEntry; confidence: 'high' | 'moderate' | 'low'; confidenceLabelKo: string } {
  const drugPapers = database.filter((p) => p.drugId === config.drugId);

  if (drugPapers.length === 0) {
    return { confidence: 'low', confidenceLabelKo: '낮음 (AI 추정)' };
  }

  // Look for exact or very close concentration and cut location
  let exactMatch = drugPapers.find(
    (p) =>
      p.cutLocation === config.cutLocation &&
      config.concentration >= p.minConcValue &&
      config.concentration <= p.maxConcValue
  );

  if (exactMatch) {
    return { paper: exactMatch, confidence: 'high', confidenceLabelKo: '높음 (동일 조건 논문)' };
  }

  // Check if concentration falls within any paper's range regardless of cut location
  let concMatch = drugPapers.find(
    (p) => config.concentration >= p.minConcValue * 0.7 && config.concentration <= p.maxConcValue * 1.3
  );

  if (concMatch) {
    return { paper: concMatch, confidence: 'moderate', confidenceLabelKo: '보통 (유사 조건 논문 기반 예측)' };
  }

  // Pick nearest paper
  let sorted = [...drugPapers].sort((a, b) => {
    const avgA = (a.minConcValue + a.maxConcValue) / 2;
    const avgB = (b.minConcValue + b.maxConcValue) / 2;
    return Math.abs(avgA - config.concentration) - Math.abs(avgB - config.concentration);
  });

  return { paper: sorted[0], confidence: 'moderate', confidenceLabelKo: '보통 (유사 조건 논문 기반 예측)' };
}

/**
 * Simulates planarian regeneration and behavioral stress for a given configuration
 */
export function runSimulation(
  config: ExperimentConfig,
  customDb: LiteratureEntry[] = INITIAL_LITERATURE_DATABASE
): SimulationResult {
  const drug = INITIAL_DRUGS.find((d) => d.id === config.drugId) || INITIAL_DRUGS[0];
  const matchResult = findMatchingLiterature(config, customDb);
  const paper = matchResult.paper;

  // Normalized concentration factor relative to typical concentration
  const concFactor = config.concentration / (drug.typicalConc || 1);

  // Baseline control values (Water control: 100% regen in 7-10 days, zero drug stress)
  const baseRegenDay7 = 88;
  const baseRegenDay14 = 100;
  const baseStemCell = 95;
  const baseEyeEta = 4.0;
  const baseCompleteEta = 7.5;
  const baseScrunch = 1.0;
  const baseHyperkinesia = 15;
  const baseSurvival = 100;
  const baseStress = 10;

  let finalRegen14 = baseRegenDay14;
  let regenDay7 = baseRegenDay7;
  let stemCellIndex = baseStemCell;
  let eyeEta = baseEyeEta;
  let completeEta = baseCompleteEta;
  let scrunchFreq = baseScrunch;
  let hyperScore = baseHyperkinesia;
  let survivalRate = baseSurvival;
  let stressIndex = baseStress;

  if (paper) {
    // Scaling based on paper findings adjusted for exact concentration ratio
    const paperAvgConc = (paper.minConcValue + paper.maxConcValue) / 2 || config.concentration;
    const ratio = config.concentration / (paperAvgConc || 1);

    const severity = Math.min(Math.max(ratio, 0.2), 3.0);

    // Dose response model
    finalRegen14 = Math.max(10, Math.min(100, paper.findings.regenerationRateDay14 - (severity - 1) * 15));
    regenDay7 = Math.max(5, Math.min(95, paper.findings.regenerationRateDay7 - (severity - 1) * 18));
    stemCellIndex = Math.max(10, Math.min(100, paper.findings.stemCellActivityIndex - (severity - 1) * 20));

    eyeEta = Math.max(3, paper.findings.eyeSpotEtaDays * (1 + (severity - 1) * 0.25));
    completeEta = Math.max(6, paper.findings.completeEtaDays * (1 + (severity - 1) * 0.22));

    scrunchFreq = Math.max(0, paper.findings.scrunchingFrequency * Math.pow(severity, 0.8));
    hyperScore = Math.min(100, paper.findings.hyperkinesiaScore * Math.pow(severity, 0.7));

    // Survival drops if concentration is extremely high
    survivalRate = Math.max(0, Math.min(100, paper.findings.survivalRate - Math.max(0, ratio - 1.5) * 35));
    stressIndex = Math.min(100, paper.findings.stressIndex * Math.pow(severity, 0.6));
  } else {
    // Model fallback based on drug category if no paper match
    if (drug.id === 'nicotine') {
      scrunchFreq = 12 * Math.pow(concFactor, 0.9);
      hyperScore = Math.min(100, 70 * concFactor);
      stemCellIndex = Math.max(15, 90 - concFactor * 25);
      finalRegen14 = Math.max(15, 95 - concFactor * 20);
      stressIndex = Math.min(100, 35 + concFactor * 30);
    } else if (drug.id === 'caffeine') {
      scrunchFreq = 5 * concFactor;
      hyperScore = Math.min(100, 60 * concFactor);
      stemCellIndex = Math.max(20, 92 - concFactor * 15);
      finalRegen14 = Math.max(20, 98 - concFactor * 12);
      stressIndex = Math.min(100, 25 + concFactor * 20);
    } else if (drug.id === 'ethanol') {
      scrunchFreq = Math.max(0.2, 2.0 / concFactor);
      hyperScore = Math.max(5, 30 / concFactor);
      stemCellIndex = Math.max(10, 95 - concFactor * 30);
      finalRegen14 = Math.max(10, 95 - concFactor * 28);
      stressIndex = Math.min(100, 20 + concFactor * 35);
    } else {
      scrunchFreq = 6 * concFactor;
      hyperScore = Math.min(100, 50 * concFactor);
      stemCellIndex = Math.max(25, 90 - concFactor * 18);
      finalRegen14 = Math.max(25, 95 - concFactor * 15);
      stressIndex = Math.min(100, 25 + concFactor * 25);
    }
    eyeEta = 4.0 + concFactor * 2.2;
    completeEta = 7.5 + concFactor * 3.0;
  }

  // Adjust for Exposure Hours (24h exposure vs 168h continuous)
  const exposureRatio = Math.min(1.0, config.exposureHours / 168); // 168h = 7 days
  if (config.exposureHours < 168) {
    // Recovery factor after drug washout
    const recoveryFactor = 1 - exposureRatio * 0.4;
    finalRegen14 = Math.min(100, finalRegen14 * (1 + (1 - recoveryFactor) * 0.3));
    scrunchFreq = scrunchFreq * exposureRatio;
    stressIndex = stressIndex * (0.5 + exposureRatio * 0.5);
  }

  // Adjust for Delivery Method
  if (config.deliveryMethod === 'targeted') {
    // Hydrogel / Liposome / Nanoparticle local delivery concept
    // Key biological advantage: Reduces systemic neuro-muscular excitation while preserving therapeutic dose at wound plane.
    scrunchFreq = Math.max(0.5, scrunchFreq * 0.25); // 75% reduction in systemic scrunching
    hyperScore = Math.max(10, hyperScore * 0.35); // 65% reduction in hyperkinesia
    stressIndex = Math.max(12, stressIndex * 0.30); // 70% reduction in stress index
    
    // Neoblast regeneration is enhanced due to lack of systemic exhaustion and controlled release
    finalRegen14 = Math.min(100, finalRegen14 * 1.15);
    stemCellIndex = Math.min(100, stemCellIndex * 1.18);
    eyeEta = Math.max(3.5, eyeEta * 0.85);
    completeEta = Math.max(6.5, completeEta * 0.85);
    survivalRate = Math.min(100, survivalRate + (100 - survivalRate) * 0.6);
  }

  // Cut Location modifier (Anterior cuts regenerate eyes faster, Posterior cuts require brain re-patterning)
  if (config.cutLocation === 'anterior') {
    eyeEta = eyeEta * 0.8;
  } else if (config.cutLocation === 'posterior') {
    eyeEta = eyeEta * 1.35;
    completeEta = completeEta * 1.25;
  }

  // Gliding speed calculation (0-100% efficiency of smooth ventral ciliary gliding)
  let glidingSpeed = Math.max(0, Math.min(100, 100 - scrunchFreq * 4.5 - (stressIndex > 30 ? (stressIndex - 30) * 1.1 : 0)));
  if (drug.id === 'ethanol') {
    glidingSpeed = Math.max(5, 100 - concFactor * 45);
  }
  if (config.deliveryMethod === 'targeted') {
    glidingSpeed = Math.min(100, Math.round(glidingSpeed * 1.4 + 20));
  } else {
    glidingSpeed = Math.round(glidingSpeed);
  }

  // Determine Hyperkinesia Type (과운동증 신경 행동 유형)
  // Types: 'C-like', 'Snake-like', 'Screw-like', 'Normal', 'Hypokinesia'
  let hyperkinesiaType: 'C-like' | 'Snake-like' | 'Screw-like' | 'Normal' | 'Hypokinesia' = 'Normal';
  let hyperkinesiaTypeLabelKo = 'Normal (정상 활공 운동)';

  if (drug.id === 'ethanol' && config.concentration >= 0.3) {
    hyperkinesiaType = 'Hypokinesia';
    hyperkinesiaTypeLabelKo = 'Hypokinesia (운동성 저하 / 중추 억제)';
  } else if (hyperScore < 20) {
    hyperkinesiaType = 'Normal';
    hyperkinesiaTypeLabelKo = 'Normal (정상 활공 운동)';
  } else if (drug.id === 'caffeine') {
    hyperkinesiaType = 'Snake-like';
    hyperkinesiaTypeLabelKo = 'Snake-like (뱀 모양 S자 굴곡 파동 운동)';
  } else if (drug.id === 'nicotine') {
    if (config.concentration >= 0.8) {
      hyperkinesiaType = 'Screw-like';
      hyperkinesiaTypeLabelKo = 'Screw-like (나선형 회전 꼬임 과운동)';
    } else {
      hyperkinesiaType = 'C-like';
      hyperkinesiaTypeLabelKo = 'C-like (C형 수축 과운동)';
    }
  } else if (drug.id === 'acetylcholine') {
    hyperkinesiaType = 'C-like';
    hyperkinesiaTypeLabelKo = 'C-like (콜린성 C형 연속 연축)';
  } else if (drug.id === 'epinephrine') {
    hyperkinesiaType = 'Snake-like';
    hyperkinesiaTypeLabelKo = 'Snake-like (아드레날린성 파동 과운동)';
  } else {
    hyperkinesiaType = hyperScore > 50 ? 'Screw-like' : 'C-like';
    hyperkinesiaTypeLabelKo = `${hyperkinesiaType} (과운동증)`;
  }

  // Calculate Direct vs Indirect separation score
  const directNeoblastImpactScore = Math.round(100 - stemCellIndex);
  const indirectNeuroStressScore = Math.round(stressIndex);

  let primaryDriver: 'direct' | 'indirect' | 'balanced' | 'severe_toxic' = 'balanced';
  if (survivalRate < 60) {
    primaryDriver = 'severe_toxic';
  } else if (indirectNeuroStressScore > directNeoblastImpactScore + 20) {
    primaryDriver = 'indirect';
  } else if (directNeoblastImpactScore > indirectNeuroStressScore + 20) {
    primaryDriver = 'direct';
  }

  // Generate 14-day time series data
  const timeSeries: DailyMetric[] = [];
  for (let day = 0; day <= 14; day++) {
    // Sigmoidal growth curve for regeneration rate
    const midpoint = completeEta * 0.6;
    const k = 0.55;
    const progressFactor = 1 / (1 + Math.exp(-k * (day - midpoint)));
    
    const dayRegen = Math.min(100, Math.round(finalRegen14 * progressFactor * 100) / 100);
    const blastemaSize = Math.min(100, Math.round(dayRegen * 0.95));

    // Stem cell activity peaks around day 2-4 during early mitotic burst, then levels off
    let dayStemCell = stemCellIndex;
    if (day >= 1 && day <= 5) {
      dayStemCell = Math.min(100, stemCellIndex * (1 + 0.25 * Math.sin(((day - 1) / 4) * Math.PI)));
    }

    const eyeSpotVisible = day >= eyeEta;

    // Behavioral stress peaks early (Days 0-3) then adapts or declines as drug metabolizes
    let dayScrunch = scrunchFreq;
    let dayStress = stressIndex;
    if (config.exposureHours < 168 && day > config.exposureHours / 24) {
      const daysAfterWashout = day - config.exposureHours / 24;
      const decay = Math.exp(-0.4 * daysAfterWashout);
      dayScrunch = Math.max(0.5, scrunchFreq * decay);
      dayStress = Math.max(10, stressIndex * (0.3 + 0.7 * decay));
    }

    // Daily gliding speed
    let dayGliding = Math.max(0, Math.min(100, 100 - dayScrunch * 4.5 - (dayStress > 30 ? (dayStress - 30) * 1.1 : 0)));
    if (drug.id === 'ethanol') {
      dayGliding = Math.max(5, 100 - concFactor * 45);
    }
    if (config.deliveryMethod === 'targeted') {
      dayGliding = Math.min(100, dayGliding * 1.4 + 20);
    }

    // Survival rate declines over time if toxic
    const daySurvival = Math.max(0, Math.round(100 - (100 - survivalRate) * (day / 14)));

    timeSeries.push({
      day,
      regenerationRate: Math.round(dayRegen),
      blastemaSizeScore: Math.round(blastemaSize),
      stemCellActivity: Math.round(dayStemCell),
      eyeSpotVisible,
      scrunchingFreq: Math.round(dayScrunch * 10) / 10,
      hyperkinesiaScore: Math.round(hyperScore),
      hyperkinesiaType,
      hyperkinesiaTypeLabelKo,
      glidingSpeed: Math.round(dayGliding),
      stressIndex: Math.round(dayStress),
      survivalRate: Math.round(daySurvival),
    });
  }

  return {
    config,
    drug,
    confidence: matchResult.confidence,
    confidenceLabelKo: matchResult.confidenceLabelKo,
    matchingPaper: paper,

    finalRegenerationRate: Math.round(finalRegen14),
    blastemaFormationScore: Math.round(finalRegen14 * 0.9),
    stemCellActivityIndex: Math.round(stemCellIndex),
    eyeSpotEtaDays: Math.round(eyeEta * 10) / 10,
    completeEtaDays: Math.round(completeEta * 10) / 10,
    scrunchingFrequency: Math.round(scrunchFreq * 10) / 10,
    hyperkinesiaScore: Math.round(hyperScore),
    hyperkinesiaType,
    hyperkinesiaTypeLabelKo,
    glidingSpeed: Math.round(glidingSpeed),
    survivalRate: Math.round(survivalRate),
    stressIndex: Math.round(stressIndex),

    directNeoblastImpactScore,
    indirectNeuroStressScore,
    primaryDriver,

    timeSeries,
  };
}

/**
 * Runs a side-by-side comparison for Submersion vs Targeted Delivery
 */
export function runSideBySideComparison(
  config: Omit<ExperimentConfig, 'deliveryMethod'>,
  customDb: LiteratureEntry[] = INITIAL_LITERATURE_DATABASE
): ComparisonResults {
  const submersionConfig: ExperimentConfig = { ...config, deliveryMethod: 'submersion' };
  const targetedConfig: ExperimentConfig = { ...config, deliveryMethod: 'targeted' };

  return {
    submersion: runSimulation(submersionConfig, customDb),
    targeted: runSimulation(targetedConfig, customDb),
  };
}
