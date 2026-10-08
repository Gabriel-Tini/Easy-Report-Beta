/**
 * Tipos e Modelos de Domínio para Relatórios de Chão de Fábrica - Linha de Solda
 */

export type Workstation =
  | 'P10'
  | 'P20'
  | 'P30'
  | 'P40'
  | 'P50'
  | 'P60'
  | 'P70'
  | 'P80'
  | 'P90';

export const WORKSTATIONS: Workstation[] = [
  'P10',
  'P20',
  'P30',
  'P40',
  'P50',
  'P60',
  'P70',
  'P80',
  'P90',
];

export type ProductModel = '20L' | '23L' | '27L' | '30L' | '38L' | '42L';

export const PRODUCT_MODELS: ProductModel[] = [
  '20L',
  '23L',
  '27L',
  '30L',
  '38L',
  '42L',
];

export type ShiftType = '1°' | '2°' | '3°';

export const SHIFT_TYPES: ShiftType[] = ['1°', '2°', '3°'];

export type DefectCategory = 'Gaps' | 'Danos Físicos' | 'Falhas de Solda' | 'Outro';

export const DEFECT_CATEGORIES: DefectCategory[] = [
  'Gaps',
  'Danos Físicos',
  'Falhas de Solda',
  'Outro',
];

// Inclusão de "Corpo" conforme solicitação
export const GAPS_OPTIONS = [
  'Gap na Frontal',
  'Gap no Traseiro',
  'Gap no Teto',
  'Gap no Corpo',
  'Gap no Suporte do Magnetron',
  'Gap no Suporte do Motor',
  'Gap no Guia de Ondas',
] as const;

export const DANOS_FISICOS_OPTIONS = [
  'Empenamento',
  'Amassado',
  'Material com Avaria',
  'Frontal Desalinhada',
  'Traseiro Desalinhado',
  'Corpo Desalinhado',
  'Dano no Corpo',
] as const;

export const FALHAS_SOLDA_OPTIONS = [
  'Traseiro',
  'Teto',
  'Corpo',
  'Frontal',
  'Suporte do Motor',
  'Suporte do Magnetron',
  'Guia de Ondas',
] as const;

export type DefectItem = {
  id: string;
  timestamp: string; // ISO string
  timeFormatted: string; // HH:mm no timezone
  workstation: Workstation;
  category: DefectCategory;
  defectName: string;
  isScrap: boolean; // se o item foi sucateado / condenado
  quantity: number;
  notes?: string;
  model: ProductModel;
  shift: ShiftType;
  hourSlot?: string; // Vinculação com o hora-hora (ex: "10:00")
};

export type HourlyApontamentoType =
  | 'normal' // Produção sem Falhas
  | 'dds' // Diálogo Diário de Segurança
  | 'setup' // Setup
  | 'defeito' // Defeito (Gap, Solda, Danos)
  | 'impacto'; // Parada / Impacto na linha

export type HourlyRecord = {
  id: string;
  hourSlot: string; // "07:00", "08:00", etc.
  type: HourlyApontamentoType;
  // Bloco 1: Descrição / Evento / Defeito
  title: string; // ex: "Parada por falha de solda", "Dialogo diário de Segurança (10Min)", "Setup", "Produção sem Falhas", "Gap Frontal"
  // Bloco 2: Posto de Trabalho / Localização
  workstation?: Workstation | 'Geral';
  // Bloco 3: Horário do Lançamento
  registeredAtTime: string; // ex: "22:03", "07:10"
  timestamp: string;
  // Dados de defeito caso aplicável
  category?: DefectCategory;
  defectName?: string;
  isScrap?: boolean;
  quantity?: number;
  countsAsImpact?: boolean;
};

