import React, { useState } from 'react';
import {
  Clock,
  AlertOctagon,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WORKSTATIONS, Workstation } from '../types/report';
import { useReportStore } from '../store/reportStore';
import { getFormattedTime } from '../utils/dateUtils';

const COMMON_REASONS = [
  'Sem Sistema',
  'pino guia soltando',
  'Parada por Falha de solda',
  'Aguardando Cavidade / Peça',
  'Troca de Eletrodo / Solda',
  'Manutenção Mecânica',
  'Manutenção Elétrica',
  'Falta de Ar Comprimido',
  'Ajuste de Gabarito',
];

export const ProductionImpacts: React.FC = () => {
  const { impacts, addImpact, removeImpact, timezone } = useReportStore();

  const [timeRange, setTimeRange] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<Workstation | 'Geral'>('Geral');
  const [description, setDescription] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Botões de atalho de horário
  const handleQuickTime = (type: 'allDay' | 'lastHour' | 'currentRange') => {
    if (type === 'allDay') {
      setTimeRange('Dia todo');
    } else if (type === 'lastHour') {
      const now = new Date();
      const currentH = now.getHours();
      const prevH = (currentH - 1 + 24) % 24;
      const pad = (n: number) => String(n).padStart(2, '0');
      setTimeRange(`${pad(prevH)}:00-${pad(currentH)}:00`);
    } else if (type === 'currentRange') {
      const now = new Date();
      const currentTime = getFormattedTime(timezone, now);
      const [hStr, mStr] = currentTime.split(':');
      const h = parseInt(hStr, 10);
      const nextH = (h + 1) % 24;
      setTimeRange(`${currentTime} - ${String(nextH).padStart(2, '0')}:${mStr}`);
    }
  };

  const handleSelectReason = (reason: string) => {
    setDescription(reason);
  };

  const handleAddImpact = (e: React.FormEvent) => {
    e.preventDefault();

    if (!timeRange.trim()) {
      alert('Informe o horário ou selecione "Dia todo".');
      return;
    }
    if (!description.trim()) {
      alert('Informe a descrição do impacto/parada.');
      return;
    }

    addImpact({
      timeRange: timeRange.trim(),
      workstation: selectedStation,
      description: description.trim(),
    });

    setFeedback('Impacto de produção adicionado à timeline');
    setTimeout(() => setFeedback(null), 2500);

    // Reset campos
    setTimeRange('');
    setDescription('');
    setSelectedStation('Geral');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Alerta de Feedback */}
      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-medium">
          {feedback}
        </div>
      )}

      {/* Formulário de Registro de Impactos */}
      <form onSubmit={handleAddImpact} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Registrar Impacto / Parada
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">Gera timeline do relatório</span>
        </div>

        {/* 1. HORÁRIO / DURAÇÃO */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>Horário ou Intervalo:</span>
            <span className="text-[10px] text-zinc-500 font-normal">Ex: 14:00-15:00 ou Dia todo</span>
          </label>

          <input
            type="text"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            placeholder="Ex: 14:00-15:00 ou Dia todo"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
            required
          />

          {/* Atalhos de preenchimento rápido de horário */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickTime('allDay')}
              className="text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 active:scale-95 transition-all"
            >
              Dia todo
            </button>
            <button
              type="button"
              onClick={() => handleQuickTime('lastHour')}
              className="text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 active:scale-95 transition-all font-mono"
            >
              Hora Anterior
            </button>
            <button
              type="button"
              onClick={() => handleQuickTime('currentRange')}
              className="text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 active:scale-95 transition-all font-mono"
            >
              Próxima 1h
            </button>
          </div>
        </div>

        {/* 2. POSTO ENVOLVIDO */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
            Posto de Trabalho Afetado:
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedStation('Geral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
                selectedStation === 'Geral'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700'
              }`}
            >
              Geral / Linha Toda
            </button>
            {WORKSTATIONS.map((station) => (
              <button
                key={station}
                type="button"
                onClick={() => setSelectedStation(station)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
                  selectedStation === station
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        </div>

        {/* 3. DESCRIÇÃO / MOTIVO */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
            Motivo do Impacto:
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: pino guia soltando ou Parada por Falha de solda"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            required
          />

          {/* Chips de motivos frequentes do chão de fábrica */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => handleSelectReason(reason)}
                className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                  description === reason
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-700'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* Visualização de Prévia da Linha */}
        {timeRange && description && (
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-amber-300">
            <span className="text-[10px] text-zinc-500 block font-sans mb-0.5">
              Formato na Timeline WhatsApp:
            </span>
            {selectedStation === 'Geral'
              ? `${timeRange} - ${description}`
              : `${timeRange} - ${selectedStation} - ${description}`}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs py-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar à Linha do Tempo</span>
        </button>
      </form>

      {/* TIMELINE DE IMPACTOS CADASTRADOS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Timeline de Produção ({impacts.length})
          </span>
          <span className="text-[10px] text-zinc-400">Ordem cronológica do turno</span>
        </div>

        {impacts.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Nenhum impacto ou parada de produção registrado até o momento.
          </div>
        ) : (
          <div className="space-y-2 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-800">
            {impacts.map((imp) => {
              const formattedLine =
                imp.workstation && imp.workstation !== 'Geral'
                  ? `${imp.timeRange} - ${imp.workstation} - ${imp.description}`
                  : `${imp.timeRange} - ${imp.description}`;

              return (
                <div
                  key={imp.id}
                  className="relative pl-7 flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-800 group"
                >
                  {/* Ponto indicador da linha do tempo */}
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-zinc-900" />

                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-mono text-xs font-semibold text-zinc-200 break-words">
                      {formattedLine}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      Registrado às {new Date(imp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImpact(imp.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-700/60 shrink-0 transition-colors"
                    title="Excluir item da timeline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
