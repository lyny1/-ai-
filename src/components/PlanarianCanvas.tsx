import React, { useState, useEffect } from 'react';
import { SimulationResult } from '../types';
import { Activity, Sparkles, AlertCircle } from 'lucide-react';

interface PlanarianCanvasProps {
  simulation: SimulationResult;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const PlanarianCanvas: React.FC<PlanarianCanvasProps> = ({
  simulation,
  selectedDay,
  onSelectDay,
}) => {
  const { config, drug, timeSeries } = simulation;
  const currentMetric = timeSeries[selectedDay] || timeSeries[0];

  // Animation toggle state for scrunching pulsation
  const [isScrunchingPulse, setIsScrunchingPulse] = useState(false);

  useEffect(() => {
    if (currentMetric.scrunchingFreq > 3) {
      const intervalMs = Math.max(400, 3000 / (currentMetric.scrunchingFreq || 1));
      const timer = setInterval(() => {
        setIsScrunchingPulse((prev) => !prev);
      }, intervalMs);
      return () => clearInterval(timer);
    } else {
      setIsScrunchingPulse(false);
    }
  }, [currentMetric.scrunchingFreq]);

  // Determine Blastema size based on selected day's regeneration rate
  const blastemaPercent = currentMetric.blastemaSizeScore;
  const showEyes = currentMetric.eyeSpotVisible;

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24]">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e5e5e0] mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#5a5a40]" />
          <h3 className="text-sm font-serif font-bold text-[#5a5a40]">플라나리아 형태학 & 행동 시뮬레이션 (Anatomical Canvas)</h3>
        </div>