// Preset de Botões Rápidos de 1-toque customizáveis pelo usuário
export type QuickActionPreset = {
  id: string;
  label: string; // Nome curto no botão, ex: "Sem Falhas", "DDS (10m)", "Setup", "P40 Solda"
  type: HourlyApontamentoType;
  defaultTitle: string; // Ex: "Produção sem Falhas", "Dialogo diário de Segurança (10Min)", "Parada por falha de solda"
  workstation?: Workstation | 'Geral';
  isScrap?: boolean;
  countsAsImpact?: boolean;
  color?: 'emerald' | 'amber' | 'sky' | 'red' | 'zinc';
};

export const DEFAULT_QUICK_PRESETS: QuickActionPreset[] = [
  {
    id: 'preset-sem-falhas',
    label: 'Sem Falhas',
    type: 'normal',
    defaultTitle: 'Produção sem Falhas',
    workstation: 'Geral',
    color: 'emerald',
    countsAsImpact: false,
  },
  {
    id: 'preset-dds',
    label: 'DDS (10min)',
    type: 'dds',
    defaultTitle: 'Dialogo diário de Segurança (10Min)',
    workstation: 'Geral',
    color: 'sky',
    countsAsImpact: false,
  },
  {
    id: 'preset-setup',
    label: 'Setup Linha',
    type: 'setup',
    defaultTitle: 'Setup de Linha',
    workstation: 'Geral',
    color: 'amber',
    countsAsImpact: true,
  },
  {
    id: 'preset-falha-solda',
    label: 'Falha de Solda',
    type: 'impacto',
    defaultTitle: 'Parada por falha de solda',
    workstation: 'P40',
    color: 'red',
    countsAsImpact: true,
  },
];

export const DEFAULT_HOURLY_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const;

export type ProductionImpact = {
  id: string;
  timestamp: string;
  timeRange: string;
  workstation?: Workstation | 'Geral';
  description: string;
};

export type ModeratorNotice = {
  id: string;
  title: string;
  message: string;
  author: string;
  timestamp: string;
  priority: 'normal' | 'alta' | 'urgente';
  isRead?: boolean;
};

export type StationImpactEntry = {
  id: string;
  station: Workstation;
  reason: string;
};

export const STATION_IMPACT_PRESETS: string[] = [
  'Pino caindo',
  'Pino travando',
  'Robô LCA travado',
  'Falta de Material',
  'Pino quebrado',
  'Desvio mecânico / ferramental',
  'Desvio de processo / matéria-prima',
  'Manutenção / quebra',
];

export type ManualClosingData = {
  totalProduzido: string;
  aprovadosParaPintura: string;
  retrabalhadosPorGap: string;
  detalheGaps: string; // Ex: "Frontal / Traseiro" ou valores específicos
  planoAcum: string;
  realAcum: string;
  // Impactantes da Produção (apenas texto manual e postos selecionáveis)
  impactoSistema: string; // Texto livre manual (sem pré-definição fixa)
  impactoEventos: string; // Texto livre manual (sem pré-definição fixa)
  impactoPostos: string; // Texto formatado dos postos operacionais
  stationImpacts?: StationImpactEntry[]; // Itens selecionados por posto
  // Observações
  obsRetificacaoEletrodos: string; // Horários, postos ou status da ação (manual)
  obsGerais: string; // Variáveis livres e comentários da supervisão
};

export type TimezoneOption = 'America/Manaus' | 'America/Sao_Paulo' | 'local';

export type ThemeOption = 'dark' | 'light' | 'gray';

export type ShiftReportArchive = {
  id: string;
  dateStr: string;
  shiftDateKey: string;
  model: ProductModel;
  shift: ShiftType;
  lineName: string;
  defects: DefectItem[];
  hourlyRecords: HourlyRecord[];
  impacts: ProductionImpact[];
  closing: ManualClosingData;
  summary: {
    totalDefeitos: number;
    scrapTotal: number;
    falhaDeSolda: number;
    amassado: number;
    empenado: number;
    gaps: number;
  };
  exportedAt?: string;
};
