import React from 'react';
import { Database, HelpCircle, Dna } from 'lucide-react';

interface NavbarProps {
  paperCount: number;
  onOpenDatabaseManager: () => void;
  onOpenResearchGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  paperCount,
  onOpenDatabaseManager,
  onOpenResearchGuide,
}) => {
  return (
    <header className="bg-white border-b border-[#e5e5e0] text-[#1a1a1a] sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Title & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-serif font-bold text-[#5a5a40] tracking-tight flex items-center gap-2">
                Planaria AI Lab <span className="hidden sm:inline-block text-xs font-sans font-normal text-[#8a8a80] border-l border-[#d6d6ce] pl-2">플라나리아 줄기세포 시뮬레이터</span>
              </h1>
              <span className="bg-[#f0f0eb] border border-[#d6d6ce] text-[#5a5a40] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Paper DB
              </span>
            </div>
            <p className="text-[11px] text-[#7a7a70] hidden md:block">
              Schmidtea mediterranea Neoblast Regeneration & Neuro-Stress Differentiation Model
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenResearchGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#f5f5f0] hover:bg-[#eaeae2] border border-[#d6d6ce] text-[#4a4a3d] text-xs font-medium transition"
            title="연구 질문 및 과학적 원리 안내"
          >
            <HelpCircle className="w-4 h-4 text-[#5a5a40]" />
            <span className="hidden sm:inline">연구 가이드</span>
          </button>

          <button
            onClick={onOpenDatabaseManager}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#5a5a40] hover:bg-[#4a4a34] text-white text-xs font-semibold transition shadow-sm"
          >
            <Database className="w-4 h-4 text-[#e0e0d8]" />
            <span>논문 DB ({paperCount}건)</span>
          </button>
        </div>
      </div>
    </header>
  );
};

