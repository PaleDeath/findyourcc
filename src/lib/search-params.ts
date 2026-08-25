import { CATEGORIES, NETWORKS, REDEMPTION_MODES, SEGMENTS, type RedemptionMode } from "@/data/cards";
import type { Category, Network, Segment } from "@/data/types";

/** URL search-param coercion helpers. Kept out of route files so automatic
 * route code-splitting cannot strip them from the shared chunk. */

export function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function bool(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true;
  return undefined;
}

export function num(value: unknown): number | undefined {
  if (value === "" || value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function csv(value: unknown): string[] {
  const s = str(value);
  return s ? s.split(",").filter(Boolean) : [];
}

/** Drop values that are not part of the enum so a stale link degrades to
 * "no filter" instead of silently matching nothing. */
function only<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export function csvSegments(value: unknown): Segment[] {
  return only(csv(value), SEGMENTS);
}

export function csvCategories(value: unknown): Category[] {
  return only(csv(value), CATEGORIES);
}

export function csvNetworks(value: unknown): Network[] {
  return only(csv(value), NETWORKS);
}

export function csvRedemptions(value: unknown): RedemptionMode[] {
  return only(csv(value), REDEMPTION_MODES);
}
