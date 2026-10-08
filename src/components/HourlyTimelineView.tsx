import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Sliders,
  X,
  ChevronRight,
  Flame,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_HOURLY_SLOTS,
  WORKSTATIONS,
  Workstation,
  DefectCategory,
  GAPS_OPTIONS,
  DANOS_FISICOS_OPTIONS,
  FALHAS_SOLDA_OPTIONS,
  HourlyApontamentoType,
  HourlyRecord,
} from '../types/report';
import { useReportStore } from '../store/reportStore';
import { getFormattedTime } from '../utils/dateUtils';
import { QuickPresetsModal } from './QuickPresetsModal';
import { ShiftTimelineTrack } from './ShiftTimelineTrack';

interface ModalState {
  isOpen: boolean;
  isEditing: boolean;
  editingId?: string;
  hourSlot: string;
}

export const HourlyTimelineView: React.FC = () => {
  const {
    hourlyRecords,
    addHourlyRecord,
    editHourlyRecord,
    removeHourlyRecord,
    quickPresets,
    timezone,
    model,
    hourlyProduction,
    hourlyProductionTarget,
    setHourlyProduction,
  } = useReportStore();

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    isEditing: false,
    hourSlot: '07:00',
  });

  const [selectedTrackSlot, setSelectedTrackSlot] = useState<string | undefined>();
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // Campos do formulário
  const [activeFormType, setActiveFormType] = useState<HourlyApontamentoType>('defeito');
  const [selectedStation, setSelectedStation] = useState<Workstation | 'Geral'>('P40');
  const [selectedCategory, setSelectedCategory] = useState<DefectCategory>('Gaps');
  const [selectedDefect, setSelectedDefect] = useState<string>(GAPS_OPTIONS[0]);
  const [customText, setCustomText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isScrap, setIsScrap] = useState<boolean>(false);
  const [registeredAt, setRegisteredAt] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentTime = getFormattedTime(timezone, new Date());

  const handleOpenNewModal = (slot: string) => {
    const nowTime = getFormattedTime(timezone, new Date());
    setRegisteredAt(nowTime);
    setActiveFormType('defeito');
    setSelectedStation('P40');
    setSelectedCategory('Gaps');
    setSelectedDefect(GAPS_OPTIONS[0]);
    setCustomText('');
    setQuantity(1);
    setIsScrap(false);
    setModalState({
      isOpen: true,
      isEditing: false,
      hourSlot: slot,
    });
  };

  const handleOpenEditModal = (record: HourlyRecord) => {
    setRegisteredAt(record.registeredAtTime);
    setActiveFormType(record.type);
    setSelectedStation(record.workstation || 'Geral');
    setCustomText(record.title);
    setQuantity(record.quantity || 1);
    setIsScrap(!!record.isScrap);
    if (record.category) setSelectedCategory(record.category);
    if (record.defectName) setSelectedDefect(record.defectName);

    setModalState({
      isOpen: true,
      isEditing: true,
      editingId: record.id,
      hourSlot: record.hourSlot,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      isEditing: false,
      hourSlot: '07:00',
    });
    setCustomText('');
    setQuantity(1);
    setIsScrap(false);
  };

  const handleQuickPresetClick = (slot: string, preset: typeof quickPresets[0]) => {
    const nowTime = getFormattedTime(timezone, new Date());
    addHourlyRecord({
      hourSlot: slot,
      type: preset.type,
      title: preset.defaultTitle,
      workstation: preset.workstation || 'Geral',
      registeredAtTime: nowTime,
      countsAsImpact: preset.countsAsImpact,
    });

    setFeedback(`Apontamento "${preset.label}" registrado às ${slot}!`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSaveApontamento = (e: React.FormEvent) => {
    e.preventDefault();

    const launchTime = registeredAt.trim() || getFormattedTime(timezone, new Date());
    let title = '';
    let category: DefectCategory | undefined = undefined;
    let defectName: string | undefined = undefined;
    let countsAsImpact = false;

    if (activeFormType === 'defeito') {
      const defName =
        selectedCategory === 'Outro'
          ? customText.trim() || 'Defeito Não Especificado'
          : selectedDefect;

      title = defName;
      category = selectedCategory;
      defectName = defName;
      countsAsImpact = true;
    } else if (activeFormType === 'impacto') {
      title = customText.trim() || 'Parada de Produção';
      countsAsImpact = true;
    } else if (activeFormType === 'dds') {
      title = customText.trim() || 'Dialogo diário de Segurança (10Min)';
      countsAsImpact = false;
    } else if (activeFormType === 'setup') {
      title = customText.trim() || 'Setup de Linha';
      countsAsImpact = true;
    } else {
      title = 'Produção sem Falhas';
      countsAsImpact = false;
    }

    if (modalState.isEditing && modalState.editingId) {
      editHourlyRecord(modalState.editingId, {
        hourSlot: modalState.hourSlot,
        type: activeFormType,
        title,
        workstation: selectedStation,
        registeredAtTime: launchTime,
        category,
        defectName,
        isScrap,
        quantity,
        countsAsImpact,
      });
      setFeedback(`Apontamento das ${modalState.hourSlot} atualizado!`);
    } else {
      addHourlyRecord({
        hourSlot: modalState.hourSlot,
        type: activeFormType,
        title,
        workstation: selectedStation,
        registeredAtTime: launchTime,
        category,
        defectName,
        isScrap,
        quantity,
        countsAsImpact,
      });
      setFeedback(`Apontamento das ${modalState.hourSlot} registrado!`);
    }

    setTimeout(() => setFeedback(null), 2500);
    handleCloseModal();
  };

  const allSlots = Array.from(
    new Set([
      ...DEFAULT_HOURLY_SLOTS,
      ...hourlyRecords.map((r) => r.hourSlot),
    ])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-3 pb-24">
      {/* TIMELINE TRACK HORIZONTAL COM PINS E ZEBRADO (ESTILO DA FOTO) */}
      <div className="rounded-2xl p-2.5 bg-black/5 dark:bg-black/20 border border-black/10 dark:border-zinc-800">
        <ShiftTimelineTrack
          selectedSlot={selectedTrackSlot}
          onSelectSlot={(slot) => setSelectedTrackSlot(slot === selectedTrackSlot ? undefined : slot)}
        />
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{feedback}</span>
        </div>
      )}

      {/* Barra de Título com Botão de Customizar 1-Toque */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {/* Badge Escuro de Alto Contraste para HOURLY LOG SHEET */}
          <div className="kpi-dark-badge flex items-center gap-2 px-3 py-1.5 rounded-xl text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="font-mono text-xs font-black uppercase tracking-wider text-white metric-count-outline">
              HOURLY LOG SHEET
            </span>
          </div>
          {selectedTrackSlot && (
            <span className="text-[10px] bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded shadow-2xs">
              Filtro: {selectedTrackSlot}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsPresetsModalOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-zinc-100 bg-zinc-950 hover:bg-zinc-900 px-2.5 py-1 rounded-lg transition-colors border border-zinc-800 shadow-sm cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>Config 1-Toque</span>
        </button>
      </div>

      {/* LISTAGEM DOS CARDS HORA A HORA (IDÊNTICA À FOTO DE REFERÊNCIA) */}
      <div className="space-y-2.5">
        {allSlots
          .filter((slot) => !selectedTrackSlot || slot === selectedTrackSlot)
          .map((slot, index) => {
            const recordsForSlot = hourlyRecords.filter((r) => r.hourSlot === slot);
            const hasRecords = recordsForSlot.length > 0;

            const currentHourPrefix = currentTime.split(':')[0];
            const slotHourPrefix = slot.split(':')[0];
            const isCurrentHour = currentHourPrefix === slotHourPrefix;

            // Formatação do intervalo da hora: "07:00 - 08:00"
            const nextHourNum = (parseInt(slot.split(':')[0], 10) + 1) % 24;
            const nextHourFormatted = `${String(nextHourNum).padStart(2, '0')}:${slot.split(':')[1]}`;
            const timeRangeLabel = `${slot} – ${nextHourFormatted}`;

            return (
              <div
                key={slot}
                className={`rounded-2xl transition-all p-3.5 border-2 ${
                  isCurrentHour
                    ? 'border-amber-400 bg-amber-400/10 shadow-md ring-2 ring-amber-400/20'
                    : 'theme-card-slot border-zinc-950/80 dark:border-zinc-700/80 hover:border-zinc-950'
                }`}
              >
                {/* LINHA 1: HORÁRIO | STATUS PILL (OPTIMAL / INSPECT / MODERATE) | METRICAS | CHEVRON */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm font-black tracking-tight theme-text-primary shrink-0">
                      {timeRangeLabel}
                    </span>

                    {/* STATUS PILL (CORES E CONTRASTES IDÊNTICOS À FOTO) */}
                    {hasRecords ? (
                      recordsForSlot.map((rec) => {
                        let pillClass = 'bg-black text-white';
                        let pillText = 'OPTIMAL';

                        if (rec.type === 'normal') {
                          pillClass = 'bg-black text-white dark:bg-zinc-950 dark:border dark:border-zinc-700';
                          pillText = 'OPTIMAL';
                        } else if (rec.type === 'defeito') {
                          pillClass = 'bg-amber-400 text-zinc-950';
                          pillText = rec.isScrap ? 'SCRAP' : 'INSPECT';
                        } else if (rec.type === 'impacto') {
                          pillClass = 'bg-amber-400 text-zinc-950';
                          pillText = 'MODERATE';
                        } else {
                          pillClass = 'bg-zinc-800 text-amber-300';
                          pillText = 'SETUP';
                        }

                        return (
                          <span
                            key={rec.id}
                            className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs shrink-0 ${pillClass}`}
                          >
                            {pillText}
                          </span>
                        );
                      })
                    ) : (
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-300/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 shrink-0">
                        PENDING
                      </span>
                    )}
                  </div>

                  {/* Informações de Posto / Volume + Chevron Amarelo */}
                  <div
                    onClick={() => handleOpenNewModal(slot)}
                    className="flex items-center gap-1.5 cursor-pointer shrink-0 group"
                  >
                    <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 transition-colors">
                      {hasRecords && recordsForSlot[0].workstation && recordsForSlot[0].workstation !== 'Geral'
                        ? `${recordsForSlot[0].workstation} • ${model}`
                        : `${model} • Linha`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-500 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* LINHA 2: CAMPO DE APENAS NÚMEROS PARA PRODUÇÃO DA HORA & COMPARATIVO COM A META */}
                <div className="mt-2.5 p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-zinc-750 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      PRODUZIDO:
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={
                          hourlyProduction[slot] !== undefined && hourlyProduction[slot] !== null
                            ? hourlyProduction[slot]
                            : ''
                        }
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const parsed = raw === '' ? 0 : parseInt(raw, 10);
                          setHourlyProduction(slot, isNaN(parsed) ? 0 : parsed);
                        }}
                        className="w-16 h-7.5 px-2 text-center font-mono font-black text-xs bg-zinc-950 text-amber-400 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
                      />
                      <span className="text-[10px] font-mono font-bold text-zinc-500">pçs</span>
                    </div>
                  </div>

                  {/* Comparativo com a Meta Configurada */}
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-zinc-500">Meta: {hourlyProductionTarget}</span>
                    {(hourlyProduction[slot] || 0) > 0 ? (
                      (hourlyProduction[slot] || 0) >= hourlyProductionTarget ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30">
                          ✓ {(hourlyProduction[slot] || 0) - hourlyProductionTarget > 0 ? `+${(hourlyProduction[slot] || 0) - hourlyProductionTarget}` : 'OK'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                          ▼ -{hourlyProductionTarget - (hourlyProduction[slot] || 0)}
                        </span>
                      )
                    ) : (
                      <span className="text-zinc-500 italic">--</span>
                    )}
                  </div>
                </div>

                {/* LINHA 3: BLOCOS VISUAIS MODULARES DO APONTAMENTO */}
                {hasRecords ? (
                  <div className="mt-2.5 space-y-2">
                    {recordsForSlot.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2 rounded-xl bg-black/5 dark:bg-black/35 border border-black/10 dark:border-zinc-700/60 flex items-center justify-between gap-2"
                      >
                        {/* Blocos 1, 2 e 3 formatados visualmente */}
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {/* Bloco 1: Evento / Defeito */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 font-mono text-[11px] font-bold shadow-2xs">
                            <span className="text-amber-400">■</span>
                            <span className="truncate max-w-[170px]">{rec.title}</span>
                            {rec.quantity && rec.quantity > 1 && (
                              <span className="text-[10px] text-amber-300 font-mono">({rec.quantity}x)</span>
                            )}
                          </span>

                          {/* Bloco 2: Posto de Trabalho */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-mono text-[11px] font-black shadow-2xs">
                            <span>{rec.workstation && rec.workstation !== 'Geral' ? rec.workstation : 'Geral'}</span>
                          </span>

                          {/* Bloco 3: Horário Registrado */}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-300 font-mono text-[10px] font-medium border border-black/10 dark:border-zinc-700/50">
                            <Clock className="w-2.5 h-2.5 text-zinc-500" />
                            <span>{rec.registeredAtTime}</span>
                          </span>
                        </div>

                        {/* Botões de Ação Inline (Editar e Excluir) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1 rounded-md text-zinc-600 hover:text-amber-500 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Editar apontamento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHourlyRecord(rec.id)}
                            className="p-1 rounded-md text-zinc-600 hover:text-red-500 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Remover apontamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 pt-1 border-t border-black/10 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                      Aguardando apontamento de produção...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenNewModal(slot)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Apontar</span>
                    </button>
                  </div>
                )}

                {/* BOTÕES DE 1-TOQUE RÁPIDOS NA PARTE INFERIOR DO CARD */}
                <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-zinc-800 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono uppercase font-bold text-zinc-500 dark:text-zinc-400 mr-0.5">
                    1-Toque:
                  </span>
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleQuickPresetClick(slot, preset)}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-100 hover:bg-amber-400 hover:text-zinc-950 active:scale-95 active:translate-y-0.5 transition-all border border-zinc-700/80 shadow-xs cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE APONTAMENTO */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-1 bg-amber-400 text-zinc-950 rounded">
                  {modalState.hourSlot}
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                  {modalState.isEditing ? 'Editar Registro' : 'Novo Apontamento'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas de Tipo */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveFormType('defeito')}
                className={`py-2 px-1 text-[11px] font-bold rounded transition-all ${
                  activeFormType === 'defeito' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Defeito
              </button>
              <button
                type="button"
                onClick={() => setActiveFormType('impacto')}
                className={`py-2 px-1 text-[11px] font-bold rounded transition-all ${
                  activeFormType === 'impacto' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Parada
              </button>
              <button
                type="button"
                onClick={() => setActiveFormType('normal')}
                className={`py-2 px-1 text-[11px] font-bold rounded transition-all ${
                  activeFormType === 'normal' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Optimal
              </button>
              <button
                type="button"
                onClick={() => setActiveFormType('dds')}
                className={`py-2 px-1 text-[11px] font-bold rounded transition-all ${
                  activeFormType === 'dds' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                DDS/Setup
              </button>
            </div>

            <form onSubmit={handleSaveApontamento} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Horário do Lançamento:
                </label>
                <input
                  type="text"
                  value={registeredAt}
                  onChange={(e) => setRegisteredAt(e.target.value)}
                  placeholder="HH:mm"
                  className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  Posto de Trabalho:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStation('Geral')}
                    className={`py-2 rounded-lg font-mono font-bold text-xs transition-all ${
                      selectedStation === 'Geral'
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                    }`}
                  >
                    Geral
                  </button>
                  {WORKSTATIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className={`py-2 rounded-lg font-mono font-bold text-xs transition-all ${
                        selectedStation === st
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {activeFormType === 'defeito' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                      Categoria:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Gaps', 'Falhas de Solda', 'Danos Físicos', 'Outro'] as DefectCategory[]).map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              if (cat === 'Gaps') setSelectedDefect(GAPS_OPTIONS[0]);
                              if (cat === 'Falhas de Solda') setSelectedDefect(FALHAS_SOLDA_OPTIONS[0]);
                              if (cat === 'Danos Físicos') setSelectedDefect(DANOS_FISICOS_OPTIONS[0]);
                            }}
                            className={`p-2 rounded-lg text-left text-xs border ${
                              selectedCategory === cat
                                ? 'border-amber-400 bg-zinc-800 text-amber-400 font-bold'
                                : 'border-zinc-800 bg-zinc-800/40 text-zinc-300'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                      Defeito / Localização:
                    </label>

                    {selectedCategory === 'Gaps' && (
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {GAPS_OPTIONS.map((gap) => (
                          <button
                            key={gap}
                            type="button"
                            onClick={() => setSelectedDefect(gap)}
                            className={`p-2 rounded-lg text-xs text-left border ${
                              selectedDefect === gap
                                ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                                : 'border-zinc-800 bg-zinc-800/60 text-zinc-300'
                            }`}
                          >
                            {gap}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'Falhas de Solda' && (
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {FALHAS_SOLDA_OPTIONS.map((falha) => (
                          <button
                            key={falha}
                            type="button"
                            onClick={() => setSelectedDefect(`Falha no ${falha}`)}
                            className={`p-2 rounded-lg text-xs text-left border ${
                              selectedDefect === `Falha no ${falha}`
                                ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                                : 'border-zinc-800 bg-zinc-800/60 text-zinc-300'
                            }`}
                          >
                            Solda: {falha}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'Danos Físicos' && (
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {DANOS_FISICOS_OPTIONS.map((dano) => (
                          <button
                            key={dano}
                            type="button"
                            onClick={() => setSelectedDefect(dano)}
                            className={`p-2 rounded-lg text-xs text-left border ${
                              selectedDefect === dano
                                ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                                : 'border-zinc-800 bg-zinc-800/60 text-zinc-300'
                            }`}
                          >
                            {dano}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'Outro' && (
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Ex: Rebarba no Corpo, pino guia..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        required
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-300 font-medium">Qtd:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-7 h-7 bg-zinc-800 text-zinc-200 rounded font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-sm text-zinc-100">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-7 h-7 bg-zinc-800 text-zinc-200 rounded font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isScrap}
                        onChange={(e) => setIsScrap(e.target.checked)}
                        className="w-4 h-4 rounded accent-red-500"
                      />
                      <span className="text-xs font-semibold text-red-400">
                        Classificar como Scrap
                      </span>
                    </label>
                  </div>
                </>
              )}

              {activeFormType === 'impacto' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Descrição da Parada / Ocorrência:
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Ex: Parada por falha de solda"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              )}

              {activeFormType === 'normal' && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <p className="text-xs font-bold text-emerald-300">
                    Produção Conforme (Optimal)
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Fluxo padrão sem registros de paradas.
                  </p>
                </div>
              )}

              {activeFormType === 'dds' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Evento Operacional:
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Ex: Dialogo diário de Segurança (10Min) ou Setup"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs py-3 rounded-xl uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer"
              >
                {modalState.isEditing ? 'Atualizar Registro' : 'Salvar no Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      <QuickPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
      />
    </div>
  );
};
