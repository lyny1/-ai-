import React, { useState } from 'react';
import { DrugInfo, CutLocation, DeliveryMethod, ExperimentConfig, ExperimentTab } from '../types';
import { Sliders, Clock, Scissors, TestTube2, Zap, ShieldCheck, Sparkles, Plus, Trash2, Layers, Info, Split } from 'lucide-react';

interface ExperimentControlsProps {
  drugs: DrugInfo[];
  tabs: ExperimentTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onDeleteTab: (id: string) => void;
  isDualMode: boolean;
  onToggleDualMode: () => void;
  dualTabId: string;
  onSelectDualTab: (id: string) => void;
  config: ExperimentConfig;
  onChangeConfig: (newConfig: ExperimentConfig) => void;
  onApplyPreset: (presetKey: string) => void;
  onOpenTargetedTechModal: () => void;
}

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({
  drugs,
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onDeleteTab,
  isDualMode,
  onToggleDualMode,
  dualTabId,
  onSelectDualTab,
  config,
  onChangeConfig,
  onApplyPreset,
  onOpenTargetedTechModal,
}) => {
  const selectedDrug = drugs.find((d) => d.id === config.drugId) || drugs[0];

  const handleDrugChange = (drugId: string) => {
    const d = drugs.find((item) => item.id === drugId) || drugs[0];
    onChangeConfig({
      ...config,
      drugId,
      unit: d.defaultUnit,
      concentration: d.typicalConc,
    });
  };

  const handleConcentrationChange = (val: number) => {
    onChangeConfig({
      ...config,
      concentration: val,
    });
  };

  const handleExposureChange = (hours: number) => {
    onChangeConfig({
      ...config,
      exposureHours: hours,
    });
  };

  const handleCutChange = (location: CutLocation) => {
    onChangeConfig({
      ...config,
      cutLocation: location,
    });
  };

  const handleDeliveryChange = (method: DeliveryMethod) => {
    onChangeConfig({
      ...config,
      deliveryMethod: method,
    });
  };

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24] space-y-4">
      {/* Top Header & Dual Mode Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e5e5e0] gap-2.5 min-w-0">
        <div className="flex items-center space-x-2 break-keep">
          <Sliders className="w-5 h-5 text-[#5a5a40] shrink-0" />
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#5a5a40]">실험 조건 설정 (Experimental Setup)</h2>
        </div>

        {/* Dual View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          <button
            onClick={onOpenTargetedTechModal}
            className="px-2.5 py-1.5 bg-[#f8f7f2] hover:bg-[#eaeae2] text-[#5a5a40] border border-[#d6d6ce] rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
            title="국소 전달 기술 기반 및 타당성 정보"
          >
            <Info className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
            <span>국소전달 정보</span>
          </button>

          <button
            onClick={onToggleDualMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              isDualMode
                ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-2xs'
                : 'bg-[#f5f5f0] text-[#6a6a60] border-[#d6d6ce] hover:bg-[#eaeae2]'
            }`}
          >
            <Split className="w-3.5 h-3.5 shrink-0" />
            <span>{isDualMode ? '듀얼 비교 ON' : '듀얼 비교 OFF'}</span>
          </button>
        </div>
      </div>

      {/* Experiment Tabs Navigation Bar */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2 border-b border-[#f0f0eb] no-scrollbar">
        <div className="flex items-center space-x-1.5 shrink-0">
          {tabs.map((tab) => {
            const isMainActive = tab.id === activeTabId;
            const isDualActive = isDualMode && tab.id === dualTabId;
            return (
              <div key={tab.id} className="flex items-center shrink-0">
                <button
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border shrink-0 whitespace-nowrap ${
                    isMainActive
                      ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-xs'
                      : isDualActive
                      ? 'bg-[#3d6a70] text-white border-[#3d6a70]'
                      : 'bg-[#f8f7f2] text-[#6a6a60] border-[#e5e5e0] hover:text-[#1a1a1a]'
                  }`}
                >
                  <Layers className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{tab.title}</span>
                  <span className="text-[10px] opacity-80 font-normal whitespace-nowrap">
                    ({tab.config.drugId}, {tab.config.deliveryMethod === 'targeted' ? '국소' : '침지'})
                  </span>
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={() => onDeleteTab(tab.id)}
                    className="p-1 text-[#a0a090] hover:text-[#b83220] transition shrink-0"
                    title="탭 삭제"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={onAddTab}
            className="px-2.5 py-1.5 bg-[#f0f0eb] hover:bg-[#e2e8d5] text-[#5a5a40] border border-[#d6d6ce] rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0 whitespace-nowrap"
            title="새 실험 조건 탭 추가"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>새 조건 탭 추가</span>
          </button>
        </div>

        {/* Dual Mode Secondary Tab Selector */}
        {isDualMode && (
          <div className="flex items-center space-x-1.5 bg-[#e2e8d5] p-1 rounded-xl border border-[#c5d898] text-xs shrink-0 whitespace-nowrap">
            <span className="font-bold text-[#4a5a30] text-[11px] px-1 whitespace-nowrap">비교 탭 2:</span>
            <select
              value={dualTabId}
              onChange={(e) => onSelectDualTab(e.target.value)}
              className="bg-white border border-[#c5d898] text-[#2a2a24] rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-none"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.config.drugId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Preset Quick Loader Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider break-keep">
            <Sparkles className="w-3.5 h-3.5 text-[#5a5a40]" />
            <span>AI 추천 연구 시나리오 (AI-Recommended Scenarios)</span>
          </label>
          <span className="text-[10px] font-bold bg-[#e2e8d5] text-[#4a5a30] px-2 py-0.5 rounded border border-[#c5d898]">
            AI 데이터베이스 연동 추천
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          <button
            onClick={() => onApplyPreset('nicotine_stress')}
            className={`p-3 text-xs rounded-xl border text-left transition cursor-pointer space-y-1 break-keep ${
              config.drugId === 'nicotine'
                ? 'bg-[#e2e8d5] border-[#5a5a40] ring-1 ring-[#5a5a40]'
                : 'bg-[#f5f5f0] hover:bg-[#eaeae2] border-[#d6d6ce]'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[#5a5a40] text-xs">0.2mM 니코틴 (Nicotine)</span>
              <span className="text-[9px] bg-[#5a5a40] text-white px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap">
                AI 추천 1
              </span>
            </div>
            <div className="text-[11px] text-[#6a6a60] leading-snug break-keep">
              신경 과자극 C-수축 vs 국소 전달 하이드로겔 비교
            </div>
          </button>

          <button
            onClick={() => onApplyPreset('ethanol_arrest')}
            className={`p-3 text-xs rounded-xl border text-left transition cursor-pointer space-y-1 break-keep ${
              config.drugId === 'ethanol'
                ? 'bg-[#e8f0f2] border-[#3d6a70] ring-1 ring-[#3d6a70]'
                : 'bg-[#f5f5f0] hover:bg-[#eaeae2] border-[#d6d6ce]'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[#3d6a70] text-xs">0.5% 에탄올 (Ethanol)</span>
              <span className="text-[9px] bg-[#3d6a70] text-white px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap">
                AI 추천 2
              </span>
            </div>
            <div className="text-[11px] text-[#6a6a60] leading-snug break-keep">
              중추신경 억제, 운동성 저하 & 막전위 정지
            </div>
          </button>

          <button
            onClick={() => onApplyPreset('caffeine_motility')}
            className={`p-3 text-xs rounded-xl border text-left transition cursor-pointer space-y-1 break-keep ${
              config.drugId === 'caffeine'
                ? 'bg-[#fef3d6] border-[#8a6a30] ring-1 ring-[#8a6a30]'
                : 'bg-[#f5f5f0] hover:bg-[#eaeae2] border-[#d6d6ce]'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[#8a6a30] text-xs">0.5mM 카페인 (Caffeine)</span>
              <span className="text-[9px] bg-[#8a6a30] text-white px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap">
                AI 추천 3
              </span>
            </div>
            <div className="text-[11px] text-[#6a6a60] leading-snug break-keep">
              Snake-like 과운동성 & cAMP 연계 재생 지연
            </div>
          </button>

          <button
            onClick={() => onApplyPreset('ach_cholinergic')}
            className={`p-3 text-xs rounded-xl border text-left transition cursor-pointer space-y-1 break-keep ${
              config.drugId === 'acetylcholine'
                ? 'bg-[#f3e8f8] border-[#6a4a70] ring-1 ring-[#6a4a70]'
                : 'bg-[#f5f5f0] hover:bg-[#eaeae2] border-[#d6d6ce]'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[#6a4a70] text-xs">100µM 아세틸콜린</span>
              <span className="text-[9px] bg-[#6a4a70] text-white px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap">
                AI 추천 4
              </span>
            </div>
            <div className="text-[11px] text-[#6a6a60] leading-snug break-keep">
              콜린성 신경망 재생 신호 & 근육 연속 연축
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Drug Selection */}
        <div className="space-y-3 min-w-0">
          <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider break-keep">
            <TestTube2 className="w-4 h-4 text-[#5a5a40] shrink-0" />
            <span>약물 종류 (Agent Selection)</span>
          </label>
          <select
            value={config.drugId}
            onChange={(e) => handleDrugChange(e.target.value)}
            className="w-full bg-[#f5f5f0] border border-[#d6d6ce] rounded-xl px-3 py-2 text-xs font-medium text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
          >
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameKo}
              </option>
            ))}
          </select>
          <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] text-xs text-[#6a6a60] space-y-1 break-keep">
            <div className="font-bold text-[#4a4a3a]">{selectedDrug.category}</div>
            <p className="line-clamp-3 leading-relaxed">{selectedDrug.description}</p>
          </div>
        </div>

        {/* 2. Drug Concentration */}
        <div className="space-y-3 min-w-0">
          <div className="flex justify-between items-center gap-1">
            <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider break-keep">
              <Zap className="w-4 h-4 text-[#8a6a30] shrink-0" />
              <span>약물 농도 (Concentration)</span>
            </label>
            <span className="text-xs font-bold text-[#5a5a40] bg-[#f0f0eb] px-2 py-0.5 rounded border border-[#d6d6ce] shrink-0">
              {config.concentration} {selectedDrug.defaultUnit}
            </span>
          </div>

          <input
            type="range"
            min={selectedDrug.minConc}
            max={selectedDrug.maxConc}
            step={selectedDrug.stepConc}
            value={config.concentration}
            onChange={(e) => handleConcentrationChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#e5e5e0] rounded-lg appearance-none cursor-pointer accent-[#5a5a40]"
          />

          <div className="flex justify-between text-[10px] text-[#8a8a80]">
            <span>{selectedDrug.minConc} {selectedDrug.defaultUnit}</span>
            <span>권장: {selectedDrug.typicalConc} {selectedDrug.defaultUnit}</span>
            <span>{selectedDrug.maxConc} {selectedDrug.defaultUnit}</span>
          </div>

          {/* Number manual entry fallback */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs text-[#7a7a70] shrink-0">직접 입력:</span>
            <input
              type="number"
              min={selectedDrug.minConc}
              max={selectedDrug.maxConc * 2}
              step={selectedDrug.stepConc}
              value={config.concentration}
              onChange={(e) => handleConcentrationChange(parseFloat(e.target.value) || selectedDrug.minConc)}
              className="w-20 bg-[#f5f5f0] border border-[#d6d6ce] rounded-lg px-2 py-1 text-xs text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
            />
            <span className="text-xs text-[#7a7a70] shrink-0">{selectedDrug.defaultUnit}</span>
          </div>
        </div>

        {/* 3. Exposure Hours & Amputation Location */}
        <div className="space-y-3 min-w-0">
          {/* Exposure Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center gap-1">
              <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider break-keep">
                <Clock className="w-4 h-4 text-[#3d6a70] shrink-0" />
                <span>노출 시간 (Duration)</span>
              </label>
              <span className="text-xs text-[#3d6a70] font-bold shrink-0">
                {config.exposureHours >= 168 ? `${config.exposureHours}h (${(config.exposureHours/24).toFixed(1)}일)` : `${config.exposureHours}시간`}
              </span>
            </div>

            {/* Expanded Preset Exposure Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
              {[1, 6, 12, 24, 48, 72, 96, 168, 336].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => handleExposureChange(hrs)}
                  className={`py-1 text-[11px] font-medium rounded-lg border text-center transition ${
                    config.exposureHours === hrs
                      ? 'bg-[#5a5a40] text-white border-[#5a5a40] font-bold'
                      : 'bg-[#f5f5f0] text-[#6a6a60] border-[#d6d6ce] hover:bg-[#eaeae2]'
                  }`}
                >
                  {hrs === 168 ? '7일' : hrs === 336 ? '14일' : `${hrs}h`}
                </button>
              ))}
            </div>

            {/* Custom Hours Input */}
            <div className="flex items-center space-x-1.5 pt-0.5">
              <span className="text-[11px] text-[#7a7a70] shrink-0">시간 직접 설정:</span>
              <input
                type="number"
                min={1}
                max={336}
                value={config.exposureHours}
                onChange={(e) => handleExposureChange(parseInt(e.target.value, 10) || 24)}
                className="w-16 bg-[#f5f5f0] border border-[#d6d6ce] rounded-lg px-2 py-0.5 text-xs text-[#1a1a1a] focus:outline-none"
              />
              <span className="text-[11px] text-[#7a7a70]">시간</span>
            </div>
          </div>

          {/* Cut Location */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider break-keep">
              <Scissors className="w-4 h-4 text-[#8a4a40] shrink-0" />
              <span>절단 위치 (Amputation)</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'anterior', label: '머리 (Head)' },
                  { id: 'trunk', label: '몸통 (Trunk)' },
                  { id: 'posterior', label: '꼬리 (Tail)' },
                ] as const
              ).map((cut) => (
                <button
                  key={cut.id}
                  onClick={() => handleCutChange(cut.id)}
                  className={`py-1.5 text-xs font-medium rounded-lg border text-center transition ${
                    config.cutLocation === cut.id
                      ? 'bg-[#5a5a40] text-white border-[#5a5a40] font-bold'
                      : 'bg-[#f5f5f0] text-[#6a6a60] border-[#d6d6ce] hover:bg-[#eaeae2]'
                  }`}
                >
                  {cut.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Drug Delivery Mode */}
        <div className="space-y-3 min-w-0">
          <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider break-keep">
            <ShieldCheck className="w-4 h-4 text-[#6a4a70] shrink-0" />
            <span>약물 전달 방식 (Delivery)</span>
          </label>
          <div className="space-y-2">
            <button
              onClick={() => handleDeliveryChange('submersion')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-start space-x-2 transition break-keep ${
                config.deliveryMethod === 'submersion'
                  ? 'bg-[#f0f0eb] border-[#5a5a40] text-[#1a1a1a] ring-1 ring-[#5a5a40]'
                  : 'bg-[#f5f5f0] border-[#d6d6ce] text-[#6a6a60] hover:bg-[#eaeae2]'
              }`}
            >
              <div className="mt-1 w-2 h-2 rounded-full bg-[#8a6a30] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#2a2a24]">① 일반 침지법 (Whole Submersion)</div>
                <div className="text-[11px] text-[#7a7a70] mt-0.5 leading-tight">
                  수조 전신 노출 (전신 신경 수용체 과자극 동반)
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDeliveryChange('targeted')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-start space-x-2 transition break-keep ${
                config.deliveryMethod === 'targeted'
                  ? 'bg-[#f0f0eb] border-[#5a5a40] text-[#1a1a1a] ring-1 ring-[#5a5a40]'
                  : 'bg-[#f5f5f0] border-[#d6d6ce] text-[#6a6a60] hover:bg-[#eaeae2]'
              }`}
            >
              <div className="mt-1 w-2 h-2 rounded-full bg-[#5a5a40] shrink-0 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-[#2a2a24] flex items-center gap-1 flex-wrap">
                  <span>② 선택적 국소 전달 (Targeted Patch)</span>
                  <span className="text-[9px] bg-[#e2e8d5] text-[#4a5a30] px-1.5 py-0.2 rounded font-bold uppercase">
                    가상 모델
                  </span>
                </div>
                <div className="text-[11px] text-[#7a7a70] mt-0.5 leading-tight">
                  상처 부위 하이드로겔 국소 방출 (신경 스트레스 최소화)
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

