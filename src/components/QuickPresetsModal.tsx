import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import {
  HourlyApontamentoType,
  QuickActionPreset,
  WORKSTATIONS,
  Workstation,
} from '../types/report';

interface QuickPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPresetsModal: React.FC<QuickPresetsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    quickPresets,
    addQuickPreset,
    removeQuickPreset,
    resetQuickPresetsToDefault,
  } = useReportStore();

  const [newLabel, setNewLabel] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<HourlyApontamentoType>('impacto');
  const [newStation, setNewStation] = useState<Workstation | 'Geral'>('Geral');
  const [newColor, setNewColor] = useState<'emerald' | 'amber' | 'sky' | 'red' | 'zinc'>('amber');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newTitle.trim()) return;

    addQuickPreset({
      label: newLabel.trim(),
      defaultTitle: newTitle.trim(),
      type: newType,
      workstation: newStation,
      color: newColor,
      countsAsImpact: newType === 'impacto' || newType === 'setup' || newType === 'defeito',
    });

    setNewLabel('');
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Personalizar Botões de 1-Toque
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

        <p className="text-xs text-zinc-400">
          Defina quais botões rápidos aparecem ao lado de cada horário no painel hora a hora.
        </p>

        {/* Lista de Botões Atuais */}
        <div className="space-y-2">
          {quickPresets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    preset.color === 'emerald'
                      ? 'bg-emerald-400'
                      : preset.color === 'sky'
                      ? 'bg-sky-400'
                      : preset.color === 'red'
                      ? 'bg-red-400'
                      : preset.color === 'amber'
                      ? 'bg-amber-400'
                      : 'bg-zinc-400'
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-200">
                      {preset.label}
                    </span>
                    {preset.workstation && preset.workstation !== 'Geral' && (
                      <span className="text-[10px] font-mono font-bold px-1 py-0.2 rounded bg-zinc-800 text-amber-400">
                        {preset.workstation}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {preset.defaultTitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeQuickPreset(preset.id)}
                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                title="Remover botão rápido"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Formulário para Adicionar Novo Botão */}
        {isAdding ? (
          <form
            onSubmit={handleCreatePreset}
            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Novo Botão de 1-Toque
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Cancelar
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Texto do Botão (Curto):
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ex: Troca Eletrodo ou Sem Ar"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Descrição Gravada:
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Parada para troca de eletrodo de solda"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Tipo:
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as HourlyApontamentoType)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="impacto">Parada / Impacto</option>
                  <option value="setup">Setup de Linha</option>
                  <option value="normal">Normal (Sem Falhas)</option>
                  <option value="dds">DDS / Diálogo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Posto:
                </label>
                <select
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value as Workstation | 'Geral')}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Geral">Geral</option>
                  {WORKSTATIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Cor de Destaque:
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'amber', class: 'bg-amber-400' },
                  { id: 'emerald', class: 'bg-emerald-400' },
                  { id: 'sky', class: 'bg-sky-400' },
                  { id: 'red', class: 'bg-red-400' },
                  { id: 'zinc', class: 'bg-zinc-400' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewColor(c.id as any)}
                    className={`w-6 h-6 rounded-full ${c.class} flex items-center justify-center transition-all ${
                      newColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70'
                    }`}
                  >
                    {newColor === c.id && <Check className="w-3.5 h-3.5 text-zinc-950" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider cursor-pointer"
            >
              Salvar Botão Rápido
            </button>
          </form>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex-1 py-2.5 rounded-lg border border-dashed border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Botão de 1-Toque</span>
            </button>

            <button
              type="button"
              onClick={resetQuickPresetsToDefault}
              className="px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Restaurar botões padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer"
        >
          Concluir
        </button>
      </div>
    </div>
  );
};
