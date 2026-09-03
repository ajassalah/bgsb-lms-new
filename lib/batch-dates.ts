export type DurationUnit = "days" | "weeks" | "months" | "years";

export function batchEndDate(startDate: string, value: number, unit: DurationUnit) {
  const date = new Date(`${startDate}T00:00:00Z`);
  if (unit === "days") date.setUTCDate(date.getUTCDate() + value);
  if (unit === "weeks") date.setUTCDate(date.getUTCDate() + value * 7);
  if (unit === "months") date.setUTCMonth(date.getUTCMonth() + value);
  if (unit === "years") date.setUTCFullYear(date.getUTCFullYear() + value);
  return date.toISOString().slice(0, 10);
}
