import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ComparisonResults } from '../types';
import { LineChart as ChartIcon, TrendingUp, Zap, Activity, HeartPulse } from 'lucide-react';

interface MetricsChartsProps {
  comparison: ComparisonResults;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const MetricsCharts: React.FC<MetricsChartsProps> = ({
  comparison,
  selectedDay,
  onSelectDay,
}) => {
  const [activeTab, setActiveTab] = useState<'regen' | 'stem' | 'gliding' | 'scrunch' | 'hyper' | 'stress'>('regen');

  // Prepare combined time series dataset for Recharts
  const chartData = comparison.submersion.timeSeries.map((sub, idx) => {
    const targ = comparison.targeted.timeSeries[idx];
    return {
      day: `Day ${sub.day}`,
      dayNum: sub.day,

      // Submersion
      submersionRegen: sub.regenerationRate,
      submersionStem: sub.stemCellActivity,
      submersionGliding: sub.glidingSpeed,
      submersionScrunch: sub.scrunchingFreq,
      submersionHyper: sub.hyperkinesiaScore,
      submersionStress: sub.stressIndex,

      // Targeted
      targetedRegen: targ.regenerationRate,
      targetedStem: targ.stemCellActivity,
      targetedGliding: targ.glidingSpeed,
      targetedScrunch: targ.scrunchingFreq,
      targetedHyper: targ.hyperkinesiaScore,
      targetedStress: targ.stressIndex,
    };
  });

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-5 shadow-xs text-[#2a2a24]">
      <div className="space-y-3 pb-4 border-b border-[#e5e5e0] mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 break-keep">
          <div className="flex items-center space-x-2">
            <ChartIcon className="w-4 h-4 text-[#5a5a40] shrink-0" />
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#5a5a40]">
              시간 경과별 동적 시뮬레이션 그래프 (Days 0 ~ 14)
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs bg-[#f0f0eb] border border-[#d6d6ce] text-[#5a5a40] font-semibold px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
            실시간 추이 비교
          </span>
        </div>

        {/* Tab selector grid for perfect alignment */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 bg-[#f5f5f0] p-1.5 rounded-xl border border-[#d6d6ce] text-xs">
          <button
            onClick={() => setActiveTab('regen')}
            className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'regen'
                ? 'bg-[#5a5a40] text-white font-bold shadow-2xs'
                : 'text-[#6a6a60] hover:text-[#1a1a1a] hover:bg-[#eaeae2]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>재생률 (%)</span>
          </button>

          <button
            onClick={() => setActiveTab('stem')}
            className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'stem'
                ? 'bg-[#3d6a70] text-white font-bold shadow-2xs'
                : 'text-[#6a6a60] hover:text-[#1a1a1a] hover:bg-[#eaeae2]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>줄기세포 활성</span>
          </button>

          <button
            onClick={() => setActiveTab('gliding')}
            className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'gliding'
                ? 'bg-[#3d6a70] text-white font-bold shadow-2xs'
                : 'text-[#6a6a60] hover:text-[#1a1a1a] hover:bg-[#eaeae2]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>글라이딩 (%)</span>
          </button>

          <button
            onClick={() => setActiveTab('scrunch')}
            className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'scrunch'
                ? 'bg-[#8a6a30] text-white font-bold shadow-2xs'
                : 'text-[#6a6a60] hover:text-[#1a1a1a] hover:bg-[#eaeae2]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>스크런칭 (회)</span>
          </button>

          <button
            onClick={() => setActiveTab('hyper')}
            className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'hyper'
                ? 'bg-[#8a4a40] text-white font-bold shadow-2xs'
                : 'text-[#6a6a60] hover:text-[#1a1a1a] hover:bg-[#eaeae2]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>과운동증</span>
          </button>

          <button
            onClick={() => setActiveTab('stress')}
            className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'stress'
                ? 'bg-[#b83220] text-white font-bold shadow-2xs'
                : 'text-[#6a6a60] hover:text-[#1a1a1a] hover:bg-[#eaeae2]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 shrink-0" />
            <span>스트레스 지수</span>
          </button>
        </div>
      </div>

      {/* Chart Render Box */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" opacity={0.8} />
            <XAxis dataKey="day" stroke="#7a7a70" fontSize={12} tickLine={false} />
            <YAxis stroke="#7a7a70" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#d6d6ce',
                borderRadius: '0.75rem',
                color: '#1a1a1a',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

            {/* Render lines based on active Tab */}
            {activeTab === 'regen' && (
              <>
                <Line
                  type="monotone"
                  dataKey="submersionRegen"
                  name="일반 침지법 (Submersion) 재생률 %"
                  stroke="#c86a30"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetedRegen"
                  name="선택적 전달 (Targeted) 재생률 %"
                  stroke="#5a5a40"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </>
            )}

            {activeTab === 'stem' && (
              <>
                <Line
                  type="monotone"
                  dataKey="submersionStem"
                  name="일반 침지법 줄기세포 활성"
                  stroke="#c86a30"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetedStem"
                  name="선택적 전달 줄기세포 활성"
                  stroke="#3d6a70"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </>
            )}

            {activeTab === 'gliding' && (
              <>
                <Line
                  type="monotone"
                  dataKey="submersionGliding"
                  name="일반 침지법 글라이딩 운동성 (%)"
                  stroke="#c86a30"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetedGliding"
                  name="선택적 전달 글라이딩 운동성 (%)"
                  stroke="#3d6a70"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </>
            )}

            {activeTab === 'scrunch' && (
              <>
                <Line
                  type="monotone"
                  dataKey="submersionScrunch"
                  name="일반 침지법 스크런칭 (회/분)"
                  stroke="#b83220"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetedScrunch"
                  name="선택적 전달 스크런칭 (회/분)"
                  stroke="#6a4a70"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </>
            )}

            {activeTab === 'hyper' && (
              <>
                <Line
                  type="monotone"
                  dataKey="submersionHyper"
                  name="일반 침지법 과운동증 지수"
                  stroke="#8a4a40"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetedHyper"
                  name="선택적 전달 과운동증 지수"
                  stroke="#3d6a70"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </>
            )}

            {activeTab === 'stress' && (
              <>
                <Line
                  type="monotone"
                  dataKey="submersionStress"
                  name="일반 침지법 스트레스 지수"
                  stroke="#b83220"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetedStress"
                  name="선택적 전달 스트레스 지수"
                  stroke="#3d6a70"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

