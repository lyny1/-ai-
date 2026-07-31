import React from 'react';
import { HelpCircle, X, Dna, Brain, Shield, Database } from 'lucide-react';

interface ResearchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchGuideModal: React.FC<ResearchGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e5e5e0] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-xl text-[#2a2a24] space-y-5 break-keep">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e0]">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-[#5a5a40] text-white flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#5a5a40]">연구 가이드 및 생물학적 원리 (Research Guide)</h2>
              <p className="text-xs text-[#7a7a70]">
                플라나리아 줄기세포(Neoblast) 재생 및 행동 스트레스 구분 모델
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#f5f5f0] text-[#7a7a70] hover:text-[#1a1a1a] hover:bg-[#eaeae2] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Question Highlight Banner */}
        <div className="p-4 bg-[#e2e8d5] border border-[#c5d898] rounded-xl space-y-1.5">
          <span className="text-xs font-bold text-[#4a5a30] uppercase tracking-wider">
            핵심 연구 질문 (Core Research Question)
          </span>
          <blockquote className="text-sm font-serif font-bold text-[#1a1a1a] leading-relaxed italic">
            "약물이 플라나리아 줄기세포 재생에 미치는 직접적인 영향과, 신경계 자극으로 인한 스트레스(스크런칭, 과운동증 등)에 의한 간접적인 영향을 최대한 구분하여 분석할 수 있는가?"
          </blockquote>
        </div>

        {/* 3 Core Scientific Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#e2e8d5] text-[#4a5a30] flex items-center justify-center">
              <Dna className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-serif font-bold text-[#1a1a1a]">1. 직접적 줄기세포 영향</h3>
            <p className="text-[11px] text-[#6a6a60] leading-relaxed">
              약물이 신체 내 줄기세포(Neoblast)의 G2/M 세포주기, smedwi 유전자 발현, ERK/mTOR 신호 전달 경로 및 초기 분열(mitosis) 위치 지정에 직접 미치는 작용.
            </p>
          </div>

          <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#fef3d6] text-[#8a6a30] flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-serif font-bold text-[#1a1a1a]">2. 간접적 신경계 스트레스</h3>
            <p className="text-[11px] text-[#6a6a60] leading-relaxed">
              콜린성/아드레날린성 신경 수용체 과자극으로 유발되는 C-shape 전신 수축(Scrunching) 및 과운동증(Hyperkinesia). 대사 에너지 소모와 피로로 인한 간접적 재생 지연.
            </p>
          </div>

          <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0e8f5] text-[#6a4a70] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-serif font-bold text-[#1a1a1a]">3. 국소 약물 전달 (Hydrogel)</h3>
            <p className="text-[11px] text-[#6a6a60] leading-relaxed">
              재생의학 Hydrogel/Liposome 모사 가상 전달계. 전신 신경 수용체 자극을 차단하고 절단 상처 부위(Blastema)에만 수용체 맞춤 작용을 일으켜 스트레스를 대폭 감소시킴.
            </p>
          </div>
        </div>

        {/* Database Restriction Rationale */}
        <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#8a6a30]">
            <Database className="w-4 h-4" />
            <span>논문 데이터베이스 기반 분석의 과학적 의의</span>
          </div>
          <p className="text-xs text-[#2a2a24] leading-relaxed">
            AI의 자유로운 환각(hallucination)을 방지하고 학교 연구 및 과학 탐구 활동에서의 재현성을 보장하기 위해,
            본 시뮬레이터는 엄선된 플라나리아 약리학 학술 논문 데이터베이스(JSON/CSV) 범위 내에서 수치를 수학적으로 계산 및 검증합니다.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            확인 및 가이드 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

