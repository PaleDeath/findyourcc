import { getNumberFormatMode } from "./format-prefs";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Indian numbering system, e.g. ₹1,50,000. */
export function formatINR(amount: number): string {
  return inr.format(amount);
}

export function formatFee(amount: number): string {
  return amount === 0 ? "Nil" : formatINR(amount);
}

/**
 * Short form (₹1.5 L) unless the user has chosen full Indian numbering in Settings.
 */
export function formatCompactINR(amount: number): string {
  if (getNumberFormatMode() === "full") return formatINR(amount);
  if (amount >= 10000000)
    return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return formatINR(amount);
}

export function formatPct(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(2).replace(/0$/, "")}%`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
