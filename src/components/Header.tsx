import React, { useEffect, useState } from 'react';
import {
  Menu,
  Bell,
  Share2,
  Download,
  Smartphone,
  ChevronDown,
  Moon,
  Sun,
  Palette,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Send,
  Layers,
} from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import {
  getFormattedDate,
  getFormattedFullTime,
  getTimezoneLabel,
} from '../utils/dateUtils';
import { TimezoneOption, ThemeOption } from '../types/report';
import { PWAInstallModal } from './PWAInstallModal';
import { ModeratorNotificationsModal } from './ModeratorNotificationsModal';
import { WhirlpoolLogo } from './WhirlpoolLogo';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNavigateToFechamento?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenHistory,
  onNavigateToFechamento,
}) => {
  const {
    lineName,
    model,
    shift,
    timezone,
    setTimezone,
    theme,
    setTheme,
    checkAndPerformDayRollover,
    getDefectCounts,
    manualClosing,
    hourlyRecords,
    impacts,
    moderatorNotices,
    getWhatsAppShareUrl,
  } = useReportStore();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const unreadNoticesCount = moderatorNotices.filter((n) => !n.isRead).length;
  const counts = getDefectCounts();

  useEffect(() => {
    const update = () => {
      checkAndPerformDayRollover();
      const now = new Date();
      setCurrentTime(getFormattedFullTime(timezone, now));
      setCurrentDate(getFormattedDate(timezone, now));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezone, checkAndPerformDayRollover]);

  // Contagem de alertas e paradas registradas
  const totalAlerts = counts.scrapTotal + counts.falhaDeSolda + impacts.length;

  // Cálculo de aderência/eficiência da produção
  const numPlano = parseFloat(manualClosing.planoAcum) || 0;
  const numReal = parseFloat(manualClosing.realAcum) || parseFloat(manualClosing.totalProduzido) || 0;
  const efficiencyPct = numPlano > 0 ? ((numReal / numPlano) * 100).toFixed(1) : '94.8';

  const totalProduzidoStr = manualClosing.totalProduzido || '1,150';

  const handleQuickWhatsApp = () => {
    window.location.href = getWhatsAppShareUrl();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full theme-app-bg transition-colors border-b theme-border-subtle/40 shadow-xs">
        {/* BARRA SUPERIOR: MENU | LOGO CORPORATIVO COM CHEVRON AMARELO | NOTIFICAÇÕES */}
        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Botão de Menu (Abre ajustes / fuso / histórico) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-inherit hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Menu Principal"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Logo Industrial Whirlpool e Identificação da Linha */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-xs shadow-xs transform rotate-2 shrink-0">
              <span className="transform -rotate-2 text-[11px] font-black">⚡</span>
            </div>
            <div className="flex flex-col text-left leading-none">
              {/* Whirlpool Logo Oficial da Imagem posicionado acima de 'Linha de Solda' */}
              <div className="flex items-center mb-1">
                <WhirlpoolLogo
                  className="h-5 sm:h-5.5 w-auto"
                  textColor={theme === 'dark' ? '#f4f5f8' : '#090a0f'}
                  swirlColor="#f59e0b"
                />
              </div>
              <span className="font-mono font-black tracking-tight text-xs uppercase theme-text-primary leading-tight">
                {lineName}
              </span>
              <span className="font-mono text-[8.5px] font-bold tracking-widest uppercase text-amber-500 mt-0.5">
                INDUSTRIAL • {model}
              </span>
            </div>
          </div>

          {/* Notificações e Troca de Tema */}
          <div className="flex items-center gap-1.5">
            {/* Seletor 3-Temas sutil */}
            <div className="flex items-center p-0.5 rounded-lg bg-black/10 dark:bg-zinc-800/80 border border-black/10 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Tema Escuro"
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <Moon className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                title="Tema Claro"
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  theme === 'light' ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('gray')}
                title="Tema Cinza Concreto"
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  theme === 'gray' ? 'bg-amber-400 text-zinc-950 font-bold shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Palette className="w-3 h-3" />
              </button>
            </div>

            {/* Ícone de Notificações / Avisos do Moderador */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-1.5 rounded-lg text-inherit hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Avisos do Moderador e Notificações"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadNoticesCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-zinc-950 font-mono font-black text-[9px] flex items-center justify-center leading-none ring-2 ring-zinc-950 shadow-xs animate-pulse">
                  {unreadNoticesCount}
                </span>
              ) : (
                moderatorNotices.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
                )
              )}
            </button>
          </div>
        </div>

        {/* CARD PRETO DE BANNER DO TURNO (SHIFT B LOG STYLE) */}
        <div className="px-3 pb-2.5">
          <div className="rounded-2xl theme-banner p-3.5 flex items-center justify-between shadow-md border border-zinc-800">
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black tracking-tight text-white uppercase">
                  {shift} TURNO Log
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
                <span>{currentDate || '07 OUT, 2026'}</span>
                <span>•</span>
                <span>07:00 – 17:20</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{currentTime || '17:20'}</span>
              </div>
            </div>

            {/* Botões do Banner: Exportar e Baixar App */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleQuickWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Exportar Relatório para WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInstallOpen(true)}
                className="p-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition-colors"
                title="Instalar App no Celular"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* LINHA DE 3 CARDS DE KPI (EFFICIENCY | VOLUME | ALERTS) COM BACKGROUND ESCURO DE ALTO CONTRASTE */}
        <div className="px-3 pb-2 grid grid-cols-3 gap-2">
          {/* Card 1: EFICIÊNCIA */}
          <div className="kpi-dark-card p-2.5 rounded-xl text-zinc-100 flex flex-col justify-between shadow-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              EFFICIENCY
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-mono font-black text-white metric-count-outline">
                {efficiencyPct}%
              </span>
              <span className="text-xs font-bold text-amber-400">↑</span>
            </div>
          </div>

          {/* Card 2: VOLUME / PRODUÇÃO COM BARRA AMARELA */}
          <div className="kpi-dark-card p-2.5 rounded-xl text-zinc-100 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                VOLUME
              </span>
              <span className="text-[9px] font-mono text-zinc-400 font-bold">
                {model}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-base font-mono font-black text-white metric-count-outline">
                {totalProduzidoStr}
              </span>
              {/* Barra de progresso amarela idêntica à foto */}
              <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, (parseInt(totalProduzidoStr, 10) || 1200) / 15))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: ALERTS / AVISOS COM PÍLULA AMARELA */}
          <div className="kpi-dark-card p-2.5 rounded-xl text-zinc-100 flex flex-col justify-between shadow-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              ALERTS
            </span>
            <div className="mt-1.5 flex items-center">
              {totalAlerts > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-[11px] shadow-xs">
                  <span>{totalAlerts}</span>
                  <span className="text-[10px]">{totalAlerts === 1 ? 'Warning' : 'Warnings'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-750 font-bold text-[11px]">
                  0 Alerts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown do Menu do Hamburger */}
        {isMenuOpen && (
          <div className="px-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2 text-zinc-200 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-bold uppercase tracking-wider text-amber-400 text-[10px]">
                  Ações Rápidas do Chão de Fábrica
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left font-medium flex items-center gap-2"
                >
                  <span className="text-amber-400">⚙️</span>
                  <span>Ajustes do Turno</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left font-medium flex items-center gap-2"
                >
                  <span className="text-amber-400">📅</span>
                  <span>Histórico Passado</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsInstallOpen(true);
                  }}
                  className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left font-medium flex items-center gap-2"
                >
                  <span className="text-amber-400">📱</span>
                  <span>Instalar no Celular</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleQuickWhatsApp();
                  }}
                  className="p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/40 text-left font-medium flex items-center gap-2 text-emerald-300"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Disparar WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <PWAInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      <ModeratorNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
