import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Maximize2,
  Plus,
  Minus,
  Sparkles,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import {
  WORKSTATIONS,
  Workstation,
  DefectCategory,
  GAPS_OPTIONS,
  DANOS_FISICOS_OPTIONS,
  FALHAS_SOLDA_OPTIONS,
} from '../types/report';
import { useReportStore } from '../store/reportStore';

export const QuickEntryDefects: React.FC = () => {
  const { addDefect, defects, removeDefect, getDefectCounts } = useReportStore();

  const [selectedStation, setSelectedStation] = useState<Workstation>('P10');
  const [selectedCategory, setSelectedCategory] = useState<DefectCategory>('Falhas de Solda');
  const [selectedDefect, setSelectedDefect] = useState<string>(FALHAS_SOLDA_OPTIONS[0]);
  const [customDefectText, setCustomDefectText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Manipulação da mudança de categoria de scrap
  const handleSelectCategory = (cat: DefectCategory) => {
    setSelectedCategory(cat);
    if (cat === 'Falhas de Solda') {
      setSelectedDefect(FALHAS_SOLDA_OPTIONS[0]);
    } else if (cat === 'Danos Físicos') {
      setSelectedDefect(DANOS_FISICOS_OPTIONS[0]);
    } else if (cat === 'Gaps') {
      setSelectedDefect(GAPS_OPTIONS[0]);
    } else {
      setSelectedDefect('Outro');
    }
  };

  const handleSelectDefectItem = (name: string) => {
    setSelectedDefect(name);
  };

  const handleRegisterDefect = (e: React.FormEvent) => {
    e.preventDefault();

    const defectNameFinal =
      selectedCategory === 'Outro'
        ? customDefectText.trim() || 'Sucata Não Especificada'
        : selectedDefect;

    // Todo apontamento nesta aba é obrigatoriamente Scrap
    addDefect({
      workstation: selectedStation,
      category: selectedCategory,
      defectName: defectNameFinal,
      isScrap: true,
      quantity,
    });

    // Feedback visual
    setFeedbackMessage(
      `+${quantity} Sucata (${defectNameFinal}) registrada em ${selectedStation}`
    );
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2800);

    // Reseta quantidade para o próximo registro
    setQuantity(1);
    if (selectedCategory === 'Outro') {
      setCustomDefectText('');
    }
  };

  const counts = getDefectCounts();

  return (
    <div className="space-y-3.5 pb-20">
      {/* Banner Exclusivo da Aba de Scrap */}
      <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black shadow-xs">
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-red-400 block">
              REGISTRO DE SUCATA (SCRAP)
            </span>
            <span className="text-[10px] theme-text-muted">
              Todos os apontamentos aqui são classificados automaticamente como refugo/sucata
            </span>
          </div>
        </div>
        <span className="font-mono text-xs font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
          100% SCRAP
        </span>
      </div>

      {/* Cards de Resumo de Sucata no topo da tela */}
      <div className="grid grid-cols-4 gap-2">
        <div className="theme-kpi-card border border-red-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
            Total Scrap
          </span>
          <span className="text-xl font-mono font-black text-red-500">
            {counts.scrapTotal}
          </span>
        </div>

        <div className="theme-kpi-card border rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
            Solda
          </span>
          <span className="text-xl font-mono font-black text-amber-500">
            {counts.falhaDeSolda}
          </span>
        </div>

        <div className="theme-kpi-card border rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] theme-text-muted font-bold uppercase tracking-wider">
            Amassado
          </span>
          <span className="text-xl font-mono font-black theme-text-primary">
            {counts.amassado}
          </span>
        </div>

        <div className="theme-kpi-card border rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] theme-text-muted font-bold uppercase tracking-wider">
            Empenado
          </span>
          <span className="text-xl font-mono font-black theme-text-secondary">
            {counts.empenado}
          </span>
        </div>
      </div>

      {/* Toast / Alerta de feedback imediato */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-semibold animate-in fade-in slide-in-from-top duration-200 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{feedbackMessage}</span>
        </div>
      )}

      {/* Formulário de Registro Rápido */}
      <form onSubmit={handleRegisterDefect} className="space-y-3">
        {/* 1. SELEÇÃO DO POSTO DE TRABALHO (P10 - P90) */}
        <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Posto de Trabalho
            </span>
            <span className="text-[11px] font-mono font-black text-zinc-950 bg-amber-400 px-2 py-0.5 rounded shadow-2xs">
              Posto: {selectedStation}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {WORKSTATIONS.map((station) => {
              const isSelected = selectedStation === station;
              // Contagem de defeitos neste posto
              const stationCount = defects.filter((d) => d.workstation === station).reduce((a, b) => a + b.quantity, 0);

              return (
                <button
                  key={station}
                  type="button"
                  onClick={() => setSelectedStation(station)}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl font-mono font-black text-sm transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-700/80'
                  }`}
                >
                  <span className="text-base">{station}</span>
                  {stationCount > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-zinc-950 text-amber-400'
                          : 'bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {stationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CATEGORIA DO DEFEITO */}
        <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            2. Categoria do Defeito
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategory('Gaps')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedCategory === 'Gaps'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-500 font-black ring-1 ring-amber-400/40'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
              }`}
            >
              <Maximize2 className="w-4 h-4 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Gaps</span>
                <span className="text-[10px] opacity-75 font-normal">Folgas dimensionais</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('Falhas de Solda')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedCategory === 'Falhas de Solda'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-500 font-black ring-1 ring-amber-400/40'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Falhas de Solda</span>
                <span className="text-[10px] opacity-75 font-normal">Pontos e cordões</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('Danos Físicos')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedCategory === 'Danos Físicos'
                  ? 'border-red-400 bg-red-400/10 text-red-500 font-black ring-1 ring-red-400/40'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Danos Físicos</span>
                <span className="text-[10px] opacity-75 font-normal">Amassado / Empenado</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('Outro')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedCategory === 'Outro'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-500 font-black ring-1 ring-amber-400/40'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Outro</span>
                <span className="text-[10px] opacity-75 font-normal">Texto livre / Anomalia</span>
              </div>
            </button>
          </div>
        </div>

        {/* 3. SELEÇÃO ESPECÍFICA DO DEFEITO */}
        <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            3. Tipo de Defeito / Localização
          </span>

          {selectedCategory === 'Gaps' && (
            <div className="grid grid-cols-2 gap-2">
              {GAPS_OPTIONS.map((gap) => (
                <button
                  key={gap}
                  type="button"
                  onClick={() => handleSelectDefectItem(gap)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                    selectedDefect === gap
                      ? 'border-amber-400 bg-amber-400 text-zinc-950 font-black shadow-xs ring-1 ring-amber-400'
                      : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
                  }`}
                >
                  {gap}
                </button>
              ))}
            </div>
          )}

          {selectedCategory === 'Falhas de Solda' && (
            <div className="space-y-2">
              <p className="text-[11px] theme-text-muted mb-1 font-semibold">
                Local da Falha de Solda:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FALHAS_SOLDA_OPTIONS.map((falha) => (
                  <button
                    key={falha}
                    type="button"
                    onClick={() => handleSelectDefectItem(falha)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                      selectedDefect === falha
                        ? 'border-amber-400 bg-amber-400 text-zinc-950 font-black shadow-xs ring-1 ring-amber-400'
                        : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
                    }`}
                  >
                    {falha}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCategory === 'Danos Físicos' && (
            <div className="grid grid-cols-2 gap-2">
              {DANOS_FISICOS_OPTIONS.map((dano) => (
                <button
                  key={dano}
                  type="button"
                  onClick={() => handleSelectDefectItem(dano)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                    selectedDefect === dano
                      ? 'border-red-500 bg-red-500 text-white font-black shadow-xs ring-1 ring-red-500'
                      : 'bg-zinc-900 text-zinc-200 border-zinc-700/70 hover:bg-zinc-800'
                  }`}
                >
                  {dano}
                </button>
              ))}
            </div>
          )}

          {selectedCategory === 'Outro' && (
            <div>
              <label className="block text-[11px] theme-text-muted mb-1.5 font-semibold">
                Descreva a anomalia ou defeito:
              </label>
              <input
                type="text"
                value={customDefectText}
                onChange={(e) => setCustomDefectText(e.target.value)}
                placeholder="Ex: Rebarba excessiva, furo obstruído..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
              />
            </div>
          )}
        </div>

        {/* 4. QUANTIDADE E CLASSIFICAÇÃO DE SUCATA */}
        <div className="theme-card-slot rounded-2xl border p-3.5 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider theme-text-primary">
              Quantidade de Peças
            </span>

            {/* Stepper numérico ergonômico */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 flex items-center justify-center font-bold active:scale-95 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 h-9 bg-zinc-950 border border-zinc-700 rounded-xl flex items-center justify-center font-mono font-black text-base text-zinc-100">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 flex items-center justify-center font-bold active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 5)}
                className="px-2.5 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-mono font-black text-amber-400 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>

          {/* Indicador de Descarte Definitivo */}
          <div className="flex items-center justify-between pt-2.5 border-t border-black/10 dark:border-zinc-800">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-red-400">
                Classificação Automática: Scrap (Sucata)
              </span>
              <span className="text-[10px] theme-text-muted">
                Lançamento direto para o descarte definitivo da linha
              </span>
            </div>
            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              DESCARTE
            </span>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL DE APONTAMENTO DE SUCATA */}
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <Trash2 className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Lançar Sucata ({quantity}x em {selectedStation})</span>
        </button>
      </form>

      {/* LISTAGEM DOS ÚLTIMOS APONTAMENTOS DO TURNO */}
      <div className="theme-card-slot rounded-2xl border p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider theme-text-primary">
            Apontamentos Registrados ({defects.length})
          </span>
          <span className="text-[10px] theme-text-muted">Mais recentes primeiro</span>
        </div>

        {defects.length === 0 ? (
          <div className="py-6 text-center text-xs theme-text-muted italic">
            Nenhum defeito registrado no turno atual.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {defects.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-zinc-950 shrink-0 shadow-2xs">
                    {d.workstation}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold theme-text-primary truncate">
                        {d.defectName}
                      </span>
                      {d.isScrap && (
                        <span className="text-[9px] font-black px-1 py-0.2 rounded bg-red-500 text-white shrink-0">
                          SCRAP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] theme-text-muted">
                      {d.category} • {d.timeFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-100 shadow-2xs">
                    {d.quantity}x
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDefect(d.id)}
                    title="Remover apontamento"
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
