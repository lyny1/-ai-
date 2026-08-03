import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ExperimentControls } from './components/ExperimentControls';
import { PlanarianCanvas } from './components/PlanarianCanvas';
import { SideBySideComparison } from './components/SideBySideComparison';
import { MetricsCharts } from './components/MetricsCharts';
import { AiAnalysisSection } from './components/AiAnalysisSection';
import { LiteratureReferences } from './components/LiteratureReferences';
import { DatabaseManagerModal } from './components/DatabaseManagerModal';
import { ResearchGuideModal } from './components/ResearchGuideModal';
import { TargetedTechModal } from './components/TargetedTechModal';

import { INITIAL_DRUGS, INITIAL_LITERATURE_DATABASE } from './data/literatureDatabase';
import { ExperimentConfig, LiteratureEntry, DrugInfo, ExperimentTab, TargetedDeliveryTechParams } from './types';
import { runSideBySideComparison } from './utils/simulationEngine';
import { Activity, Sparkles, Zap, Brain, Dna, HelpCircle, Layers, Bot, BookOpen, Split, CheckCircle2 } from 'lucide-react';

// Helper function for dynamic tab title generation
const getDynamicTabTitle = (config: ExperimentConfig, index: number, drugList: DrugInfo[]) => {
  const drug = drugList.find((d) => d.id === config.drugId);
  const drugName = drug ? drug.nameKo.split(' ')[0] : config.drugId;
  const delivery = config.deliveryMethod === 'targeted' ? '국소' : '침지';
  return `조건 ${index + 1}: ${drugName} ${config.concentration}${config.unit} (${delivery})`;
};

