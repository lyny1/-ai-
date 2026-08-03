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

  // Calculate 7 Specific Behavioral Metrics (Nicotine & Drug Specific dynamics)
  let totalDistance = 120; // mm/min baseline
  let turnCount = 5; // turns/min baseline
  let bodyBendingDegree = 8; // degrees baseline
  let spasmFrequency = 0.5; // events/min baseline
  let lightAvoidanceResponse = 98; // % baseline
  let motorRecoveryTimeHours = 2; // hours baseline

  if (drug.id === 'nicotine') {
    const timeFactor = Math.min(2.5, Math.pow(config.exposureHours / 24, 0.7));
    const concTimeEffect = concFactor * timeFactor;

    if (config.deliveryMethod === 'targeted') {
      if (config.cutLocation === 'anterior') {
        // 머리 국소 침지: 머리 신경절 및 감각 처리 기능 우선 영향
        // - 방향 결정 능력 & 빛 회피 반응 저하
        // - 머리 흔들기 및 방향 전환 증가, 직선 이동 불안정
        // - 전신 심한 경련보다는 머리 중심의 탐색 행동 이상
        lightAvoidanceResponse = Math.max(15, Math.round(95 - concTimeEffect * 40));
        turnCount = Math.min(45, Math.round(6 + concTimeEffect * 22));
        glidingSpeed = Math.max(15, Math.round(75 - concTimeEffect * 25));
        bodyBendingDegree = Math.min(50, Math.round(12 + concTimeEffect * 18));
        spasmFrequency = Math.min(12, Math.round(1.5 + concTimeEffect * 4)); // 전신 경련 억제
        totalDistance = Math.max(25, Math.round(110 - concTimeEffect * 30));
        motorRecoveryTimeHours = Math.round(12 + concTimeEffect * 24);
      } else if (config.cutLocation === 'trunk') {
        // 몸통 국소 침지: 국소 근육 및 말초 신경 우선 영향
        // - 국소 수축, C/S자 굽힘, 비대칭 운동, 이동 속도 저하
        // - 농도/시간 증가 시 국소 수축이 인접 부위로 전이
        bodyBendingDegree = Math.min(90, Math.round(20 + concTimeEffect * 45)); // C/S자 굽힘 심화
        glidingSpeed = Math.max(10, Math.round(65 - concTimeEffect * 30));
        totalDistance = Math.max(20, Math.round(95 - concTimeEffect * 40));
        spasmFrequency = Math.min(25, Math.round(3 + concTimeEffect * 12));
        turnCount = Math.round(8 + concTimeEffect * 8);
        lightAvoidanceResponse = Math.max(40, Math.round(90 - concTimeEffect * 20));
        motorRecoveryTimeHours = Math.round(18 + concTimeEffect * 32);
      } else {
        // 꼬리 국소 침지: 꼬리 추진력 저하, 이동 궤적 곡선 변형, 머리 방향성 상대적 유지
        lightAvoidanceResponse = Math.max(65, Math.round(95 - concTimeEffect * 15)); // 머리 감각 유지
        glidingSpeed = Math.max(20, Math.round(70 - concTimeEffect * 28)); // 추진력 감소
        totalDistance = Math.max(30, Math.round(100 - concTimeEffect * 32));
        turnCount = Math.round(5 + concTimeEffect * 6);
        bodyBendingDegree = Math.min(45, Math.round(10 + concTimeEffect * 15));
        spasmFrequency = Math.min(10, Math.round(1 + concTimeEffect * 5));
        motorRecoveryTimeHours = Math.round(10 + concTimeEffect * 20);
      }

      // 절단면 국소 침지 공통: 신경 재연결 및 운동 기능 회복 시간 지연
      motorRecoveryTimeHours = Math.round(motorRecoveryTimeHours * (1 + concFactor * 0.5));
    } else {
      // 전신 침지 (Submersion): 전신적 운동 협응 저하, 반복 행동, 몸체 떨림/경련, 방향 전환 급증, 총 이동 거리 급감
      totalDistance = Math.max(10, Math.round(110 - concTimeEffect * 55));
      turnCount = Math.min(50, Math.round(12 + concTimeEffect * 28));
      bodyBendingDegree = Math.min(85, Math.round(15 + concTimeEffect * 40));
      spasmFrequency = Math.min(35, Math.round(5 + concTimeEffect * 20));
      lightAvoidanceResponse = Math.max(10, Math.round(90 - concTimeEffect * 48));
      glidingSpeed = Math.max(5, Math.round(50 - concTimeEffect * 35));
      motorRecoveryTimeHours = Math.round(36 + concTimeEffect * 48); // 전신 노출로 회복 지연
    }
  } else if (drug.id === 'caffeine') {
    turnCount = Math.min(40, Math.round(8 + concFactor * 18)); // Head waving
    totalDistance = Math.max(40, Math.round(120 - concFactor * 25));
    lightAvoidanceResponse = Math.max(50, Math.round(95 - concFactor * 20));
    spasmFrequency = Math.min(15, Math.round(2 + concFactor * 6));
    bodyBendingDegree = Math.min(40, Math.round(10 + concFactor * 12));
    motorRecoveryTimeHours = Math.round(8 + concFactor * 12);
  } else if (drug.id === 'ethanol') {
    totalDistance = Math.max(5, Math.round(110 - concFactor * 60)); // Hypokinesia
    turnCount = Math.max(1, Math.round(5 - concFactor * 2));
    lightAvoidanceResponse = Math.max(15, Math.round(90 - concFactor * 45));
    spasmFrequency = Math.max(0, Math.round(1 - concFactor));
    bodyBendingDegree = Math.min(30, Math.round(5 + concFactor * 8));
    motorRecoveryTimeHours = Math.round(24 + concFactor * 36);
  } else {
    totalDistance = Math.max(30, Math.round(115 - concFactor * 35));
    turnCount = Math.round(5 + concFactor * 10);
    bodyBendingDegree = Math.round(8 + concFactor * 15);
    spasmFrequency = Math.round(1 + concFactor * 8);
    lightAvoidanceResponse = Math.max(40, Math.round(95 - concFactor * 25));
    motorRecoveryTimeHours = Math.round(12 + concFactor * 18);
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

  // Generate 14-day dynamic time series data based on physiological response curves
  const timeSeries: DailyMetric[] = [];
  const exposureDays = config.exposureHours / 24;

  for (let day = 0; day <= 14; day++) {
    // Sigmoidal growth curve for regeneration rate
    const midpoint = completeEta * 0.6;
    const k = 0.55;
    const progressFactor = 1 / (1 + Math.exp(-k * (day - midpoint)));
    
    const dayRegen = Math.min(100, Math.round(finalRegen14 * progressFactor * 100) / 100);
    const blastemaSize = Math.min(100, Math.round(dayRegen * 0.95));

    // Neoblast Cell Division (Mitotic Burst Curve):
    // Bi-phasic proliferation peak around Day 1 (systemic wound response) and Day 3 (blastema-specific proliferation),
    // followed by cell differentiation into tissue lineages (Day 5-14).
    let dayStemCell = stemCellIndex;
    if (day === 0) {
      dayStemCell = Math.max(10, stemCellIndex * 0.85); // Immediate wound shock drop
    } else if (day === 1) {
      dayStemCell = Math.min(100, stemCellIndex * 1.28); // First mitotic peak
    } else if (day === 2) {
      dayStemCell = Math.min(100, stemCellIndex * 1.15);
    } else if (day === 3) {
      dayStemCell = Math.min(100, stemCellIndex * 1.25); // Second mitotic peak (blastema formation)
    } else if (day === 4) {
      dayStemCell = Math.min(100, stemCellIndex * 1.05);
    } else {
      // Differentiation phase: proliferation drops back to basal homeostatic level
      const diffDecay = Math.exp(-0.25 * (day - 4));
      dayStemCell = Math.max(20, Math.min(100, stemCellIndex * (0.65 + 0.35 * diffDecay)));
    }

    const eyeSpotVisible = day >= eyeEta;

    // Behavioral Dynamics (Hyperkinesia, Scrunching, Stress, and Gliding Locomotion):
    let dayScrunch = scrunchFreq;
    let dayHyper = hyperScore;
    let dayStress = stressIndex;

    if (day <= exposureDays) {
      // Active exposure phase (Day 0 to exposure end)
      if (day === 0 || day === 1) {
        // Acute neuro-excitation peak
        dayHyper = Math.min(100, hyperScore * 1.2);
        dayScrunch = scrunchFreq * 1.25;
        dayStress = Math.min(100, stressIndex * 1.15);
      } else {
        // Neuro-receptor desensitization (tachyphylaxis) / habituation under continuous exposure
        const adaptDays = day - 1;
        const adaptFactor = Math.exp(-0.15 * adaptDays);
        dayHyper = Math.max(15, hyperScore * (0.5 + 0.5 * adaptFactor));
        dayScrunch = Math.max(0.5, scrunchFreq * (0.4 + 0.6 * adaptFactor));
        dayStress = Math.max(15, stressIndex * (0.6 + 0.4 * adaptFactor));
      }
    } else {
      // Post-washout recovery phase (after exposure hours end)
      const daysAfterWashout = day - exposureDays;
      const washoutDecay = Math.exp(-0.5 * daysAfterWashout);

      dayHyper = Math.max(10, hyperScore * (0.15 + 0.85 * washoutDecay));
      dayScrunch = Math.max(0.2, scrunchFreq * washoutDecay);
      dayStress = Math.max(10, stressIndex * (0.2 + 0.8 * washoutDecay));
    }

    // Gliding speed locomotion efficiency (0-100%):
    // Day 0 drop due to injury & spasms -> progressively recovers as cilia regenerate & brain reconnects
    let baseGlidingRecovery = Math.min(100, 20 + (day / 14) * 75); // Ciliary restoration baseline curve
    let motilityInhibition = (dayScrunch * 3.5) + (dayHyper * 0.4) + (dayStress > 30 ? (dayStress - 30) * 0.8 : 0);

    let dayGliding = Math.max(5, Math.min(100, baseGlidingRecovery - motilityInhibition));

    if (drug.id === 'ethanol') {
      // Ethanol sedation suppresses locomotion directly
      const sedationFactor = Math.min(1.0, concFactor * 0.6);
      if (day <= exposureDays) {
        dayGliding = Math.max(5, (100 - sedationFactor * 75) * (0.3 + 0.7 * (day / 14)));
      } else {
        const postWashout = day - exposureDays;
        dayGliding = Math.min(100, 30 + postWashout * 12);
      }
    }

    if (config.deliveryMethod === 'targeted') {
      // Targeted patch protects ventral ciliary tracts, accelerating locomotion recovery
      dayGliding = Math.min(100, Math.round(dayGliding * 1.35 + 25));
    }

    // Survival rate declines over time if toxic
    const daySurvival = Math.max(0, Math.round(100 - (100 - survivalRate) * (day / 14)));

    // Daily progression scaling for behavioral metrics
    const dayDist = Math.round(totalDistance * Math.min(1.0, 0.4 + (day / 14) * 0.6));
    const dayTurn = Math.round(turnCount * Math.max(0.3, 1.2 - (day / 14) * 0.4));
    const dayBend = Math.round(bodyBendingDegree * Math.max(0.2, 1.1 - (day / 14) * 0.5));
    const daySpasm = Math.round(spasmFrequency * Math.max(0.1, 1.2 - (day / 14) * 0.6) * 10) / 10;
    const dayLight = Math.round(lightAvoidanceResponse * Math.min(1.0, 0.5 + (day / 14) * 0.5));

    timeSeries.push({
      day,
      regenerationRate: Math.round(dayRegen),
      blastemaSizeScore: Math.round(blastemaSize),
      stemCellActivity: Math.round(dayStemCell),
      eyeSpotVisible,
      scrunchingFreq: Math.round(dayScrunch * 10) / 10,
      hyperkinesiaScore: Math.round(dayHyper),
      hyperkinesiaType,
      hyperkinesiaTypeLabelKo,
      glidingSpeed: Math.round(dayGliding),
      stressIndex: Math.round(dayStress),
      survivalRate: Math.round(daySurvival),

      totalDistance: dayDist,
      turnCount: dayTurn,
      bodyBendingDegree: dayBend,
      spasmFrequency: daySpasm,
      lightAvoidanceResponse: dayLight,
      motorRecoveryTimeHours: motorRecoveryTimeHours,
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

    totalDistance: Math.round(totalDistance),
    turnCount: Math.round(turnCount),
    bodyBendingDegree: Math.round(bodyBendingDegree),
    spasmFrequency: Math.round(spasmFrequency * 10) / 10,
    lightAvoidanceResponse: Math.round(lightAvoidanceResponse),
    motorRecoveryTimeHours: Math.round(motorRecoveryTimeHours),

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
