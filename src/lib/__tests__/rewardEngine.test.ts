import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { DEFAULT_SPEND } from "@/lib/spend-profile";
import { bestTierFor, isCategoryExcluded, loungeAnnualValue, valueCard } from "@/lib/rewardEngine";
import { membershipLines } from "@/lib/benefit-values";

const base = ALL_CARDS.find((c) => c.status === "Active")!;

function withTiers(tiers: CreditCard["rewards"]["acceleratedEarn"]): CreditCard {
  return { ...base, rewards: { ...base.rewards, acceleratedEarn: tiers } };
}

const spend = { ...DEFAULT_SPEND, online: 20000, dining: 10000, fuel: 5000, groceries: 8000 };

describe("bestTierFor", () => {
  it("applies an all-spends accelerator to every category", () => {
    const card = withTiers([
      {
        label: "5X on all spends",
        multiplier: "5X",
        ratePct: 5,
      } as CreditCard["rewards"]["acceleratedEarn"][number],
    ]);
    expect(bestTierFor(card, "online")?.ratePct).toBe(5);
    expect(bestTierFor(card, "dining")?.ratePct).toBe(5);
    expect(bestTierFor(card, "travel")?.ratePct).toBe(5);
  });

  it("keeps a category accelerator scoped to its category", () => {
    const card = withTiers([
      {
        label: "10X on dining",
        multiplier: "10X",
        ratePct: 10,
      } as CreditCard["rewards"]["acceleratedEarn"][number],
    ]);
    expect(bestTierFor(card, "dining")?.ratePct).toBe(10);
    expect(bestTierFor(card, "fuel")).toBeNull();
  });

  it("picks the highest applicable tier", () => {
    const card = withTiers([
      {
        label: "2X on online",
        multiplier: "2X",
        ratePct: 2,
      } as CreditCard["rewards"]["acceleratedEarn"][number],
      {
        label: "6X on online shopping",
        multiplier: "6X",
        ratePct: 6,
      } as CreditCard["rewards"]["acceleratedEarn"][number],
    ]);
    expect(bestTierFor(card, "online")?.ratePct).toBe(6);
  });
});

describe("valueCard", () => {
  it("never rewards an excluded category", () => {
    for (const card of ALL_CARDS.slice(0, 50)) {
      const v = valueCard(card, spend);
      for (const cat of v.categories) {
        if (isCategoryExcluded(card, cat.key)) expect(cat.monthlyValue).toBe(0);
      }
    }
  });

  it("keeps gross = rewards + milestones + perks and net = gross - fee", () => {
    const v = valueCard(base, spend);
    expect(v.grossAnnualValue).toBe(
      v.annualRewardValue + v.milestoneAnnualValue + v.membershipValue + v.loungeValue,
    );
    expect(v.netAnnualValue).toBe(v.grossAnnualValue - v.effectiveAnnualFee);
  });

  it("reports zero break-even for a card with no effective fee", () => {
    const ltf = ALL_CARDS.find((c) => c.fees.lifetimeFree)!;
    expect(valueCard(ltf, spend).breakEvenMonthlySpend).toBe(0);
  });

  it("drops perks when the user switches them off", () => {
    const v = valueCard(base, spend, { countLounge: false, countMemberships: false });
    expect(v.loungeValue).toBe(0);
    expect(v.membershipValue).toBe(0);
    expect(v.benefitLines).toHaveLength(0);
  });

  it("caps lounge value by how often the user flies", () => {
    const flyer = ALL_CARDS.find((c) => (c.benefits.loungeDomestic?.visitsPerYear ?? 0) >= 8)!;
    expect(loungeAnnualValue(flyer, 1)).toBeLessThan(loungeAnnualValue(flyer, 10));
  });
});

describe("benefit values", () => {
  it("prices a known membership from its published retail price", () => {
    const card = { ...base, benefits: { ...base.benefits, memberships: ["Swiggy One"] } };
    const [line] = membershipLines(card);
    expect(line?.value).toBe(1199);
    expect(line?.basis).toMatch(/Swiggy One/);
  });

  it("labels unknown memberships as an estimate", () => {
    const card = { ...base, benefits: { ...base.benefits, memberships: ["Something Unheard Of"] } };
    expect(membershipLines(card)[0]?.basis).toMatch(/estimate/i);
  });
});
