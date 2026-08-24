import type { AcceleratedEarn, CreditCard } from "@/data/types";
import {
  domesticLoungeVisitValue,
  INTL_LOUNGE_VISIT_VALUE,
  membershipLines,
  type BenefitLine,
} from "@/lib/benefit-values";
import { SPEND_CATEGORIES, type SpendKey, type SpendProfile } from "@/lib/spend-profile";

/**
 * A deliberately transparent, rule-based earn model.
 *
 * We never invent numbers: every rate below traces back to a field on the card
 * (base rate, an accelerated-earn tier, or an earning exclusion), and the
 * breakdown returned here is what the UI shows the user line by line.
 */

const CATEGORY_KEYWORDS: Record<SpendKey, string[]> = {
  online: [
    "online",
    "e-commerce",
    "ecommerce",
    "amazon",
    "flipkart",
    "myntra",
    "shopping",
    "quick commerce",
    "tata neu",
    "smartbuy",
    "partner brand",
  ],
  groceries: ["grocer", "supermarket", "departmental", "bigbasket", "dmart", "kirana"],
  dining: ["dining", "restaurant", "food", "swiggy", "zomato", "eazydiner"],
  fuel: ["fuel", "petrol", "diesel", "hpcl", "bpcl", "indianoil", "iocl"],
  travel: [
    "travel",
    "flight",
    "hotel",
    "airline",
    "air ticket",
    "irctc",
    "makemytrip",
    "cleartrip",
    "uber",
    "ola",
    "cab",
    "forex",
    "international spend",
    "overseas",
  ],
  bills: [
    "utility",
    "utilities",
    "bill",
    "electricity",
    "telecom",
    "mobile recharge",
    "broadband",
    "dth",
  ],
  rent: ["rent"],
  education: ["education", "school", "college", "tuition"],
  insurance: ["insurance", "premium"],
  offline: ["offline", "retail", "in-store"],
};

/**
 * Tiers that apply to *every* category rather than one of them. Previously
 * these were filed under "offline", so an all-spends accelerator silently
 * failed to lift online, dining or travel earn.
 */
const ALL_SPENDS_KEYWORDS = ["all spends", "all retail spends", "everywhere", "every spend"];

const EXCLUSION_KEYWORDS: Record<SpendKey, string[]> = {
  online: ["e-commerce", "online gaming"],
  groceries: ["grocer", "supermarket"],
  dining: [],
  fuel: ["fuel", "petrol"],
  travel: [],
  bills: ["utility", "utilities", "bill payment", "telecom"],
  rent: ["rent"],
  education: ["education", "school fee", "tuition"],
  insurance: ["insurance"],
  offline: [],
};

