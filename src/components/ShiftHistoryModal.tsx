import React, { useState } from 'react';
import {
  X,
  History,
  Calendar,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import { ShiftReportArchive } from '../types/report';

interface ShiftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftHistoryModal: React.FC<ShiftHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { shiftHistory } = useReportStore();
  const [selectedArchive, setSelectedArchive] = useState<ShiftReportArchive | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyArchiveText = async (archive: ShiftReportArchive) => {
    // Monta o template histórico executivo
    const timelineLines: string[] = [];

    if (archive.hourlyRecords && archive.hourlyRecords.length > 0) {
      for (const hr of archive.hourlyRecords) {
        if (hr.type === 'impacto' || hr.type === 'defeito' || hr.countsAsImpact || hr.type === 'setup') {
          const stationPart = hr.workstation && hr.workstation !== 'Geral' ? ` - ${hr.workstation}` : '';
          timelineLines.push(`• ${hr.hourSlot}${stationPart} - ${hr.title} (Reg. ${hr.registeredAtTime})`);
        }
      }
    }

    if (archive.impacts && archive.impacts.length > 0) {
      for (const imp of archive.impacts) {
        const stationPart = imp.workstation && imp.workstation !== 'Geral' ? ` - ${imp.workstation}` : '';
        timelineLines.push(`• ${imp.timeRange}${stationPart} - ${imp.description}`);
      }
    }

    const timelineText =
      timelineLines.length === 0
        ? '• Sem paradas ou impactos registrados no turno'
        : timelineLines.join('\n');

    const totalProd = archive.closing.totalProduzido || '0';
    const retrabalho = archive.closing.retrabalhadosPorGap || '0';
    const aprovados = archive.closing.aprovadosParaPintura || '0';
    const plano = archive.closing.planoAcum || '0';
    const real = archive.closing.realAcum || '0';

    const text = `📊 *RELATÓRIO EXECUTIVO DE PRODUÇÃO*
🏭 *${archive.lineName.toUpperCase()}* | *${archive.shift} TURNO*
📅 Data: ${archive.dateStr} | Modelo: *${archive.model}*
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *PRODUÇÃO & EFICIÊNCIA*
Total produzido: ${totalProd}
Aprovados para Pintura: ${aprovados}
Retrabalhados por Gap: ${retrabalho}

Plano Acum: ${plano}
Real Acum: ${real}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *QUALIDADE & SUCATA (SCRAP)*
Scrap total: ${archive.summary.scrapTotal}
Falha de solda: ${archive.summary.falhaDeSolda}
Amassado: ${archive.summary.amassado}
Empenado: ${archive.summary.empenado}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ *IMPACTOS DE PRODUÇÃO & OCORRÊNCIAS*
${timelineText}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Enviado via Sistema de Chão de Fábrica - Histórico_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(archive.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // noop
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Histórico de Turnos Passados
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {shiftHistory.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            Nenhum turno anterior arquivado ainda.
            <p className="text-[11px] text-zinc-600 mt-1">
              Os relatórios são salvos automaticamente na virada do dia para preservar todos os dados.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {shiftHistory.map((item) => {
              const isExpanded = selectedArchive?.id === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 transition-colors"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedArchive(isExpanded ? null : item)}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-200">
                            {item.dateStr}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono">
                            {item.model}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {item.shift} Turno
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {item.summary.totalDefeitos} defeitos • Scrap: {item.summary.scrapTotal}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyArchiveText(item);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Copiar relatório deste turno"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-zinc-900 p-2 rounded">
                          <span className="text-zinc-500 block">Falha de Solda:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {item.summary.falhaDeSolda}
                          </span>
                        </div>
                        <div className="bg-zinc-900 p-2 rounded">
                          <span className="text-zinc-500 block">Gaps Totais:</span>
                          <span className="font-mono font-bold text-sky-400">
                            {item.summary.gaps}
                          </span>
                        </div>
                        <div className="bg-zinc-900 p-2 rounded">
                          <span className="text-zinc-500 block">Amassados:</span>
                          <span className="font-mono font-bold text-zinc-200">
                            {item.summary.amassado}
                          </span>
                        </div>
                        <div className="bg-zinc-900 p-2 rounded">
                          <span className="text-zinc-500 block">Empenados:</span>
                          <span className="font-mono font-bold text-zinc-200">
                            {item.summary.empenado}
                          </span>
                        </div>
                      </div>

                      {item.impacts.length > 0 && (
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                            Impactos Registrados:
                          </span>
                          <div className="bg-zinc-900 p-2 rounded text-[11px] font-mono text-zinc-300 space-y-1">
                            {item.impacts.map((imp, idx) => (
                              <div key={idx}>
                                {imp.timeRange} - {imp.workstation} - {imp.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
