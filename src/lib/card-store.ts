import { useMemo } from "react";
import { ALL_CARDS } from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  DEFAULT_ANSWERS,
  DEFAULT_SPEND,
  type MatchAnswers,
  type SpendProfile,
} from "@/lib/spend-profile";

export const DATASET_OVERRIDE_KEY = "dataset-override";

/** Very light structural validation — enough to reject a wrong-shaped upload. */
export function parseDataset(raw: string): { cards: CreditCard[] } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "That file isn't valid JSON." };
  }
  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" &&
        parsed !== null &&
        Array.isArray((parsed as { cards?: unknown }).cards)
      ? ((parsed as { cards: unknown[] }).cards as unknown[])
      : null;

  if (!list) return { error: "Expected an array of cards, or an object with a `cards` array." };

  for (const item of list) {
    if (typeof item !== "object" || item === null)
      return { error: "Every entry must be an object." };
    const card = item as Partial<CreditCard>;
    if (!card.id || !card.name || !card.issuer || !card.fees || !card.rewards) {
      return { error: `A card is missing required fields (id, name, issuer, fees, rewards).` };
    }
  }
  return { cards: list as CreditCard[] };
}

export function useDataset() {
  const [override, setOverride, hydrated] = usePersistentState<CreditCard[] | null>(
    DATASET_OVERRIDE_KEY,
    null,
  );

  const cards = useMemo<CreditCard[]>(
    () => (override && override.length > 0 ? override : ALL_CARDS),
    [override],
  );

  return {
    cards,
    isOverridden: Boolean(override && override.length > 0),
    setOverride,
    hydrated,
  };
}

export function useFavourites() {
  const [ids, setIds, hydrated] = usePersistentState<string[]>("favourites", []);
  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return { ids, toggle, hydrated };
}

export const MAX_COMPARE = 4;

export function useCompareTray() {
  const [ids, setIds, hydrated] = usePersistentState<string[]>("compare", []);
  const toggle = (id: string) =>
    setIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id],
    );
  const clear = () => setIds([]);
  return { ids, toggle, clear, hydrated };
}

export function useWallet() {
  const [ids, setIds, hydrated] = usePersistentState<string[]>("wallet", []);
  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const clear = () => setIds([]);
  return { ids, setIds, toggle, clear, hydrated };
}

export function useSpendProfile() {
  const [spend, setSpend, hydrated] = usePersistentState<SpendProfile>(
    "spend-profile",
    DEFAULT_SPEND,
  );
  const setCategory = (key: keyof SpendProfile, value: number) =>
    setSpend((prev) => ({ ...prev, [key]: value }));
  const reset = () => setSpend({ ...DEFAULT_SPEND });
  return { spend, setSpend, setCategory, reset, hydrated };
}

export function useMatchAnswers() {
  const [answers, setAnswers, hydrated] = usePersistentState<MatchAnswers>(
    "match-answers",
    DEFAULT_ANSWERS,
  );
  const patch = (next: Partial<MatchAnswers>) => setAnswers((prev) => ({ ...prev, ...next }));
  const reset = () => setAnswers({ ...DEFAULT_ANSWERS, spend: { ...DEFAULT_SPEND } });
  return { answers, setAnswers, patch, reset, hydrated };
}
