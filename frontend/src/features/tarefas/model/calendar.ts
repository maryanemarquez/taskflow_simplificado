/** Data de calendário sem fuso: mês de 1 a 12. */
export interface Ymd {
  year: number;
  month: number;
  day: number;
}

export interface YearMonth {
  year: number;
  month: number;
}

export interface CalendarCell {
  date: Ymd;
  inMonth: boolean;
}

const MS_PER_DAY = 86_400_000;
const pad = (value: number, size: number) => String(value).padStart(size, '0');

export function todayYmd(now: Date = new Date()): Ymd {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Aceita só datas que existem no calendário (31/02 não existe). */
export function isRealDate({ year, month, day }: Ymd): boolean {
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function compareYmd(a: Ymd, b: Ymd): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function isPast(date: Ymd, today: Ymd): boolean {
  return compareYmd(date, today) < 0;
}

export function toIso({ year, month, day }: Ymd): string {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

export function fromIso(iso: string | null): Ymd | null {
  const found = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!found) {
    return null;
  }
  const date = { year: Number(found[1]), month: Number(found[2]), day: Number(found[3]) };
  return isRealDate(date) ? date : null;
}

export function toBr({ year, month, day }: Ymd): string {
  return `${pad(day, 2)}/${pad(month, 2)}/${pad(year, 4)}`;
}

/** Monta dia, mês e ano digitados; devolve null se faltar dígito ou se a data não existir. */
export function parseSegments(day: string, month: string, year: string): Ymd | null {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return null;
  }
  const date = { year: Number(year), month: Number(month), day: Number(day) };
  return isRealDate(date) ? date : null;
}

export function isSegmentsComplete(day: string, month: string, year: string): boolean {
  return day.length === 2 && month.length === 2 && year.length === 4;
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year - b.year || a.month - b.month;
}

/** 6 semanas (42 dias) começando no domingo, com os dias vizinhos marcados como fora do mês. */
export function monthMatrix({ year, month }: YearMonth): CalendarCell[][] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const start = Date.UTC(year, month - 1, 1 - firstWeekday);
  const weeks: CalendarCell[][] = [];
  for (let week = 0; week < 6; week += 1) {
    const row: CalendarCell[] = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const current = new Date(start + (week * 7 + weekday) * MS_PER_DAY);
      const date = { year: current.getUTCFullYear(), month: current.getUTCMonth() + 1, day: current.getUTCDate() };
      row.push({ date, inMonth: date.month === month });
    }
    weeks.push(row);
  }
  return weeks;
}
