import React, { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  Eye,
  Share2,
  Cpu,
  BarChart3,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Award,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import { DonutChart, ChartSegment } from './DonutChart';
import { getFormattedDate } from '../utils/dateUtils';
import {
  Workstation,
  WORKSTATIONS,
  StationImpactEntry,
  STATION_IMPACT_PRESETS,
} from '../types/report';

export const FechamentoTab: React.FC = () => {
  const {
    lineName,
    model,
    shift,
    timezone,
    manualClosing,
    updateManualClosing,
    getDefectCounts,
    hourlyProduction,
    generateWhatsAppText,
    getWhatsAppShareUrl,
  } = useReportStore();

  const [copied, setCopied] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Workstation>('P30');
  const [customStationReason, setCustomStationReason] = useState<string>('');
  const [showRawTextEditor, setShowRawTextEditor] = useState<boolean>(false);

  const counts = getDefectCounts();
  const currentDate = getFormattedDate(timezone);

  const sumHourlyProduction = Object.values(hourlyProduction).reduce((a, b) => a + b, 0);

  const handleChange = (field: keyof typeof manualClosing, value: string) => {
    updateManualClosing({ [field]: value });
  };

  const handlePullHourlyProduction = () => {
    updateManualClosing({ totalProduzido: String(sumHourlyProduction) });
  };

  const handlePullGaps = () => {
    updateManualClosing({ retrabalhadosPorGap: String(counts.gapsTotal) });
  };

  const handleAutoCalcApproved = () => {
    const totalNum = parseInt(manualClosing.totalProduzido || String(sumHourlyProduction), 10);
    if (!isNaN(totalNum)) {
      const calc = Math.max(0, totalNum - counts.scrapTotal);
      updateManualClosing({ aprovadosParaPintura: String(calc) });
    }
  };

  // Sincronização dos impactos por postos com formatação executiva
  const syncStationImpacts = (items: StationImpactEntry[]) => {
    if (items.length === 0) {
      updateManualClosing({
        stationImpacts: [],
        impactoPostos: '',
      });
      return;
    }
    const grouped = new Map<string, string[]>();
    for (const item of items) {
      const list = grouped.get(item.station) || [];
      if (!list.includes(item.reason)) {
        list.push(item.reason);
      }
      grouped.set(item.station, list);
    }
    const lines: string[] = [];
    for (const [st, descs] of Array.from(grouped.entries()).sort()) {
      lines.push(`[${st}]: ${descs.join(' / ')}`);
    }
    const formatted = lines.join('\n\n');
    updateManualClosing({
      stationImpacts: items,
      impactoPostos: formatted,
    });
  };

  const handleAddPresetImpact = (preset: string) => {
    const currentList: StationImpactEntry[] = manualClosing.stationImpacts || [];
    if (currentList.some((item) => item.station === selectedStation && item.reason === preset)) {
      return;
    }
    const newItem: StationImpactEntry = {
      id: `si-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      station: selectedStation,
      reason: preset,
    };
    const updated = [...currentList, newItem];
    syncStationImpacts(updated);
  };

  const handleAddCustomImpact = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = customStationReason.trim();
    if (!text) return;
    const currentList: StationImpactEntry[] = manualClosing.stationImpacts || [];
    const newItem: StationImpactEntry = {
      id: `si-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      station: selectedStation,
      reason: text,
    };
    const updated = [...currentList, newItem];
    syncStationImpacts(updated);
    setCustomStationReason('');
  };

  const handleRemoveStationImpact = (id: string) => {
    const currentList: StationImpactEntry[] = manualClosing.stationImpacts || [];
    const updated = currentList.filter((item) => item.id !== id);
    syncStationImpacts(updated);
  };

  const handleClearStationImpacts = () => {
    syncStationImpacts([]);
  };

  const handleCopyText = async () => {
    const text = generateWhatsAppText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const url = getWhatsAppShareUrl();
    window.location.href = url;
  };

  const handleNativeShare = async () => {
    const text = generateWhatsAppText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório Executivo - Linha de Solda - ${currentDate}`,
          text: text,
        });
      } catch {
        handleShareWhatsApp();
      }
    } else {
      handleShareWhatsApp();
    }
  };

  // Cálculos executivos de KPIs
  const numTotal = parseInt(manualClosing.totalProduzido, 10) || 0;
  const numPlano = parseInt(manualClosing.planoAcum, 10) || 0;
  const numReal = parseInt(manualClosing.realAcum, 10) || 0;
  const aderenciaPct = numPlano > 0 ? ((numReal / numPlano) * 100).toFixed(1) : null;
  const scrapRatePct = numTotal > 0 ? ((counts.scrapTotal / numTotal) * 100).toFixed(2) : '0.00';

  const chartData: ChartSegment[] = [
    {
      name: 'Falhas de Solda',
      value: counts.falhaDeSolda,
      color: '#eab308',
    },
    {
      name: 'Gaps',
      value: counts.gapsTotal,
      color: '#38bdf8',
    },
    {
      name: 'Amassado',
      value: counts.amassado,
      color: '#ef4444',
    },
    {
      name: 'Empenado',
      value: counts.empenado,
      color: '#f97316',
    },
    {
      name: 'Outros Defeitos',
      value: Math.max(
        0,
        counts.totalGeral -
          (counts.falhaDeSolda + counts.gapsTotal + counts.amassado + counts.empenado)
      ),
      color: '#71717a',
    },
  ];

  const executiveReportText = generateWhatsAppText();

  return (
    <div className="space-y-3.5 pb-20">
      {/* 1. CABEÇALHO EXECUTIVO DO FECHAMENTO */}
      <div className="p-3.5 rounded-2xl theme-banner border theme-border shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Fechamento Executivo do Turno
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">
                {lineName} • {model} • {shift} Turno
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
            {currentDate}
          </span>
        </div>

        {/* Indicadores Executivos Principais */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
              Aderência
            </span>
            <span className="text-sm font-mono font-black text-white">
              {aderenciaPct ? `${aderenciaPct}%` : '--'}
            </span>
          </div>

          <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
              Índice Scrap
            </span>
            <span className="text-sm font-mono font-black text-red-400">
              {scrapRatePct}%
            </span>
          </div>

          <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
              Defeitos
            </span>
            <span className="text-sm font-mono font-black text-amber-400">
              {counts.totalGeral}
            </span>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICO DE ROSCA (DONUT CHART) */}
      <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2.5 mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider theme-text-primary">
              Distribuição de Defeitos do Turno
            </span>
          </div>
          <span className="text-[10px] font-mono theme-text-muted font-bold">
            {counts.totalGeral} apontamentos
          </span>
        </div>

        <DonutChart data={chartData} totalLabel="Defeitos" height={190} />
      </div>

      {/* 3. DADOS DE QUALIDADE CALCULADOS AUTOMATICAMENTE */}
      <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2 mb-3">
          <span className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-amber-500" />
            Qualidade & Perdas (Automático)
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">100% STORE</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-black/5 dark:bg-black/40 p-2.5 rounded-xl border border-black/10 dark:border-zinc-800 flex items-center justify-between">
            <span className="theme-text-muted font-medium">Scrap total (Sucata):</span>
            <span className="font-mono font-black text-red-500 text-sm">
              {counts.scrapTotal}
            </span>
          </div>

          <div className="bg-black/5 dark:bg-black/40 p-2.5 rounded-xl border border-black/10 dark:border-zinc-800 flex items-center justify-between">
            <span className="theme-text-muted font-medium">Falha de solda:</span>
            <span className="font-mono font-black text-amber-500 text-sm">
              {counts.falhaDeSolda}
            </span>
          </div>

          <div className="bg-black/5 dark:bg-black/40 p-2.5 rounded-xl border border-black/10 dark:border-zinc-800 flex items-center justify-between">
            <span className="theme-text-muted font-medium">Amassados:</span>
            <span className="font-mono font-black theme-text-primary text-sm">
              {counts.amassado}
            </span>
          </div>

          <div className="bg-black/5 dark:bg-black/40 p-2.5 rounded-xl border border-black/10 dark:border-zinc-800 flex items-center justify-between">
            <span className="theme-text-muted font-medium">Empenados:</span>
            <span className="font-mono font-black theme-text-primary text-sm">
              {counts.empenado}
            </span>
          </div>
        </div>
      </div>

      {/* 4. FORMULÁRIO EXECUTIVO DE FECHAMENTO (PREENCHIMENTO ANTES DA PRÉVIA) */}
      <div className="space-y-3">
        {/* SEÇÃO 1: INDICADORES DE PRODUÇÃO */}
        <div className="theme-card-slot rounded-2xl border p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              1. Indicadores de Produção
            </span>
            <span className="text-[10px] theme-text-muted font-mono">📈 Métricas de Volume</span>
          </div>

          {/* Total Produzido */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold theme-text-secondary">
                • Total Produzido:
              </label>
              {sumHourlyProduction > 0 && (
                <button
                  type="button"
                  onClick={handlePullHourlyProduction}
                  className="text-[10px] text-amber-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Puxar do Hora a Hora ({sumHourlyProduction} pçs)</span>
                </button>
              )}
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={manualClosing.totalProduzido}
              onChange={(e) => handleChange('totalProduzido', e.target.value)}
              placeholder={`Ex: ${sumHourlyProduction > 0 ? sumHourlyProduction : 1250}`}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Aprovados para Pintura com Helper */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold theme-text-secondary">
                • Aprovados para Pintura:
              </label>
              <button
                type="button"
                onClick={handleAutoCalcApproved}
                className="text-[10px] text-amber-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto: Total - Scrap ({Math.max(0, (parseInt(manualClosing.totalProduzido || String(sumHourlyProduction), 10) || 0) - counts.scrapTotal)})</span>
              </button>
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={manualClosing.aprovadosParaPintura}
              onChange={(e) => handleChange('aprovadosParaPintura', e.target.value)}
              placeholder="Ex: 1240"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* SEÇÃO 2: QUALIDADE E RETRABALHO (GAP) */}
        <div className="theme-card-slot rounded-2xl border p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
              <Award className="w-4 h-4 text-sky-400" />
              2. Qualidade e Retrabalho (Gap)
            </span>
            <span className="text-[10px] theme-text-muted font-mono">🛠️ Reinspeção</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold theme-text-secondary">
                  • Retrabalhados por Gap:
                </label>
                {counts.gapsTotal > 0 && (
                  <button
                    type="button"
                    onClick={handlePullGaps}
                    className="text-[9px] text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    Usar {counts.gapsTotal}
                  </button>
                )}
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={manualClosing.retrabalhadosPorGap}
                onChange={(e) => handleChange('retrabalhadosPorGap', e.target.value)}
                placeholder={`Ex: ${counts.gapsTotal || 14}`}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold theme-text-secondary">
                  • Detalhamento dos Gaps:
                </label>
                {manualClosing.detalheGaps && (
                  <button
                    type="button"
                    onClick={() => handleChange('detalheGaps', '')}
                    className="text-[10px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                    title="Limpar detalhe dos gaps"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={manualClosing.detalheGaps}
                onChange={(e) => handleChange('detalheGaps', e.target.value)}
                placeholder="Ex: Frontal / Traseiro"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: IMPACTANTES DA PRODUÇÃO */}
        <div className="theme-card-slot rounded-2xl border p-3.5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider theme-text-primary">
                3. Impactantes da Produção
              </span>
            </div>
            <span className="text-[10px] theme-text-muted font-mono">
              (Campos vazios desaparecem do relatório)
            </span>
          </div>

          {/* Sistema: Apenas texto manual sem pré-definição */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold theme-text-secondary flex items-center gap-1">
                <span>• Sistema (Apontamento de paradas / MES):</span>
              </label>
              {manualClosing.impactoSistema && (
                <button
                  type="button"
                  onClick={() => handleChange('impactoSistema', '')}
                  className="text-[10px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                  title="Limpar campo para não exibir no relatório"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={manualClosing.impactoSistema}
              onChange={(e) => handleChange('impactoSistema', e.target.value)}
              placeholder="Ex: Apontamento de paradas / MES (deixe vazio se não houver)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Eventos: Apenas texto manual sem pré-definição */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold theme-text-secondary flex items-center gap-1">
                <span>• Eventos (Treinamentos / SIPATMA):</span>
              </label>
              {manualClosing.impactoEventos && (
                <button
                  type="button"
                  onClick={() => handleChange('impactoEventos', '')}
                  className="text-[10px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                  title="Limpar campo para não exibir no relatório"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={manualClosing.impactoEventos}
              onChange={(e) => handleChange('impactoEventos', e.target.value)}
              placeholder="Ex: Treinamentos / SIPATMA (deixe vazio se não houver)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Postos Operacionais: SELECIONÁVEIS POR POSTO COM PRESETS E OUTRO (MANUAL) */}
          <div className="space-y-2 pt-2 border-t border-black/10 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-amber-500">
                  • Postos Operacionais:
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-zinc-800 theme-text-secondary">
                  {manualClosing.stationImpacts && manualClosing.stationImpacts.length > 0
                    ? `${manualClosing.stationImpacts.length} impacto(s)`
                    : 'Nenhum (não exibirá)'}
                </span>
              </div>
              {manualClosing.stationImpacts && manualClosing.stationImpacts.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearStationImpacts}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover Todos</span>
                </button>
              )}
            </div>

            {/* 1. SELETOR DE POSTO */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                1. Selecione o Posto:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                {WORKSTATIONS.map((st) => {
                  const isSelected = selectedStation === st;
                  const countForStation =
                    manualClosing.stationImpacts?.filter((i) => i.station === st).length || 0;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className={`py-1.5 px-1 rounded-lg font-mono text-xs font-black transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-400 text-zinc-950 shadow-sm ring-1 ring-amber-500 scale-[1.02]'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750'
                      }`}
                    >
                      <span>{st}</span>
                      {countForStation > 0 && (
                        <span
                          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center font-bold ${
                            isSelected ? 'bg-zinc-950 text-amber-400' : 'bg-amber-400 text-zinc-950'
                          }`}
                        >
                          {countForStation}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. PRESETS DO POSTO SELECIONADO */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                2. Selecione o Impacto para [{selectedStation}]:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {STATION_IMPACT_PRESETS.map((preset) => {
                  const alreadyAdded = manualClosing.stationImpacts?.some(
                    (i) => i.station === selectedStation && i.reason === preset
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddPresetImpact(preset)}
                      className={`text-left text-[11px] font-medium px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                        alreadyAdded
                          ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 font-bold'
                          : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:border-zinc-500'
                      }`}
                    >
                      <span className="truncate">{preset}</span>
                      {alreadyAdded ? (
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. OPÇÃO DE TEXTO MANUAL ("OUTRO") */}
            <form onSubmit={handleAddCustomImpact} className="pt-1 flex gap-1.5">
              <input
                type="text"
                value={customStationReason}
                onChange={(e) => setCustomStationReason(e.target.value)}
                placeholder={`Outro impacto manual para [${selectedStation}]...`}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={!customStationReason.trim()}
                className="px-3 py-1.5 bg-amber-400 disabled:opacity-40 hover:bg-amber-300 text-zinc-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* 4. LISTA DE IMPACTOS SELECIONADOS NO MOMENTO */}
            {manualClosing.stationImpacts && manualClosing.stationImpacts.length > 0 ? (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                  Impactos Registrados por Posto:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {manualClosing.stationImpacts.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-medium group"
                    >
                      <span className="font-mono font-black text-amber-400">[{item.station}]</span>
                      <span className="truncate max-w-[190px]">{item.reason}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStationImpact(item.id)}
                        className="ml-1 text-zinc-400 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                        title="Remover este impacto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-black/5 dark:bg-black/20 border border-black/5 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-500 italic">
                  Nenhum desvio selecionado para os postos. Se mantiver vazio, o bloco não aparecerá no relatório.
                </span>
              </div>
            )}

            {/* TOGGLE OPCIONAL PARA AJUSTAR TEXTO MANUAL DOS POSTOS */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowRawTextEditor(!showRawTextEditor)}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 font-mono flex items-center gap-1 cursor-pointer"
              >
                {showRawTextEditor ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>
                  {showRawTextEditor
                    ? 'Ocultar editor de texto livre dos postos'
                    : 'Ajustar texto livre dos postos diretamente'}
                </span>
              </button>

              {showRawTextEditor && (
                <div className="mt-1.5 space-y-1">
                  <textarea
                    rows={3}
                    value={manualClosing.impactoPostos}
                    onChange={(e) => handleChange('impactoPostos', e.target.value)}
                    placeholder="[P30]: Desvio mecânico / ferramental&#10;&#10;[P40]: Desvio de processo / matéria-prima"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Texto formatado que entrará no relatório final.</span>
                    {manualClosing.impactoPostos && (
                      <button
                        type="button"
                        onClick={() => handleChange('impactoPostos', '')}
                        className="text-red-400 hover:underline cursor-pointer"
                      >
                        Limpar texto
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: OBSERVAÇÕES E VARIÁVEIS ANTES DA PRÉVIA */}
        <div className="theme-card-slot rounded-2xl border p-3.5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider theme-text-primary">
                4. Observações & Variáveis
              </span>
            </div>
            <span className="text-[10px] theme-text-muted font-mono">
              (Campos vazios desaparecem do relatório)
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold theme-text-secondary">
                • Retificação de Eletrodos:
              </label>
              {manualClosing.obsRetificacaoEletrodos && (
                <button
                  type="button"
                  onClick={() => handleChange('obsRetificacaoEletrodos', '')}
                  className="text-[10px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                  title="Limpar campo para não exibir no relatório"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={manualClosing.obsRetificacaoEletrodos}
              onChange={(e) => handleChange('obsRetificacaoEletrodos', e.target.value)}
              placeholder="Horários, postos ou status da ação (Ex: Realizada nos postos P20 e P40 às 10:30 e 15:00 - Conforme)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold theme-text-secondary">
                • Observações Gerais Adicionais (Variáveis Livres):
              </label>
              {manualClosing.obsGerais && (
                <button
                  type="button"
                  onClick={() => handleChange('obsGerais', '')}
                  className="text-[10px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                  title="Limpar campo para não exibir no relatório"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={manualClosing.obsGerais}
              onChange={(e) => handleChange('obsGerais', e.target.value)}
              placeholder="Adicione qualquer variável adicional do turno, observações da liderança ou pendências..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 5. PRÉVIA EXECUTIVA DO WHATSAPP */}
      <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 theme-text-muted" />
            <span className="text-xs font-black uppercase tracking-wider theme-text-primary">
              Template Executivo WhatsApp
            </span>
          </div>
          <span className="text-[10px] text-amber-500 font-mono font-bold">100% Pronto</span>
        </div>

        <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap break-words select-all leading-relaxed max-h-72 overflow-y-auto">
          {executiveReportText}
        </pre>
      </div>

      {/* 6. BOTÕES DE EXPORTAÇÃO */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <Send className="w-4 h-4 fill-zinc-950" />
          <span>Enviar Relatório no WhatsApp</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className={`py-3 px-3 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
              copied
                ? 'bg-amber-400 text-zinc-950 border-amber-400'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
