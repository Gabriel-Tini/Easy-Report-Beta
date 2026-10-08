import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DEFAULT_QUICK_PRESETS,
  DefectCategory,
  DefectItem,
  HourlyApontamentoType,
  HourlyRecord,
  ManualClosingData,
  ModeratorNotice,
  ProductModel,
  ProductionImpact,
  QuickActionPreset,
  ShiftReportArchive,
  ShiftType,
  ThemeOption,
  TimezoneOption,
  Workstation,
} from '../types/report';
import {
  getCurrentDateKey,
  getFormattedDate,
  getFormattedDateShort,
  getFormattedTime,
} from '../utils/dateUtils';

interface ReportState {
  // Configurações do Turno e Tema
  lineName: string;
  model: ProductModel;
  shift: ShiftType;
  timezone: TimezoneOption;
  theme: ThemeOption;
  currentShiftDateKey: string; // YYYY-MM-DD

  // Produção Hora a Hora e Meta
  hourlyProduction: Record<string, number>;
  hourlyProductionTarget: number; // Meta por hora configurável (padrão: 120)

  // Avisos e Comunicados do Moderador
  moderatorNotices: ModeratorNotice[];

  // Dados do Turno Atual
  defects: DefectItem[]; // Aba de Scrap (100% Sucata)
  hourlyRecords: HourlyRecord[];
  impacts: ProductionImpact[];
  manualClosing: ManualClosingData;
  quickPresets: QuickActionPreset[];

  // Histórico de turnos arquivados
  shiftHistory: ShiftReportArchive[];

  // Ações de Configuração
  setModel: (model: ProductModel) => void;
  setShift: (shift: ShiftType) => void;
  setLineName: (name: string) => void;
  setTimezone: (tz: TimezoneOption) => void;
  setTheme: (theme: ThemeOption) => void;
  setHourlyProductionTarget: (target: number) => void;

  // Lançamento de Produção Hora a Hora
  setHourlyProduction: (hourSlot: string, amount: number) => void;

  // Comunicados do Moderador
  addModeratorNotice: (notice: Omit<ModeratorNotice, 'id' | 'timestamp'>) => void;
  removeModeratorNotice: (id: string) => void;
  markNoticeAsRead: (id: string) => void;

  // Reset administrativo nas configurações
  resetShiftData: () => void;

  // Botões Rápidos de 1-toque customizáveis
  addQuickPreset: (preset: Omit<QuickActionPreset, 'id'>) => void;
  updateQuickPreset: (id: string, preset: Partial<QuickActionPreset>) => void;
  removeQuickPreset: (id: string) => void;
  resetQuickPresetsToDefault: () => void;

  // Apontamentos Hora a Hora (Com Edição)
  addHourlyRecord: (data: {
    hourSlot: string;
    type: HourlyApontamentoType;
    title: string;
    workstation?: Workstation | 'Geral';
    registeredAtTime?: string;
    category?: DefectCategory;
    defectName?: string;
    isScrap?: boolean;
    quantity?: number;
    countsAsImpact?: boolean;
  }) => void;
  editHourlyRecord: (
    id: string,
    updated: {
      hourSlot?: string;
      type?: HourlyApontamentoType;
      title?: string;
      workstation?: Workstation | 'Geral';
      registeredAtTime?: string;
      category?: DefectCategory;
      defectName?: string;
      isScrap?: boolean;
      quantity?: number;
      countsAsImpact?: boolean;
    }
  ) => void;
  removeHourlyRecord: (id: string) => void;

  // Apontamento Específico de Sucata (Aba Scrap)
  addDefect: (defect: {
    workstation: Workstation;
    category: DefectCategory;
    defectName: string;
    isScrap?: boolean;
    quantity: number;
    notes?: string;
    hourSlot?: string;
  }) => void;
  removeDefect: (id: string) => void;

  // Impactos de Produção / Paradas
  addImpact: (impact: {
    timeRange: string;
    workstation?: Workstation | 'Geral';
    description: string;
  }) => void;
  removeImpact: (id: string) => void;

  // Fechamento manual
  updateManualClosing: (data: Partial<ManualClosingData>) => void;

  // Virada automática de turno
  checkAndPerformDayRollover: () => void;

  // Cálculos automáticos da Store
  getDefectCounts: () => {
    scrapTotal: number;
    falhaDeSolda: number;
    amassado: number;
    empenado: number;
    gapsTotal: number;
    danosFisicosTotal: number;
    outrosTotal: number;
    totalGeral: number;
  };

  // Gerador do texto executivo para o WhatsApp
  generateWhatsAppText: () => string;
  getWhatsAppShareUrl: () => string;
}

