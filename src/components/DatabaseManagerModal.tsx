import React, { useState } from 'react';
import { LiteratureEntry, DrugInfo, CutLocation } from '../types';
import { Database, Download, Upload, Plus, X, Check, FileJson, FileSpreadsheet } from 'lucide-react';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: LiteratureEntry[];
  drugs: DrugInfo[];
  onAddPaper: (entry: LiteratureEntry) => void;
  onImportDatabase: (entries: LiteratureEntry[]) => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  database,
  drugs,
  onAddPaper,
  onImportDatabase,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // New paper form state
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState(2023);
  const [journal, setJournal] = useState('');
  const [doi, setDoi] = useState('');
  const [pubmedId, setPubmedId] = useState('');
  const [drugId, setDrugId] = useState(drugs[0]?.id || 'nicotine');
  const [concentrationStr, setConcentrationStr] = useState('0.2 mM');
  const [minConcValue, setMinConcValue] = useState(0.1);
  const [maxConcValue, setMaxConcValue] = useState(0.3);
  const [cutLocation, setCutLocation] = useState<CutLocation>('trunk');
  const [regenDay14, setRegenDay14] = useState(85);
  const [stemCellActivity, setStemCellActivity] = useState(75);
  const [scrunchingFreq, setScrunchingFreq] = useState(10);
  const [stressIndex, setStressIndex] = useState(60);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleCreatePaper = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDrug = drugs.find((d) => d.id === drugId);

    const newEntry: LiteratureEntry = {
      id: `custom-${Date.now()}`,
      drugId,
      drugName: selectedDrug ? selectedDrug.name : 'Custom Drug',
      title,
      authors,
      year: Number(year),
      journal,
      doi,
      pubmedId,
      concentration: concentrationStr,
      minConcValue: Number(minConcValue),
      maxConcValue: Number(maxConcValue),
      cutLocation,
      findings: {
        regenerationRateDay7: Math.round(regenDay14 * 0.7),
        regenerationRateDay14: Number(regenDay14),
        stemCellActivityIndex: Number(stemCellActivity),
        eyeSpotEtaDays: 5.5,
        completeEtaDays: 10.0,
        scrunchingFrequency: Number(scrunchingFreq),
        hyperkinesiaScore: 65,
        survivalRate: 95,
        stressIndex: Number(stressIndex),
      },
      notes,
      isRealData: true,
    };

    onAddPaper(newEntry);
    setShowAddForm(false);
    // Reset form
    setTitle('');
    setAuthors('');
    setNotes('');
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(database, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'planarian_literature_database.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'id',
      'drugId',
      'drugName',
      'title',
      'authors',
      'year',
      'journal',
      'doi',
      'pubmedId',
      'concentration',
      'minConcValue',
      'maxConcValue',
      'cutLocation',
      'regenerationRateDay14',
      'stemCellActivityIndex',
      'scrunchingFrequency',
      'stressIndex',
      'notes',
    ];

    const rows = database.map((item) => [
      item.id,
      item.drugId,
      item.drugName,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.authors.replace(/"/g, '""')}"`,
      item.year,
      `"${item.journal.replace(/"/g, '""')}"`,
      item.doi || '',
      item.pubmedId || '',
      item.concentration,
      item.minConcValue,
      item.maxConcValue,
      item.cutLocation,
      item.findings.regenerationRateDay14,
      item.findings.stemCellActivityIndex,
      item.findings.scrunchingFrequency,
      item.findings.stressIndex,
      `"${item.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', 'planarian_literature_database.csv');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // File Upload Handler for JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportDatabase(parsed);
          alert(`성공적으로 ${parsed.length}건의 논문 데이터베이스를 불러왔습니다.`);
        }
      } catch (err) {
        alert('JSON 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#e5e5e0] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-xl text-[#2a2a24] space-y-5 break-keep">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e0]">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-[#5a5a40] text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#5a5a40]">논문 데이터베이스 관리자 (Paper DB Engine)</h2>
              <p className="text-xs text-[#7a7a70]">
                예측 신뢰성과 연구 재현성을 보장하는 학술 논문 데이터 집합 ({database.length}건 등록됨)
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

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>새 논문 데이터 직접 추가</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="px-3 py-1.5 bg-white hover:bg-[#eaeae2] text-[#3a3a30] text-xs font-semibold rounded-lg border border-[#d6d6ce] cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-[#3d6a70]" />
              <span>JSON 불러오기</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-white hover:bg-[#eaeae2] text-[#3a3a30] text-xs font-semibold rounded-lg border border-[#d6d6ce] flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5 text-[#8a6a30]" />
              <span>JSON 내보내기</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white hover:bg-[#eaeae2] text-[#3a3a30] text-xs font-semibold rounded-lg border border-[#d6d6ce] flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#5a5a40]" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* Add Paper Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleCreatePaper} className="p-4 bg-[#f8f7f2] rounded-xl border border-[#5a5a40] space-y-3">
            <div className="text-xs font-serif font-bold text-[#5a5a40] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>신규 학술 연구 논문 데이터 양식</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#7a7a70]">논문 제목 (Title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: Nicotine delays neoblast mitosis..."
                  className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7a7a70]">저자 (Authors)</label>
                <input
                  type="text"
                  required
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="예: Smith A, Johnson B, et al."
                  className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7a7a70]">출판 저널 / 연도</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    placeholder="저널명 (e.g. Dev Biol)"
                    className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-20 bg-white border border-[#d6d6ce] rounded-lg px-2 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#7a7a70]">DOI / PubMed ID</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="10.1016/..."
                    className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                  <input
                    type="text"
                    value={pubmedId}
                    onChange={(e) => setPubmedId(e.target.value)}
                    placeholder="PubMed ID"
                    className="w-28 bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#7a7a70]">대상 약물 및 실험 농도 범위</label>
                <div className="flex space-x-2">
                  <select
                    value={drugId}
                    onChange={(e) => setDrugId(e.target.value)}
                    className="bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  >
                    {drugs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameKo}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={concentrationStr}
                    onChange={(e) => setConcentrationStr(e.target.value)}
                    placeholder="예: 0.2 mM"
                    className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#7a7a70]">최소-최대 수치 수용 범위 (Min - Max)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    value={minConcValue}
                    onChange={(e) => setMinConcValue(Number(e.target.value))}
                    className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2 py-1.5 text-xs text-[#1a1a1a]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={maxConcValue}
                    onChange={(e) => setMaxConcValue(Number(e.target.value))}
                    className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#7a7a70]">논문 요약 노트</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="실험 관찰 결과 요약..."
                className="w-full bg-white border border-[#d6d6ce] rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-[#f5f5f0] text-[#6a6a60] text-xs rounded-lg border border-[#d6d6ce]"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                논문 데이터 저장
              </button>
            </div>
          </form>
        )}

        {/* Database Rows List */}
        <div className="space-y-2">
          {database.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-[#fafafa] rounded-xl border border-[#e5e5e0] flex items-start justify-between text-xs gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-[#5a5a40]">{item.drugName}</span>
                  <span className="text-[#7a7a70]">({item.concentration})</span>
                  <span className="text-[10px] bg-[#f0f0eb] border border-[#d6d6ce] text-[#6a6a60] px-1.5 py-0.2 rounded font-semibold">
                    {item.cutLocation} cut
                  </span>
                </div>
                <div className="font-bold text-[#1a1a1a] mt-1">{item.title}</div>
                <div className="text-[11px] text-[#7a7a70] mt-0.5">
                  {item.authors} ({item.year}) · {item.journal}
                </div>
              </div>
              <div className="text-right text-[11px] shrink-0 space-y-0.5">
                <div className="text-[#5a5a40] font-bold">Day14 재생: {item.findings.regenerationRateDay14}%</div>
                <div className="text-[#8a6a30]">스크런칭: {item.findings.scrunchingFrequency}회/분</div>
                <div className="text-[#7a7a70]">스트레스: {item.findings.stressIndex}/100</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

