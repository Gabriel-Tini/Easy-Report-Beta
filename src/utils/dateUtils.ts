/**
 * Utilitários para sincronização de data, hora e fuso horário
 * Suporte completo a Manaus (AMT -04) e horário oficial do turno
 */
import { TimezoneOption } from '../types/report';

export function getTimezoneLabel(tz: TimezoneOption): string {
  switch (tz) {
    case 'America/Manaus':
      return 'AMT (Manaus -04:00)';
    case 'America/Sao_Paulo':
      return 'BRT (Brasília -03:00)';
    case 'local':
      return 'Horário do Aparelho';
  }
}

/**
 * Retorna a chave de data atual (YYYY-MM-DD) no fuso horário configurado
 */
export function getCurrentDateKey(tz: TimezoneOption, date = new Date()): string {
  try {
    const timeZone = tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // Retorna formato YYYY-MM-DD
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Retorna a data formatada DD/MM/AAAA para o cabeçalho e template de exportação
 */
export function getFormattedDate(tz: TimezoneOption, date = new Date()): string {
  try {
    const timeZone = tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}

/**
 * Retorna a data formatada DD/MM/AA para o template executivo
 */
export function getFormattedDateShort(tz: TimezoneOption, date = new Date()): string {
  const full = getFormattedDate(tz, date);
  const parts = full.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
  }
  return full;
}

/**
 * Retorna a hora atual formatada HH:mm no fuso horário
 */
export function getFormattedTime(tz: TimezoneOption, date = new Date()): string {
  try {
    const timeZone = tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

/**
 * Retorna a hora completa com segundos HH:mm:ss
 */
export function getFormattedFullTime(tz: TimezoneOption, date = new Date()): string {
  try {
    const timeZone = tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleTimeString('pt-BR');
  }
}

/**
 * Calcula a porcentagem do turno de 07:00 às 17:20
 */
export function getShiftProgress(tz: TimezoneOption): {
  percentage: number;
  isActiveShift: boolean;
  timeRemainingStr: string;
} {
  const now = new Date();
  const timeStr = getFormattedTime(tz, now);
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  const currentMinutes = h * 60 + m;
  const shiftStartMinutes = 7 * 60; // 07:00 = 420 min
  const shiftEndMinutes = 17 * 60 + 20; // 17:20 = 1040 min
  const totalShiftMinutes = shiftEndMinutes - shiftStartMinutes; // 620 min

  if (currentMinutes < shiftStartMinutes) {
    const minsUntilStart = shiftStartMinutes - currentMinutes;
    const hours = Math.floor(minsUntilStart / 60);
    const mins = minsUntilStart % 60;
    return {
      percentage: 0,
      isActiveShift: false,
      timeRemainingStr: `Inicia em ${hours}h ${mins}m`,
    };
  }

  if (currentMinutes > shiftEndMinutes) {
    return {
      percentage: 100,
      isActiveShift: false,
      timeRemainingStr: 'Turno finalizado (17:20)',
    };
  }

  const elapsed = currentMinutes - shiftStartMinutes;
  const percentage = Math.min(100, Math.max(0, Math.round((elapsed / totalShiftMinutes) * 100)));
  const remainingMinutes = shiftEndMinutes - currentMinutes;
  const hoursLeft = Math.floor(remainingMinutes / 60);
  const minsLeft = remainingMinutes % 60;

  return {
    percentage,
    isActiveShift: true,
    timeRemainingStr: `${hoursLeft}h ${minsLeft}m restantes`,
  };
}
