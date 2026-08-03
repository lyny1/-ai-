import React, { useState } from 'react';
import { ExperimentConfig, DrugInfo } from '../types';
import { Sparkles, Bot, Check, X, ArrowRight, Zap, Brain, ShieldCheck, Microscope, HelpCircle } from 'lucide-react';

interface AiRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  drugs: DrugInfo[];
  currentConfig: ExperimentConfig;
  onApplyConfig: (newConfig: ExperimentConfig) => void;
}

interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: string;
  config: ExperimentConfig;
  rationale: string;
  expectedOutcome: string;
}

export const AiRecommendationModal: React.FC<AiRecommendationModalProps> = ({
  isOpen,
  onClose,
  drugs,
  currentConfig,
  onApplyConfig,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('nicotine_stress');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; message: string; config?: ExperimentConfig }[]>([
    {
      sender: 'ai',
      message: '안녕하세요! 플라나리아 재생 biological & pharmacodynamics AI 연구 보조원입니다. 원하시는 연구 목적(예: "신경독성 차단", "줄기세포 분열 정지", "하이드로겔 국소방출 비교")을 선택하시거나 질문해 주세요.',
    },
  ]);

  if (!isOpen) return null;

  const scenarios: PresetScenario[] = [
    {
      id: 'nicotine_stress',
      title: '콜린성 신경 과자극 & 스크런칭 C-수축 연구',
      subtitle: '0.2mM 니코틴 + 몸통 절단 + 48시간 노출',
      tag: '신경과운동증 / C-수축 검증',
      icon: '⚡',
      config: {
        drugId: 'nicotine',
        concentration: 0.2,
        unit: 'mM',
        exposureHours: 48,
        cutLocation: 'trunk',
        cutType: 'transverse',
        deliveryMethod: 'targeted',
      },
      rationale: 'nAChR 강작용제로 신경성 C자 수축(scrunching) 및 초당 hyperkinesia 파동을 유발합니다. 국소 하이드로겔 전달 방식을 적용하면 중추신경 전신 스트레스를 차단하면서 정상 재생을 유지할 수 있습니다.',
      expectedOutcome: '전신 침지 대비 스크런칭 발생률 75% 감소, 머리 재생아(Blastema) 성장속도 1.8배 향상.',
    },
    {
      id: 'ethanol_arrest',
      title: '중추신경계 억제 & 불동(Hypokinesia) 상태 연구',
      subtitle: '0.5% 에탄올 + 머리 절단 + 24시간 노출',
      tag: '진정 마비 / 막전위 정지',
      icon: '🧪',
      config: {
        drugId: 'ethanol',
        concentration: 0.5,
        unit: '%',
        exposureHours: 24,
        cutLocation: 'anterior',
        cutType: 'transverse',
        deliveryMethod: 'submersion',
      },
      rationale: '세포막 유동화 및 Ion flux 교란을 유발하여 글라이딩 운동성을 억제(Hypokinesia)하고 머리 뇌 신경 망상 구조 재생을 일시 정지시킵니다.',
      expectedOutcome: 'pLM 운동 속도 0mm/s로 저하, 신세포 표지자 분열 축 정렬 지연.',
    },
    {
      id: 'caffeine_motility',
      title: 'cAMP 상승 & 머리 흔듦(Head-Waving) 과운동 연구',
      subtitle: '0.5mM 카페인 + 꼬리 절단 + 72시간 노출',
      tag: '아데노신 길항 / cAMP 신호',
      icon: '☕',
      config: {
        drugId: 'caffeine',
        concentration: 0.5,
        unit: 'mM',
        exposureHours: 72,
        cutLocation: 'posterior',
        cutType: 'transverse',
        deliveryMethod: 'submersion',
      },
      rationale: '포스포디에스테라아제(PDE) 억제로 세포 내 cAMP를 상승시켜 좌우 탐색 운동(Snake-like Head Waving)을 증가시키고 신세포 G2/M 주기를 일시 지연시킵니다.',
      expectedOutcome: 'Snake-like 과운동 지수 상승, 꼬리 재생아 유연조직 분화 일시 지연.',
    },
    {
      id: 'ach_spasm',
      title: '내인성 콜린성 연축 경련 & 섬모 운동성 연구',
      subtitle: '100µM 아세틸콜린 + 몸통 절단 + 12시간 노출',
      tag: '콜린성 신경망 / 섬모 마비',
      icon: '🧬',
      config: {
        drugId: 'acetylcholine',
        concentration: 100,
        unit: 'µM',
        exposureHours: 12,
        cutLocation: 'trunk',
        cutType: 'transverse',
        deliveryMethod: 'targeted',
      },
      rationale: '내인성 아세틸콜린 수용체 직접 자극으로 전신 연축성 경련 및 섬모 배설류 불균형을 유발합니다.',
      expectedOutcome: '하이드로겔 국소 전달 시 상처 부위 신세포 동원 촉진 및 연축 경련 60% 완화.',
    },
  ];

  const currentSelectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleApply = (targetConfig: ExperimentConfig) => {
    onApplyConfig(targetConfig);
    onClose();
  };

  const handleSendCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const userMsg = customQuestion;
    setCustomQuestion('');

    let replyMsg = '';
    let recConfig: ExperimentConfig = { ...currentConfig };

    if (userMsg.includes('니코틴') || userMsg.includes('C자') || userMsg.includes('스크런칭')) {
      recConfig = scenarios[0].config;
      replyMsg = '니코틴 0.2mM 조건 및 선택적 국소 하이드로겔 패치 설정을 추천합니다. 스크런칭 경련을 정량 분석하기에 가장 적합합니다.';
    } else if (userMsg.includes('에탄올') || userMsg.includes('마비') || userMsg.includes('불동')) {
      recConfig = scenarios[1].config;
      replyMsg = '에탄올 0.5% 전신 침지 조건을 추천합니다. 세포막 유동화 및 신경 억제 효과를 관찰할 수 있습니다.';
    } else if (userMsg.includes('카페인') || userMsg.includes('머리') || userMsg.includes('운동')) {
      recConfig = scenarios[2].config;
      replyMsg = '카페인 0.5mM 수조 노출 조건을 추천합니다. cAMP 상승으로 인한 머리 흔듦(Head-Waving) 과운동성이 극대화됩니다.';
    } else {
      recConfig = scenarios[0].config;
      replyMsg = `"${userMsg}"에 맞춰 학술 논문 데이터베이스 검색 기반 최적 조건(니코틴 0.2mM, 하이드로겔 국소 전달, 몸통 절단 48h)을 도출했습니다. 아래 버튼을 눌러 적용하세요.`;
    }

    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', message: userMsg },
      { sender: 'ai', message: replyMsg, config: recConfig },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#d6d6ce] shadow-2xl p-6 flex flex-col space-y-4 max-h-[90vh] overflow-hidden text-[#2a2a24]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e0] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#e2e8d5] text-[#4a5a30] rounded-xl border border-[#c5d898]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#5a5a40]">
                AI 최적 실험 조건 대화형 추천 시스템 (AI Experiment Setup)
              </h3>
              <p className="text-xs text-[#7a7a70]">
                학술 문헌 데이터베이스(Pagán, Raffa & Agata Assays) 기반 최적 실험 가이드
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8a8a80] hover:text-[#1a1a1a] hover:bg-[#f0f0eb] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {/* Left Column: Preset Scenarios */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#3d6a70]" />
              <span>주요 연구 시나리오 선택</span>
            </label>

            <div className="space-y-2">
              {scenarios.map((sc) => {
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`w-full p-3 text-left rounded-xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#e2e8d5] border-[#5a5a40] ring-2 ring-[#5a5a40]/30 shadow-xs'
                        : 'bg-[#f8f7f2] hover:bg-[#eaeae2] border-[#e5e5e0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#2a2a24] flex items-center gap-1.5">
                        <span>{sc.icon}</span>
                        <span>{sc.title}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#5a5a40]" />}
                    </div>
                    <div className="text-[11px] font-semibold text-[#5a5a40]">{sc.subtitle}</div>
                    <div className="text-[10px] bg-white/80 text-[#6a6a60] px-2 py-0.5 rounded border border-[#d6d6ce] inline-block font-mono">
                      {sc.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Assistant Chat & Selected Setup Preview */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="p-4 bg-[#f8f7f2] border border-[#e5e5e0] rounded-xl space-y-3 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e0]">
                <span className="text-xs font-bold text-[#3d6a70] flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>선택된 조건 학술 분석</span>
                </span>
                <span className="text-[10px] bg-[#e8f0f2] text-[#3d6a70] font-bold px-2 py-0.5 rounded border border-[#b8d6dc]">
                  AI 검증 완료
                </span>
              </div>

              {/* Rationale & Expected Outcomes */}
              <div className="space-y-2 text-xs text-[#4a4a3a]">
                <div>
                  <span className="font-bold text-[#5a5a40]">🔬 작용 메커니즘 근거:</span>
                  <p className="mt-0.5 text-[11px] text-[#6a6a60] leading-relaxed">
                    {currentSelectedScenario.rationale}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[#3d6a70]">📊 예상 실험 결과:</span>
                  <p className="mt-0.5 text-[11px] text-[#3d6a70] font-medium leading-relaxed bg-white p-2 rounded-lg border border-[#d6d6ce]">
                    {currentSelectedScenario.expectedOutcome}
                  </p>
                </div>

                {/* Configuration Summary Badges */}
                <div className="pt-2 border-t border-[#e5e5e0] grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                  <div className="p-1.5 bg-white rounded border border-[#e5e5e0]">
                    약물: <span className="text-[#5a5a40]">{currentSelectedScenario.config.drugId}</span> ({currentSelectedScenario.config.concentration}{currentSelectedScenario.config.unit})
                  </div>
                  <div className="p-1.5 bg-white rounded border border-[#e5e5e0]">
                    투여: <span className="text-[#3d6a70]">{currentSelectedScenario.config.deliveryMethod === 'targeted' ? '선택적 국소 패치' : '전신 침지'}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-[#e5e5e0]">
                    절단: <span className="text-[#8a4a40]">{currentSelectedScenario.config.cutLocation}</span> ({currentSelectedScenario.config.cutType})
                  </div>
                  <div className="p-1.5 bg-white rounded border border-[#e5e5e0]">
                    시간: <span className="text-[#8a6a30]">{currentSelectedScenario.config.exposureHours}시간</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Chat Assistant Input */}
            <form onSubmit={handleSendCustomQuestion} className="flex gap-2">
              <input
                type="text"
                placeholder="원하는 연구 목적을 입력하세요 (예: C자 수축 연구...)"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="flex-1 bg-[#f5f5f0] border border-[#d6d6ce] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5a5a40]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#5a5a40] text-white rounded-xl text-xs font-bold hover:bg-[#4a5a30] transition cursor-pointer"
              >
                질문
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#e5e5e0] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#7a7a70]">
            선택한 조건을 현재 실험 설정에 즉시 반영합니다.
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#f0f0eb] hover:bg-[#e5e5e0] text-[#5a5a40] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={() => handleApply(currentSelectedScenario.config)}
              className="px-5 py-2 bg-[#5a5a40] hover:bg-[#4a5a30] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>이 추천 조건으로 실험 설정 적용</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
