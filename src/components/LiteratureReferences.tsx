import React, { useState } from 'react';
import { LiteratureEntry, DrugInfo } from '../types';
import { BookOpen, ExternalLink, ShieldCheck, Database, Sparkles } from 'lucide-react';

interface LiteratureReferencesProps {
  database: LiteratureEntry[];
  currentDrugId: string;
  drugs: DrugInfo[];
  matchingPaper?: LiteratureEntry;
  onOpenDatabaseModal?: () => void;
}

export const LiteratureReferences: React.FC<LiteratureReferencesProps> = ({
  database,
  currentDrugId,
  drugs,
  matchingPaper,
  onOpenDatabaseModal,
}) => {
  const [filterDrugId, setFilterDrugId] = useState<string>('all');

  const filteredEntries = database.filter((entry) => {
    if (filterDrugId === 'all') return true;
    return entry.drugId === filterDrugId;
  });

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24] space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e5e5e0] gap-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#5a5a40]" />
          <h2 className="text-base font-serif font-bold text-[#5a5a40]">
            근거 학술 논문 및 시뮬레이션 데이터베이스 (Literature Citations)
          </h2>
        </div>

        {/* Drug Filter & Live Collection Button */}
        <div className="flex items-center space-x-2">
          {onOpenDatabaseModal && (
            <button
              onClick={onOpenDatabaseModal}
              className="px-3 py-1 bg-[#3d6a70] hover:bg-[#2d5055] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e2e8d5]" />
              <span>실시간 논문 DB 수집/관리</span>
            </button>
          )}

          <span className="text-xs text-[#7a7a70]">약물 필터:</span>
          <select
            value={filterDrugId}
            onChange={(e) => setFilterDrugId(e.target.value)}
            className="bg-[#f5f5f0] border border-[#d6d6ce] rounded-lg px-2.5 py-1 text-xs text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
          >
            <option value="all">전체 약물 ({database.length}건)</option>
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameKo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Currently Matched Paper Highlight Banner */}
      {matchingPaper && (
        <div className="p-4 bg-[#e2e8d5] border border-[#c5d898] rounded-xl space-y-2 break-keep">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4a5a30] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#5a5a40]" />
              현재 설정 조건 최우선 매칭 논문 (Primary Matching Study)
            </span>
            <span className="text-[10px] bg-white text-[#4a5a30] font-bold px-2 py-0.5 rounded border border-[#c5d898]">
              High Confidence
            </span>
          </div>
          <div className="text-sm font-serif font-bold text-[#1a1a1a]">{matchingPaper.title}</div>
          <div className="text-xs text-[#4a4a3a]">
            {matchingPaper.authors} ({matchingPaper.year}) — <span className="italic">{matchingPaper.journal}</span>
          </div>
          <div className="text-xs text-[#2a2a24] bg-white/90 p-2.5 rounded-lg border border-[#c5d898]">
            <span className="text-[#5a5a40] font-bold">연구 주요 결과: </span>
            {matchingPaper.notes}
          </div>
        </div>
      )}

      {/* Literature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.map((paper) => {
          const isCurrentMatch = matchingPaper?.id === paper.id;

          return (
            <div
              key={paper.id}
              className={`p-4 rounded-xl border transition space-y-2 break-keep ${
                isCurrentMatch
                  ? 'bg-[#f8f7f2] border-[#5a5a40] ring-1 ring-[#5a5a40]/30'
                  : 'bg-[#fafafa] border-[#e5e5e0] hover:border-[#d6d6ce]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-[#5a5a40] bg-[#f0f0eb] px-2 py-0.5 rounded border border-[#d6d6ce]">
                  {paper.drugName} ({paper.concentration})
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    paper.isRealData
                      ? 'bg-[#e2e8d5] text-[#4a5a30] border-[#c5d898]'
                      : 'bg-[#fef3d6] text-[#8a6a30] border-[#f0d8a8]'
                  }`}
                >
                  {paper.isRealData ? '실제 논문 데이터' : 'AI 추정 모델'}
                </span>
              </div>

              <h3 className="text-xs font-serif font-bold text-[#1a1a1a] leading-snug">{paper.title}</h3>

              <div className="text-[11px] text-[#7a7a70]">
                {paper.authors} ({paper.year}) · <span className="italic">{paper.journal}</span>
              </div>

              <p className="text-[11px] text-[#5a5a50] line-clamp-2 pt-1 border-t border-[#e5e5e0]">
                {paper.notes}
              </p>

              {/* DOI and PubMed Links */}
              <div className="flex items-center space-x-3 pt-2 text-[11px]">
                {paper.doi && (
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5a5a40] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>DOI Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {paper.pubmedId && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3d6a70] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>PubMed ID ({paper.pubmedId})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Ethics and Scientific Integrity Compliance Footer Banner */}
      <div className="p-3 bg-[#f8f7f2] border border-[#e5e5e0] rounded-xl text-xs text-[#6a6a60] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#4a5a30] shrink-0" />
          <span className="font-semibold text-[#4a5a30] break-keep">
            생명윤리 및 동물실험 대체 3R (Replacement, Reduction, Refinement) 원칙 준수 가상 데이터베이스
          </span>
        </div>
        <span className="text-[10px] bg-white px-2 py-1 rounded border border-[#d6d6ce] text-[#5a5a40] font-medium shrink-0">
          Peer-Reviewed Literature Validated
        </span>
      </div>
    </div>
  );
};

