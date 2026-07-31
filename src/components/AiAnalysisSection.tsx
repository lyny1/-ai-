import React, { useState } from 'react';
import { SimulationResult, GeminiAnalysisResponse } from '../types';
import { Bot, Sparkles, Loader2, BookOpen, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

interface AiAnalysisSectionProps {
  simulation: SimulationResult;
  targetedSimulation: SimulationResult;
}

export const AiAnalysisSection: React.FC<AiAnalysisSectionProps> = ({
  simulation,
  targetedSimulation,
}) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { config, drug, matchingPaper, confidence, confidenceLabelKo } = simulation;

  const handleRunAiAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugName: drug.nameKo,
          concentration: config.concentration,
          unit: config.unit,
          exposureHours: config.exposureHours,
          cutLocation: config.cutLocation,
          submersionMetrics: simulation,
          targetedMetrics: targetedSimulation,
          matchingPaper,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: GeminiAnalysisResponse = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Failed to run AI analysis:', err);
      setError(err.message || 'AI 분석을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e5e5e0] gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#5a5a40] text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#5a5a40] flex items-center gap-2">
              Gemini AI 심층 과학 분석 (Biological Mechanism Analysis)
            </h2>
            <p className="text-xs text-[#7a7a70]">
              줄기세포 직접 영향 vs 신경계 자극 스트레스 기전 차이 해설
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#7a7a70]">신뢰도:</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              confidence === 'high'
                ? 'bg-[#e2e8d5] text-[#4a5a30] border-[#c5d898]'
                : confidence === 'moderate'
                ? 'bg-[#fef3d6] text-[#8a6a30] border-[#f0d8a8]'
                : 'bg-[#fce8e6] text-[#b83220] border-[#f5c2bc]'
            }`}
          >
            {confidenceLabelKo}
          </span>
        </div>
      </div>

      {/* Main Trigger Button if Analysis Not Yet Run */}
      {!analysis && !loading && (
        <div className="p-6 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] text-center space-y-3 break-keep">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#f0f0eb] flex items-center justify-center text-[#5a5a40]">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#2a2a24]">
            {drug.nameKo} ({config.concentration} {config.unit}) 실험 결과 AI 과학 분석 수행
          </h3>
          <p className="text-xs text-[#6a6a60] max-w-lg mx-auto leading-relaxed">
            Google Gemini 모델이 학술 논문 데이터와 약리학적 기전을 기반으로, 줄기세포(neoblast) 증식에 대한 직접적 영향과
            신경계 과자극(스크런칭 등)에 의한 간접적 스트레스 영향을 정밀하게 비교 분석합니다.
          </p>
          <button
            onClick={handleRunAiAnalysis}
            className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 심층 생명과학 분석 시작</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#5a5a40] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#5a5a40]">
            Gemini AI가 약학 및 생명과학 논문 근거를 바탕으로 분석 중입니다...
          </p>
          <p className="text-[11px] text-[#7a7a70]">
            Schmidtea mediterranea Neoblast Mitosis & Cholinergic Circuit Pathways Evaluating...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[#fce8e6] border border-[#f5c2bc] rounded-xl text-xs text-[#b83220] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#b83220] shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRunAiAnalysis}
            className="px-3 py-1 bg-[#b83220] hover:bg-[#982210] text-white rounded text-[11px] font-semibold"
          >
            재시도
          </button>
        </div>
      )}

      {/* Analysis Output Results */}
      {analysis && (
        <div className="space-y-4 pt-1">
          {/* Re-run button */}
          <div className="flex justify-end">
            <button
              onClick={handleRunAiAnalysis}
              className="text-xs text-[#7a7a70] hover:text-[#5a5a40] flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>분석 다시 실행</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct Neoblast Mechanism */}
            <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2 break-keep">
              <div className="flex items-center space-x-2 text-[#3d6a70] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. 줄기세포(Neoblast)에 대한 직접적 영향</span>
              </div>
              <p className="text-xs text-[#2a2a24] leading-relaxed">
                {analysis.directNeoblastMechanism}
              </p>
            </div>

            {/* Indirect Neuro-Stress Mechanism */}
            <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2 break-keep">
              <div className="flex items-center space-x-2 text-[#8a6a30] font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>2. 신경계 자극 및 스트레스(간접 영향)</span>
              </div>
              <p className="text-xs text-[#2a2a24] leading-relaxed">
                {analysis.indirectNeuroStressMechanism}
              </p>
            </div>
          </div>

          {/* Delivery Method Comparison Rationale */}
          <div className="p-4 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-2 break-keep">
            <div className="flex items-center space-x-2 text-[#6a4a70] font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>3. 약물 처리 방식(침지법 vs 국소 전달) 비교 해설</span>
            </div>
            <p className="text-xs text-[#2a2a24] leading-relaxed">
              {analysis.deliveryMethodComparison}
            </p>
          </div>

          {/* Literature Match Summary & Conclusion */}
          <div className="p-4 bg-[#e2e8d5] border border-[#c5d898] rounded-xl space-y-2 break-keep">
            <div className="flex items-center space-x-2 text-[#4a5a30] font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>4. 기존 연구 데이터 매칭 및 탐구 결론</span>
            </div>
            <p className="text-xs text-[#2a2a24] leading-relaxed">
              {analysis.literatureMatchSummary}
            </p>
            <div className="pt-2 border-t border-[#c5d898] text-xs text-[#4a5a30] font-bold">
              💡 핵심 요약: {analysis.scientificConclusion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

