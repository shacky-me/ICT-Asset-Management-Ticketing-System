import { formatLongDate } from "@/lib/financialYear";

export const LETTERHEAD_LINES = [
  "REPUBLIC OF KENYA",
  "STATE DEPARTMENT FOR JUSTICE, HUMAN RIGHTS AND CONSTITUTIONAL AFFAIRS",
  "ICT DEPARTMENT",
] as const;

export const SYSTEM_NAME = "ICT Asset Management and Tracking System";

export type ReportMeta = {
  title: string;
  // e.g. "Financial Year 2025/2026 (1 July 2025 to 30 June 2026)"
  period: string;
  // Optional note on how records were selected, e.g. "Assets held as at 30 June 2026"
  basis?: string;
  preparedBy?: string;
};

export function generatedLine(meta: ReportMeta, now = new Date()): string {
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const prepared = meta.preparedBy ? `  |  Prepared by: ${meta.preparedBy}` : "";
  return `Generated: ${formatLongDate(now)}, ${time}${prepared}`;
}

// Snapshot exports that are not tied to a financial year.
export function asAtTodayPeriod(): string {
  return `As at ${formatLongDate(new Date())}`;
}

let coatOfArmsCache: Promise<string | null> | null = null;

export function loadCoatOfArms(): Promise<string | null> {
  if (!coatOfArmsCache) {
    coatOfArmsCache = fetch("/coat-of-arms.png")
      .then((response) => (response.ok ? response.blob() : null))
      .then(
        (blob) =>
          new Promise<string | null>((resolve) => {
            if (!blob) return resolve(null);
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          }),
      )
      .catch(() => null);
  }
  return coatOfArmsCache;
}