function matches(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

export function isCategoryExcluded(card: CreditCard, key: SpendKey): boolean {
  const words = EXCLUSION_KEYWORDS[key];
  if (words.length === 0) return false;
  return card.rewards.earningExclusions.some((ex) => matches(ex, words));
}

export function bestTierFor(card: CreditCard, key: SpendKey): AcceleratedEarn | null {
  let best: AcceleratedEarn | null = null;
  for (const tier of card.rewards.acceleratedEarn) {
    const haystack = [tier.label, ...(tier.brands ?? [])].join(" ");
    const applies =
      matches(haystack, CATEGORY_KEYWORDS[key]) || matches(haystack, ALL_SPENDS_KEYWORDS);
    if (applies) {
      if (!best || tier.ratePct > best.ratePct) best = tier;
    }
  }
  return best;
}

export function baseRatePct(card: CreditCard): number {
  const derived = card.rewards.baseRatePer100 * card.rewards.pointValueInRupees;
  return derived > 0 ? derived : card.rewards.effectiveBaseRatePct;
}

export interface CategoryEarn {
  key: SpendKey;
  label: string;
  monthlySpend: number;
  ratePct: number;
  excluded: boolean;
  cappedAt?: number;
  reason: string;
  monthlyValue: number;
}

export interface MilestoneHit {
  label: string;
  spendRequired: number;
  period: string;
  achieved: boolean;
  progressPct: number;
  annualValue: number;
}

export interface CardValuation {
  card: CreditCard;
  categories: CategoryEarn[];
  monthlyRewardValue: number;
  annualRewardValue: number;
  excludedMonthlySpend: number;
  milestones: MilestoneHit[];
  milestoneAnnualValue: number;
  membershipValue: number;
  loungeValue: number;
  /** Line-by-line perk valuation, each with the basis for its rupee figure. */
  benefitLines: BenefitLine[];
  effectiveAnnualFee: number;
  feeWaived: boolean;
  grossAnnualValue: number;
  netAnnualValue: number;
  effectiveReturnPct: number;
  /** Monthly spend needed (at this card's blended rate) to cover its annual fee. */
  breakEvenMonthlySpend: number | null;
}

/**
 * Lounge worth is derived per card from the programme on the card itself
 * (Priority Pass passes cost more than DreamFolks ones), capped by how often
 * the user says they actually fly.
 */
export function loungeLines(
  card: CreditCard,
  tripsPerYear = 4,
  international = false,
): BenefitLine[] {
  const lines: BenefitLine[] = [];
  const d = card.benefits.loungeDomestic;
  const i = card.benefits.loungeInternational;
  if (d) {
    const entitled = d.visitsPerYear ?? (d.visitsPerQuarter ?? 0) * 4;
    const usable = Math.min(entitled, Math.max(tripsPerYear, 0) * 2);
    const perVisit = domesticLoungeVisitValue(d.program);
    if (usable > 0) {
      lines.push({
        label: `Domestic lounge — ${usable} visit${usable === 1 ? "" : "s"} used`,
        value: Math.round(usable * perVisit),
        basis: `${d.program ?? "Lounge"} walk-in rate of ₹${perVisit} per visit, capped at 2 per trip`,
      });
    }
  }
  if (i && international) {
    const intlVisits = Math.min(i.visitsPerYear ?? 0, 6);
    if (intlVisits > 0) {
      lines.push({
        label: `International lounge — ${intlVisits} visits`,
        value: Math.round(intlVisits * INTL_LOUNGE_VISIT_VALUE),
        basis: `${i.program ?? "Lounge"} international walk-in rate of ₹${INTL_LOUNGE_VISIT_VALUE} per visit`,
      });
    }
  }
  return lines;
}

export function loungeAnnualValue(
  card: CreditCard,
  tripsPerYear = 4,
  international = false,
): number {
  return loungeLines(card, tripsPerYear, international).reduce((s, l) => s + l.value, 0);
}

export function membershipAnnualValue(card: CreditCard): number {
  return membershipLines(card).reduce((s, l) => s + l.value, 0);
}

export interface ValuationOptions {
  tripsPerYear?: number;
  international?: boolean;
  countLounge?: boolean;
  countMemberships?: boolean;
}

export function valueCard(
  card: CreditCard,
  spend: SpendProfile,
  options: ValuationOptions = {},
): CardValuation {
  const {
    tripsPerYear = 4,
    international = false,
    countLounge = true,
    countMemberships = true,
  } = options;

  const base = baseRatePct(card);
  const categories: CategoryEarn[] = SPEND_CATEGORIES.map((meta) => {
    const monthlySpend = spend[meta.key] || 0;
    const excluded = isCategoryExcluded(card, meta.key);
    if (excluded) {
      return {
        key: meta.key,
        label: meta.label,
        monthlySpend,
        ratePct: 0,
        excluded: true,
        reason: "Excluded from rewards by the issuer",
        monthlyValue: 0,
      };
    }
    const tier = bestTierFor(card, meta.key);
    const ratePct = tier ? Math.max(tier.ratePct, base) : base;
    let monthlyValue = (monthlySpend * ratePct) / 100;
    let cappedAt: number | undefined;
    if (tier?.monthlyCapPoints) {
      const capValue = tier.monthlyCapPoints * card.rewards.pointValueInRupees;
      if (monthlyValue > capValue) {
        const cappedSpend = (capValue * 100) / ratePct;
        const overflow = Math.max(monthlySpend - cappedSpend, 0);
        monthlyValue = capValue + (overflow * base) / 100;
        cappedAt = Math.round(capValue);
      }
    }
    return {
      key: meta.key,
      label: meta.label,
      monthlySpend,
      ratePct,
      excluded: false,
      ...(cappedAt !== undefined ? { cappedAt } : {}),
      reason: tier ? `${tier.multiplier} — ${tier.label}` : "Base earn rate",
      monthlyValue: Math.round(monthlyValue),
    };
  });

  const monthlyRewardValue = categories.reduce((s, c) => s + c.monthlyValue, 0);
  const annualRewardValue = monthlyRewardValue * 12;
  const excludedMonthlySpend = categories
    .filter((c) => c.excluded)
    .reduce((s, c) => s + c.monthlySpend, 0);

  const monthlySpendTotal = categories.reduce((s, c) => s + c.monthlySpend, 0);
  const annualSpend = monthlySpendTotal * 12;

  const milestones: MilestoneHit[] = card.rewards.milestones.map((m) => {
    const periodSpend =
      m.period === "Monthly"
        ? monthlySpendTotal
        : m.period === "Quarterly"
          ? monthlySpendTotal * 3
          : annualSpend;
    const achieved = periodSpend >= m.spend;
    const times = m.period === "Monthly" ? 12 : m.period === "Quarterly" ? 4 : 1;
    return {
      label: m.benefit,
      spendRequired: m.spend,
      period: m.period,
      achieved,
      progressPct: m.spend > 0 ? Math.min(100, Math.round((periodSpend / m.spend) * 100)) : 100,
      annualValue: achieved ? (m.valueInRupees ?? 0) * times : 0,
    };
  });
  const milestoneAnnualValue = milestones.reduce((s, m) => s + m.annualValue, 0);

  const membershipPerks = countMemberships ? membershipLines(card) : [];
  const loungePerks = countLounge ? loungeLines(card, tripsPerYear, international) : [];
  const benefitLines = [...loungePerks, ...membershipPerks];
  const membershipValue = membershipPerks.reduce((s, l) => s + l.value, 0);
  const loungeValue = loungePerks.reduce((s, l) => s + l.value, 0);

  const feeWaived =
    card.fees.lifetimeFree ||
    (card.fees.feeWaiverSpend !== undefined && annualSpend >= card.fees.feeWaiverSpend);
  const effectiveAnnualFee = feeWaived ? 0 : card.fees.annualFee;

  const grossAnnualValue = annualRewardValue + milestoneAnnualValue + membershipValue + loungeValue;
  const netAnnualValue = grossAnnualValue - effectiveAnnualFee;
  const effectiveReturnPct = annualSpend > 0 ? (annualRewardValue / annualSpend) * 100 : 0;

  const blendedRate = annualSpend > 0 ? annualRewardValue / annualSpend : 0;
  const breakEvenMonthlySpend =
    effectiveAnnualFee > 0 && blendedRate > 0
      ? Math.round(effectiveAnnualFee / blendedRate / 12)
      : effectiveAnnualFee > 0
        ? null
        : 0;

  return {
    card,
    categories,
    monthlyRewardValue,
    annualRewardValue,
    excludedMonthlySpend,
    milestones,
    milestoneAnnualValue,
    membershipValue,
    loungeValue,
    benefitLines,
    effectiveAnnualFee,
    feeWaived,
    grossAnnualValue,
    netAnnualValue,
    effectiveReturnPct: Number(effectiveReturnPct.toFixed(2)),
    breakEvenMonthlySpend,
  };
}