        {/* Day Selector Bar */}
        <div className="flex items-center space-x-1 bg-[#f5f5f0] p-1 rounded-xl border border-[#d6d6ce]">
          <span className="text-[11px] text-[#7a7a70] font-semibold px-2">Day:</span>
          {[0, 2, 4, 7, 10, 14].map((d) => (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg transition ${
                selectedDay === d
                  ? 'bg-[#5a5a40] text-white font-bold shadow-xs'
                  : 'text-[#6a6a60] hover:text-[#1a1a1a]'
              }`}
            >
              d{d}
            </button>
          ))}
        </div>
      </div>

      {/* Main SVG Visualization Container */}
      <div className="relative w-full h-64 sm:h-72 bg-[#e9e9e2] rounded-xl border border-[#d6d6ce] overflow-hidden flex items-center justify-center">
        {/* Submersion Bath Particles Effect */}
        {config.deliveryMethod === 'submersion' && (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-4 left-10 w-2.5 h-2.5 rounded-full bg-[#8a9a5b] animate-ping" />
            <div className="absolute top-20 right-12 w-3 h-3 rounded-full bg-[#5a5a40] animate-pulse" />
            <div className="absolute bottom-8 left-1/3 w-2 h-2 rounded-full bg-[#6b7c4a] animate-ping" />
            <div className="absolute top-1/2 right-1/4 w-2.5 h-2.5 rounded-full bg-[#8a9a5b] animate-pulse" />
            <div className="text-[10px] text-[#5a5a40] font-mono font-bold uppercase tracking-wider absolute top-3 right-3 bg-white/80 px-2 py-0.5 rounded border border-[#d6d6ce]">
              Submersion Bath ({drug.name} {config.concentration} {config.unit})
            </div>
          </div>
        )}

        {/* Targeted Local Release Delivery Patch Effect */}
        {config.deliveryMethod === 'targeted' && (
          <div className="absolute top-3 right-3 pointer-events-none text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5a5a40] bg-white/90 px-2.5 py-1 rounded-full border border-[#5a5a40] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#5a5a40]" />
              Targeted Hydrogel Release
            </span>
          </div>
        )}

        {/* Animated Planarian Body SVG */}
        <svg
          viewBox="0 0 400 200"
          className={`w-full h-full max-w-lg transition-transform duration-300 ${
            isScrunchingPulse ? 'scale-y-90 scale-x-95 rotate-2' : 'scale-100'
          }`}
        >
          <defs>
            {/* Planarian Body Gradient - Natural Moss/Olive Tones */}
            <linearGradient id="planarianBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6b7c4a" />
              <stop offset="50%" stopColor="#8a9a5b" />
              <stop offset="100%" stopColor="#5a6a3b" />
            </linearGradient>

            {/* Blastema Tissue Gradient - Bright Pale Sage/Yellow-Green */}
            <linearGradient id="blastemaTissue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d8e6b5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c5d898" stopOpacity="0.95" />
            </linearGradient>

            {/* Targeted Hydrogel Gel Gradient */}
            <radialGradient id="hydrogelGlow">
              <stop offset="0%" stopColor="#5a5a40" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8a9a5b" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Main Planarian Body Outline & Anatomical Regeneration */}
          <g transform="translate(40, 30)">
            {/* 1. ANTERIOR CUT: Head Amputated, Body Stump (x=85 to x=280) + Growing Leftward Head Blastema */}
            {config.cutLocation === 'anterior' && (
              <g>
                {/* Remaining Posterior Stump */}
                <path
                  d="M 85,25 C 140,20 220,25 260,40 C 280,50 290,60 280,70 C 260,80 140,85 85,75 Z"
                  fill="url(#planarianBody)"
                  stroke="#4a5a2b"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                {/* Cut Wound Margin Edge at x=85 */}
                <line x1="85" y1="25" x2="85" y2="75" stroke="#b83220" strokeWidth="2.5" />

                {/* Regenerating Head Blastema Growing Leftward from x=85 */}
                {blastemaPercent > 0 && (
                  <path
                    d={`M 85,25 C 85,25 ${85 - (blastemaPercent / 100) * 45},${
                      25 - (blastemaPercent / 100) * 15
                    } ${85 - (blastemaPercent / 100) * 60},50 C ${
                      85 - (blastemaPercent / 100) * 45
                    },${75 + (blastemaPercent / 100) * 15} 85,75 85,75 Z`}
                    fill="url(#blastemaTissue)"
                    stroke="#8a9a5b"
                    strokeWidth="1.5"
                  />
                )}

                {/* Eye Spots Differentiation within Regenerated Head Blastema */}
                {showEyes && blastemaPercent > 30 && (
                  <g className="animate-pulse">
                    {/* Left Eye Spot in new head tissue */}
                    <circle cx={85 - (blastemaPercent / 100) * 45} cy="42" r="3" fill="#ffffff" />
                    <circle cx={85 - (blastemaPercent / 100) * 46} cy="42" r="1.8" fill="#1a1a1a" />
                    {/* Right Eye Spot in new head tissue */}
                    <circle cx={85 - (blastemaPercent / 100) * 45} cy="58" r="3" fill="#ffffff" />
                    <circle cx={85 - (blastemaPercent / 100) * 46} cy="58" r="1.8" fill="#1a1a1a" />
                  </g>
                )}
              </g>
            )}

            {/* 2. TRUNK CUT: Midbody Amputated, Trunk Stump (x=160 to x=280) + Growing Leftward Anterior Tissue */}
            {config.cutLocation === 'trunk' && (
              <g>
                {/* Remaining Posterior Stump */}
                <path
                  d="M 160,25 C 200,25 250,30 270,45 C 285,55 285,65 270,75 C 250,85 200,85 160,80 Z"
                  fill="url(#planarianBody)"
                  stroke="#4a5a2b"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                {/* Cut Wound Margin Edge at x=160 */}
                <line x1="160" y1="25" x2="160" y2="80" stroke="#b83220" strokeWidth="2.5" />

                {/* Regenerating Anterior Trunk & Head Blastema Growing Leftward from x=160 */}
                {blastemaPercent > 0 && (
                  <path
                    d={`M 160,25 C 130,22 ${160 - (blastemaPercent / 100) * 110},${
                      22 - (blastemaPercent / 100) * 12
                    } ${160 - (blastemaPercent / 100) * 135},50 C ${
                      160 - (blastemaPercent / 100) * 110
                    },${80 + (blastemaPercent / 100) * 12} 130,80 160,80 Z`}
                    fill="url(#blastemaTissue)"
                    stroke="#8a9a5b"
                    strokeWidth="1.5"
                  />
                )}

                {/* Eye Spots Differentiation within Regenerated Trunk-Head Tissue */}
                {showEyes && blastemaPercent > 35 && (
                  <g className="animate-pulse">
                    <circle cx={160 - (blastemaPercent / 100) * 115} cy="42" r="3" fill="#ffffff" />
                    <circle cx={160 - (blastemaPercent / 100) * 116} cy="42" r="1.8" fill="#1a1a1a" />
                    <circle cx={160 - (blastemaPercent / 100) * 115} cy="58" r="3" fill="#ffffff" />
                    <circle cx={160 - (blastemaPercent / 100) * 116} cy="58" r="1.8" fill="#1a1a1a" />
                  </g>
                )}
              </g>
            )}

            {/* 3. POSTERIOR CUT: Tail Amputated, Head/Trunk Stump (x=25 to x=220) + Growing Rightward Tail Blastema */}
            {config.cutLocation === 'posterior' && (
              <g>
                {/* Intact Head & Trunk Stump */}
                <path
                  d="M 30,60 C 10,60 0,40 10,20 C 25,0 50,10 70,25 C 140,20 190,25 220,32 L 220,72 C 190,80 140,85 70,75 C 50,90 25,100 10,80 Z"
                  fill="url(#planarianBody)"
                  stroke="#4a5a2b"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                {/* Intact Original Eyes */}
                <circle cx="25" cy="40" r="3" fill="#ffffff" />
                <circle cx="24" cy="40" r="1.8" fill="#1a1a1a" />
                <circle cx="25" cy="60" r="3" fill="#ffffff" />
                <circle cx="24" cy="60" r="1.8" fill="#1a1a1a" />

                {/* Cut Wound Margin Edge at x=220 */}
                <line x1="220" y1="32" x2="220" y2="72" stroke="#b83220" strokeWidth="2.5" />

                {/* Regenerating Tail Blastema Growing Rightward from x=220 */}
                {blastemaPercent > 0 && (
                  <path
                    d={`M 220,32 Q ${220 + (blastemaPercent / 100) * 35},35 ${
                      220 + (blastemaPercent / 100) * 65
                    },52 Q ${220 + (blastemaPercent / 100) * 35},70 220,72 Z`}
                    fill="url(#blastemaTissue)"
                    stroke="#8a9a5b"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            )}

            {/* Intestinal Ventral Branching Pattern Overlay */}
            <path
              d="M 60,50 Q 140,48 210,55 M 90,45 Q 110,35 130,45 M 150,45 Q 170,35 190,45 M 90,60 Q 110,68 130,60 M 150,60 Q 170,68 190,60"
              stroke="#3a4a1b"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              fill="none"
              opacity="0.5"
            />

            {/* Targeted Hydrogel Gel Patch Gel Ring at Wound Site */}
            {config.deliveryMethod === 'targeted' && (
              <circle
                cx={
                  config.cutLocation === 'anterior'
                    ? 85
                    : config.cutLocation === 'trunk'
                    ? 160
                    : 220
                }
                cy="50"
                r="20"
                fill="url(#hydrogelGlow)"
                stroke="#5a5a40"
                strokeWidth="1.5"
                strokeDasharray="3,2"
                className="animate-spin-slow"
              />
            )}
          </g>
        </svg>

        {/* Live Behavior Alert Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-white/95 border border-[#d6d6ce] px-3 py-1.5 rounded-xl text-xs shadow-xs text-[#2a2a24]">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="font-bold text-[#5a5a40]">행동 (Day {selectedDay}):</span>
            <span className="text-[#3d6a70] font-mono font-semibold">
              글라이딩 {currentMetric.glidingSpeed}%
            </span>
            <span className="text-[#d6d6ce]">|</span>
            <span className="text-[#8a6a30] font-mono font-semibold">
              스크런칭 {currentMetric.scrunchingFreq}회/분
            </span>
            <span className="text-[#d6d6ce]">|</span>
            <span className="text-[#6a4a70] font-mono font-semibold">
              과운동 {currentMetric.hyperkinesiaScore}점 ({currentMetric.hyperkinesiaType || simulation.hyperkinesiaType})
            </span>
          </div>
          {currentMetric.scrunchingFreq > 10 && (
            <span className="flex items-center text-[10px] text-[#b83220] font-bold bg-[#fce8e6] px-1.5 py-0.5 rounded border border-[#f5c2bc] shrink-0">
              <AlertCircle className="w-3 h-3 mr-1" />
              고스크런칭
            </span>
          )}
        </div>
      </div>

      {/* Metric Summary Indicators underneath Canvas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
        <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5">
          <div className="text-[11px] font-semibold text-[#7a7a70]">재생률 (Day {selectedDay})</div>
          <div className="text-lg font-serif font-bold text-[#5a5a40]">
            {currentMetric.regenerationRate}%
          </div>
        </div>

        <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5">
          <div className="text-[11px] font-semibold text-[#7a7a70]">줄기세포 (Neoblast)</div>
          <div className="text-lg font-serif font-bold text-[#3d6a70]">
            {currentMetric.stemCellActivity}/100
          </div>
        </div>

        <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5">
          <div className="text-[11px] font-semibold text-[#7a7a70]">글라이딩 (섬모운동)</div>
          <div className="text-lg font-serif font-bold text-[#3d6a70]">
            {currentMetric.glidingSpeed}%
          </div>
        </div>

        <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5">
          <div className="text-[11px] font-semibold text-[#7a7a70]">스크런칭 (근육 C-수축)</div>
          <div className="text-lg font-serif font-bold text-[#8a6a30]">
            {currentMetric.scrunchingFreq}회/분
          </div>
        </div>

        <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#7a7a70]">
            <span>과운동증 (Hyperkinesia)</span>
          </div>
          <div className="text-lg font-serif font-bold text-[#8a4a40] flex items-baseline justify-between">
            <span>{currentMetric.hyperkinesiaScore}/100</span>
            <span className="text-[10px] font-sans font-bold bg-[#fef3d6] text-[#8a6a30] px-1.5 py-0.5 rounded border border-[#f0d8a8]">
              {currentMetric.hyperkinesiaType || simulation.hyperkinesiaType || 'Normal'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5">
          <div className="text-[11px] font-semibold text-[#7a7a70]">생존율 (Survival)</div>
          <div className="text-lg font-serif font-bold text-[#6a4a70]">
            {currentMetric.survivalRate}%
          </div>
        </div>
      </div>
    </div>
  );
};

