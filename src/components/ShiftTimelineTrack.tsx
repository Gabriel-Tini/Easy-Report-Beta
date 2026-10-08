import React from 'react';
import { useReportStore } from '../store/reportStore';
import { getFormattedTime } from '../utils/dateUtils';

interface ShiftTimelineTrackProps {
  selectedSlot?: string;
  onSelectSlot?: (slot: string) => void;
}

export const ShiftTimelineTrack: React.FC<ShiftTimelineTrackProps> = ({
  selectedSlot,
  onSelectSlot,
}) => {
  const { timezone } = useReportStore();
  const currentTime = getFormattedTime(timezone, new Date());
  const [currentHStr, currentMStr] = currentTime.split(':');
  const currentMinutes = parseInt(currentHStr, 10) * 60 + parseInt(currentMStr, 10);

  // Milestones oficiais mostrados na imagem de referência
  const milestones = [
    { label: '07:00', minutes: 7 * 60 },
    { label: '09:00', minutes: 9 * 60 },
    { label: '11:00', minutes: 11 * 60 },
    { label: '13:00', minutes: 13 * 60 },
    { label: '15:00', minutes: 15 * 60 },
    { label: '17:00', minutes: 17 * 60 },
    { label: '17:20', minutes: 17 * 60 + 20, isHazard: true },
  ];

  return (
    <div className="w-full py-2 px-1 select-none">
      {/* Rótulos das Horas em Pílulas sutis */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-2">
        {milestones.map((m) => {
          const isSelected = selectedSlot === m.label;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => onSelectSlot && onSelectSlot(m.label)}
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-xs scale-105 ring-1 ring-amber-500'
                  : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-700/80 shadow-2xs'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Régua Horizontal com Nós Conectados */}
      <div className="relative flex items-center h-5">
        {/* Linha base escura */}
        <div className="absolute inset-x-2 h-1 bg-zinc-700/80 rounded-full" />

        {/* Linha preenchida em amarelo para o tempo decorrido */}
        {milestones.map((m, idx) => {
          if (idx === milestones.length - 1) return null;
          const next = milestones[idx + 1];
          const isPassed = currentMinutes >= next.minutes;
          const isCurrentSegment =
            currentMinutes >= m.minutes && currentMinutes < next.minutes;

          // Se for o último segmento (17:00 - 17:20), aplica faixa zebrada industrial
          if (next.isHazard) {
            return (
              <div
                key={`segment-${idx}`}
                className="absolute h-2 rounded-full hazard-stripes border border-zinc-900/40 z-10"
                style={{
                  left: `${(idx / (milestones.length - 1)) * 100}%`,
                  width: `${(1 / (milestones.length - 1)) * 100}%`,
                }}
              />
            );
          }

          if (isPassed) {
            return (
              <div
                key={`segment-${idx}`}
                className="absolute h-1 bg-amber-400 z-10 rounded-full"
                style={{
                  left: `${(idx / (milestones.length - 1)) * 100}%`,
                  width: `${(1 / (milestones.length - 1)) * 100}%`,
                }}
              />
            );
          }

          if (isCurrentSegment) {
            const segRatio = Math.max(
              0,
              Math.min(
                1,
                (currentMinutes - m.minutes) / (next.minutes - m.minutes)
              )
            );
            return (
              <div
                key={`segment-${idx}`}
                className="absolute h-1 bg-amber-400 z-10 rounded-full"
                style={{
                  left: `${(idx / (milestones.length - 1)) * 100}%`,
                  width: `${(segRatio / (milestones.length - 1)) * 100}%`,
                }}
              />
            );
          }

          return null;
        })}

        {/* Nós Circulares (Milestones) */}
        <div className="absolute inset-x-2 flex items-center justify-between z-20 pointer-events-none">
          {milestones.map((m) => {
            const isPassed = currentMinutes >= m.minutes;
            const isCurrent =
              Math.abs(currentMinutes - m.minutes) < 30 ||
              (currentMinutes >= m.minutes && currentMinutes < m.minutes + 60);

            if (m.isHazard) {
              return (
                <div
                  key={`node-${m.label}`}
                  className="w-3.5 h-3.5 rounded-full border-2 border-zinc-900 hazard-stripes shadow-xs"
                />
              );
            }

            if (isPassed) {
              return (
                <div
                  key={`node-${m.label}`}
                  className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-zinc-950 shadow-xs ring-1 ring-amber-400/50"
                />
              );
            }

            return (
              <div
                key={`node-${m.label}`}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'bg-amber-400 border-zinc-950 ring-2 ring-amber-400 animate-pulse'
                    : 'bg-zinc-800 border-zinc-600'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
