import { baseRatePct, bestTierFor, isCategoryExcluded, valueCard } from "@/lib/rewardEngine";
import type { CreditCard } from "@/data/types";
import {
  SPEND_CATEGORIES,
  monthlyTotal,
  type SpendKey,
  type SpendProfile,
} from "@/lib/spend-profile";

export interface CategoryBest {
  key: SpendKey;
  label: string;
  monthlySpend: number;
  bestRatePct: number;
  winner: CreditCard | null;
  excludedOnAll: boolean;
}

/** Best available rate for a category across a set of owned cards. */
export function categoryRateForCard(
  card: CreditCard,
  key: SpendKey,
): { rate: number; excluded: boolean } {
  if (isCategoryExcluded(card, key)) return { rate: 0, excluded: true };
  const tier = bestTierFor(card, key);
  const base = baseRatePct(card);
  return { rate: tier ? Math.max(tier.ratePct, base) : base, excluded: false };
}

export function bestForCategory(
  cards: CreditCard[],
  key: SpendKey,
  monthlySpend: number,
): CategoryBest {
  const meta = SPEND_CATEGORIES.find((c) => c.key === key);
  let bestRatePct = 0;
  let winner: CreditCard | null = null;
  let anyEligible = false;
  for (const card of cards) {
    const { rate, excluded } = categoryRateForCard(card, key);
    if (excluded) continue;
    anyEligible = true;
    if (rate > bestRatePct) {
      bestRatePct = rate;
      winner = card;
    }
  }
  return {
    key,
    label: meta?.label ?? key,
    monthlySpend,
    bestRatePct,
    winner,
    excludedOnAll: cards.length > 0 && !anyEligible,
  };
}

export function coverageForWallet(cards: CreditCard[], spend: SpendProfile): CategoryBest[] {
  return SPEND_CATEGORIES.map((meta) => bestForCategory(cards, meta.key, spend[meta.key] || 0));
}

export interface OverlapWarning {
  categoryLabel: string;
  cardNames: string[];
}

export function findCategoryOverlaps(cards: CreditCard[], spend: SpendProfile): OverlapWarning[] {
  const warnings: OverlapWarning[] = [];
  for (const meta of SPEND_CATEGORIES) {
    const strong = cards.filter((c) => {
      const { rate, excluded } = categoryRateForCard(c, meta.key);
      return !excluded && rate > 3;
    });
    if (strong.length >= 2) {
      warnings.push({ categoryLabel: meta.label, cardNames: strong.map((c) => c.name) });
    }
  }
  return warnings;
}

export interface FeeOverlapWarning {
  cardNames: string[];
  totalFee: number;
}

export function findFeeOverlap(cards: CreditCard[], spend: SpendProfile): FeeOverlapWarning | null {
  const bigFeeCards = cards.filter((c) => {
    const v = valueCard(c, spend);
    return v.effectiveAnnualFee >= 2000;
  });
  if (bigFeeCards.length >= 2) {
    return {
      cardNames: bigFeeCards.map((c) => c.name),
      totalFee: bigFeeCards.reduce((s, c) => s + valueCard(c, spend).effectiveAnnualFee, 0),
    };
  }
  return null;
}

export interface WalletSummary {
  totalAnnualFee: number;
  combinedAnnualReward: number;
  combinedReturnPct: number;
}

export function summariseWallet(cards: CreditCard[], spend: SpendProfile): WalletSummary {
  const totalAnnualFee = cards.reduce((s, c) => s + valueCard(c, spend).effectiveAnnualFee, 0);
  const coverage = coverageForWallet(cards, spend);
  const combinedAnnualReward =
    coverage.reduce((s, c) => s + (c.monthlySpend * c.bestRatePct) / 100, 0) * 12;
  const annualSpend = monthlyTotal(spend) * 12;
  const combinedReturnPct = annualSpend > 0 ? (combinedAnnualReward / annualSpend) * 100 : 0;
  return { totalAnnualFee, combinedAnnualReward, combinedReturnPct };
}

export interface GapSuggestion {
  card: CreditCard;
  annualGain: number;
  category: CategoryBest;
  candidateRate: number;
}

/** From the full dataset (excluding owned), find the single card that most improves weak categories. */
export function suggestGapPlugger(
  allCards: CreditCard[],
  ownedCards: CreditCard[],
  spend: SpendProfile,
): GapSuggestion | null {
  const ownedIds = new Set(ownedCards.map((c) => c.id));
  const currentBest = coverageForWallet(ownedCards, spend);
  const candidates = allCards.filter((c) => !ownedIds.has(c.id) && c.status === "Active");

  let best: GapSuggestion | null = null;
  for (const candidate of candidates) {
    let totalGain = 0;
    let topCategory: CategoryBest | null = null;
    let topGain = -1;
    let topRate = 0;
    for (const cur of currentBest) {
      const { rate, excluded } = categoryRateForCard(candidate, cur.key);
      if (excluded) continue;
      const gain = Math.max(0, rate - cur.bestRatePct) * (cur.monthlySpend / 100) * 12;
      totalGain += gain;
      if (gain > topGain) {
        topGain = gain;
        topCategory = cur;
        topRate = rate;
      }
    }
    if (totalGain > 0 && topCategory && (!best || totalGain > best.annualGain)) {
      best = {
        card: candidate,
        annualGain: Math.round(totalGain),
        category: topCategory,
        candidateRate: topRate,
      };
    }
  }
  return best;
}