const DEFAULT_MODERATOR_NOTICES: ModeratorNotice[] = [
  {
    id: 'notice-inicio-turno',
    title: 'Início do Turno',
    message: 'Operação iniciada. Bom turno de trabalho! Atenção aos parâmetros de solda, pontas de eletrodos e inspeção visual de gaps.',
    author: 'Sistema',
    timestamp: '07:00',
    priority: 'alta',
    isRead: false,
  },
];

const initialClosingData: ManualClosingData = {
  totalProduzido: '',
  aprovadosParaPintura: '',
  retrabalhadosPorGap: '',
  detalheGaps: '',
  planoAcum: '',
  realAcum: '',
  impactoSistema: '',
  impactoEventos: '',
  impactoPostos: '',
  stationImpacts: [],
  obsRetificacaoEletrodos: '',
  obsGerais: '',
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      lineName: 'Linha de Solda',
      model: '23L',
      shift: '1°',
      timezone: 'America/Manaus',
      theme: 'dark',
      currentShiftDateKey: getCurrentDateKey('America/Manaus'),

      hourlyProduction: {},
      hourlyProductionTarget: 120, // 120 peças/hora por padrão
      moderatorNotices: DEFAULT_MODERATOR_NOTICES,

      defects: [],
      hourlyRecords: [],
      impacts: [],
      manualClosing: initialClosingData,
      quickPresets: DEFAULT_QUICK_PRESETS,
      shiftHistory: [],

      setModel: (model) => set({ model }),
      setShift: (shift) => set({ shift }),
      setLineName: (lineName) => set({ lineName }),
      setTimezone: (timezone) => {
        set({ timezone });
        get().checkAndPerformDayRollover();
      },
      setTheme: (theme) => set({ theme }),
      setHourlyProductionTarget: (target) => set({ hourlyProductionTarget: Math.max(1, target) }),

      setHourlyProduction: (hourSlot, amount) => {
        set((s) => ({
          hourlyProduction: {
            ...s.hourlyProduction,
            [hourSlot]: Math.max(0, amount),
          },
        }));
      },

      addModeratorNotice: (notice) => {
        const now = new Date();
        const timestamp = getFormattedTime(get().timezone, now);
        const newNotice: ModeratorNotice = {
          ...notice,
          id: `notice-${Date.now()}`,
          timestamp,
          isRead: false,
        };
        set((s) => ({
          moderatorNotices: [newNotice, ...s.moderatorNotices],
        }));
      },

      removeModeratorNotice: (id) => {
        set((s) => ({
          moderatorNotices: s.moderatorNotices.filter((n) => n.id !== id),
        }));
      },

      markNoticeAsRead: (id) => {
        set((s) => ({
          moderatorNotices: s.moderatorNotices.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },

      // Reset administrativo disponível nas Configurações
      resetShiftData: () => {
        set({
          defects: [],
          hourlyRecords: [],
          impacts: [],
          hourlyProduction: {},
          manualClosing: initialClosingData,
        });
      },

      // Gerenciamento de Botões Rápidos
      addQuickPreset: (preset) => {
        const id = `preset-${Date.now()}`;
        set((s) => ({
          quickPresets: [...s.quickPresets, { ...preset, id }],
        }));
      },
      updateQuickPreset: (id, preset) => {
        set((s) => ({
          quickPresets: s.quickPresets.map((p) => (p.id === id ? { ...p, ...preset } : p)),
        }));
      },
      removeQuickPreset: (id) => {
        set((s) => ({
          quickPresets: s.quickPresets.filter((p) => p.id !== id),
        }));
      },
      resetQuickPresetsToDefault: () => {
        set({ quickPresets: DEFAULT_QUICK_PRESETS });
      },

      addHourlyRecord: ({
        hourSlot,
        type,
        title,
        workstation = 'Geral',
        registeredAtTime,
        category,
        defectName,
        isScrap = false,
        quantity = 1,
        countsAsImpact = false,
      }) => {
        get().checkAndPerformDayRollover();

        const state = get();
        const now = new Date();
        const launchTime = registeredAtTime || getFormattedTime(state.timezone, now);
        const recordId = `hr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const newRecord: HourlyRecord = {
          id: recordId,
          hourSlot,
          type,
          title,
          workstation,
          registeredAtTime: launchTime,
          timestamp: now.toISOString(),
          category,
          defectName,
          isScrap,
          quantity,
          countsAsImpact,
        };

        set((s) => ({
          hourlyRecords: [...s.hourlyRecords, newRecord],
        }));
      },

      editHourlyRecord: (id, updated) => {
        set((s) => ({
          hourlyRecords: s.hourlyRecords.map((r) =>
            r.id === id ? { ...r, ...updated } : r
          ),
        }));
      },

      removeHourlyRecord: (id) => {
        set((s) => ({
          hourlyRecords: s.hourlyRecords.filter((r) => r.id !== id),
        }));
      },

      // Aba específica de Scrap (Sucata) - todo apontamento aqui é 100% scrap
      addDefect: ({
        workstation,
        category,
        defectName,
        quantity = 1,
        notes,
        hourSlot,
      }) => {
        get().checkAndPerformDayRollover();

        const state = get();
        const now = new Date();
        const timeFormatted = getFormattedTime(state.timezone, now);
        const id = `def-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const newDefect: DefectItem = {
          id,
          workstation,
          category,
          defectName,
          isScrap: true, // Classificado obrigatoriamente como scrap
          quantity,
          notes,
          model: state.model,
          shift: state.shift,
          hourSlot,
          timestamp: now.toISOString(),
          timeFormatted,
        };

        set((s) => ({
          defects: [newDefect, ...s.defects],
        }));
      },

      removeDefect: (id) => {
        set((s) => ({
          defects: s.defects.filter((d) => d.id !== id),
        }));
      },

      addImpact: ({ timeRange, workstation = 'Geral', description }) => {
        get().checkAndPerformDayRollover();

        const now = new Date();
        const id = `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newImpact: ProductionImpact = {
          id,
          timestamp: now.toISOString(),
          timeRange,
          workstation,
          description,
        };

        set((s) => ({
          impacts: [...s.impacts, newImpact],
        }));
      },

      removeImpact: (id) => {
        set((s) => ({
          impacts: s.impacts.filter((i) => i.id !== id),
        }));
      },

      updateManualClosing: (data) => {
        set((s) => ({
          manualClosing: {
            ...s.manualClosing,
            ...data,
          },
        }));
      },

      checkAndPerformDayRollover: () => {
        const state = get();
        const todayKey = getCurrentDateKey(state.timezone);

        if (state.currentShiftDateKey && state.currentShiftDateKey !== todayKey) {
          const hasCurrentData =
            state.defects.length > 0 ||
            state.hourlyRecords.length > 0 ||
            state.impacts.length > 0 ||
            state.manualClosing.totalProduzido !== '';

          if (hasCurrentData) {
            const counts = state.getDefectCounts();
            const archiveItem: ShiftReportArchive = {
              id: `archive-${state.currentShiftDateKey}-${state.shift}`,
              dateStr: state.currentShiftDateKey,
              shiftDateKey: state.currentShiftDateKey,
              model: state.model,
              shift: state.shift,
              lineName: state.lineName,
              defects: [...state.defects],
              hourlyRecords: [...state.hourlyRecords],
              impacts: [...state.impacts],
              closing: { ...state.manualClosing },
              summary: {
                totalDefeitos: counts.totalGeral,
                scrapTotal: counts.scrapTotal,
                falhaDeSolda: counts.falhaDeSolda,
                amassado: counts.amassado,
                empenado: counts.empenado,
                gaps: counts.gapsTotal,
              },
            };

            set((s) => ({
              shiftHistory: [archiveItem, ...s.shiftHistory].slice(0, 30),
              currentShiftDateKey: todayKey,
              defects: [],
              hourlyRecords: [],
              impacts: [],
              hourlyProduction: {},
              manualClosing: initialClosingData,
            }));
          } else {
            set({
              currentShiftDateKey: todayKey,
            });
          }
        }
      },

      // Os dados para os insights de falha de solda e gaps são baseados no apontamento hora a hora + aba de scrap
      getDefectCounts: () => {
        const hourlyRecords = get().hourlyRecords;
        const defects = get().defects;

        let scrapTotal = 0;
        let falhaDeSolda = 0;
        let amassado = 0;
        let empenado = 0;
        let gapsTotal = 0;
        let danosFisicosTotal = 0;
        let outrosTotal = 0;
        let totalGeral = 0;

        // 1. Apontamentos do Hora a Hora (Insights de produção)
        for (const hr of hourlyRecords) {
          if (hr.type === 'defeito' || hr.category) {
            const qty = hr.quantity || 1;
            totalGeral += qty;

            const titleLower = (hr.title || '').toLowerCase();
            const defectNameLower = (hr.defectName || '').toLowerCase();

            if (
              hr.category === 'Falhas de Solda' ||
              titleLower.includes('solda') ||
              defectNameLower.includes('solda')
            ) {
              falhaDeSolda += qty;
            }

            if (
              hr.category === 'Gaps' ||
              titleLower.includes('gap') ||
              defectNameLower.includes('gap')
            ) {
              gapsTotal += qty;
            }

            if (
              defectNameLower.includes('amassad') ||
              titleLower.includes('amassad')
            ) {
              amassado += qty;
            }

            if (
              defectNameLower.includes('empenad') ||
              titleLower.includes('empenad')
            ) {
              empenado += qty;
            }

            if (hr.category === 'Danos Físicos') {
              danosFisicosTotal += qty;
            }

            if (hr.category === 'Outro') {
              outrosTotal += qty;
            }

            if (hr.isScrap) {
              scrapTotal += qty;
            }
          }
        }

        // 2. Aba específica de Scrap (Todo apontamento nesta aba é scrap)
        for (const item of defects) {
          const qty = item.quantity;
          totalGeral += qty;
          scrapTotal += qty; // 100% scrap

          const defectNameLower = (item.defectName || '').toLowerCase();

          if (item.category === 'Falhas de Solda' || defectNameLower.includes('solda')) {
            falhaDeSolda += qty;
          }
          if (defectNameLower.includes('amassad')) {
            amassado += qty;
          }
          if (defectNameLower.includes('empenad')) {
            empenado += qty;
          }
          if (item.category === 'Gaps') {
            gapsTotal += qty;
          }
          if (item.category === 'Danos Físicos') {
            danosFisicosTotal += qty;
          }
          if (item.category === 'Outro') {
            outrosTotal += qty;
          }
        }

        return {
          scrapTotal,
          falhaDeSolda,
          amassado,
          empenado,
          gapsTotal,
          danosFisicosTotal,
          outrosTotal,
          totalGeral,
        };
      },

      /**
       * NOVO TEMPLATE EXECUTIVO DE FECHAMENTO CONFORME ESPECIFICAÇÃO
       * Regra de Omissão: Todos os campos que ficarem vazios, automaticamente desaparecem do relatório final.
       */
      generateWhatsAppText: () => {
        const state = get();
        const counts = state.getDefectCounts();
        const currentDateShort = getFormattedDateShort(state.timezone);

        // Turno formatado ex: "1ºT", "2ºT", "3ºT"
        const turnoFormatted = `${state.shift.replace('°', 'º')}T`;

        const sections: string[] = [];

        // 1. Cabeçalho do Relatório
        sections.push(
          `📊 RELATÓRIO DIÁRIO DE PRODUÇÃO\n\nData: ${currentDateShort} | Turno: ${turnoFormatted}\n\nÁrea: ${state.lineName} [${state.model}]`
        );

        // 2. INDICADORES DE PRODUÇÃO
        let totalProd = state.manualClosing.totalProduzido.trim();
        if (!totalProd) {
          const sumHourly = Object.values(state.hourlyProduction).reduce((a, b) => a + b, 0);
          if (sumHourly > 0) {
            totalProd = String(sumHourly);
          }
        }
        const aprovados = state.manualClosing.aprovadosParaPintura.trim();

        const prodLines: string[] = [];
        if (totalProd) {
          prodLines.push(`• Total Produzido: ${totalProd}`);
        }
        if (aprovados) {
          prodLines.push(`• Aprovados para Pintura: ${aprovados}`);
        }
        if (prodLines.length > 0) {
          sections.push(`📈 INDICADORES DE PRODUÇÃO\n\n${prodLines.join('\n\n')}`);
        }

        // 3. QUALIDADE E RETRABALHO (GAP)
        let retrabalho = state.manualClosing.retrabalhadosPorGap.trim();
        if (!retrabalho && counts.gapsTotal > 0) {
          retrabalho = String(counts.gapsTotal);
        }
        const detalheGaps = state.manualClosing.detalheGaps.trim();

        if (retrabalho) {
          let gapLine = `• Retrabalhados por Gap: ${retrabalho}`;
          if (detalheGaps) {
            gapLine += ` (${detalheGaps.startsWith('(') ? detalheGaps : `[${detalheGaps}]`})`;
          }
          sections.push(`🛠️ QUALIDADE E RETRABALHO (GAP)\n\n${gapLine}`);
        }

        // 4. SUCATA (SCRAP)
        const numTotal = parseInt(totalProd, 10) || 0;
        const indiceScrapPct =
          numTotal > 0 ? ((counts.scrapTotal / numTotal) * 100).toFixed(2) : '0.00';

        const scrapLines = [
          `• Total de Scrap: ${counts.scrapTotal}`,
          `Falha de Solda: ${counts.falhaDeSolda}`,
          `Amassado: ${counts.amassado}`,
          `Empenado: ${counts.empenado}`,
          `Índice de Scrap: ${indiceScrapPct}%`,
        ];
        sections.push(`🚮 SUCATA (SCRAP)\n\n${scrapLines.join('\n\n')}`);

        // 5. IMPACTANTES DA PRODUÇÃO
        // Postos Operacionais: texto formatado de postos selecionáveis ou manual
        let operationalText = (state.manualClosing.impactoPostos || '').trim();
        if (
          !operationalText &&
          state.manualClosing.stationImpacts &&
          state.manualClosing.stationImpacts.length > 0
        ) {
          const map = new Map<string, string[]>();
          for (const item of state.manualClosing.stationImpacts) {
            const list = map.get(item.station) || [];
            if (!list.includes(item.reason)) {
              list.push(item.reason);
            }
            map.set(item.station, list);
          }
          const lines: string[] = [];
          for (const [st, descs] of Array.from(map.entries()).sort()) {
            lines.push(`[${st}]: ${descs.join(' / ')}`);
          }
          operationalText = lines.join('\n\n');
        }

        const sistemaText = state.manualClosing.impactoSistema.trim();
        const eventosText = state.manualClosing.impactoEventos.trim();

        const impactLines: string[] = [];
        if (sistemaText) {
          impactLines.push(`• Sistema: ${sistemaText}`);
        }
        if (eventosText) {
          impactLines.push(`• Eventos: ${eventosText}`);
        }
        if (operationalText) {
          impactLines.push(`• Postos Operacionais:\n\n${operationalText}`);
        }

        // Se houver algum impacto, adiciona a seção. Se todos estiverem vazios, não aparece nada!
        if (impactLines.length > 0) {
          sections.push(`⚠️ IMPACTANTES DA PRODUÇÃO\n\n${impactLines.join('\n\n')}`);
        }

        // 6. OBSERVAÇÕES
        const retificacaoText = state.manualClosing.obsRetificacaoEletrodos.trim();
        const obsGeraisText = state.manualClosing.obsGerais.trim();

        const obsLines: string[] = [];
        if (retificacaoText) {
          obsLines.push(`• Retificação de Eletrodos: ${retificacaoText}`);
        }
        if (obsGeraisText) {
          obsLines.push(`• Observações: ${obsGeraisText}`);
        }

        // Se houver alguma observação, adiciona a seção. Se ambas vazias, desaparece completamente!
        if (obsLines.length > 0) {
          sections.push(`📝 OBSERVAÇÕES\n\n${obsLines.join('\n\n')}`);
        }

        return sections.join('\n\n');
      },

      getWhatsAppShareUrl: () => {
        const text = get().generateWhatsAppText();
        return `https://wa.me/?text=${encodeURIComponent(text)}`;
      },
    }),
    {
      name: 'fabrica-relatorios-solda-store',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState: any) => {
        if (persistedState) {
          if (persistedState.manualClosing) {
            const mc = persistedState.manualClosing;
            // Limpa textos mockados das versões anteriores para respeitar a nova regra de campos vazios
            if (mc.impactoSistema === 'Sem paradas de sistema / MES normal') {
              mc.impactoSistema = '';
            }
            if (mc.impactoEventos === 'Treinamentos / SIPATMA') {
              mc.impactoEventos = '';
            }
            if (
              mc.obsRetificacaoEletrodos === 'Realizada nos postos P20 e P40 - Conforme' ||
              mc.obsRetificacaoEletrodos === 'Horários, postos ou status da ação'
            ) {
              mc.obsRetificacaoEletrodos = '';
            }
            if (mc.impactoPostos && mc.impactoPostos.includes('Desvio mecânico / ferramental')) {
              mc.impactoPostos = '';
            }
            if (mc.detalheGaps === 'Frontal / Traseiro') {
              mc.detalheGaps = '';
            }
            if (!mc.stationImpacts) {
              mc.stationImpacts = [];
            }
          }

          // Ajustes nas notificações: os avisos são de uso exclusivo do programador (apenas Inicio do Turno)
          if (persistedState.moderatorNotices) {
            persistedState.moderatorNotices = persistedState.moderatorNotices.filter(
              (n: any) => n.id !== 'notice-1' && n.id !== 'notice-2'
            );
            if (persistedState.moderatorNotices.length === 0) {
              persistedState.moderatorNotices = DEFAULT_MODERATOR_NOTICES;
            }
          }
        }
        return persistedState;
      },
    }
  )
);