export default function App() {
  const [drugs, setDrugs] = useState<DrugInfo[]>(INITIAL_DRUGS);
  const [database, setDatabase] = useState<LiteratureEntry[]>(INITIAL_LITERATURE_DATABASE);

  // Multi-Tab Experiment Setup Profiles
  const [tabs, setTabs] = useState<ExperimentTab[]>([
    {
      id: 'tab-1',
      title: '조건 1: 니코틴 0.2mM (침지)',
      config: {
        drugId: 'nicotine',
        concentration: 0.2,
        unit: 'mM',
        exposureHours: 48,
        cutLocation: 'trunk',
        deliveryMethod: 'submersion',
      },
    },
    {
      id: 'tab-2',
      title: '조건 2: 니코틴 0.2mM (국소 패치)',
      config: {
        drugId: 'nicotine',
        concentration: 0.2,
        unit: 'mM',
        exposureHours: 48,
        cutLocation: 'trunk',
        deliveryMethod: 'targeted',
      },
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Dual View Mode State
  const [isDualMode, setIsDualMode] = useState<boolean>(false);
  const [dualTabId, setDualTabId] = useState<string>('tab-2');

  const [selectedDay, setSelectedDay] = useState<number>(7);

  // Modals
  const [isDatabaseOpen, setIsDatabaseOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTargetedTechOpen, setIsTargetedTechOpen] = useState<boolean>(false);

  // Targeted Delivery Tech Parameters
  const [targetedTechParams, setTargetedTechParams] = useState<TargetedDeliveryTechParams>({
    biomaterial: 'Photo-crosslinkable GelMA / Chitosan Hydrogel Patch',
    releaseKinetics: 'Zero-order local matrix diffusion (24-72h release)',
    neuroShieldingEfficiency: 75,
    blastemaTargetingAffinity: 90,
    diffusionRate: 100,
    mmpCleavageTrigger: true,
  });

  // Current Active Tab
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Secondary Tab for Dual Mode
  const dualTab = useMemo(() => {
    return tabs.find((t) => t.id === dualTabId) || tabs[1] || tabs[0];
  }, [tabs, dualTabId]);

  // Current active drug info
  const activeDrug = useMemo(() => {
    return drugs.find((d) => d.id === activeTab.config.drugId) || drugs[0];
  }, [drugs, activeTab.config.drugId]);

  // Run Side-by-Side Comparison Engine for Active Tab
  const activeComparisonResults = useMemo(() => {
    return runSideBySideComparison(activeTab.config, database);
  }, [activeTab.config, database]);

  // Run Side-by-Side Comparison Engine for Secondary Dual Tab
  const dualComparisonResults = useMemo(() => {
    return runSideBySideComparison(dualTab.config, database);
  }, [dualTab.config, database]);

  // Simulation result for active tab's selected delivery method
  const currentSimulation =
    activeTab.config.deliveryMethod === 'targeted'
      ? activeComparisonResults.targeted
      : activeComparisonResults.submersion;

  const currentDualSimulation =
    dualTab.config.deliveryMethod === 'targeted'
      ? dualComparisonResults.targeted
      : dualComparisonResults.submersion;

  // Active config updater
  const handleUpdateActiveConfig = (newConfig: ExperimentConfig) => {
    setTabs((prev) =>
      prev.map((tab, idx) =>
        tab.id === activeTabId
          ? {
              ...tab,
              config: newConfig,
              title: getDynamicTabTitle(newConfig, idx, drugs),
            }
          : tab
      )
    );
  };

  // Tab Manager Handlers
  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const defaultConfig: ExperimentConfig = {
      drugId: 'ethanol',
      concentration: 0.5,
      unit: '%',
      exposureHours: 48,
      cutLocation: 'trunk',
      cutType: 'transverse',
      deliveryMethod: 'submersion',
    };
    const newTab: ExperimentTab = {
      id: newId,
      title: getDynamicTabTitle(defaultConfig, tabs.length, drugs),
      config: defaultConfig,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleDuplicateTab = (targetTabId?: string) => {
    const idToDup = targetTabId || activeTabId;
    const targetTab = tabs.find((t) => t.id === idToDup) || activeTab;
    const newId = `tab-${Date.now()}`;
    const duplicatedConfig: ExperimentConfig = { ...targetTab.config };
    const baseTitle = getDynamicTabTitle(duplicatedConfig, tabs.length, drugs);
    const newTab: ExperimentTab = {
      id: newId,
      title: `${baseTitle} (복제)`,
      config: duplicatedConfig,
    };
    const targetIdx = tabs.findIndex((t) => t.id === idToDup);
    if (targetIdx !== -1) {
      const updated = [...tabs];
      updated.splice(targetIdx + 1, 0, newTab);
      setTabs(updated);
    } else {
      setTabs((prev) => [...prev, newTab]);
    }
    setActiveTabId(newId);
  };

  const handleReorderTabs = (reorderedTabs: ExperimentTab[]) => {
    setTabs(reorderedTabs);
  };

  const handleDeleteTab = (idToDelete: string) => {
    if (tabs.length <= 1) return;
    const filtered = tabs.filter((t) => t.id !== idToDelete);
    setTabs(filtered);
    if (activeTabId === idToDelete) {
      setActiveTabId(filtered[0].id);
    }
    if (dualTabId === idToDelete) {
      setDualTabId(filtered[0].id);
    }
  };

  // Preset Handlers
  const handleApplyPreset = (presetKey: string) => {
    let presetConfig: ExperimentConfig;
    switch (presetKey) {
      case 'nicotine_stress':
        presetConfig = {
          drugId: 'nicotine',
          concentration: 0.2,
          unit: 'mM',
          exposureHours: 48,
          cutLocation: 'trunk',
          deliveryMethod: 'submersion',
        };
        break;
      case 'ethanol_arrest':
        presetConfig = {
          drugId: 'ethanol',
          concentration: 0.5,
          unit: '%',
          exposureHours: 168,
          cutLocation: 'anterior',
          deliveryMethod: 'submersion',
        };
        break;
      case 'caffeine_motility':
        presetConfig = {
          drugId: 'caffeine',
          concentration: 0.5,
          unit: 'mM',
          exposureHours: 72,
          cutLocation: 'trunk',
          deliveryMethod: 'submersion',
        };
        break;
      case 'ach_cholinergic':
        presetConfig = {
          drugId: 'acetylcholine',
          concentration: 100,
          unit: 'µM',
          exposureHours: 168,
          cutLocation: 'posterior',
          deliveryMethod: 'submersion',
        };
        break;
      default:
        return;
    }
    handleUpdateActiveConfig(presetConfig);
  };

  const handleAddPaper = (entry: LiteratureEntry) => {
    setDatabase((prev) => [entry, ...prev]);
  };

  const handleImportDatabase = (entries: LiteratureEntry[]) => {
    setDatabase(entries);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#2a2a24] font-sans selection:bg-[#5a5a40] selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        paperCount={database.length}
        onOpenDatabaseManager={() => setIsDatabaseOpen(true)}
        onOpenResearchGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Body */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Research Question Banner */}
        <div className="p-4 bg-white border border-[#e5e5e0] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5" />
              학술 논문 기반 시뮬레이션 모델 (Paper-Backed Research Model)
            </span>
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1a1a1a]">
              직접적 줄기세포(Neoblast) 재생 영향 vs 간접적 신경계 자극 스트레스 구분
            </h2>
            <p className="text-xs text-[#6a6a60] break-keep">
              {activeDrug.nameKo} ({activeTab.config.concentration} {activeDrug.defaultUnit}) 조건에서 줄기세포(Neoblast) 재생 직접 영향 및 {activeDrug.category} 계열 신경 행동 반응 분석
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs bg-[#e2e8d5] text-[#4a5a30] border border-[#c5d898] px-3 py-1 rounded-full font-semibold">
              신뢰도: {currentSimulation.confidenceLabelKo}
            </span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-1.5 rounded-lg bg-[#f5f5f0] hover:bg-[#eaeae2] text-[#5a5a40] text-xs transition cursor-pointer"
              title="원리 가이드"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SIDE-BY-SIDE SPLIT WORKSPACE GRID (LEFT: CONTROLS & COMPARISON, RIGHT: SIMULATOR & QUANTITATIVE ANALYSIS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT COLUMN: WINDOW 1 (실험 설정 & 처리 방식 비교 분석) */}
          <div className="space-y-6 min-w-0">
            {/* 1. Experimental Setup Controls with Multi-Tab & Dual Mode Toggle */}
            <ExperimentControls
              drugs={drugs}
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onAddTab={handleAddTab}
              onDuplicateTab={handleDuplicateTab}
              onDeleteTab={handleDeleteTab}
              onReorderTabs={handleReorderTabs}
              isDualMode={isDualMode}
              onToggleDualMode={() => setIsDualMode((prev) => !prev)}
              dualTabId={dualTabId}
              onSelectDualTab={setDualTabId}
              config={activeTab.config}
              onChangeConfig={handleUpdateActiveConfig}
              onApplyPreset={handleApplyPreset}
              onOpenTargetedTechModal={() => setIsTargetedTechOpen(true)}
            />

            {/* 2. Direct vs Indirect Executive Impact Cards (세 작은 블록) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white border border-[#e5e5e0] rounded-2xl space-y-1.5 shadow-2xs break-keep">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-[#6a6a60] flex items-center gap-1">
                    <Dna className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
                    줄기세포 직접 저해
                  </span>
                  <span className="text-xs font-bold text-[#3d6a70] bg-[#e8f0f2] px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                    {currentSimulation.directNeoblastImpactScore} / 100
                  </span>
                </div>
                <div className="w-full bg-[#f0f0eb] rounded-full h-1.5 overflow-hidden border border-[#d6d6ce]">
                  <div
                    className="bg-[#3d6a70] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${currentSimulation.directNeoblastImpactScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#7a7a70] leading-normal">
                  G2/M 세포주기 정지 및 smedwi 유전자 차단
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#e5e5e0] rounded-2xl space-y-1.5 shadow-2xs break-keep">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-[#6a6a60] flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-[#8a6a30] shrink-0" />
                    신경계 간접 스트레스
                  </span>
                  <span className="text-xs font-bold text-[#8a6a30] bg-[#fef3d6] px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                    {currentSimulation.indirectNeuroStressScore} / 100
                  </span>
                </div>
                <div className="w-full bg-[#f0f0eb] rounded-full h-1.5 overflow-hidden border border-[#d6d6ce]">
                  <div
                    className="bg-[#8a6a30] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${currentSimulation.indirectNeuroStressScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#7a7a70] leading-normal">
                  수용체 과자극 C-shape 스크런칭 & 에너지 소모
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#e5e5e0] rounded-2xl space-y-1.5 shadow-2xs break-keep">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-[#6a6a60] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                    주요 지연 요인
                  </span>
                  <span className="text-[11px] font-bold text-[#5a5a40] bg-[#e2e8d5] px-1.5 py-0.5 rounded uppercase shrink-0 whitespace-nowrap">
                    {currentSimulation.primaryDriver}
                  </span>
                </div>
                <div className="text-[11px] text-[#1a1a1a] font-semibold pt-0.5 break-keep">
                  {currentSimulation.primaryDriver === 'indirect' && '💡 신경계 자극(스크런칭) 스트레스'}
                  {currentSimulation.primaryDriver === 'direct' && '🧬 줄기세포(Neoblast) 직접 억제'}
                  {currentSimulation.primaryDriver === 'balanced' && '⚖️ 세포 저해 & 신경 스트레스 복합'}
                  {currentSimulation.primaryDriver === 'severe_toxic' && '⚠️ 고농도 약물 독성'}
                </div>
                <p className="text-[10px] text-[#7a7a70] leading-normal">
                  Targeted Delivery 사용 시 신경 스트레스 70% 감축
                </p>
              </div>
            </div>

            {/* 3. Side-by-Side Delivery Method Comparison (처리 방식 비교: Submersion vs Targeted Delivery) */}
            <SideBySideComparison
              comparison={activeComparisonResults}
              drugName={activeDrug.nameKo}
              concentration={activeTab.config.concentration}
              unit={activeTab.config.unit}
            />
          </div>

          {/* RIGHT COLUMN: WINDOW 2 (모션 시뮬레이션 창 & 정량 분석, 차트, AI 검증) */}
          <div className="space-y-6 min-w-0">
            {/* 1. Interactive Anatomical Canvas & Morphology (모션 시뮬레이션 창 - Single or Dual Side-by-Side Feed View) */}
            {!isDualMode ? (
              <PlanarianCanvas
                simulation={currentSimulation}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                diffusionRate={targetedTechParams.diffusionRate}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#e2e8d5] p-3 rounded-xl border border-[#c5d898] break-keep">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#4a5a30]">
                    <Split className="w-4 h-4 shrink-0" />
                    <span>🔬 실시간 시뮬레이션 모니터 피드 (Dual Stream)</span>
                  </div>
                  <span className="text-[11px] text-[#5a5a40] font-medium shrink-0">
                    스크롤하여 실시간 비교
                  </span>
                </div>

                {/* Simulation Feed Container */}
                <div className="space-y-5">
                  {/* FEED MONITOR 1 */}
                  <div className="bg-white border border-[#e5e5e0] rounded-2xl p-4 shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-[#5a5a40] flex items-center justify-between pb-2 border-b border-[#f0f0eb] break-keep gap-2">
                      <span className="flex items-center gap-1.5 font-serif text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5a5a40] inline-block animate-pulse"></span>
                        [FEED MONITOR 01] 조건 1: {activeTab.title}
                      </span>
                      <span className="text-[10px] bg-[#f0f0eb] px-2.5 py-1 rounded-lg border border-[#d6d6ce] font-sans font-bold shrink-0 whitespace-nowrap">
                        {activeTab.config.drugId} ({activeTab.config.deliveryMethod === 'targeted' ? '국소 전달' : '일반 침지'})
                      </span>
                    </div>
                    <PlanarianCanvas
                      simulation={currentSimulation}
                      selectedDay={selectedDay}
                      onSelectDay={setSelectedDay}
                      diffusionRate={targetedTechParams.diffusionRate}
                    />
                  </div>

                  {/* FEED MONITOR 2 */}
                  <div className="bg-white border border-[#e5e5e0] rounded-2xl p-4 shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-[#3d6a70] flex items-center justify-between pb-2 border-b border-[#f0f0eb] break-keep gap-2">
                      <span className="flex items-center gap-1.5 font-serif text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3d6a70] inline-block animate-pulse"></span>
                        [FEED MONITOR 02] 조건 2: {dualTab.title}
                      </span>
                      <span className="text-[10px] bg-[#e8f0f2] px-2.5 py-1 rounded-lg border border-[#3d6a70]/30 font-sans font-bold text-[#3d6a70] shrink-0 whitespace-nowrap">
                        {dualTab.config.drugId} ({dualTab.config.deliveryMethod === 'targeted' ? '국소 전달' : '일반 침지'})
                      </span>
                    </div>
                    <PlanarianCanvas
                      simulation={currentDualSimulation}
                      selectedDay={selectedDay}
                      onSelectDay={setSelectedDay}
                      diffusionRate={targetedTechParams.diffusionRate}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Dynamic Time-Series Charts (Days 0 to 14) */}
            <MetricsCharts
              comparison={activeComparisonResults}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />

            {/* 3. Google Gemini AI Deep Biological Analysis Section */}
            <AiAnalysisSection
              simulation={activeComparisonResults.submersion}
              targetedSimulation={activeComparisonResults.targeted}
            />
          </div>

          {/* BOTTOM FULL-WIDTH SECTION: LITERATURE DATABASE & PAPER CITATIONS */}
          <div className="col-span-1 lg:col-span-2 pt-4 min-w-0">
            <LiteratureReferences
              database={database}
              currentDrugId={activeTab.config.drugId}
              drugs={drugs}
              matchingPaper={currentSimulation.matchingPaper}
              onOpenDatabaseModal={() => setIsDatabaseOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Targeted Tech Modal */}
      <TargetedTechModal
        isOpen={isTargetedTechOpen}
        onClose={() => setIsTargetedTechOpen(false)}
        techParams={targetedTechParams}
        onUpdateParams={setTargetedTechParams}
      />

      {/* Database Manager Modal */}
      <DatabaseManagerModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        database={database}
        drugs={drugs}
        onAddPaper={handleAddPaper}
        onImportDatabase={handleImportDatabase}
      />

      {/* Research Guide Modal */}
      <ResearchGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#e5e5e0] bg-white py-6 text-center text-xs text-[#7a7a70]">
        <div className="max-w-[1700px] mx-auto px-4">
          <p>© Planarian Neoblast Regeneration & Drug Effect Simulator — Paper-Backed Model</p>
          <p className="text-[11px] text-[#8a8a80] mt-1">
            *선택적 국소 전달(Targeted Delivery) 방식은 재생의학 Hydrogel/Liposome 기술 기반의 가상 연구 모델입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

