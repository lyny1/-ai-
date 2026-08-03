import React, { useState, useEffect } from 'react';
import { DrugInfo, CutLocation, CutType, DeliveryMethod, ExperimentConfig, ExperimentTab } from '../types';
import { Sliders, Clock, Scissors, TestTube2, Zap, ShieldCheck, Sparkles, Plus, Copy, Trash2, Layers, Info, Split, Bot, ChevronDown, ChevronRight, Settings, AlertTriangle, GripVertical } from 'lucide-react';
import { AiRecommendationModal } from './AiRecommendationModal';

interface ExperimentControlsProps {
  drugs: DrugInfo[];
  tabs: ExperimentTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onDuplicateTab: (targetTabId?: string) => void;
  onDeleteTab: (id: string) => void;
  onReorderTabs?: (newTabs: ExperimentTab[]) => void;
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
  onDuplicateTab,
  onDeleteTab,
  onReorderTabs,
  isDualMode,
  onToggleDualMode,
  dualTabId,
  onSelectDualTab,
  config,
  onChangeConfig,
  onOpenTargetedTechModal,
}) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showDrugInfoTooltip, setShowDrugInfoTooltip] = useState(false);
  const [showConcentrationTooltip, setShowConcentrationTooltip] = useState(false);
  const [showExposureTooltip, setShowExposureTooltip] = useState(false);
  const [showDeliveryTooltip, setShowDeliveryTooltip] = useState(false);
  const [showCutTooltip, setShowCutTooltip] = useState(false);

  // Tab Interaction States: Context Menu, Hover & Drag-and-Drop Reordering
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Keyboard shortcut listener: Ctrl+C/V to duplicate, Delete or Ctrl+D to delete hovered/active tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input/textarea
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Duplicate shortcut: Ctrl+C or Ctrl+V
      if (isCtrlOrCmd && (key === 'c' || key === 'v')) {
        e.preventDefault();
        const targetId = hoveredTabId || activeTabId;
        if (targetId) {
          onDuplicateTab(targetId);
        }
      }

      // Delete shortcut: Delete key or Ctrl+D
      if (key === 'delete' || (isCtrlOrCmd && key === 'd')) {
        e.preventDefault();
        const targetId = hoveredTabId || activeTabId;
        if (targetId && tabs.length > 1) {
          onDeleteTab(targetId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredTabId, activeTabId, tabs, onDuplicateTab, onDeleteTab]);

  // Amputation Custom Menu States
  const [isCutMenuOpen, setIsCutMenuOpen] = useState(false);
  const [hoveredCutCategory, setHoveredCutCategory] = useState<'transverse' | 'longitudinal' | null>('transverse');

  const selectedDrug = drugs.find((d) => d.id === config.drugId) || drugs[0];

  const handleCombinedCutChange = (combinedKey: string) => {
    switch (combinedKey) {
      case 'transverse_anterior':
        onChangeConfig({ ...config, cutLocation: 'anterior', cutType: 'transverse' });
        break;
      case 'transverse_trunk':
        onChangeConfig({ ...config, cutLocation: 'trunk', cutType: 'transverse' });
        break;
      case 'transverse_posterior':
        onChangeConfig({ ...config, cutLocation: 'posterior', cutType: 'transverse' });
        break;
      case 'longitudinal_head':
        onChangeConfig({ ...config, cutLocation: 'anterior', cutType: 'longitudinal' });
        break;
      case 'longitudinal_full':
        onChangeConfig({ ...config, cutLocation: 'trunk', cutType: 'longitudinal' });
        break;
      case 'longitudinal_tail':
        onChangeConfig({ ...config, cutLocation: 'posterior', cutType: 'longitudinal' });
        break;
      default:
        onChangeConfig({ ...config, cutLocation: 'trunk', cutType: 'transverse' });
    }
  };

  const getCutDisplayText = () => {
    if (config.cutType === 'longitudinal') {
      if (config.cutLocation === 'anterior') return '종단 세로 가르기 › 머리 세로 가르기';
      if (config.cutLocation === 'posterior') return '종단 세로 가르기 › 꼬리 세로 가르기';
      return '종단 세로 가르기 › 전신 완전 반절';
    } else {
      if (config.cutLocation === 'anterior') return '횡단 절단 › 머리 절단';
      if (config.cutLocation === 'posterior') return '횡단 절단 › 꼬리 절단';
      return '횡단 절단 › 몸통 절단';
    }
  };

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
    const clamped = Math.max(selectedDrug.minConc, Math.min(selectedDrug.maxConc, val));
    onChangeConfig({
      ...config,
      concentration: clamped,
    });
  };

  const handleExposureChange = (hours: number) => {
    onChangeConfig({
      ...config,
      exposureHours: Math.max(1, Math.min(336, hours)),
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

        {/* Dual View Mode Toggle & Tech Modal Button */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          <button
            type="button"
            onClick={onOpenTargetedTechModal}
            className="px-2.5 py-1.5 bg-[#f8f7f2] hover:bg-[#eaeae2] text-[#5a5a40] border border-[#d6d6ce] rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
            title="국소 전달 기술 설정 및 생체 타당성 정보"
          >
            <Settings className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
            <span>국소전달 설정</span>
          </button>

          <button
            type="button"
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
          {tabs.map((tab, idx) => {
            const isMainActive = tab.id === activeTabId;
            const isDualActive = isDualMode && tab.id === dualTabId;
            const isDragging = draggedIdx === idx;
            const isOver = dragOverIdx === idx;

            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIdx(idx);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', tab.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIdx !== idx) {
                    setDragOverIdx(idx);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverIdx === idx) {
                    setDragOverIdx(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx && onReorderTabs) {
                    const updated = Array.from(tabs);
                    const [moved] = updated.splice(draggedIdx, 1);
                    updated.splice(idx, 0, moved);
                    onReorderTabs(updated);
                  }
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    tabId: tab.id,
                  });
                }}
                className={`relative group flex items-center shrink-0 cursor-grab active:cursor-grabbing transition-all rounded-xl p-0.5 border ${
                  isDragging ? 'opacity-40 scale-95 border-dashed border-[#5a5a40]' : 'border-transparent'
                } ${isOver ? 'ring-2 ring-[#5a5a40] ring-offset-1 bg-[#f0f0eb]' : ''}`}
              >
                {/* Grip Handle Icon */}
                <div className="pl-0.5 pr-0.5 text-[#a0a090] opacity-40 group-hover:opacity-100 transition-opacity flex items-center">
                  <GripVertical className="w-3 h-3" />
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border shrink-0 whitespace-nowrap cursor-pointer ${
                    isMainActive
                      ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-xs'
                      : isDualActive
                      ? 'bg-[#3d6a70] text-white border-[#3d6a70]'
                      : 'bg-[#f8f7f2] text-[#6a6a60] border-[#e5e5e0] hover:text-[#1a1a1a]'
                  }`}
                  title="우클릭: 메뉴 | Ctrl+C,V: 복제 | Delete / Ctrl+D: 삭제 | 드래그: 순서 변경"
                >
                  <Layers className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{tab.title}</span>
                </button>

                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTab(tab.id);
                    }}
                    className="p-1 text-[#a0a090] hover:text-[#b83220] transition shrink-0 cursor-pointer ml-0.5"
                    title="탭 삭제 (Delete / Ctrl+D)"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddTab}
            className="p-1.5 bg-[#f0f0eb] hover:bg-[#eaeae2] text-[#5a5a40] border border-[#d6d6ce] rounded-full transition cursor-pointer shrink-0 flex items-center justify-center shadow-2xs"
            title="새 실험 조건 탭 추가"
          >
            <Plus className="w-4 h-4 shrink-0" />
          </button>

          <span className="text-[10px] text-[#8a8a80] hidden sm:inline-block ml-1.5 font-mono">
            💡 우클릭 / Ctrl+C,V: 복제 | Delete / Ctrl+D: 삭제
          </span>
        </div>

        {/* Floating Context Menu for Condition Block Options */}
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/5"
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu(null);
              }}
            />
            <div
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-50 w-52 bg-white/98 backdrop-blur-md border border-[#d6d6ce] shadow-xl rounded-xl py-1 text-xs text-[#2a2a24] animate-fadeIn"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#7a7a70] border-b border-[#f0f0eb] uppercase tracking-wider flex items-center justify-between">
                <span>실험 조건 옵션</span>
                <span className="text-[9px] font-mono bg-[#f0f0eb] px-1 rounded text-[#5a5a40]">Ctrl+C/V</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onDuplicateTab(contextMenu.tabId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#e2e8d5] hover:text-[#4a5a30] font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#4a5a30]" />
                <span>복제 (Ctrl+C, Ctrl+V)</span>
              </button>

              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTab(contextMenu.tabId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#fde8e8] hover:text-[#b83220] font-bold flex items-center gap-2 transition cursor-pointer text-[#8a3a30]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제 (Delete / Ctrl+D)</span>
                </button>
              )}

              <div className="border-t border-[#f0f0eb] my-1" />

              <button
                type="button"
                onClick={() => {
                  onAddTab();
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#f0f0eb] font-semibold flex items-center gap-2 transition cursor-pointer text-[#5a5a40]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 조건 탭 추가</span>
              </button>
            </div>
          </>
        )}

        {/* Dual Mode Secondary Tab Selector */}
        {isDualMode && (
          <div className="flex items-center space-x-1.5 bg-[#e2e8d5] p-1 rounded-xl border border-[#c5d898] text-xs shrink-0 whitespace-nowrap">
            <span className="font-bold text-[#4a5a30] text-[11px] px-1 whitespace-nowrap">비교 탭 2:</span>
            <select
              value={dualTabId}
              onChange={(e) => onSelectDualTab(e.target.value)}
              className="bg-white border border-[#c5d898] text-[#2a2a24] rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* AI Assistant Setup Launch Button */}
      <div className="p-3 bg-[#f8f7f2] border border-[#d6d6ce] rounded-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#e2e8d5] text-[#4a5a30] rounded-lg border border-[#c5d898]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#5a5a40] block">
              AI 최적 실험 조건 추천 (AI Setup Assistant)
            </span>
            <span className="text-[11px] text-[#7a7a70]">
              학술 논문 기반 시나리오를 대화형 팝업 창에서 탐색하고 한 번에 세팅하세요.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="px-4 py-2 bg-[#5a5a40] hover:bg-[#4a5a30] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#e2e8d5]" />
          <span>AI 추천 및 대화 창 열기</span>
        </button>
      </div>

      {/* Controls Grid - Reordered and resized as requested */}
      <div className="space-y-3.5">
        {/* Row 1: 약물 선택 & 노출 시간 (기존 투여 농도 위치에 노출 시간 배치) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
          {/* Div 1: Drug Selection Dropdown with Hover Info Tooltip */}
          <div className="flex flex-col justify-between space-y-1.5 min-w-0 relative bg-[#faf9f5] border border-[#e5e5e0] rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-1">
              <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
                <TestTube2 className="w-4 h-4 text-[#5a5a40] shrink-0" />
                <span className="whitespace-nowrap">약물 선택</span>
                <span className="text-[10px] text-[#7a7a70] font-normal hidden lg:inline">(Agent)</span>
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowDrugInfoTooltip(true)}
                onMouseLeave={() => setShowDrugInfoTooltip(false)}
                onClick={() => setShowDrugInfoTooltip(!showDrugInfoTooltip)}
                className="text-[#7a7a70] hover:text-[#5a5a40] transition p-0.5 cursor-pointer shrink-0"
                title="약물 정보 팝업"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="relative mt-auto"
              onMouseEnter={() => setShowDrugInfoTooltip(true)}
              onMouseLeave={() => setShowDrugInfoTooltip(false)}
            >
              <select
                value={config.drugId}
                onChange={(e) => handleDrugChange(e.target.value)}
                className="w-full bg-white border border-[#d6d6ce] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5a5a40] cursor-pointer break-keep"
              >
                {drugs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameKo}
                  </option>
                ))}
              </select>

              {/* Hover Popover Tooltip for Drug Info */}
              {showDrugInfoTooltip && (
                <div className="absolute left-0 top-full mt-1 z-30 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1.5 text-[#2a2a24] animate-fadeIn pointer-events-none">
                  <div className="font-bold text-[#5a5a40] flex items-center justify-between border-b border-[#e5e5e0] pb-1">
                    <span>{selectedDrug.nameKo}</span>
                    <span className="text-[10px] bg-[#e2e8d5] text-[#4a5a30] px-1.5 py-0.2 rounded">
                      {selectedDrug.categoryKo || selectedDrug.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                    {selectedDrug.descriptionKo || selectedDrug.description}
                  </p>
                  <div className="text-[10px] text-[#7a7a70] font-mono border-t border-[#e5e5e0] pt-1">
                    표준 농도: {selectedDrug.typicalConc}{selectedDrug.defaultUnit}
                  </div>
                </div>
              )}
            </div>

            {config.drugId === 'acetylcholine' && (
              <div className="p-2 bg-[#fef8e8] border border-[#f3e2b4] rounded-lg text-[11px] text-[#7a5a10] leading-snug flex items-start gap-1.5 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#b86a10] shrink-0 mt-0.5" />
                <div>
                  <strong>아세틸콜린(ACh) 효소 분해 주의:</strong> 체내 AChE에 의해 수 초 내 분해되어 국소 전달이 어렵습니다. <strong>카바콜(Carbachol)</strong> 등의 분해저항성 유사체 대체 및 전달체 보완을 권장합니다.
                </div>
              </div>
            )}
          </div>

          {/* Div 2: Exposure Hours Dropdown (Placed where Concentration used to be in Row 1) */}
          <div className="flex flex-col justify-between space-y-1.5 min-w-0 relative bg-[#faf9f5] border border-[#e5e5e0] rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-1">
              <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
                <Clock className="w-4 h-4 text-[#3d6a70] shrink-0" />
                <span className="whitespace-nowrap">노출 시간</span>
                <span className="text-[10px] text-[#7a7a70] font-normal hidden lg:inline">(Exposure)</span>
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowExposureTooltip(true)}
                onMouseLeave={() => setShowExposureTooltip(false)}
                onClick={() => setShowExposureTooltip(!showExposureTooltip)}
                className="text-[#7a7a70] hover:text-[#3d6a70] transition p-0.5 cursor-pointer shrink-0"
                title="노출 시간 학술 의미 팝업"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="relative mt-auto"
              onMouseEnter={() => setShowExposureTooltip(true)}
              onMouseLeave={() => setShowExposureTooltip(false)}
            >
              <select
                value={config.exposureHours}
                onChange={(e) => handleExposureChange(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-[#d6d6ce] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#3d6a70] cursor-pointer break-keep"
              >
                <option value={1}>1시간 (단기 신경반응)</option>
                <option value={6}>6시간 (초기 응답)</option>
                <option value={12}>12시간 (반일 노출)</option>
                <option value={24}>24시간 (1일 노출)</option>
                <option value={48}>48시간 (2일 / 상처 봉합)</option>
                <option value={72}>72시간 (3일 / 재생아)</option>
                <option value={168}>168시간 (7일 / 눈점 분화)</option>
                <option value={336}>336시간 (14일 / 완전 재생)</option>
              </select>

              {/* Exposure Tooltip Popover */}
              {showExposureTooltip && (
                <div className="absolute right-0 top-full mt-1 z-30 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                  <div className="font-bold text-[#3d6a70] border-b border-[#e5e5e0] pb-1">
                    노출 시간 조건 가이드
                  </div>
                  <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                    • 1~24시간: 급성 신경독성 및 과운동성(HI) 정량 관찰<br />
                    • 48~72시간: 신세포(Neoblast) 동원 및 재생아 형성 시점<br />
                    • 168~336시간: 안점 분화 및 완전 조직 재생
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: 투여 농도 (기존 절단 방식/위치 칸의 크기 - Full Width) */}
        <div className="grid grid-cols-1 gap-3.5 items-stretch">
          <div className="flex flex-col justify-between space-y-1.5 min-w-0 relative bg-[#faf9f5] border border-[#e5e5e0] rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-1">
              <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
                <Zap className="w-4 h-4 text-[#8a6a30] shrink-0" />
                <span className="whitespace-nowrap">투여 농도</span>
                <span className="text-[10px] text-[#7a7a70] font-normal hidden lg:inline">(Concentration)</span>
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowConcentrationTooltip(true)}
                onMouseLeave={() => setShowConcentrationTooltip(false)}
                onClick={() => setShowConcentrationTooltip(!showConcentrationTooltip)}
                className="text-[#7a7a70] hover:text-[#8a6a30] transition p-0.5 cursor-pointer shrink-0"
                title="농도 설정 학술 설명"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="space-y-1.5 relative mt-auto"
              onMouseEnter={() => setShowConcentrationTooltip(true)}
              onMouseLeave={() => setShowConcentrationTooltip(false)}
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="range"
                  min={selectedDrug.minConc}
                  max={selectedDrug.maxConc}
                  step={selectedDrug.stepConc}
                  value={config.concentration}
                  onChange={(e) => handleConcentrationChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#d6d6ce] rounded-lg appearance-none cursor-pointer accent-[#5a5a40] min-w-0"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min={selectedDrug.minConc}
                    max={selectedDrug.maxConc}
                    step={selectedDrug.stepConc}
                    value={config.concentration}
                    onChange={(e) => handleConcentrationChange(parseFloat(e.target.value) || selectedDrug.minConc)}
                    className="w-16 bg-white border border-[#d6d6ce] rounded-lg px-2 py-1 text-xs font-bold text-center text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                  />
                  <span className="text-[11px] font-bold text-[#5a5a40] shrink-0">{selectedDrug.defaultUnit}</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-[#7a7a70] font-mono leading-none pt-0.5">
                <span>최저: {selectedDrug.minConc} {selectedDrug.defaultUnit}</span>
                <span>권장: {selectedDrug.typicalConc} {selectedDrug.defaultUnit}</span>
                <span>최고: {selectedDrug.maxConc} {selectedDrug.defaultUnit}</span>
              </div>
            </div>

            {showConcentrationTooltip && (
              <div className="absolute left-0 top-full mt-1 z-30 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                <div className="font-bold text-[#8a6a30] border-b border-[#e5e5e0] pb-1">
                  투여 농도 개념 지표
                </div>
                <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                  • 슬라이더 조절 및 직접 입력을 통해 약물 정밀 농도를 설정합니다.<br />
                  • 최저~최고 생체 유효 범위 내에서 탐색합니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: 맨 아랫 줄 - 절단 방식/위치 & 투여 방식 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
          {/* Div 1: 절단 방식/위치 (Cut Type & Location) */}
          <div className="flex flex-col justify-between space-y-1.5 min-w-0 relative bg-[#faf9f5] border border-[#e5e5e0] rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-1">
              <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
                <Scissors className="w-4 h-4 text-[#8a4a40] shrink-0" />
                <span className="whitespace-nowrap">절단 방식/위치</span>
                <span className="text-[10px] text-[#7a7a70] font-normal hidden lg:inline">(Cut Type & Location)</span>
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowCutTooltip(true)}
                onMouseLeave={() => setShowCutTooltip(false)}
                onClick={() => setShowCutTooltip(!showCutTooltip)}
                className="text-[#7a7a70] hover:text-[#8a4a40] transition p-0.5 cursor-pointer shrink-0"
                title="절단 유형 학술 설명 팝업"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="relative mt-auto"
              onMouseEnter={() => setShowCutTooltip(true)}
              onMouseLeave={() => setShowCutTooltip(false)}
            >
              <button
                type="button"
                onClick={() => setIsCutMenuOpen(!isCutMenuOpen)}
                className="w-full bg-white border border-[#d6d6ce] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1a1a1a] flex items-center justify-between hover:border-[#5a5a40] transition cursor-pointer min-w-0"
              >
                <span className="break-keep text-left truncate">{getCutDisplayText()}</span>
                <ChevronDown className="w-4 h-4 text-[#7a7a70] shrink-0 ml-1" />
              </button>

              {isCutMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-1 z-40 bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-2 text-xs w-64 sm:w-72 animate-fadeIn space-y-2"
                  onMouseLeave={() => setIsCutMenuOpen(false)}
                >
                  <div className="space-y-1">
                    {/* Top Tier Category 1: 횡단 절단 */}
                    <div
                      onMouseEnter={() => setHoveredCutCategory('transverse')}
                      onClick={() => setHoveredCutCategory('transverse')}
                      className={`p-2 rounded-lg font-bold flex items-center justify-between cursor-pointer transition ${
                        hoveredCutCategory === 'transverse'
                          ? 'bg-[#e2e8d5] text-[#4a5a30]'
                          : 'hover:bg-[#f8f7f2] text-[#2a2a24]'
                      }`}
                    >
                      <span>횡단 절단 (Transverse)</span>
                      <ChevronRight className="w-4 h-4 text-[#7a7a70]" />
                    </div>

                    {/* Top Tier Category 2: 종단 세로 가르기 */}
                    <div
                      onMouseEnter={() => setHoveredCutCategory('longitudinal')}
                      onClick={() => setHoveredCutCategory('longitudinal')}
                      className={`p-2 rounded-lg font-bold flex items-center justify-between cursor-pointer transition ${
                        hoveredCutCategory === 'longitudinal'
                          ? 'bg-[#e2e8d5] text-[#4a5a30]'
                          : 'hover:bg-[#f8f7f2] text-[#2a2a24]'
                      }`}
                    >
                      <span>종단 / 세로 가르기 (Longitudinal)</span>
                      <ChevronRight className="w-4 h-4 text-[#7a7a70]" />
                    </div>
                  </div>

                  {/* Submenu Panel */}
                  {hoveredCutCategory && (
                    <div className="pt-2 border-t border-[#e5e5e0] space-y-1 bg-[#fbfbf8] rounded-lg p-2 border border-[#e5e5e0]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a70] mb-1">
                        {hoveredCutCategory === 'transverse' ? '횡단 절단 위치' : '종단 세로 가르기 유형'}
                      </div>

                      {hoveredCutCategory === 'transverse' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              handleCombinedCutChange('transverse_anterior');
                              setIsCutMenuOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs font-semibold block transition ${
                              config.cutType === 'transverse' && config.cutLocation === 'anterior'
                                ? 'bg-[#5a5a40] text-white'
                                : 'hover:bg-[#e2e8d5] text-[#2a2a24]'
                            }`}
                          >
                            머리 절단 (Anterior Head Cut)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCombinedCutChange('transverse_trunk');
                              setIsCutMenuOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs font-semibold block transition ${
                              config.cutType === 'transverse' && config.cutLocation === 'trunk'
                                ? 'bg-[#5a5a40] text-white'
                                : 'hover:bg-[#e2e8d5] text-[#2a2a24]'
                            }`}
                          >
                            몸통 절단 (Trunk Amputation)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCombinedCutChange('transverse_posterior');
                              setIsCutMenuOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs font-semibold block transition ${
                              config.cutType === 'transverse' && config.cutLocation === 'posterior'
                                ? 'bg-[#5a5a40] text-white'
                                : 'hover:bg-[#e2e8d5] text-[#2a2a24]'
                            }`}
                          >
                            꼬리 절단 (Posterior Tail Cut)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              handleCombinedCutChange('longitudinal_head');
                              setIsCutMenuOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs font-semibold block transition ${
                              config.cutType === 'longitudinal' && config.cutLocation === 'anterior'
                                ? 'bg-[#5a5a40] text-white'
                                : 'hover:bg-[#e2e8d5] text-[#2a2a24]'
                            }`}
                          >
                            머리 세로 가르기 (Two-Headed)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCombinedCutChange('longitudinal_full');
                              setIsCutMenuOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs font-semibold block transition ${
                              config.cutType === 'longitudinal' && config.cutLocation === 'trunk'
                                ? 'bg-[#5a5a40] text-white'
                                : 'hover:bg-[#e2e8d5] text-[#2a2a24]'
                            }`}
                          >
                            전신 완전 반절 (Full Split)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCombinedCutChange('longitudinal_tail');
                              setIsCutMenuOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs font-semibold block transition ${
                              config.cutType === 'longitudinal' && config.cutLocation === 'posterior'
                                ? 'bg-[#5a5a40] text-white'
                                : 'hover:bg-[#e2e8d5] text-[#2a2a24]'
                            }`}
                          >
                            꼬리 세로 가르기 (Two-Tailed)
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cut Tooltip Popover */}
              {showCutTooltip && !isCutMenuOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                  <div className="font-bold text-[#8a4a40] border-b border-[#e5e5e0] pb-1">
                    절단 형태학 설명
                  </div>
                  <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                    • 횡단 절단: 머리/몸통/꼬리 특정 세그먼트 재생 연구.<br />
                    • 머리 세로 가르기: 정렬 교란으로 쌍두(Two-Headed) 유도.<br />
                    • 꼬리 세로 가르기: 신호 분할로 쌍미(Two-Tailed) 유도.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Div 2: 투여 방식 (Drug Delivery Method) */}
          <div className="flex flex-col justify-between space-y-1.5 min-w-0 relative bg-[#faf9f5] border border-[#e5e5e0] rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-1">
              <label className="text-xs font-semibold text-[#5a5a40] flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
                <ShieldCheck className="w-4 h-4 text-[#6a4a70] shrink-0" />
                <span className="whitespace-nowrap">투여 방식</span>
                <span className="text-[10px] text-[#7a7a70] font-normal hidden lg:inline">(Delivery)</span>
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowDeliveryTooltip(true)}
                onMouseLeave={() => setShowDeliveryTooltip(false)}
                onClick={() => setShowDeliveryTooltip(!showDeliveryTooltip)}
                className="text-[#7a7a70] hover:text-[#6a4a70] transition p-0.5 cursor-pointer shrink-0"
                title="투여 방식 학술 비교 팝업"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="relative mt-auto"
              onMouseEnter={() => setShowDeliveryTooltip(true)}
              onMouseLeave={() => setShowDeliveryTooltip(false)}
            >
              <select
                value={config.deliveryMethod}
                onChange={(e) => handleDeliveryChange(e.target.value as DeliveryMethod)}
                className="w-full bg-white border border-[#d6d6ce] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6a4a70] cursor-pointer break-keep"
              >
                <option value="submersion">전신 침지법 (Submersion)</option>
                <option value="targeted">선택적 국소 전달 (Targeted Patch - 이론 기반 가상 모델)</option>
              </select>

              {/* Delivery Tooltip Popover */}
              {showDeliveryTooltip && (
                <div className="absolute right-0 top-full mt-1 z-30 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                  <div className="font-bold text-[#6a4a70] border-b border-[#e5e5e0] pb-1">
                    투여 방식 학술 지표
                  </div>
                  <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                    • 전신 침지법: 수조 노출로 전신 신경계 자극 및 스트레스 유발.<br />
                    • 선택적 국소 전달: 하이드로겔 국소 방출 연구 논문 기반 <strong>[실제 이론 기반 가상 모델]</strong>로, 전신 스트레스를 차단하면서 재생 촉진 효과를 가상 평가.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal Popup Component */}
      <AiRecommendationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        drugs={drugs}
        currentConfig={config}
        onApplyConfig={(newCfg) => onChangeConfig(newCfg)}
      />
    </div>
  );
};

