import React, { useState } from 'react';
import { ComparisonResults } from '../types';
import { Split, ShieldAlert, Sparkles, TrendingUp, Zap, Activity, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface SideBySideComparisonProps {
  comparison: ComparisonResults;
  drugName: string;
  concentration: number;
  unit: string;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({
  comparison,
  drugName,
  concentration,
  unit,
}) => {
  const { submersion, targeted } = comparison;

  // Swappable aspect tab state: 'pharm' (약리학성) vs 'regen' (재생의학적)
  const [activeAspect, setActiveAspect] = useState<'pharm' | 'regen'>('pharm');

  // Touch swipe support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 30) {
      setActiveAspect(prev => (prev === 'pharm' ? 'regen' : 'pharm'));
    }
    setTouchStartX(null);
  };

  // Hover popover states for Method 1 & Method 2
  const [hoveredM1, setHoveredM1] = useState<'pharm' | 'regen' | null>(null);
  const [hoveredM2, setHoveredM2] = useState<'pharm' | 'regen' | null>(null);

  // Hover & click state for Drug Delivery System (DDS) Pharmacological Verification popover
  const [showDdsValidationModal, setShowDdsValidationModal] = useState(false);
  const [isDdsHovered, setIsDdsHovered] = useState(false);

  // Deltas between Submersion vs Targeted
  const regenDelta = targeted.finalRegenerationRate - submersion.finalRegenerationRate;
  const stemCellDelta = targeted.stemCellActivityIndex - submersion.stemCellActivityIndex;
  const stressDelta = submersion.stressIndex - targeted.stressIndex; // positive means targeted saved stress
  const scrunchDelta = submersion.scrunchingFrequency - targeted.scrunchingFrequency;
  const glidingDelta = targeted.glidingSpeed - submersion.glidingSpeed;

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e5e5e0] mb-5 gap-2.5">
        <div className="flex items-center space-x-2 min-w-0">
          <Split className="w-5 h-5 text-[#5a5a40] shrink-0" />
          <h2 className="text-base font-serif font-bold text-[#5a5a40] break-keep">
            처리 방식 비교 (Submersion vs. Targeted Delivery)
          </h2>
        </div>
        <span className="text-xs bg-[#f0f0eb] border border-[#d6d6ce] text-[#5a5a40] font-semibold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto whitespace-nowrap">
          {drugName} {concentration} {unit} 대조 비교
        </span>
      </div>

      {/* Main Split Grid: Use xl:grid-cols-2 so that inside the 2-column parent on lg desktop, this stacks vertically or fits comfortably without text/block overflow */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        {/* LEFT PANEL: 일반 침지법 (Whole Submersion) */}
        <div className="bg-[#fafafa] rounded-xl border border-[#e5e5e0] p-4 sm:p-5 space-y-4 relative flex flex-col justify-between min-w-0">
          <div className="space-y-4 min-w-0">
            <div className="pb-3 border-b border-[#e5e5e0] min-w-0">
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-[10px] font-bold text-[#8a6a30] uppercase tracking-wider shrink-0 bg-[#fef3d6] px-1.5 py-0.5 rounded border border-[#f0d8a8] mt-0.5">
                  Method ①
                </span>
                <h3 className="text-sm font-serif font-bold text-[#2a2a24] leading-snug break-keep min-w-0">
                  일반 침지법 <br />
                  <span className="text-xs font-sans font-normal text-[#6a6a60]">(Submersion Bath)</span>
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#6a6a60] leading-relaxed break-keep min-h-[52px]">
              사육 수조 전체에 약물이 용해되어 플라나리아 표피 및 신경 수용체 전체가 약물에 직접 노출됩니다. 전신 수용체 과자극에 따른 스트레스 반응이 동반됩니다.
            </p>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 min-w-0">
              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#5a5a40] break-keep truncate">재생률 (14일)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#5a5a40] truncate">
                  {submersion.finalRegenerationRate}%
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#3d6a70] break-keep truncate">줄기세포 활성</span>
                  <Zap className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#3d6a70] truncate">
                  {submersion.stemCellActivityIndex} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#3d6a70] break-keep truncate">글라이딩 속도</span>
                  <Activity className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#3d6a70] truncate">
                  {submersion.glidingSpeed}%
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#8a6a30] break-keep truncate">스크런칭 수축</span>
                  <Activity className="w-3.5 h-3.5 text-[#8a6a30] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#8a6a30] truncate">
                  {submersion.scrunchingFrequency}회/분
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs col-span-2 min-w-0">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#8a4a40] break-keep truncate">과운동증 (Hyperkinesia)</span>
                  <span className="text-[10px] font-sans font-bold bg-[#fef3d6] text-[#8a6a30] px-1.5 py-0.5 rounded border border-[#f0d8a8] shrink-0 whitespace-nowrap">
                    {submersion.hyperkinesiaType}
                  </span>
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#8a4a40] truncate">
                  {submersion.hyperkinesiaScore} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aspect Analysis Single Swipeable Box for Method 1 */}
          <div className="space-y-2 pt-2 border-t border-[#e5e5e0] min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-[#5a5a40] uppercase tracking-wider block shrink-0">
                분석 관점 (Method ①)
              </span>

              {/* Toggle Pills */}
              <div className="flex items-center space-x-1 shrink-0 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={() => setActiveAspect('pharm')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeAspect === 'pharm'
                      ? 'bg-[#b83220] text-white shadow-2xs'
                      : 'bg-[#e5e5e0] text-[#6a6a60] hover:bg-[#d6d6ce]'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>약리학성</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAspect('regen')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeAspect === 'regen'
                      ? 'bg-[#5a5a40] text-white shadow-2xs'
                      : 'bg-[#e5e5e0] text-[#6a6a60] hover:bg-[#d6d6ce]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>재생의학적</span>
                </button>
              </div>
            </div>

            {/* Single Box with Touch Swipe */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed relative break-keep transition-all duration-300 min-h-[100px] flex flex-col justify-between shadow-2xs cursor-grab active:cursor-grabbing ${
                activeAspect === 'pharm'
                  ? 'bg-[#fce8e6] border-[#f5c2bc] text-[#b83220]'
                  : 'bg-[#f8f7f2] border-[#d6d6ce] text-[#4a5a30]'
              }`}
              onMouseEnter={() => setHoveredM1(activeAspect)}
              onMouseLeave={() => setHoveredM1(null)}
            >
              {activeAspect === 'pharm' ? (
                <>
                  <div>
                    <div className="font-bold flex items-center justify-between gap-1 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#b83220] shrink-0" />
                        <span>약리학적 특성 (Submersion Risk)</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a02818] leading-relaxed">
                      전신 수조 노출로 인해 무차별적 중추신경계 수용체 과자극 및 근육계 스크런칭 수축 유발. 재생 에너지가 스트레스 대응으로 소모됨.
                    </p>
                  </div>

                  {hoveredM1 === 'pharm' && (
                    <div className="absolute left-0 bottom-full mb-1.5 z-30 w-full bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                      <div className="font-bold border-b border-[#e5e5e0] pb-1 flex items-center justify-between text-[#b83220]">
                        <span>⚡ 침지법 약리학 분석 지표</span>
                        <span className="text-[10px] text-[#7a7a70] bg-[#fce8e6] px-1.5 py-0.2 rounded">
                          Hover Info
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                        • 수조 침지 시 표피 수용체 반응률 100% 노출.<br />
                        • 전신 과운동지수(HI) 유발 및 대사 에너지 소모율 증가.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div className="font-bold flex items-center justify-between gap-1 mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#5a5a40]">
                        <Sparkles className="w-4 h-4 text-[#5a5a40] shrink-0" />
                        <span>재생의학적 관점 (Submersion Limitation)</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4a5a30] leading-relaxed">
                      전신 비선택적 방출 구조로 상처 부위 신생 모세포(Neoblast) 집중 정밀 농도 유지가 어려우며 재생 속도가 지연됨.
                    </p>
                  </div>

                  {hoveredM1 === 'regen' && (
                    <div className="absolute right-0 bottom-full mb-1.5 z-30 w-full bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                      <div className="font-bold border-b border-[#e5e5e0] pb-1 flex items-center justify-between text-[#5a5a40]">
                        <span>🌱 침지법 재생학 분석 지표</span>
                        <span className="text-[10px] text-[#7a7a70] bg-[#f0f0eb] px-1.5 py-0.2 rounded">
                          Hover Info
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                        • 비선택적 전신 노출로 상처 부위 줄기세포 국소 집적 효율 저하.<br />
                        • 재생 완수 시간 약 14일 소요.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 선택적 국소 전달 방식 (Targeted Hydrogel/Nanoparticle) */}
        <div className="bg-[#f8f7f2] rounded-xl border border-[#d6d6ce] p-4 sm:p-5 space-y-4 relative flex flex-col justify-between min-w-0">
          <div className="space-y-4 min-w-0">
            <div className="pb-3 border-b border-[#d6d6ce] min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-[#4a5a30] uppercase tracking-wider shrink-0 bg-[#e2e8d5] px-1.5 py-0.5 rounded border border-[#c5d898]">
                  Method ②
                </span>
                <h3 className="text-sm font-serif font-bold text-[#2a2a24] leading-snug break-keep min-w-0">
                  선택적 국소 전달 <span className="text-xs font-sans font-normal text-[#6a6a60]">(Targeted Release)</span>
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#6a6a60] leading-relaxed break-keep">
              Hydrogel/Nanoparticle 약물 전달학(DDS) 논문에 기반한 <strong className="text-[#4a5a30] font-semibold">실제 이론 기반 가상 모델</strong>입니다. 절단 상처 부위(wound site)에만 국소적으로 약물을 방출하여 전신 과자극을 차단합니다.
            </p>

            {/* Compact Pharmacological Verification Button with Hover Popover */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowDdsValidationModal(!showDdsValidationModal)}
                onMouseEnter={() => setIsDdsHovered(true)}
                onMouseLeave={() => setIsDdsHovered(false)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#fef8e8] text-[#7a5a10] border border-[#f3e2b4] hover:bg-[#fdeec3] transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="약학적 전달체 검증 & 피드백 정보 (클릭/호버)"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#b86a10]" />
                <span>전달체 검증 ℹ️</span>
              </button>

              {/* Floating Popover on Hover / Click */}
              {(isDdsHovered || showDdsValidationModal) && (
                <div className="absolute left-0 top-full mt-2 z-40 w-72 sm:w-80 bg-white/98 backdrop-blur-md border border-[#f0d8a8] shadow-xl rounded-2xl p-4 text-xs text-[#2a2a24] space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#f0e0b8]">
                    <span className="font-bold text-[#7a5a10] flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-[#b86a10]" />
                      <span>약학적 전달체 검증 & 피드백 반영</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDdsValidationModal(false)}
                      className="text-[#8a8a80] hover:text-[#1a1a1a] font-bold text-xs cursor-pointer px-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 text-[11px] text-[#5a4820] leading-relaxed">
                    <div className="p-2 bg-[#fef8e8] rounded-xl border border-[#f3e2b4] space-y-1">
                      <span className="font-bold text-[#7a5a10] block">
                        • 아세틸콜린(ACh) 분해 특성 보완:
                      </span>
                      <p className="text-[#5a4820]">
                        아세틸콜린은 체내 <em>아세틸콜린에스터레이스(AChE)</em>에 의해 <strong>수 초 내 급속 분해</strong>되어 단순 국소 전달 유지가 까다롭습니다. 이에 따라 효소 분해 저항성 유사체인 <strong>카바콜(Carbachol)</strong> 등으로 약물을 대체하거나 나노입자 캡슐화 전달체를 보완합니다.
                      </p>
                    </div>

                    <div className="p-2 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-1">
                      <span className="font-bold text-[#4a5a30] block">
                        • 전체 약물 국소 전달 타당성 점검:
                      </span>
                      <p className="text-[#5a6a50]">
                        니코틴, 카페인, 에탄올, 에피네프린 등 모든 실험 약물군에 대해서도 약물 분자 반감기 및 국소 방출이 의도대로 작용하는지 지속 검증 및 보정을 거칩니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 min-w-0">
              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#5a5a40] break-keep truncate">재생률 (14일)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#5a5a40] truncate">
                  {targeted.finalRegenerationRate}%
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#3d6a70] break-keep truncate">줄기세포 활성</span>
                  <Zap className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#3d6a70] truncate">
                  {targeted.stemCellActivityIndex} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#3d6a70] break-keep truncate">글라이딩 속도</span>
                  <Activity className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#3d6a70] truncate">
                  {targeted.glidingSpeed}%
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#4a5a30] break-keep truncate">스크런칭 수축</span>
                  <Activity className="w-3.5 h-3.5 text-[#4a5a30] shrink-0" />
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#4a5a30] truncate">
                  {targeted.scrunchingFrequency}회/분
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs col-span-2 min-w-0">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#7a7a70] gap-1 min-w-0">
                  <span className="font-medium text-[#4a5a30] break-keep truncate">과운동증 (Hyperkinesia)</span>
                  <span className="text-[10px] font-sans font-bold bg-[#e2e8d5] text-[#4a5a30] px-1.5 py-0.5 rounded border border-[#c5d898] shrink-0 whitespace-nowrap">
                    {targeted.hyperkinesiaType}
                  </span>
                </div>
                <div className="text-sm sm:text-lg font-serif font-bold text-[#4a5a30] truncate">
                  {targeted.hyperkinesiaScore} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aspect Analysis Single Swipeable Box for Method 2 */}
          <div className="space-y-2 pt-2 border-t border-[#d6d6ce] min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-[#4a5a30] uppercase tracking-wider block shrink-0">
                분석 관점 (Method ②)
              </span>

              {/* Toggle Pills */}
              <div className="flex items-center space-x-1 shrink-0 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={() => setActiveAspect('pharm')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeAspect === 'pharm'
                      ? 'bg-[#3d6a70] text-white shadow-2xs'
                      : 'bg-[#e5e5e0] text-[#6a6a60] hover:bg-[#d6d6ce]'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>약리학성</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAspect('regen')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeAspect === 'regen'
                      ? 'bg-[#4a5a30] text-white shadow-2xs'
                      : 'bg-[#e5e5e0] text-[#6a6a60] hover:bg-[#d6d6ce]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>재생의학적</span>
                </button>
              </div>
            </div>

            {/* Single Box with Touch Swipe */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed relative break-keep transition-all duration-300 min-h-[100px] flex flex-col justify-between shadow-2xs cursor-grab active:cursor-grabbing ${
                activeAspect === 'pharm'
                  ? 'bg-[#e2f0f2] border-[#b8d6dc] text-[#3d6a70]'
                  : 'bg-[#e2e8d5] border-[#c5d898] text-[#4a5a30]'
              }`}
              onMouseEnter={() => setHoveredM2(activeAspect)}
              onMouseLeave={() => setHoveredM2(null)}
            >
              {activeAspect === 'pharm' ? (
                <>
                  <div>
                    <div className="font-bold flex items-center justify-between gap-1 mb-1.5 text-[#3d6a70]">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#3d6a70] shrink-0" />
                        <span>약리학적 국소 방출 동역학</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2a4d52] leading-relaxed">
                      상처 인접 부위 세포막 투과율이 최대화되며, 체내 오프타깃(Off-target) 독성 약물 노출을 차단함.
                    </p>
                  </div>

                  {hoveredM2 === 'pharm' && (
                    <div className="absolute left-0 bottom-full mb-1.5 z-30 w-full bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                      <div className="font-bold border-b border-[#e5e5e0] pb-1 flex items-center justify-between text-[#3d6a70]">
                        <span>🧪 국소 전달 약리학 분석 지표</span>
                        <span className="text-[10px] text-[#3d6a70] bg-[#e2f0f2] px-1.5 py-0.2 rounded">
                          Hover Info
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                        • 스마트 생체분해성 하이드로겔 상처 차단 지속 시간 72시간 유지.<br />
                        • 중추신경계 스트레스 지수 비약적 감소.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div className="font-bold flex items-center justify-between gap-1 mb-1.5 text-[#4a5a30]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#5a5a40] shrink-0" />
                        <span>재생의학적 이점 (Targeted)</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3a4a20] leading-relaxed">
                      전신 신경계 스트레스 지수가 약 {stressDelta}% 감소하며, 상처 부위 줄기세포(Neoblast) 증식 및 이동을 집적 촉진함.
                    </p>
                  </div>

                  {hoveredM2 === 'regen' && (
                    <div className="absolute right-0 bottom-full mb-1.5 z-30 w-full bg-white border border-[#d6d6ce] shadow-xl rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
                      <div className="font-bold border-b border-[#e5e5e0] pb-1 flex items-center justify-between text-[#4a5a30]">
                        <span>✨ 국소 전달 재생학 이점 지표</span>
                        <span className="text-[10px] text-[#4a5a30] bg-[#e2e8d5] px-1.5 py-0.2 rounded">
                          Hover Info
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                        • 줄기세포(Neoblast) 이동 속도 증대 및 신속 눈점(Eyespots) 재생 완성.<br />
                        • 스크런칭 및 발작 행동 발생 빈도 대폭 감소.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};


