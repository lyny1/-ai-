import React, { useState } from 'react';
import { X, ShieldCheck, Dna, Layers, Zap, Info, CheckCircle2, Sliders } from 'lucide-react';
import { TargetedDeliveryTechParams } from '../types';

interface TargetedTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  techParams: TargetedDeliveryTechParams;
  onUpdateParams?: (params: TargetedDeliveryTechParams) => void;
}

export const TargetedTechModal: React.FC<TargetedTechModalProps> = ({
  isOpen,
  onClose,
  techParams,
  onUpdateParams,
}) => {
  const [params, setParams] = useState<TargetedDeliveryTechParams>(techParams);

  if (!isOpen) return null;

  const handleSliderChange = (key: keyof TargetedDeliveryTechParams, val: any) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    if (onUpdateParams) {
      onUpdateParams(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e5e5e0] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-xl text-[#2a2a24] space-y-6 break-keep">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e0]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#5a5a40] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#5a5a40]">
                선택적 국소 전달 시스템 (Targeted Local Delivery) 기술 사양 & 예측 타당성
              </h2>
              <p className="text-xs text-[#7a7a70]">
                생체재료(Biomaterials) 기반 상처 부위 맞춤 약물 방출 기전 및 예측 수학 모델
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#f5f5f0] text-[#7a7a70] hover:text-[#1a1a1a] hover:bg-[#eaeae2] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Technical Foundation Summary */}
        <div className="p-4 bg-[#f8f7f2] border border-[#e5e5e0] rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-serif font-bold text-[#5a5a40]">
            <Dna className="w-4 h-4 text-[#5a5a40]" />
            <span>1. 생체재료 및 전달체 기술 기반 (Biomaterial Foundation)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-[#d6d6ce]">
              <span className="font-bold text-[#1a1a1a] block mb-1">🧪 하이드로겔 패치 (GelMA / Chitosan)</span>
              <p className="text-[#5a5a50] leading-relaxed">
                빛 교차결합(Photo-crosslinkable GelMA) 및 키토산/알지네이트 생체분해성 매트릭스로, 플라나리아 상처 상피(Blastema) 조직 표면에 선택적으로 점착(Mucoadhesive)합니다.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#d6d6ce]">
              <span className="font-bold text-[#1a1a1a] block mb-1">⚡ 상처 효소(MMP) 반응성 방출</span>
              <p className="text-[#5a5a50] leading-relaxed">
                절단 후 오직 상처 부위에서만 고농도로 분비되는 기질분해효소(MMP-2/9)에 의해 하이드로겔 분자고리가 절단되어, 줄기세포가 밀집한 상처 표면에만 국소 방출됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Scientific Rationale for Prediction Validity */}
        <div className="p-4 bg-[#e2e8d5] border border-[#c5d898] rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-serif font-bold text-[#4a5a30]">
            <ShieldCheck className="w-4 h-4 text-[#5a5a40]" />
            <span>2. 예측 수치의 생물학적 & 생체역학적 타당성 (Scientific Validity)</span>
          </div>
          <div className="space-y-2 text-xs text-[#2a2a24] leading-relaxed">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#5a5a40] shrink-0 mt-0.5" />
              <p>
                <strong>수중 전신 침지법(Submersion)의 한계:</strong> 용액 전체에 약물이 용해되어 복측 섬모 상피 및 중추신경계(VNC, 두부 신경절) 전신 수용체를 지속 자극함으로써 C-shape 전신 수축(스크런칭)과 막대한 대사 ATP 소모를 유발합니다.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#5a5a40] shrink-0 mt-0.5" />
              <p>
                <strong>국소 전달 시스템의 차단 효과:</strong> 수용액 중 약물 농도를 최소화(상처 외부 농도 ~0 µM 유지)하고 상처 부위(Blastema)에만 수용체 맞춤 유효 농도를 유지하므로, <strong>전신 신경계 자극(스크런칭)을 약 70~80% 차단</strong>합니다.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#5a5a40] shrink-0 mt-0.5" />
              <p>
                <strong>대사 에너지 보존 법칙:</strong> 행동 스트레스(스크런칭) 감소는 Neoblast 세포의 G2/M 주기를 유지시켜 초기 재생(Day 2~7) 속도를 실질적으로 향상시킵니다.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Interactive Parameter Sensitivity Control */}
        <div className="p-4 bg-[#f8f7f2] border border-[#e5e5e0] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-serif font-bold text-[#5a5a40]">
              <Sliders className="w-4 h-4 text-[#5a5a40]" />
              <span>3. 국소 전달 시뮬레이션 민감도 가상 설정 (Parameter Inspector)</span>
            </div>
            <span className="text-[10px] bg-[#f0f0eb] text-[#5a5a40] px-2 py-0.5 rounded font-bold border border-[#d6d6ce]">
              실시간 모델 조정
            </span>
          </div>

          <div className="space-y-4 text-xs pt-1">
            {/* Neuro-Shielding Slider */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#2a2a24]">전신 신경계 차단 효율 (Neuro-Shielding Rate)</span>
                <span className="text-[#5a5a40] font-bold">{params.neuroShieldingEfficiency}% 차단</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={params.neuroShieldingEfficiency}
                onChange={(e) => handleSliderChange('neuroShieldingEfficiency', Number(e.target.value))}
                className="w-full accent-[#5a5a40] cursor-pointer"
              />
              <p className="text-[11px] text-[#7a7a70]">
                수치가 높을수록 신경계 수용체 자극으로 인한 스크런칭 및 과운동증 행동 스트레스가 크게 감소합니다.
              </p>
            </div>

            {/* Blastema Targeting Affinity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#2a2a24]">상처 부위(Blastema) 집적 친화도</span>
                <span className="text-[#3d6a70] font-bold">{params.blastemaTargetingAffinity}% 집적</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={params.blastemaTargetingAffinity}
                onChange={(e) => handleSliderChange('blastemaTargetingAffinity', Number(e.target.value))}
                className="w-full accent-[#3d6a70] cursor-pointer"
              />
              <p className="text-[11px] text-[#7a7a70]">
                상처 조직 줄기세포 니치(Niche)에 유효 약물 농도가 직접 전달되는 정밀도 수치입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            설정 적용 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
