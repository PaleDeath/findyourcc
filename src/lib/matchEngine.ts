import type { CreditCard } from "@/data/types";
import { cardMonthlyIncomeRequirement, hasLounge, totalLoungeVisits } from "@/data/cards";
import { valueCard, type CardValuation } from "@/lib/rewardEngine";
import { SCORE_BANDS, type Brand, type Goal, type MatchAnswers } from "@/lib/spend-profile";

export interface MatchFactor {
  label: string;
  detail: string;
  points: number;
}

export interface MatchResult {
  card: CreditCard;
  valuation: CardValuation;
  score: number;
  projectedAnnualValue: number;
  factors: MatchFactor[];
  /** Populated for near-misses so we can say why a card *didn't* win. */
  rejection?: string;
}

const GOAL_CATEGORY: Record<Goal, string[]> = {
  cashback: ["Cashback"],
  travel: ["Travel", "Forex"],
  lounge: ["Travel", "Lifestyle"],
  "first-card": ["Entry", "Rewards", "Cashback"],
  "build-credit": ["Secured (FD)", "Student"],
  business: ["Business"],
};

const BRAND_HINTS: Record<Brand, string[]> = {
  Amazon: ["amazon"],
  Flipkart: ["flipkart"],
  Swiggy: ["swiggy"],
  Zomato: ["zomato"],
  Myntra: ["myntra"],
  "Tata Neu": ["tata neu", "tata"],
  IRCTC: ["irctc", "railway"],
  Uber: ["uber"],
  BookMyShow: ["bookmyshow", "movie"],
};

function brandOverlap(card: CreditCard, brands: Brand[]): { count: number; names: string[] } {
  const haystack = [
    card.name,
    card.coBrandPartner ?? "",
    ...card.rewards.acceleratedEarn.flatMap((t) => [t.label, ...(t.brands ?? [])]),
    ...card.bestFor,
  ]
    .join(" ")
    .toLowerCase();
  const names = brands.filter((b) => BRAND_HINTS[b].some((k) => haystack.includes(k)));
  return { count: names.length, names };
}

export interface EligibilityCheck {
  eligible: boolean;
  reason?: string;
}

export function checkEligibility(card: CreditCard, answers: MatchAnswers): EligibilityCheck {
  if (card.status === "Discontinued")
    return { eligible: false, reason: "No longer offered to new applicants" };
  if (card.status === "Invite Only" || card.segment === "Invite Only")
    return { eligible: false, reason: "Invite-only — the bank has to approach you" };

  const requiredIncome = cardMonthlyIncomeRequirement(card, answers.employment);
  if (requiredIncome > answers.monthlyIncome && !card.eligibility.fdBacked) {
    return {
      eligible: false,
      reason: `Needs about ₹${requiredIncome.toLocaleString("en-IN")}/month income`,
    };
  }

  const score = SCORE_BANDS.find((b) => b.value === answers.scoreBand)?.approx ?? 730;
  if (card.eligibility.minCreditScore > score && !card.eligibility.fdBacked) {
    return {
      eligible: false,
      reason: `Usually needs a credit score of ${card.eligibility.minCreditScore}+`,
    };
  }

  if (!card.eligibility.employmentTypes.includes(answers.employment)) {
    return {
      eligible: false,
      reason: `Not offered to ${answers.employment.toLowerCase()} applicants`,
    };
  }

  return { eligible: true };
}

function goalBonus(card: CreditCard, goal: Goal, valuation: CardValuation): MatchFactor | null {
  const wanted = GOAL_CATEGORY[goal];
  switch (goal) {
    case "lounge": {
      const visits = totalLoungeVisits(card);
      if (!hasLounge(card)) return null;
      return {
        label: "Lounge access matches your goal",
        detail: `${visits} lounge visits a year, worth about ₹${valuation.loungeValue.toLocaleString("en-IN")}`,
        points: Math.min(visits * 400, 6000),
      };
    }
    case "travel": {
      const partners = card.rewards.transferPartners?.length ?? 0;
      if (!card.categories.includes("Travel") && partners === 0) return null;
      return {
        label: "Built for travel",
        detail:
          partners > 0
            ? `${partners} airline/hotel transfer partners`
            : "Travel-focused earn structure",
        points: 2000 + partners * 300,
      };
    }
    case "build-credit":
      if (!card.eligibility.fdBacked) return null;
      return {
        label: "Approval-friendly",
        detail: "FD-backed, so approval doesn't hinge on your score",
        points: 4000,
      };
    case "first-card":
      if (card.fees.lifetimeFree)
        return {
          label: "Easy first card",
          detail: "Lifetime free — no cost to keep it open",
          points: 3500,
        };
      if (card.segment === "Entry")
        return {
          label: "Entry-level card",
          detail: "Low bar for a first credit card",
          points: 2000,
        };
      return null;
    default: {
      if (!card.categories.some((c) => wanted.includes(c))) return null;
      return {
        label: `Matches your ${goal === "business" ? "business" : "cashback"} goal`,
        detail: `Categorised as ${card.categories.filter((c) => wanted.includes(c)).join(", ")}`,
        points: 2500,
      };
    }
  }
}

