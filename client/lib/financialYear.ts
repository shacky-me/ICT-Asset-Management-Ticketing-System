// Government of Kenya financial year: 1 July to 30 June.
// A financial year is identified by the calendar year it starts in,
// so FY 2025/2026 has startYear 2025.

export type FinancialYear = {
  startYear: number;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function financialYearOf(date: Date): FinancialYear {
  // July is month index 6.
  const startYear =
    date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  return { startYear };
}

export function currentFinancialYear(): FinancialYear {
  return financialYearOf(new Date());
}

export function fyStart(fy: FinancialYear): Date {
  return new Date(fy.startYear, 6, 1);
}

// Exclusive end: 1 July of the following year.
export function fyEndExclusive(fy: FinancialYear): Date {
  return new Date(fy.startYear + 1, 6, 1);
}

export function fyLabel(fy: FinancialYear): string {
  return `FY ${fy.startYear}/${fy.startYear + 1}`;
}

export function fyRangeLabel(fy: FinancialYear): string {
  return `1 July ${fy.startYear} to 30 June ${fy.startYear + 1}`;
}

export function fyEndLabel(fy: FinancialYear): string {
  return `30 June ${fy.startYear + 1}`;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isWithinFinancialYear(
  value: string | null | undefined,
  fy: FinancialYear,
): boolean {
  const date = parseDate(value);
  if (!date) return false;
  return date >= fyStart(fy) && date < fyEndExclusive(fy);
}

export function isOnOrBeforeFinancialYearEnd(
  value: string | null | undefined,
  fy: FinancialYear,
): boolean {
  const date = parseDate(value);
  if (!date) return false;
  return date < fyEndExclusive(fy);
}

// Every financial year from the earliest dated record up to the current one,
// newest first.
export function financialYearOptions(
  dates: Array<string | null | undefined>,
): FinancialYear[] {
  const current = currentFinancialYear().startYear;
  let earliest = current;
  for (const value of dates) {
    const date = parseDate(value);
    if (date) earliest = Math.min(earliest, financialYearOf(date).startYear);
  }
  const options: FinancialYear[] = [];
  for (let year = current; year >= earliest; year--) {
    options.push({ startYear: year });
  }
  return options;
}

export function formatLongDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
