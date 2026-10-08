import React, { useState } from 'react';
import {
  X,
  Sliders,
  Check,
  ShieldAlert,
  Clock,
  MapPin,
  Moon,
  Sun,
  Palette,
  Smartphone,
  RotateCcw,
  Target,
} from 'lucide-react';
import {
  PRODUCT_MODELS,
  ProductModel,
  SHIFT_TYPES,
  ShiftType,
  TimezoneOption,
  ThemeOption,
} from '../types/report';
import { useReportStore } from '../store/reportStore';
import { getTimezoneLabel } from '../utils/dateUtils';
import { PWAInstallModal } from './PWAInstallModal';

interface ShiftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftSettingsModal: React.FC<ShiftSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    lineName,
    setLineName,
    model,
    setModel,
    shift,
    setShift,
    timezone,
    setTimezone,
    theme,
    setTheme,
    hourlyProductionTarget,
    setHourlyProductionTarget,
    resetShiftData,
  } = useReportStore();

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md theme-surface border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider theme-text-primary">
              Configurações do Turno
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-black/10 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. MODELO DO PRODUTO EM PRODUÇÃO */}
        <div>
          <label className="block text-xs font-semibold theme-text-secondary mb-2">
            Modelo do Produto em Produção:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRODUCT_MODELS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={`py-2.5 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  model === m
                    ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-400/40 font-extrabold shadow-sm'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-750'
                }`}
              >
                <span>{m}</span>
                {model === m && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. TURNO DE TRABALHO */}
        <div>
          <label className="block text-xs font-semibold theme-text-secondary mb-2">
            Turno de Trabalho:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHIFT_TYPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShift(s)}
                className={`py-2.5 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  shift === s
                    ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-400/40 font-extrabold shadow-sm'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-750'
                }`}
              >
                <span>{s} Turno</span>
                {shift === s && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* 3. META DE PRODUÇÃO POR HORA */}
        <div>
          <label className="block text-xs font-semibold theme-text-secondary mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Meta de Produção por Hora:</span>
            </span>
            <span className="font-mono font-black text-amber-500 text-xs">
              {hourlyProductionTarget} pçs/h
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={hourlyProductionTarget}
              onChange={(e) => setHourlyProductionTarget(parseInt(e.target.value, 10) || 1)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <div className="flex items-center gap-1">
              {[80, 100, 120, 150].map((presetTarget) => (
                <button
                  key={presetTarget}
                  type="button"
                  onClick={() => setHourlyProductionTarget(presetTarget)}
                  className={`px-2 py-1.5 rounded-md font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                    hourlyProductionTarget === presetTarget
                      ? 'bg-amber-400 text-zinc-950 border-amber-400'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  {presetTarget}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[10px] theme-text-muted mt-1 block">
            Utilizada para comparar o ritmo real em cada card de horário no painel hora a hora.
          </span>
        </div>

        {/* 4. NOME DA LINHA */}
        <div>
          <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
            Identificação da Linha:
          </label>
          <input
            type="text"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* 5. SINCRONIZAÇÃO DE FUSO HORÁRIO (MANAUS AMT -04) */}
        <div>
          <label className="block text-xs font-semibold theme-text-secondary mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Fuso Horário Oficial:</span>
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'America/Manaus', label: 'AMT - Manaus (-04:00)' },
              { id: 'America/Sao_Paulo', label: 'BRT - Brasília (-03:00)' },
              { id: 'local', label: 'Dispositivo Local' },
            ].map((tz) => (
              <button
                key={tz.id}
                type="button"
                onClick={() => setTimezone(tz.id as TimezoneOption)}
                className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center justify-between border transition-all cursor-pointer ${
                  timezone === tz.id
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>{tz.label}</span>
                {timezone === tz.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* 6. TEMA VISUAL (ESCURO, CLARO, CINZA CLARO) */}
        <div>
          <label className="block text-xs font-semibold theme-text-secondary mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema Visual da Interface:</span>
            </span>
            <span className="text-[10px] theme-text-muted font-mono">
              {theme === 'dark' ? 'Escuro' : theme === 'light' ? 'Claro' : 'Cinza Claro'}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                theme === 'dark'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400">
                <Moon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">Escuro</span>
              <span className="text-[9px] text-zinc-500">Carbono</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                theme === 'light'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-amber-500">
                <Sun className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">Claro</span>
              <span className="text-[9px] text-zinc-500">Branco</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('gray')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                theme === 'gray'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-zinc-300 border border-zinc-400 flex items-center justify-center text-zinc-900">
                <Palette className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">Cinza Claro</span>
              <span className="text-[9px] text-zinc-500">Concreto</span>
            </button>
          </div>
        </div>

        {/* 7. ZONA DE ADMINISTRAÇÃO: ZERAR RELATÓRIO E APONTAMENTOS */}
        <div className="p-3.5 rounded-2xl border border-red-900/60 bg-red-950/20 space-y-2.5">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider">
              Zerar Relatório & Apontamentos
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Área protegida da supervisão. Limpa os apontamentos do hora a hora, sucata e metas do turno atual para reiniciar os registros.
          </p>

          {!isConfirmingReset ? (
            <button
              type="button"
              onClick={() => setIsConfirmingReset(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zerar Dados do Turno Atual</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-950 border border-red-500/60 space-y-2 animate-in fade-in">
              <p className="text-xs font-bold text-red-300 text-center">
                Confirmar reinicialização? Todos os apontamentos deste turno serão apagados!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetShiftData();
                    setIsConfirmingReset(false);
                    setResetSuccess(true);
                    setTimeout(() => setResetSuccess(false), 2500);
                  }}
                  className="py-2 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  Sim, Zerar Turno
                </button>
              </div>
            </div>
          )}

          {resetSuccess && (
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-center pt-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Dados do turno zerados com sucesso!</span>
            </div>
          )}
        </div>

        {/* Botão de Atalho para Baixar App no Celular */}
        <button
          type="button"
          onClick={() => setIsInstallModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-500 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Baixar App no Celular (iPhone & Android)</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow-md"
        >
          Confirmar Configurações
        </button>
      </div>

      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};