export function scoreCard(card: CreditCard, answers: MatchAnswers): MatchResult {
  const valuation = valueCard(card, answers.spend, {
    tripsPerYear: answers.travelPerYear,
    international: answers.international,
  });

  const factors: MatchFactor[] = [];

  factors.push({
    label: "Rewards on your actual spending",
    detail: `₹${Math.round(valuation.annualRewardValue).toLocaleString("en-IN")} a year at an effective ${valuation.effectiveReturnPct}%`,
    points: valuation.annualRewardValue,
  });

  if (valuation.milestoneAnnualValue > 0) {
    factors.push({
      label: "Milestone benefits you'd actually hit",
      detail: `₹${valuation.milestoneAnnualValue.toLocaleString("en-IN")} of vouchers/benefits unlocked by your spend`,
      points: valuation.milestoneAnnualValue,
    });
  }
  if (valuation.membershipValue > 0) {
    factors.push({
      label: "Bundled memberships",
      detail: (card.benefits.memberships ?? []).join(", "),
      points: valuation.membershipValue,
    });
  }
  if (valuation.loungeValue > 0) {
    factors.push({
      label: "Lounge value for your travel",
      detail: `Based on ${answers.travelPerYear} trips a year${answers.international ? " including international" : ""}`,
      points: valuation.loungeValue,
    });
  }
  if (valuation.effectiveAnnualFee > 0) {
    factors.push({
      label: "Annual fee",
      detail: card.fees.feeWaiverSpend
        ? `₹${card.fees.annualFee.toLocaleString("en-IN")} — waived above ₹${card.fees.feeWaiverSpend.toLocaleString("en-IN")} annual spend, which you don't reach`
        : `₹${card.fees.annualFee.toLocaleString("en-IN")} every year`,
      points: -valuation.effectiveAnnualFee,
    });
  } else if (card.fees.lifetimeFree) {
    factors.push({ label: "Lifetime free", detail: "No annual fee, ever", points: 1000 });
  }

  const goal = goalBonus(card, answers.goal, valuation);
  if (goal) factors.push(goal);

  const brands = brandOverlap(card, answers.brands);
  if (brands.count > 0) {
    factors.push({
      label: "Matches brands you already use",
      detail: `Boosted earn on ${brands.names.join(", ")}`,
      points: brands.count * 1200,
    });
  }

  if (valuation.excludedMonthlySpend > 0) {
    factors.push({
      label: "Part of your spend earns nothing",
      detail: `₹${valuation.excludedMonthlySpend.toLocaleString("en-IN")}/month falls under this card's exclusions`,
      points: -Math.min(valuation.excludedMonthlySpend * 12 * 0.01, 4000),
    });
  }

  if (card.fees.annualFee > answers.feeTolerance) {
    factors.push({
      label: "Above your fee comfort",
      detail: `₹${card.fees.annualFee.toLocaleString("en-IN")} fee vs your ₹${answers.feeTolerance.toLocaleString("en-IN")} limit`,
      points: -(card.fees.annualFee - answers.feeTolerance),
    });
  }

  if (answers.existingCardIds.includes(card.id)) {
    factors.push({
      label: "You already hold this card",
      detail: "Excluded from new suggestions",
      points: -100000,
    });
  }

  const score = Math.round(factors.reduce((s, f) => s + f.points, 0));

  return {
    card,
    valuation,
    score,
    projectedAnnualValue: Math.round(valuation.netAnnualValue),
    factors: factors.sort((a, b) => Math.abs(b.points) - Math.abs(a.points)),
  };
}

export interface MatchOutcome {
  top: MatchResult[];
  nearMisses: MatchResult[];
  rejected: { card: CreditCard; reason: string }[];
  consideredCount: number;
}

export function runMatch(cards: CreditCard[], answers: MatchAnswers, topN = 5): MatchOutcome {
  const eligible: CreditCard[] = [];
  const rejected: { card: CreditCard; reason: string }[] = [];

  for (const card of cards) {
    const check = checkEligibility(card, answers);
    if (check.eligible) eligible.push(card);
    else rejected.push({ card, reason: check.reason ?? "Not eligible" });
  }

  const scored = eligible.map((card) => scoreCard(card, answers)).sort((a, b) => b.score - a.score);

  const top = scored.slice(0, topN);
  const nearMisses = scored.slice(topN, topN + 3).map((r) => {
    const best = top[0];
    const gap = best ? best.score - r.score : 0;
    const weakest = [...r.factors].sort((a, b) => a.points - b.points)[0];
    return {
      ...r,
      rejection:
        weakest && weakest.points < 0
          ? `${weakest.label.toLowerCase()} — ${weakest.detail}`
          : `worth about ₹${gap.toLocaleString("en-IN")} less a year on your profile`,
    };
  });

  return { top, nearMisses, rejected, consideredCount: eligible.length };
}
