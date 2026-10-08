import React, { useEffect, useState } from 'react';
import {
  Clock,
  Trash2,
  FileCheck2,
} from 'lucide-react';
import { Header } from './components/Header';
import { HourlyTimelineView } from './components/HourlyTimelineView';
import { QuickEntryDefects } from './components/QuickEntryDefects';
import { FechamentoTab } from './components/FechamentoTab';
import { ShiftSettingsModal } from './components/ShiftSettingsModal';
import { ShiftHistoryModal } from './components/ShiftHistoryModal';
import { useReportStore } from './store/reportStore';

type ActiveTab = 'hora_a_hora' | 'apontamentos' | 'fechamento';

export default function App() {
  // A página inicial deve ser o hora-a-hora conforme solicitado
  const [activeTab, setActiveTab] = useState<ActiveTab>('hora_a_hora');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { defects, hourlyRecords, theme } = useReportStore();

  useEffect(() => {
    // Sincroniza atributo no HTML root e meta theme-color para PWA
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (theme === 'light') {
        metaThemeColor.setAttribute('content', '#f8fafc');
      } else if (theme === 'gray') {
        metaThemeColor.setAttribute('content', '#e4e4e7');
      } else {
        metaThemeColor.setAttribute('content', '#09090b');
      }
    }
  }, [theme]);

  return (
    <div
      data-theme={theme}
      className="min-h-screen theme-app-bg flex flex-col font-sans select-none antialiased theme-root transition-colors duration-200"
    >
      {/* Faixa decorativa industrial superior */}
      <div className="h-1 w-full bg-amber-400 shadow-xs" />

      {/* Header com sincronização de relógio e fuso horário */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNavigateToFechamento={() => setActiveTab('fechamento')}
      />

      {/* Conteúdo Principal (Mobile-First Container) */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 pt-2 pb-24">
        {activeTab === 'hora_a_hora' && <HourlyTimelineView />}
        {activeTab === 'apontamentos' && <QuickEntryDefects />}
        {activeTab === 'fechamento' && <FechamentoTab />}
      </main>

      {/* Barra de Navegação Inferior (Mobile Bottom Navigation - PROC-X Industrial Dock) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 theme-bottom-dock border-t theme-border-subtle pb-safe transition-colors shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-3 h-16 px-2">
          {/* Aba 1: Hora a Hora (PÁGINA INICIAL PRINCIPAL) */}
          <button
            type="button"
            onClick={() => setActiveTab('hora_a_hora')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer active:scale-95 ${
              activeTab === 'hora_a_hora'
                ? 'text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 font-medium'
            }`}
          >
            <div className="relative">
              <Clock className={`w-5 h-5 ${activeTab === 'hora_a_hora' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {hourlyRecords.length > 0 && (
                <span className="absolute -top-1 -right-2.5 font-mono text-[9px] px-1 py-0.2 rounded-full bg-amber-400 text-zinc-950 font-black leading-none shadow-xs">
                  {hourlyRecords.length}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">Hora a Hora</span>
            {activeTab === 'hora_a_hora' && (
              <span className="absolute top-0 inset-x-4 h-0.5 bg-amber-400 rounded-full shadow-xs" />
            )}
          </button>

          {/* Aba 2: Apontamentos Específicos de Scrap (100% Sucata) */}
          <button
            type="button"
            onClick={() => setActiveTab('apontamentos')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer active:scale-95 ${
              activeTab === 'apontamentos'
                ? 'text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 font-medium'
            }`}
          >
            <div className="relative">
              <Trash2 className={`w-5 h-5 ${activeTab === 'apontamentos' ? 'stroke-[2.5] text-red-500' : 'stroke-[1.8]'}`} />
              {defects.length > 0 && (
                <span className="absolute -top-1 -right-2.5 font-mono text-[9px] px-1 py-0.2 rounded-full bg-red-600 text-white font-black leading-none shadow-xs">
                  {defects.reduce((acc, d) => acc + d.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">Scrap</span>
            {activeTab === 'apontamentos' && (
              <span className="absolute top-0 inset-x-4 h-0.5 bg-amber-400 rounded-full shadow-xs" />
            )}
          </button>

          {/* Aba 3: Fechamento / WhatsApp */}
          <button
            type="button"
            onClick={() => setActiveTab('fechamento')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer active:scale-95 ${
              activeTab === 'fechamento'
                ? 'text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 font-medium'
            }`}
          >
            <div className="relative">
              <FileCheck2 className={`w-5 h-5 ${activeTab === 'fechamento' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[11px] tracking-tight">Fechamento</span>
            {activeTab === 'fechamento' && (
              <span className="absolute top-0 inset-x-4 h-0.5 bg-amber-400 rounded-full shadow-xs" />
            )}
          </button>
        </div>
      </nav>

      {/* Modais */}
      <ShiftSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ShiftHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

