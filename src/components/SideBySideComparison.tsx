import React from 'react';
import { ComparisonResults } from '../types';
import { Split, ShieldAlert, Sparkles, TrendingUp, Zap, HeartPulse, Activity } from 'lucide-react';

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

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT PANEL: 일반 침지법 (Whole Submersion) */}
        <div className="bg-[#fafafa] rounded-xl border border-[#e5e5e0] p-5 space-y-4 relative overflow-hidden">
          <div className="pb-3 border-b border-[#e5e5e0]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#8a6a30] uppercase tracking-wider shrink-0">
                Method ①
              </span>
              <h3 className="text-sm font-serif font-bold text-[#2a2a24] break-keep">
                일반 침지법 (Submersion Bath)
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#6a6a60] leading-relaxed break-keep">
            사육 수조 전체에 약물이 용해되어 플라나리아 표피 및 신경 수용체 전체가 약물에 직접 노출됨.
            신경계 과자극에 따른 스트레스 반응이 동반됨.
          </p>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#5a5a40] break-keep">재생률 (14일)</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#5a5a40] shrink-0" />
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#5a5a40]">
                {submersion.finalRegenerationRate}%
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#3d6a70] break-keep">줄기세포 활성</span>
                <Zap className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#3d6a70]">
                {submersion.stemCellActivityIndex} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#3d6a70] break-keep">글라이딩 속도</span>
                <Activity className="w-3.5 h-3.5 text-[#3d6a70] shrink-0" />
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#3d6a70]">
                {submersion.glidingSpeed}%
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#8a6a30] break-keep">스크런칭 수축</span>
                <Activity className="w-3.5 h-3.5 text-[#8a6a30] shrink-0" />
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#8a6a30]">
                {submersion.scrunchingFrequency}회/분
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#e5e5e0] space-y-1 shadow-2xs col-span-2 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#8a4a40] break-keep">과운동증 (Hyperkinesia)</span>
                <span className="text-[10px] font-sans font-bold bg-[#fef3d6] text-[#8a6a30] px-1.5 py-0.5 rounded border border-[#f0d8a8] shrink-0 whitespace-nowrap">
                  {submersion.hyperkinesiaType}
                </span>
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#8a4a40]">
                {submersion.hyperkinesiaScore} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#fce8e6] border border-[#f5c2bc] rounded-xl text-xs text-[#b83220] flex items-start space-x-2 break-keep">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#b83220] mt-0.5" />
            <div>
              <span className="font-bold">약리학적 특성: </span>
              전신 노출로 인해 근육계 수축(스크런칭) 및 중추신경계 과자극이 크게 유발되며,
              재생에 필요한 대사 에너지 일부가 스트레스 대응으로 소모됨.
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 선택적 국소 전달 방식 (Targeted Hydrogel/Nanoparticle) */}
        <div className="bg-[#f8f7f2] rounded-xl border border-[#d6d6ce] p-5 space-y-4 relative overflow-hidden">
          <div className="pb-3 border-b border-[#d6d6ce]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#4a5a30] uppercase tracking-wider shrink-0">
                Method ②
              </span>
              <h3 className="text-sm font-serif font-bold text-[#2a2a24] break-keep">
                선택적 국소 전달 (Targeted Release)
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#6a6a60] leading-relaxed break-keep">
            Hydrogel/Nanoparticle을 활용하여 절단 상처 부위(wound site)에만 국소적으로 약물을 방출함.
            신경 수용체 전체의 과자극을 차단하고 줄기세포 위치에만 집중 작용함.
          </p>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#5a5a40] break-keep">재생률 (14일)</span>
                {regenDelta > 0 && (
                  <span className="text-[10px] font-bold text-[#4a5a30] bg-[#e2e8d5] px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                    +{regenDelta}%
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#5a5a40]">
                {targeted.finalRegenerationRate}%
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#3d6a70] break-keep">줄기세포 활성</span>
                {stemCellDelta > 0 && (
                  <span className="text-[10px] font-bold text-[#3d6a70] bg-[#e2f0f2] px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                    +{stemCellDelta}
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#3d6a70]">
                {targeted.stemCellActivityIndex} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#3d6a70] break-keep">글라이딩 속도</span>
                {glidingDelta > 0 && (
                  <span className="text-[10px] font-bold text-[#3d6a70] bg-[#e2f0f2] px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                    +{glidingDelta}%
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#3d6a70]">
                {targeted.glidingSpeed}%
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#4a5a30] break-keep">스크런칭 수축</span>
                {scrunchDelta > 0 && (
                  <span className="text-[10px] font-bold text-[#4a5a30] bg-[#e2e8d5] px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                    -{scrunchDelta.toFixed(1)}회
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#4a5a30]">
                {targeted.scrunchingFrequency}회/분
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#d6d6ce] space-y-1 shadow-2xs col-span-2 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#7a7a70] gap-1">
                <span className="font-medium text-[#4a5a30] break-keep">과운동증 (Hyperkinesia)</span>
                <span className="text-[10px] font-sans font-bold bg-[#e2e8d5] text-[#4a5a30] px-1.5 py-0.5 rounded border border-[#c5d898] shrink-0 whitespace-nowrap">
                  {targeted.hyperkinesiaType}
                </span>
              </div>
              <div className="text-base sm:text-lg font-serif font-bold text-[#4a5a30] flex items-baseline justify-between gap-1 min-w-0">
                <span>{targeted.hyperkinesiaScore} <span className="text-xs font-sans text-[#7a7a70] font-normal">/100</span></span>
                {targeted.hyperkinesiaScore < submersion.hyperkinesiaScore && (
                  <span className="text-[10px] font-bold text-[#4a5a30] bg-[#e2e8d5] px-1.5 py-0.5 rounded border border-[#c5d898] shrink-0 whitespace-nowrap">
                    -{submersion.hyperkinesiaScore - targeted.hyperkinesiaScore}점
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#e2e8d5] border border-[#c5d898] rounded-xl text-xs text-[#4a5a30] flex items-start space-x-2 break-keep">
            <Sparkles className="w-4 h-4 shrink-0 text-[#5a5a40] mt-0.5" />
            <div>
              <span className="font-bold">재생의학적 이점: </span>
              전신 신경계 스트레스 지수가 약 {stressDelta}% 감소하면서, 줄기세포(Neoblast) 증식 및
              세포 이동(migration)에 최적화된 마이크로 환경이 형성됨.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

