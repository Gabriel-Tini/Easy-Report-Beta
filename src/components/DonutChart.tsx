import React, { useState } from 'react';

export interface ChartSegment {
  name: string;
  value: number;
  color: string;
  category?: string;
}

interface DonutChartProps {
  data: ChartSegment[];
  totalLabel?: string;
  height?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalLabel = 'Defeitos',
  height = 220,
}) => {
  const [activeSegment, setActiveSegment] = useState<ChartSegment | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400">
        <div className="w-16 h-16 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center mb-2">
          <span className="text-xs font-mono text-zinc-500">0</span>
        </div>
        <p className="text-xs text-zinc-400 font-medium">Nenhum defeito apontado no turno</p>
        <p className="text-[11px] text-zinc-600">Linha operando com 100% de conformidade</p>
      </div>
    );
  }

  // Cálculos para o SVG Donut Chart
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const segmentsWithAngles = data
    .filter((d) => d.value > 0)
    .map((item) => {
      const percentage = (item.value / total) * 100;
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += (percentage / 100) * circumference;

      return {
        ...item,
        percentage,
        strokeDasharray,
        strokeDashoffset,
      };
    });

  return (
    <div className="flex flex-col items-center w-full">
      {/* SVG Container */}
      <div className="relative flex items-center justify-center" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 160 160"
          className="w-44 h-44 -rotate-90 transform drop-shadow-sm transition-all"
        >
          {/* Fundo do anel */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            className="donut-track"
            strokeWidth={strokeWidth}
          />

          {/* Segmentos coloridos */}
          {segmentsWithAngles.map((seg, idx) => (
            <circle
              key={idx}
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={activeSegment?.name === seg.name ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-300 cursor-pointer hover:opacity-90"
              onClick={() => setActiveSegment(activeSegment?.name === seg.name ? null : seg)}
            />
          ))}
        </svg>

        {/* Centro da Rosca (Indicador central Shadcn style) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
            {activeSegment ? activeSegment.value : total}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
            {activeSegment ? activeSegment.name : totalLabel}
          </span>
          {activeSegment && (
            <span className="text-[10px] text-amber-400 font-mono mt-0.5">
              {((activeSegment.value / total) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Legenda explicativa com valores e percentuais */}
      <div className="grid grid-cols-2 gap-2 w-full mt-2">
        {data.map((item, idx) => {
          if (item.value === 0) return null;
          const pct = ((item.value / total) * 100).toFixed(0);
          const isSelected = activeSegment?.name === item.name;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSegment(isSelected ? null : item)}
              className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'border-amber-400/80 bg-zinc-800/90 ring-1 ring-amber-400/50'
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-zinc-300 font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <span className="text-xs font-mono font-bold text-zinc-100">{item.value}</span>
                <span className="text-[10px] font-mono text-zinc-500">({pct}%)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
