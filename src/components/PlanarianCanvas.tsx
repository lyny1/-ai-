import React, { useState, useEffect, useRef } from 'react';
import { SimulationResult } from '../types';
import { Activity, Sparkles, AlertCircle, Play, Pause, RotateCcw, Info, Zap, Move } from 'lucide-react';

interface PlanarianCanvasProps {
  simulation: SimulationResult;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  diffusionRate?: number;
}

// Color interpolation helper for blastema tissue maturation (0% = pale pink/cream, 100% = mature brown body tissue)
const interpolateColor = (color1: string, color2: string, factor: number) => {
  const f = Math.min(1, Math.max(0, factor));
  const c1 = parseInt(color1.replace('#', ''), 16);
  const c2 = parseInt(color2.replace('#', ''), 16);

  const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;

  const r = Math.round(r1 + f * (r2 - r1));
  const g = Math.round(g1 + f * (g2 - g1));
  const b = Math.round(b1 + f * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const PlanarianCanvas: React.FC<PlanarianCanvasProps> = ({
  simulation,
  selectedDay,
  onSelectDay,
  diffusionRate = 100,
}) => {
  const { config, drug, timeSeries } = simulation;
  const currentMetric = timeSeries[selectedDay] || timeSeries[0];

  // Auto-play state for continuous timeline animation
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<1 | 2>(1);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  // Motion & Animation Toggle State (움직임 ON/OFF)
  const [showGradient, setShowGradient] = useState(true);
  const [isAnimated, setIsAnimated] = useState(true);
  const isCameraTracking = true; // Permanently enabled to keep planarian centered in field of view

  // Collapsible Dashboard HUD Panel State
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [isHudHovered, setIsHudHovered] = useState(false);

  // Hover tooltip states for Motion Simulation metrics & canvas elements
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [showTimelineTooltip, setShowTimelineTooltip] = useState(false);

  // Animation toggle state for scrunching & hyperkinesia pulsation
  const [motionFrame, setMotionFrame] = useState(0);

  // Continuous timer for micro motion frame
  useEffect(() => {
    if (!isAnimated) return;
    const timer = setInterval(() => {
      setMotionFrame((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, [isAnimated]);

  // Auto-play day progression timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onSelectDay((selectedDay + 1) % 15);
      }, 1000 / playSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, selectedDay, playSpeed, onSelectDay]);

  // Determine Blastema size based on selected day's regeneration rate
  const blastemaPercent = currentMetric.blastemaSizeScore;
  const showEyes = currentMetric.eyeSpotVisible;

  // Calculate tissue maturation: as blastemaPercent reaches 100%, tissue darkens to full mature golden brown
  const regenMaturity = Math.min(1, Math.max(0, (blastemaPercent - 10) / 90));
  const blastemaStartColor = interpolateColor('#f7eed5', '#e2c46a', regenMaturity);
  const blastemaEndColor = interpolateColor('#ebd38b', '#c49a37', regenMaturity);

  // Behavioral motion parameters
  const hyperType = currentMetric.hyperkinesiaType || simulation.hyperkinesiaType || 'Normal';
  const isScrunching = currentMetric.scrunchingFreq > 3;

  // 1. Gentle Dynamic Motion & Trajectory Physics Calculation (Smooth, subtle gliding)
  const frameTime = motionFrame * 0.08;
  const speed = (currentMetric.glidingSpeed ?? 50) / 100; // Normalized 0.0 to 1.0+
  const turnIntensity = (currentMetric.turnCount ?? 5) / 5; // Turning frequency scale
  const bend = currentMetric.bodyBendingDegree ?? 10;
  const spasmFreq = currentMetric.spasmFrequency ?? 0;

  // Gentle trigonometric trajectory position (keeps planarian centered in dish with subtle wander)
  const pathX = Math.sin(frameTime * 0.25 * turnIntensity) * 22 * speed;
  const pathY = Math.cos(frameTime * 0.45 * turnIntensity) * 12 * speed;

  let posX = 200 + pathX;
  let posY = 100 + pathY;

  // Derivative for smooth, natural heading direction angle
  const dt = 0.05;
  const futureX = 200 + Math.sin((frameTime + dt) * 0.25 * turnIntensity) * 22 * speed;
  const futureY = 100 + Math.cos((frameTime + dt) * 0.45 * turnIntensity) * 12 * speed;
  const vx = futureX - posX;
  const vy = futureY - posY;

  let headingAngle = Math.hypot(vx, vy) > 0.001 ? (Math.atan2(vy, vx) * 180) / Math.PI : 0;

  // Head waving / wiggling driven by turn frequency
  let headWiggle = Math.sin(frameTime * 1.8) * (5 + turnIntensity * 5);
  let bodyCurveAngle = Math.sin(frameTime * 1.2) * (bend * 0.4);
  let tailSwayAngle = Math.sin(frameTime * 1.5) * 6;
  let cSpasmScale = 1;
  let screwRotation = 0;
  let opacityVal = 1;

  if (drug.id === 'nicotine') {
    if (config.deliveryMethod === 'targeted') {
      if (config.cutLocation === 'anterior') {
        headWiggle = Math.sin(frameTime * 2.2) * (10 + turnIntensity * 5);
      } else if (config.cutLocation === 'trunk') {
        bodyCurveAngle = Math.sin(frameTime * 1.5) * (bend * 0.6);
        cSpasmScale = 1 - 0.08 * Math.abs(Math.sin(frameTime * 1.8));
      } else {
        tailSwayAngle = Math.sin(frameTime * 2.2) * 12;
      }
    } else {
      cSpasmScale = 1 - 0.12 * Math.abs(Math.sin(frameTime * 2.0));
      screwRotation = hyperType === 'Screw-like' ? Math.sin(frameTime * 1.8) * 18 : 0;
      const tremorX = Math.sin(frameTime * 6) * (spasmFreq * 0.25);
      const tremorY = Math.cos(frameTime * 7) * (spasmFreq * 0.25);
      posX += tremorX;
      posY += tremorY;
    }
  } else if (drug.id === 'caffeine') {
    headWiggle = Math.sin(frameTime * 2.8) * 14;
  } else if (drug.id === 'ethanol') {
    opacityVal = 0.88;
  }

  // Scrunching concertina pulse
  const scrunchPulse = isScrunching ? Math.sin(frameTime * 2.8) * 0.10 : 0;

  // Strict single cut-type resolver to prevent duplicate planarians
  const effectiveCutType = (config.cutType && config.cutType !== 'none' && config.cutType !== 'uncut') ? config.cutType : 'none';

  // Camera Offset for Viewport Centering
  const camX = isCameraTracking ? 200 - posX : 0;
  const camY = isCameraTracking ? 100 - posY : 0;

  // Calculate dynamic patch coordinates for targeted delivery diffusion visualization (World space)
  const patchX =
    config.cutType === 'longitudinal'
      ? config.cutLocation === 'anterior'
        ? 180
        : config.cutLocation === 'trunk'
        ? 200
        : 220
      : config.cutLocation === 'anterior'
      ? 165
      : config.cutLocation === 'trunk'
      ? 200
      : 235;
  const patchY = 100;

  // Calculate dynamic diffusion radius multiplier based on drug diffusion rate parameter (default 100% = 1.0)
  const diffScale = Math.max(0.3, diffusionRate / 100);
  const r75 = 28 * diffScale;
  const r40 = 48 * diffScale;
  const r15 = 70 * diffScale;
  const fillR = 78 * diffScale;
  const wavefrontR = (70 + ((motionFrame * 1.2) % 22)) * diffScale;
  const maxParticleDist = 55 * diffScale;

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24] space-y-4">
      {/* Top Header & Day Slider Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e5e5e0] gap-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#5a5a40]" />
          <h3 className="text-sm font-serif font-bold text-[#5a5a40]">
            실시간 형태학 & 모션 시뮬레이션 (Morphological & Behavioral Canvas)
          </h3>
        </div>

        {/* Auto-play & Speed Controls */}
        <div className="flex items-center space-x-2 bg-[#f5f5f0] p-1.5 rounded-xl border border-[#d6d6ce]">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isPlaying
                ? 'bg-[#b83220] text-white shadow-xs animate-pulse'
                : 'bg-[#5a5a40] text-white hover:bg-[#4a5a30]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>자동 재생 (Play)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPlaySpeed(playSpeed === 1 ? 2 : 1)}
            className="px-2 py-1 bg-white text-[#5a5a40] border border-[#d6d6ce] rounded-lg text-[11px] font-bold hover:bg-[#eaeae2]"
          >
            {playSpeed}x
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onSelectDay(0);
            }}
            className="p-1 text-[#7a7a70] hover:text-[#1a1a1a] transition"
            title="Day 0 리셋"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Draggable Day Timeline Range Slider */}
      <div
        className="p-3 bg-[#f8f7f2] border border-[#e5e5e0] rounded-xl space-y-2 relative z-20"
        onMouseEnter={() => setShowTimelineTooltip(true)}
        onMouseLeave={() => setShowTimelineTooltip(false)}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#5a5a40] flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#3d6a70]" />
            <span>경과 시간 선택 (Day {selectedDay} / 14일)</span>
          </span>
          <span className="font-mono font-bold text-[#3d6a70] bg-[#e8f0f2] px-2 py-0.5 rounded border border-[#b8d6dc]">
            Day {selectedDay} ({selectedDay === 0 ? '수술 직후' : `${selectedDay * 24}시간 경과`})
          </span>
        </div>

        {/* Continuous Draggable Timeline Slider */}
        <input
          type="range"
          min={0}
          max={14}
          step={1}
          value={selectedDay}
          onChange={(e) => onSelectDay(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-[#d6d6ce] rounded-lg appearance-none cursor-pointer accent-[#3d6a70]"
        />

        {/* Timeline Day Markers */}
        <div className="flex justify-between text-[10px] text-[#7a7a70] font-semibold pt-0.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDay(d)}
              className={`hover:text-[#3d6a70] transition ${
                selectedDay === d ? 'text-[#3d6a70] font-bold underline' : ''
              }`}
            >
              d{d}
            </button>
          ))}
        </div>

        {/* Timeline Hover Tooltip Popover */}
        {showTimelineTooltip && (
          <div className="absolute left-0 top-full mt-1 z-30 w-72 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
            <div className="font-bold text-[#3d6a70] border-b border-[#e5e5e0] pb-1 flex justify-between items-center">
              <span>⏱️ 시간 경과 재생 타임라인 개념</span>
              <span className="text-[10px] text-[#7a7a70] font-normal">Day 0 ~ Day 14</span>
            </div>
            <p className="text-[11px] text-[#5a5a50] leading-relaxed">
              • <strong>Day 0~3:</strong> Wound healing & 세포 외 기질 재구축 단계.<br />
              • <strong>Day 4~7:</strong> Neoblast 줄기세포 폭발적 증식 및 Blastema 형성.<br />
              • <strong>Day 8~14:</strong> 신경 망 재배선, 눈점(Eyespots) 재생 완수 및 운동성 회복.
            </p>
          </div>
        )}
      </div>

      {/* Main SVG Visualization Canvas Container (Expanded Height h-80 sm:h-96 md:h-[420px]) */}
      <div className="relative z-10 w-full h-80 sm:h-96 md:h-[420px] bg-[#e9e9e2] rounded-xl border border-[#d6d6ce] shadow-inner">
        {/* Floating Quick Action Toggles Top Right */}
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1.5 pointer-events-auto">
          {/* Toggle 1: Animation Motion ON/OFF */}
          <button
            type="button"
            onClick={() => setIsAnimated(!isAnimated)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isAnimated
                ? 'bg-[#5a5a40] text-white border-[#4a5a30]'
                : 'bg-white/90 text-[#7a7a70] border-[#d6d6ce] hover:bg-white'
            }`}
            title="확산 및 생체 모션 애니메이션 활성화/비활성화"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>애니메이션: {isAnimated ? 'ON' : 'OFF'}</span>
          </button>

          {/* Toggle 2: Gradient Overlay ON/OFF (Placed BELOW Animation button) */}
          {config.deliveryMethod === 'targeted' && (
            <button
              type="button"
              onClick={() => setShowGradient(!showGradient)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                showGradient
                  ? 'bg-[#3d6a70] text-white border-[#2a4d52]'
                  : 'bg-white/90 text-[#7a7a70] border-[#d6d6ce] hover:bg-white'
              }`}
              title="농도 구배 등고선 그래픽 표시/숨김"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>등고선 구배: {showGradient ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Toggle 3: Cockpit HUD Dashboard Panel Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setIsHudHovered(true)}
            onMouseLeave={() => setIsHudHovered(false)}
          >
            <button
              type="button"
              onClick={() => setIsHudOpen(!isHudOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isHudOpen || isHudHovered
                  ? 'bg-[#1a3538] text-white border-[#0d1e20]'
                  : 'bg-white/95 text-[#1a3538] border-[#3d6a70]/40 hover:bg-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#e8f0f2]" />
              <span>시뮬레이션 계기판 {isHudOpen ? '▲' : '▼'}</span>
            </button>

            {/* Hoverable / Collapsible Floating Cockpit HUD Drawer Panel */}
            {(isHudOpen || isHudHovered) && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-72 sm:w-80 max-h-[260px] sm:max-h-[300px] overflow-y-auto bg-white/98 backdrop-blur-md border border-[#3d6a70]/50 shadow-xl rounded-2xl p-3.5 text-xs text-[#2a2a24] space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#e5e5e0] sticky top-0 bg-white/98 z-10 pt-0.5">
                  <span className="font-bold text-[#1a3538] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#3d6a70]" />
                    <span>약물 확산 & 시뮬레이션 계기판 (HUD)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsHudOpen(false)}
                    className="text-[#8a8a80] hover:text-[#1a1a1a] font-bold text-xs cursor-pointer px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Display Delivery Mode Summary */}
                <div className="p-2 bg-[#f4f7f6] rounded-xl border border-[#d6e3e5] space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2a4d52]">전달 방식:</span>
                    <span className="font-bold text-[#3d6a70] bg-white px-2 py-0.5 rounded border border-[#b8d6dc]">
                      {config.deliveryMethod === 'targeted'
                        ? '🎯 하이드로겔 국소 방출 (Targeted)'
                        : '🧪 전신 수조 침지 (Submersion)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5a6a50]">
                    <span>약물 및 농도:</span>
                    <span className="font-mono font-bold text-[#2a2a24]">
                      {drug.name} ({config.concentration} {config.unit})
                    </span>
                  </div>
                </div>

                {/* Physical Diffusion Gradient Isoline Model */}
                {config.deliveryMethod === 'targeted' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#2a4d52]">
                      <span>물리적 확산 농도 구배 모델</span>
                      <span className="font-mono text-[#3d6a70]">
                        D = {(diffScale).toFixed(2)} D₀ ({diffusionRate}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#1a3538] via-[#3d6a70] via-50% to-[#e9e9e2] border border-[#b8d6dc]" />

                    <div className="text-[10px] text-[#5a6a50] flex items-center justify-between font-mono bg-[#f8f7f2] p-1.5 rounded border border-[#e5e5e0]">
                      <span>r₀ (패치): 100% C₀</span>
                      <span>r₁: {(2.5 * diffScale).toFixed(1)}mm (50%)</span>
                      <span>r₂: {(5.0 * diffScale).toFixed(1)}mm (0%)</span>
                    </div>

                    <div className="text-[10px] text-[#5a6a50] leading-snug bg-white p-2 rounded-lg border border-[#e5e5e0]">
                      <strong>Fickian Diffusion Equation:</strong><br />
                      <code className="text-[#3d6a70] font-mono">C(r,t) ∝ exp(-r²/4Dt)</code>
                      <p className="mt-1 text-[#7a7a70]">
                        패치 중심으로부터 거리가 멀어질수록 약물 농도가 지수함수적으로 감쇄합니다.
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Toggle Switches inside Cockpit HUD */}
                <div className="pt-1.5 border-t border-[#e5e5e0] grid grid-cols-2 gap-1.5 text-[11px]">
                  {config.deliveryMethod === 'targeted' && (
                    <button
                      type="button"
                      onClick={() => setShowGradient(!showGradient)}
                      className="p-1.5 bg-white border border-[#d6d6ce] rounded-lg font-bold text-[#3d6a70] hover:bg-[#e8f0f2] transition text-center cursor-pointer"
                    >
                      등고선 구배: {showGradient ? '표시 중' : '숨김'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAnimated(!isAnimated)}
                    className="p-1.5 bg-white border border-[#d6d6ce] rounded-lg font-bold text-[#5a5a40] hover:bg-[#eaeae2] transition text-center cursor-pointer col-span-1"
                  >
                    애니메이션: {isAnimated ? '작동 중' : '정지'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inner SVG Canvas Background Container with overflow-hidden for rounded corner clipping */}
        <div className="absolute inset-0 overflow-hidden rounded-xl flex items-center justify-center bg-[#e4e4dc]">

        {/* Live Observation Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-30 flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-[#3d6a70] border border-[#d6d6ce] flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#3d6a70] animate-ping" />
            <span>실시간 생체 페트리 접시</span>
          </div>
        </div>

        {/* Animated Main SVG World Canvas */}
        <svg
          viewBox="0 0 400 200"
          style={{ opacity: opacityVal }}
          className="w-full h-full max-w-xl transition-transform duration-100"
        >
          <defs>
            {/* Cute Artistic Planarian Warm Ochre-Gold Body Gradient (Reference Image Palette) */}
            <linearGradient id="koreanPlanarianBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ebd17d" />
              <stop offset="35%" stopColor="#dfb652" />
              <stop offset="70%" stopColor="#d3a840" />
              <stop offset="100%" stopColor="#c59932" />
            </linearGradient>

            {/* Rich Dark Brown Central Dorsal Shading (Matching Reference Image Central Stripe) */}
            <linearGradient id="planarianDorsalShading" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#522b17" stopOpacity="0.30" />
              <stop offset="30%" stopColor="#4a2210" stopOpacity="0.82" />
              <stop offset="70%" stopColor="#3d1b0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2e1205" stopOpacity="0.40" />
            </linearGradient>

            {/* Regeneration Blastema Tissue (Dynamic maturation from pale golden-cream to mature ochre) */}
            <linearGradient id="koreanBlastema" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={blastemaStartColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={blastemaEndColor} stopOpacity="0.98" />
            </linearGradient>

            {/* Diffusion Field & Hydrogel Patch Gradients */}
            <radialGradient id="diffusionFieldGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a3538" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#3d6a70" stopOpacity="0.60" />
              <stop offset="55%" stopColor="#5a8c90" stopOpacity="0.30" />
              <stop offset="80%" stopColor="#8a9a5b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#8a9a5b" stopOpacity="0.0" />
            </radialGradient>

            <radialGradient id="hydrogelCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a3538" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3d6a70" stopOpacity="0.80" />
            </radialGradient>
          </defs>

          {/* LAYER A: Petri Dish World Layer (Shifted by Camera Tracking Offset camX, camY) */}
          <g transform={`translate(${camX}, ${camY})`}>
            {/* Petri Dish Outer Rim & Water Base */}
            <circle cx="200" cy="100" r="260" fill="#ededf0" stroke="#d2d2ca" strokeWidth="6" />
            <circle cx="200" cy="100" r="258" fill="#e8eee8" opacity="0.6" />

            {/* Petri Dish Millimeter Grid Lines */}
            <g opacity="0.15" stroke="#3d6a70" strokeWidth="0.8">
              {[-100, -60, -20, 20, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500].map((x, i) => (
                <line key={`v-${i}`} x1={x} y1="-100" x2={x} y2="300" />
              ))}
              {[-100, -60, -20, 20, 60, 100, 140, 180, 220, 260, 300].map((y, i) => (
                <line key={`h-${i}`} x1="-100" y1={y} x2="500" y2={y} />
              ))}
            </g>

            {/* Dish Center Marker */}
            <circle cx="200" cy="100" r="3" fill="none" stroke="#7a7a70" strokeWidth="1" strokeDasharray="2,2" />

            {/* Gliding Trail History / Snail Trail in Dish */}
            {currentMetric.glidingSpeed > 10 && (
              <path
                d={`M ${posX - 80},${posY + 15} Q ${posX - 40},${posY - 10} ${posX},${posY}`}
                fill="none"
                stroke="#3d6a70"
                strokeWidth="2.5"
                strokeDasharray="4,4"
                opacity="0.3"
              />
            )}

            {/* Submersion Bath Particles Effect */}
            {config.deliveryMethod === 'submersion' && (
              <g opacity="0.4" className="pointer-events-none">
                <circle cx="120" cy="60" r="3" fill="#8a9a5b" className="animate-ping" />
                <circle cx="280" cy="140" r="3.5" fill="#5a5a40" className="animate-pulse" />
                <circle cx="160" cy="150" r="2.5" fill="#6b7c4a" className="animate-ping" />
              </g>
            )}

            {/* Targeted Hydrogel Local Delivery Patch & Gradient Field */}
            {config.deliveryMethod === 'targeted' && showGradient && (
              <g className="pointer-events-none">
                <circle cx={patchX} cy={patchY} r={fillR} fill="url(#diffusionFieldGradient)" />
                <circle
                  cx={patchX}
                  cy={patchY}
                  r={wavefrontR}
                  fill="none"
                  stroke="#3d6a70"
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                  opacity={0.8 - (((motionFrame * 1.2) % 22) / 22) * 0.7}
                />
                <circle cx={patchX} cy={patchY} r={r15} fill="none" stroke="#8a9a5b" strokeWidth="1" strokeDasharray="2,4" opacity="0.6" />
                <circle cx={patchX} cy={patchY} r={r40} fill="none" stroke="#5a8c90" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.75" />
                <circle cx={patchX} cy={patchY} r={r75} fill="none" stroke="#3d6a70" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.9" />
                <circle cx={patchX} cy={patchY} r="14" fill="url(#hydrogelCore)" stroke="#1a3538" strokeWidth="2" className="drop-shadow-md" />

                <g className="text-[8px] font-mono font-bold select-none">
                  <text x={patchX} y={patchY - 18} textAnchor="middle" fill="#1a3538" stroke="#ffffff" strokeWidth="2" paintOrder="stroke fill">
                    100% C₀
                  </text>
                  <text x={patchX + r75} y={patchY - 3} textAnchor="start" fill="#2a4d52" stroke="#ffffff" strokeWidth="2" paintOrder="stroke fill">
                    75%
                  </text>
                  <text x={patchX + r40} y={patchY - 3} textAnchor="start" fill="#3d6a70" stroke="#ffffff" strokeWidth="2" paintOrder="stroke fill">
                    40%
                  </text>
                </g>

                {[0, 45, 90, 135, 180, 225, 270, 315].map((angleDeg, idx) => {
                  const rad = (angleDeg * Math.PI) / 180;
                  const dist = 14 + ((motionFrame * 1.5 + idx * 8) % maxParticleDist);
                  const px = patchX + Math.cos(rad) * dist;
                  const py = patchY + Math.sin(rad) * dist;
                  const pOpacity = Math.max(0, 1 - dist / (r15 + 2));
                  return <circle key={idx} cx={px} cy={py} r={dist < r75 ? 2 : 1.2} fill="#3d6a70" opacity={pOpacity} />;
                })}
              </g>
            )}
          </g>

          {/* LAYER B: CENTERED PLANARIAN LAYER (Positioned at Viewport Center 200, 100 in Camera Mode or posX, posY in World Mode) */}
          <g transform={`translate(${isCameraTracking ? 200 : posX}, ${isCameraTracking ? 100 : posY}) rotate(${headingAngle})`}>
            {/* Dynamic Organism Transformation Group (Scrunching, C-spasm, Screw rotation, Body curvature) */}
            <g transform={`translate(-120, -50) scale(${1 - scrunchPulse}, ${cSpasmScale}) rotate(${screwRotation + bodyCurveAngle}, 120, 50)`}>

              {/* CASE 0: INTACT / UNCUT FULL PLANARIAN (Warm Ochre Body + Central Dark Shading) */}
              {effectiveCutType === 'none' && (
                <g transform={`rotate(${headWiggle}, 45, 50)`}>
                  {/* Single Continuous Outer Planarian Body (Spade Head + Smooth Body + Tapered Tail) */}
                  <path
                    d="M 15,50 C 22,33 32,20 45,20 C 52,20 62,34 75,38 C 110,38 150,40 185,44 C 205,46 218,48.5 220,50 C 218,51.5 205,54 185,56 C 150,60 110,62 75,62 C 62,66 52,80 45,80 C 32,80 22,67 15,50 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />

                  {/* Dark Brown Central Dorsal Shading (Reference Image Shaded Spine) */}
                  <path
                    d="M 42,50 C 65,42 120,41 180,46 C 200,48 212,49.5 215,50 C 212,50.5 200,52 180,54 C 120,59 65,58 42,50 Z"
                    fill="url(#planarianDorsalShading)"
                  />

                  {/* Intestinal Gastrovascular Branches */}
                  <path
                    d="M 65,50 L 190,50 M 80,44 Q 95,38 110,44 M 125,44 Q 140,38 155,44 M 80,56 Q 95,62 110,56 M 125,56 Q 140,62 155,56"
                    stroke="#c59932"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                    fill="none"
                    opacity="0.4"
                  />

                  {/* Pharynx (Central Digestive Tube) */}
                  <ellipse cx="135" cy="50" rx="12" ry="4" fill="#f2c49b" opacity="0.6" stroke="#c59932" strokeWidth="1" />

                  {/* Super Cute Cross-Eyed Eyespots (◉.◉) */}
                  <g className="select-none">
                    {/* Left Eye Cup */}
                    <ellipse cx="38" cy="41" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                    <circle cx="39.2" cy="42" r="2.2" fill="#111111" />
                    <circle cx="40" cy="41.2" r="0.9" fill="#ffffff" />

                    {/* Right Eye Cup */}
                    <ellipse cx="38" cy="59" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                    <circle cx="39.2" cy="58" r="2.2" fill="#111111" />
                    <circle cx="40" cy="58.8" r="0.9" fill="#ffffff" />
                  </g>
                </g>
              )}

              {/* CASE 1: ANTERIOR TRANSVERSE CUT (Head Amputated -> Headless Body & Tail Fragment + Regenerating Pale Head Blastema) */}
              {(effectiveCutType === 'transverse' || effectiveCutType === 'single') && config.cutLocation === 'anterior' && (
                <g transform={`rotate(${headWiggle}, 85, 50)`}>
                  {/* Truncated Headless Body & Tail Fragment (Clean Flat Cut at Anterior End x=85) */}
                  <path
                    d="M 85,38 L 85,62 C 110,62 150,60 185,56 C 205,54 218,51.5 220,50 C 218,48.5 205,46 185,44 C 150,40 110,38 85,38 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />
                  {/* Dark Shading */}
                  <path d="M 95,50 Q 150,46 200,50" stroke="url(#planarianDorsalShading)" strokeWidth="10" fill="none" strokeLinecap="round" />

                  {/* Cut Wound Line at Anterior Cut Site (Fades as blastema regenerates) */}
                  <line
                    x1="85"
                    y1="38"
                    x2="85"
                    y2="62"
                    stroke="#b83220"
                    strokeWidth="2.5"
                    strokeDasharray="3,1"
                    opacity={Math.max(0, 1 - blastemaPercent / 40)}
                  />

                  {/* Regenerating Pale Head Blastema Tissue Growing Leftward from x=85 */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 85,38 C 72,${38 - (blastemaPercent / 100) * 10} 50,${38 - (blastemaPercent / 100) * 18} ${85 - (blastemaPercent / 100) * 55},50 C 50,${62 + (blastemaPercent / 100) * 18} 72,${62 + (blastemaPercent / 100) * 10} 85,62 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Regenerating Eyespots (Appear inside pale blastema after Day 3/4) */}
                  {showEyes && blastemaPercent > 30 && (
                    <g className="animate-pulse">
                      <ellipse cx={85 - (blastemaPercent / 100) * 42} cy="42" rx="3.5" ry="3" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                      <circle cx={85 - (blastemaPercent / 100) * 41} cy="42.5" r="1.8" fill="#111111" />
                      <circle cx={85 - (blastemaPercent / 100) * 40.5} cy="41.8" r="0.7" fill="#ffffff" />

                      <ellipse cx={85 - (blastemaPercent / 100) * 42} cy="58" rx="3.5" ry="3" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                      <circle cx={85 - (blastemaPercent / 100) * 41} cy="57.5" r="1.8" fill="#111111" />
                      <circle cx={85 - (blastemaPercent / 100) * 40.5} cy="56.8" r="0.7" fill="#ffffff" />
                    </g>
                  )}
                </g>
              )}

              {/* CASE 2: TRUNK TRANSVERSE CUT (Midbody Cut -> Headless Tail/Trunk Fragment + Regenerating Head Blastema) */}
              {(effectiveCutType === 'transverse' || effectiveCutType === 'single') && config.cutLocation === 'trunk' && (
                <g transform={`rotate(${headWiggle}, 135, 50)`}>
                  {/* Truncated Headless Tail Piece (Clean Flat Cut at Midbody x=135) */}
                  <path
                    d="M 135,40 L 135,60 C 170,60 200,56 218,51.5 C 220,50 218,48.5 200,44 C 170,40 135,40 135,40 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />
                  {/* Cut Wound Line (Fades as blastema grows) */}
                  <line
                    x1="135"
                    y1="40"
                    x2="135"
                    y2="60"
                    stroke="#b83220"
                    strokeWidth="2.5"
                    strokeDasharray="3,1"
                    opacity={Math.max(0, 1 - blastemaPercent / 40)}
                  />

                  {/* Regenerating Head Blastema Tissue Growing Leftward from x=135 to x=30 */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 135,40 C 110,${40 - (blastemaPercent / 100) * 12} 60,${40 - (blastemaPercent / 100) * 20} ${135 - (blastemaPercent / 100) * 105},50 C 60,${60 + (blastemaPercent / 100) * 20} 110,${60 + (blastemaPercent / 100) * 12} 135,60 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Regenerating Eyespots on New Head Blastema */}
                  {showEyes && blastemaPercent > 35 && (
                    <g className="animate-pulse">
                      <ellipse cx={135 - (blastemaPercent / 100) * 90} cy="42" rx="3.5" ry="3" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                      <circle cx={135 - (blastemaPercent / 100) * 89} cy="42.5" r="1.8" fill="#111111" />
                      <ellipse cx={135 - (blastemaPercent / 100) * 90} cy="58" rx="3.5" ry="3" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                      <circle cx={135 - (blastemaPercent / 100) * 89} cy="57.5" r="1.8" fill="#111111" />
                    </g>
                  )}
                </g>
              )}

              {/* CASE 3: POSTERIOR TRANSVERSE CUT (Tail Amputated -> Intact Head & Trunk Fragment + Regenerating Tail Blastema) */}
              {(effectiveCutType === 'transverse' || effectiveCutType === 'single') && config.cutLocation === 'posterior' && (
                <g transform={`rotate(${headWiggle}, 45, 50)`}>
                  {/* Intact Head & Midbody Fragment (Original Spade Head with intact eyes, flat cut at posterior x=175) */}
                  <path
                    d="M 15,50 C 22,33 32,20 45,20 C 52,20 62,34 75,38 C 110,38 150,40 175,42 L 175,58 C 150,60 110,62 75,62 C 62,66 52,80 45,80 C 32,80 22,67 15,50 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />
                  {/* Intact Original Eyespots */}
                  <ellipse cx="38" cy="41" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                  <circle cx="39.2" cy="42" r="2.2" fill="#111111" />
                  <circle cx="40" cy="41.2" r="0.9" fill="#ffffff" />

                  <ellipse cx="38" cy="59" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                  <circle cx="39.2" cy="58" r="2.2" fill="#111111" />
                  <circle cx="40" cy="58.8" r="0.9" fill="#ffffff" />

                  {/* Wound Line at Tail Cut Site */}
                  <line
                    x1="175"
                    y1="42"
                    x2="175"
                    y2="58"
                    stroke="#b83220"
                    strokeWidth="2.5"
                    strokeDasharray="3,1"
                    opacity={Math.max(0, 1 - blastemaPercent / 40)}
                  />

                  {/* Regenerating Pale Tail Blastema Growing Rightward from x=175 to x=218 */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 175,42 Q ${175 + (blastemaPercent / 100) * 28},44 ${175 + (blastemaPercent / 100) * 43},50 Q ${175 + (blastemaPercent / 100) * 28},56 175,58 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}
                </g>
              )}
              {/* CASE 4: LONGITUDINAL ANTERIOR HEAD SPLIT (Two-Headed Planarian / 쌍두 플라나리아 - Matching Reference Image Y-Fork & Regeneration) */}
              {effectiveCutType === 'longitudinal' && config.cutLocation === 'anterior' && (() => {
                // Dynamic head spread angle & spade expansion as blastema matures
                const spread = (blastemaPercent / 100) * 16; // 0 to 16px extra outward spread

                // Upper Head Spade Coordinates
                const uTipX = 25 - (blastemaPercent / 100) * 5;
                const uTipY = 32 - spread;
                const uAuricleX = 42;
                const uAuricleY = 16 - spread * 1.3;

                // Lower Head Spade Coordinates
                const lTipX = 25 - (blastemaPercent / 100) * 5;
                const lTipY = 68 + spread;
                const lAuricleX = 42;
                const lAuricleY = 84 + spread * 1.3;

                // Inner V-Notch Apex
                const vApexX = 85 - (blastemaPercent / 100) * 35;

                return (
                  <g transform={`rotate(${headWiggle}, 90, 50)`}>
                    {/* Outer Y-Forked Organism Body Path */}
                    <path
                      d={`M 220,50 C 205,53 165,58 110,58 C 85,58 ${uAuricleX + 20},${55 - spread} ${uAuricleX},${uAuricleY} C ${uTipX + 8},${uTipY - 6} ${uTipX - 4},${uTipY + 4} ${uTipX + 12},${uTipY + 12} C ${uAuricleX + 10},${48 - spread * 0.5} ${vApexX + 15},48 ${vApexX},50 C ${vApexX + 15},52 ${lAuricleX + 10},${52 + spread * 0.5} ${lTipX + 12},${lTipY - 12} C ${lTipX - 4},${lTipY - 4} ${lTipX + 8},${lTipY + 6} ${lAuricleX},${lAuricleY} C ${lAuricleX + 20},${45 + spread} 85,42 110,42 C 165,42 205,47 220,50 Z`}
                      fill="url(#koreanPlanarianBody)"
                      stroke="#422010"
                      strokeWidth="1.8"
                      className="drop-shadow-sm"
                    />

                    {/* Dark Dorsal Shading Forking smoothly into both heads */}
                    <path
                      d={`M 200,50 C 160,48 110,47 80,44 C 60,40 ${uAuricleX + 5},${32 - spread} ${uTipX + 10},${uTipY + 4} M 80,56 C 60,60 ${lAuricleX + 5},${68 + spread} ${lTipX + 10},${lTipY - 4}`}
                      stroke="url(#planarianDorsalShading)"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Inner Regenerating Blastema filling V-notch between split heads */}
                    {blastemaPercent > 0 && (
                      <path
                        d={`M ${vApexX},50 Q ${vApexX - 25},${50 - spread * 0.8} ${uTipX + 15},${uTipY + 10} Q ${vApexX - 15},50 ${lTipX + 15},${lTipY - 10} Q ${vApexX - 25},${50 + spread * 0.8} ${vApexX},50 Z`}
                        fill="url(#koreanBlastema)"
                        stroke="#c59932"
                        strokeWidth="1.2"
                        opacity={0.9}
                      />
                    )}

                    {/* Longitudinal Cut Incision Line (Fades as inner blastema grows & heals) */}
                    <line
                      x1="85"
                      y1="50"
                      x2={28 - (blastemaPercent / 100) * 10}
                      y2="50"
                      stroke="#b83220"
                      strokeWidth="2"
                      strokeDasharray="3,2"
                      opacity={Math.max(0, 1 - blastemaPercent / 45)}
                    />

                    {/* Dual Head Eyespots: Starts with 1 outer eye on each half-head. Regenerates complete pair (4 eyes total) as blastema develops */}
                    <g className="select-none">
                      {/* Upper Head Eyespots */}
                      <g>
                        {/* Original Outer Eye */}
                        <ellipse cx={uTipX + 10} cy={uTipY - 3} rx="3.2" ry="2.8" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                        <circle cx={uTipX + 11} cy={uTipY - 2.5} r="1.8" fill="#111111" />
                        <circle cx={uTipX + 11.5} cy={uTipY - 3.2} r="0.7" fill="#ffffff" />

                        {/* Regenerating Inner Eye (Appears on new inner head tissue) */}
                        {showEyes && blastemaPercent > 25 && (
                          <g className="animate-pulse">
                            <ellipse cx={uTipX + 10} cy={uTipY + 6} rx="3.0" ry="2.6" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" opacity={Math.min(1, (blastemaPercent - 25) / 30)} />
                            <circle cx={uTipX + 11} cy={uTipY + 6.5} r="1.6" fill="#111111" opacity={Math.min(1, (blastemaPercent - 25) / 30)} />
                            <circle cx={uTipX + 11.5} cy={uTipY + 5.8} r="0.6" fill="#ffffff" opacity={Math.min(1, (blastemaPercent - 25) / 30)} />
                          </g>
                        )}
                      </g>

                      {/* Lower Head Eyespots */}
                      <g>
                        {/* Original Outer Eye */}
                        <ellipse cx={lTipX + 10} cy={lTipY + 3} rx="3.2" ry="2.8" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                        <circle cx={lTipX + 11} cy={lTipY + 3.5} r="1.8" fill="#111111" />
                        <circle cx={lTipX + 11.5} cy={lTipY + 2.8} r="0.7" fill="#ffffff" />

                        {/* Regenerating Inner Eye (Appears on new inner head tissue) */}
                        {showEyes && blastemaPercent > 25 && (
                          <g className="animate-pulse">
                            <ellipse cx={lTipX + 10} cy={lTipY - 6} rx="3.0" ry="2.6" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" opacity={Math.min(1, (blastemaPercent - 25) / 30)} />
                            <circle cx={lTipX + 11} cy={lTipY - 5.5} r="1.6" fill="#111111" opacity={Math.min(1, (blastemaPercent - 25) / 30)} />
                            <circle cx={lTipX + 11.5} cy={lTipY - 6.2} r="0.6" fill="#ffffff" opacity={Math.min(1, (blastemaPercent - 25) / 30)} />
                          </g>
                        )}
                      </g>
                    </g>
                  </g>
                );
              })()}

              {/* CASE 5: LONGITUDINAL POSTERIOR TAIL SPLIT (Two-Tailed Planarian / 쌍미 플라나리아) */}
              {effectiveCutType === 'longitudinal' && config.cutLocation === 'posterior' && (
                <g transform={`rotate(${headWiggle}, 45, 50)`}>
                  <path
                    d="M 15,50 C 22,33 32,20 45,20 C 52,20 62,34 75,38 L 110,38 C 140,32 180,22 215,22 C 220,25 210,38 110,48 C 100,50 100,50 110,52 C 210,62 220,75 215,78 C 180,78 140,68 110,62 L 75,62 C 62,66 52,80 45,80 C 32,80 22,67 15,50 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />

                  {/* Intact Head Eyespots */}
                  <ellipse cx="38" cy="41" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                  <circle cx="39.2" cy="42" r="2.2" fill="#111111" />
                  <circle cx="40" cy="41.2" r="0.9" fill="#ffffff" />

                  <ellipse cx="38" cy="59" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                  <circle cx="39.2" cy="58" r="2.2" fill="#111111" />
                  <circle cx="40" cy="58.8" r="0.9" fill="#ffffff" />

                  {/* Regenerating Pale Blastema Tissue in the inner V-fork between split tails */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 110,48 Q ${110 + (blastemaPercent / 100) * 50},50 110,52 Q ${110 + (blastemaPercent / 100) * 38},50 110,48 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Red Dashed Split Incision Line (Fades as blastema regenerates) */}
                  <line
                    x1="110"
                    y1="50"
                    x2="215"
                    y2="50"
                    stroke="#b83220"
                    strokeWidth="2"
                    strokeDasharray="3,2"
                    opacity={Math.max(0, 1 - blastemaPercent / 45)}
                  />
                </g>
              )}

              {/* CASE 6: LONGITUDINAL TRUNK FULL BODY SPLIT (Half-Body Planarian / 좌우 반신) */}
              {effectiveCutType === 'longitudinal' && config.cutLocation === 'trunk' && (
                <g transform={`rotate(${headWiggle}, 120, 35)`}>
                  {/* Upper Half Body Segment */}
                  <path
                    d="M 15,50 C 22,35 32,22 45,22 C 52,22 62,34 75,38 C 110,38 150,40 215,50 L 15,50 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />
                  {/* Original Eye on intact outer half */}
                  <ellipse cx="38" cy="41" rx="4" ry="3.5" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                  <circle cx="39.2" cy="42" r="2.2" fill="#111111" />
                  <circle cx="40" cy="41.2" r="0.9" fill="#ffffff" />

                  {/* Midline Red Cut Line */}
                  <line
                    x1="15"
                    y1="50"
                    x2="215"
                    y2="50"
                    stroke="#b83220"
                    strokeWidth="2.5"
                    strokeDasharray="3,1"
                    opacity={Math.max(0, 1 - blastemaPercent / 45)}
                  />

                  {/* Regenerating Lateral Half Blastema tissue growing downwards along midline */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 15,50 L 215,50 C 215,50 170,${50 + (blastemaPercent / 100) * 22} 115,${50 + (blastemaPercent / 100) * 26} C 60,${50 + (blastemaPercent / 100) * 22} 15,50 15,50 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Regenerating Second Eye on missing half head (Appears after Day 3/4) */}
                  {showEyes && blastemaPercent > 30 && (
                    <g className="animate-pulse">
                      <ellipse cx="38" cy="59" rx="3.5" ry="3.0" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" opacity={Math.min(1, (blastemaPercent - 30) / 30)} />
                      <circle cx="39.2" cy="58" r="1.8" fill="#111111" opacity={Math.min(1, (blastemaPercent - 30) / 30)} />
                      <circle cx="40" cy="58.8" r="0.7" fill="#ffffff" opacity={Math.min(1, (blastemaPercent - 30) / 30)} />
                    </g>
                  )}
                </g>
              )}

              {/* CASE 7: TRIPARTITE CUT (3등분 절단 -> Trunk Middle Fragment regenerating BOTH head & tail) */}
              {effectiveCutType === 'tripartite' && (
                <g transform={`rotate(${headWiggle}, 115, 50)`}>
                  {/* Middle Trunk Piece (Flat cuts at both anterior x=80 and posterior x=150) */}
                  <path
                    d="M 80,38 L 80,62 C 110,62 135,60 150,58 L 150,42 C 135,40 110,38 80,38 Z"
                    fill="url(#koreanPlanarianBody)"
                    stroke="#422010"
                    strokeWidth="1.8"
                    className="drop-shadow-sm"
                  />

                  {/* Both Anterior & Posterior Wound Lines */}
                  <line x1="80" y1="38" x2="80" y2="62" stroke="#b83220" strokeWidth="2" strokeDasharray="3,1" opacity={Math.max(0, 1 - blastemaPercent / 40)} />
                  <line x1="150" y1="42" x2="150" y2="58" stroke="#b83220" strokeWidth="2" strokeDasharray="3,1" opacity={Math.max(0, 1 - blastemaPercent / 40)} />

                  {/* Regenerating Pale Head Blastema at Anterior (x=80 to x=30) */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 80,38 C 68,${38 - (blastemaPercent / 100) * 10} 50,${38 - (blastemaPercent / 100) * 18} ${80 - (blastemaPercent / 100) * 50},50 C 50,${62 + (blastemaPercent / 100) * 18} 68,${62 + (blastemaPercent / 100) * 10} 80,62 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Regenerating Pale Tail Blastema at Posterior (x=150 to x=195) */}
                  {blastemaPercent > 0 && (
                    <path
                      d={`M 150,42 Q ${150 + (blastemaPercent / 100) * 28},44 ${150 + (blastemaPercent / 100) * 45},50 Q ${150 + (blastemaPercent / 100) * 28},56 150,58 Z`}
                      fill="url(#koreanBlastema)"
                      stroke="#c59932"
                      strokeWidth="1.2"
                    />
                  )}

                  {/* Regenerating Eyespots on new head */}
                  {showEyes && blastemaPercent > 35 && (
                    <g className="animate-pulse">
                      <ellipse cx={80 - (blastemaPercent / 100) * 38} cy="42" rx="3.5" ry="3" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                      <circle cx={80 - (blastemaPercent / 100) * 37} cy="42.5" r="1.8" fill="#111111" />
                      <ellipse cx={80 - (blastemaPercent / 100) * 38} cy="58" rx="3.5" ry="3" fill="#ffffff" stroke="#c0a290" strokeWidth="0.6" />
                      <circle cx={80 - (blastemaPercent / 100) * 37} cy="57.5" r="1.8" fill="#111111" />
                    </g>
                  )}
                </g>
              )}

            </g>
          </g>
        </svg>

        {/* Live Behavior Alert Overlay Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-white/95 border border-[#d6d6ce] px-3 py-1.5 rounded-xl text-xs shadow-xs text-[#2a2a24]">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-bold text-[#5a5a40]">행동 상태 (Day {selectedDay}):</span>
            <span className="text-[#3d6a70] font-mono font-bold">
              속도 {currentMetric.glidingSpeed}%
            </span>
            <span className="text-[#d6d6ce]">|</span>
            <span className="text-[#8a6a30] font-mono font-bold">
              방향 전환 {currentMetric.turnCount ?? simulation.turnCount}회/분
            </span>
            <span className="text-[#d6d6ce]">|</span>
            <span className="text-[#8a4a40] font-mono font-bold">
              굽힘 {currentMetric.bodyBendingDegree ?? simulation.bodyBendingDegree}°
            </span>
            <span className="text-[#d6d6ce]">|</span>
            <span className="text-[#b83220] font-mono font-bold">
              경련 {currentMetric.spasmFrequency ?? simulation.spasmFrequency}회/분
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCriteriaModal(!showCriteriaModal)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#3d6a70] bg-[#e8f0f2] hover:bg-[#d8e6eb] px-2 py-0.5 rounded-md border border-[#b8d6dc] transition cursor-pointer shrink-0"
          >
            <Info className="w-3 h-3" />
            <span>과운동증 유형 분류 기준</span>
          </button>
        </div>
      </div>
      </div>

      {/* Hyperkinesia Classification Standard Explanation Modal / Panel */}
      {showCriteriaModal && (
        <div className="p-4 bg-[#f8f7f2] border border-[#d6d6ce] rounded-xl text-xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#e5e5e0] pb-2">
            <span className="font-bold text-[#5a5a40] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#8a4a40]" />
              <span>학술 논문 기반 과운동증(Hyperkinesia) 4단계 행동 분류 기준 (Pagán & Raffa Assays)</span>
            </span>
            <button
              onClick={() => setShowCriteriaModal(false)}
              className="text-[#8a8a80] hover:text-[#1a1a1a] font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#4a4a3a]">
            <div className="p-2 bg-white rounded-lg border border-[#e5e5e0]">
              <span className="font-bold text-[#8a6a30]">① Head-Weaving (Snake-like / 머리 흔듦):</span>
              <p className="mt-0.5 text-[#6a6a60]">
                저농도 신경 자극 시 좌우로 머리를 빠르게 흔들며 탐색하는 파동형 과운동. 아데노신 길항 및 초기 콜린성 자극 유도.
              </p>
            </div>

            <div className="p-2 bg-white rounded-lg border border-[#e5e5e0]">
              <span className="font-bold text-[#b83220]">② C-like Spasm (C자형 경련 수축):</span>
              <p className="mt-0.5 text-[#6a6a60]">
                니코틴성 아세틸콜린 수용체(nAChR) 강자극으로 전신 종축 근육이 무의식적으로 굴곡되어 C자형으로 말리는 경련성 수축.
              </p>
            </div>

            <div className="p-2 bg-white rounded-lg border border-[#e5e5e0]">
              <span className="font-bold text-[#6a4a70]">③ Screw-like Paroxysm (스크류 3D 회전):</span>
              <p className="mt-0.5 text-[#6a6a60]">
                중추신경계(CNS) 신경독성 극대화 상태. 체축 중심으로 360도 스크류 회전을 일으키는 발작성 신경 이상 행동.
              </p>
            </div>

            <div className="p-2 bg-white rounded-lg border border-[#e5e5e0]">
              <span className="font-bold text-[#3d6a70]">④ Hypokinesia (진정/불동 마비):</span>
              <p className="mt-0.5 text-[#6a6a60]">
                GABA성 억제제 또는 에탄올 등에 의한 중추신경 마비 및 세포막 유동화로 운동성 정지 및 이완성 마비 상태.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Summary Indicators underneath Canvas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: 이동 속도 (Gliding Speed) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#3d6a70] hover:shadow-xs cursor-help"
          onMouseEnter={() => setHoveredMetric('gliding')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>① 이동 속도 (Speed)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#3d6a70]">
            {currentMetric.glidingSpeed} <span className="text-xs font-sans text-[#7a7a70] font-normal">% ({(currentMetric.glidingSpeed * 0.015).toFixed(2)} mm/s)</span>
          </div>

          {hoveredMetric === 'gliding' && (
            <div className="absolute left-0 bottom-full mb-1.5 z-30 w-64 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#3d6a70] border-b border-[#e5e5e0] pb-1">
                🐌 이동 속도 (Gliding Locomotion)
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                복부 섬모 운동(ciliary gliding) 속도입니다. 신경 및 근육 협응 장애 시 직진 활공 속도가 현저히 감소합니다.
              </p>
            </div>
          )}
        </div>

        {/* Metric 2: 총 이동 거리 (Total Distance) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#3d6a70] hover:shadow-xs cursor-help"
          onMouseEnter={() => setHoveredMetric('distance')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>② 총 이동 거리 (Distance)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#5a5a40]">
            {currentMetric.totalDistance ?? simulation.totalDistance} <span className="text-xs font-sans text-[#7a7a70] font-normal">mm/분</span>
          </div>

          {hoveredMetric === 'distance' && (
            <div className="absolute left-0 bottom-full mb-1.5 z-30 w-64 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#5a5a40] border-b border-[#e5e5e0] pb-1">
                📏 총 이동 거리 (Total Displacement)
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                1분간 위치 변화 총거리입니다. 운동 협응 저하 및 제자리 제자리 회전 시 단위 시간당 총 변위 거리가 감소합니다.
              </p>
            </div>
          )}
        </div>

        {/* Metric 3: 방향 전환 횟수 (Turn Count) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#8a6a30] hover:shadow-xs cursor-help"
          onMouseEnter={() => setHoveredMetric('turns')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>③ 방향 전환 (Turns)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#8a6a30]">
            {currentMetric.turnCount ?? simulation.turnCount} <span className="text-xs font-sans text-[#7a7a70] font-normal">회/분</span>
          </div>

          {hoveredMetric === 'turns' && (
            <div className="absolute left-0 bottom-full mb-1.5 z-30 w-64 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#8a6a30] border-b border-[#e5e5e0] pb-1">
                🔄 방향 전환 & 머리 흔듦 빈도 (Turn Frequency)
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                머리 신경절(Cephalic Ganglia) 자극 시 탐색성 머리 흔들기(Head-waving) 및 진로 변경 빈도입니다.
              </p>
            </div>
          )}
        </div>

        {/* Metric 4: 몸체 굽힘 정도 (Body Bending Degree) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#8a4a40] hover:shadow-xs cursor-help"
          onMouseEnter={() => setHoveredMetric('bend')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>④ 몸체 굽힘 (Curvature)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#8a4a40]">
            {currentMetric.bodyBendingDegree ?? simulation.bodyBendingDegree}°
          </div>

          {hoveredMetric === 'bend' && (
            <div className="absolute right-0 bottom-full mb-1.5 z-30 w-64 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#8a4a40] border-b border-[#e5e5e0] pb-1">
                ↪️ 몸체 C/S자 굴곡각 (Body Bending Degree)
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                국소 근육 수축 및 좌우 비대칭 신경 흥분에 의해 유발되는 최대 체축 굴곡 각도(°)입니다.
              </p>
            </div>
          )}
        </div>

        {/* Metric 5: 경련/떨림 빈도 (Spasm Frequency) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#b83220] hover:shadow-xs cursor-help"
          onMouseEnter={() => setHoveredMetric('spasm')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>⑤ 경련/떨림 (Spasms)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#b83220]">
            {currentMetric.spasmFrequency ?? simulation.spasmFrequency} <span className="text-xs font-sans text-[#7a7a70] font-normal">회/분</span>
          </div>

          {hoveredMetric === 'spasm' && (
            <div className="absolute left-0 bottom-full mb-1.5 z-30 w-64 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#b83220] border-b border-[#e5e5e0] pb-1">
                ⚡ 경련 및 떨림 빈도 (Spasm & Tremor Frequency)
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                전신 수용체 과자극에 따른 비자율적 근육 연축 및 시초성 떨림 발작 횟수입니다.
              </p>
            </div>
          )}
        </div>

        {/* Metric 6: 빛 회피 반응 (Light Avoidance Response) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#3d6a70] hover:shadow-xs cursor-help"
          onMouseEnter={() => setHoveredMetric('light')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>⑥ 빛 회피 반응 (Phototaxis)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#3d6a70]">
            {currentMetric.lightAvoidanceResponse ?? simulation.lightAvoidanceResponse}%
          </div>

          {hoveredMetric === 'light' && (
            <div className="absolute right-0 bottom-full mb-1.5 z-30 w-64 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#3d6a70] border-b border-[#e5e5e0] pb-1">
                💡 음성 광성 반응성 (Light Avoidance)
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                안점(Eyespots) 및 cephalic ganglion의 감각 신호 처리 정상성 지표로, 자극 노출 시 빛 회피 반응 정확도입니다.
              </p>
            </div>
          )}
        </div>

        {/* Metric 7: 운동 기능 회복 시간 (Motor Recovery Time) */}
        <div
          className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e5e5e0] space-y-0.5 relative transition-all hover:border-[#6a4a70] hover:shadow-xs cursor-help col-span-2"
          onMouseEnter={() => setHoveredMetric('recovery')}
          onMouseLeave={() => setHoveredMetric(null)}
        >
          <div className="text-[11px] font-semibold text-[#7a7a70] flex items-center justify-between">
            <span>⑦ 신경/운동 기능 회복 시간 (Motor Recovery Time)</span>
            <Info className="w-3 h-3 text-[#a0a090]" />
          </div>
          <div className="text-base font-serif font-bold text-[#6a4a70] flex items-baseline justify-between">
            <span>{simulation.motorRecoveryTimeHours} 시간 <span className="text-xs font-sans text-[#7a7a70] font-normal">({(simulation.motorRecoveryTimeHours / 24).toFixed(1)}일)</span></span>
            <span className="text-[10px] font-sans font-bold bg-[#e8f0f2] text-[#3d6a70] px-1.5 py-0.5 rounded border border-[#b8d6dc]">
              신경 재연결 측정
            </span>
          </div>

          {hoveredMetric === 'recovery' && (
            <div className="absolute right-0 bottom-full mb-1.5 z-30 w-72 bg-white border border-[#d6d6ce] shadow-lg rounded-xl p-3 text-xs space-y-1 text-[#2a2a24] animate-fadeIn pointer-events-none">
              <div className="font-bold text-[#6a4a70] border-b border-[#e5e5e0] pb-1">
                🧠 운동 기능 및 신경 연결 회복 소요 시간
              </div>
              <p className="text-[11px] text-[#5a5a50] leading-relaxed">
                절단면 약물 노출 후 신경 망 재배선(Neural reconnection) 및 정상 섬모/근육 활공 복원에 소요되는 예상 시간입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


