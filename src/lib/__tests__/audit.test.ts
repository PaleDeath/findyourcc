import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "@/data/cards";
import { AIRPORTS, BANK_LOUNGE_POLICIES } from "@/data/lounges";
import { POPULAR_MERCHANTS, MCC_CATEGORIES, CARD_MCC_RULES } from "@/data/mcc";
import { TRANSFER_PARTNERS, CARD_TRANSFERS } from "@/data/transfers";
import { LEARN_TOPICS } from "@/data/learn";
import { DEVALUATION_EVENTS } from "@/data/devaluations";
import { CURATED_STACK_COMBOS } from "@/data/combos";
import { BRAND_PORTAL_RATES } from "@/data/portals";

describe("Site-Wide Information & Compliance Audit", () => {
  it("verifies dataset size and unique IDs across all credit cards", () => {
    expect(ALL_CARDS.length).toBeGreaterThan(140);

    const ids = new Set<string>();
    for (const card of ALL_CARDS) {
      expect(card.id).toBeTruthy();
      expect(ids.has(card.id)).toBe(false); // No duplicate card IDs
      ids.add(card.id);
    }
  });

  it("audits fees, APR, and forex markup for regulatory consistency", () => {
    for (const card of ALL_CARDS) {
      // Joining & Annual Fees
      expect(card.fees.joiningFee).toBeGreaterThanOrEqual(0);
      expect(card.fees.annualFee).toBeGreaterThanOrEqual(0);
      if (card.fees.lifetimeFree) {
        expect(card.fees.annualFee).toBe(0);
      }

      // Forex markup: In India, standard credit card forex markup is between 0% and 3.5% (rarely up to 4%)
      expect(card.fees.forexMarkupPct).toBeGreaterThanOrEqual(0);
      expect(card.fees.forexMarkupPct).toBeLessThanOrEqual(4.5);

      // APR: Monthly interest rate in India is typically 1.5% to 3.99% (18% - 48% p.a.)
      // Amex Charge cards have 0% revolving APR because they are charge products (not revolving credit).
      if (card.fees.apr) {
        if (card.fees.apr.minMonthlyPct === 0 && card.fees.apr.maxMonthlyPct === 0) {
          expect(["amex-platinum-charge", "amex-gold-charge", "amex-centurion"]).toContain(card.id);
        } else {
          expect(card.fees.apr.minMonthlyPct).toBeGreaterThanOrEqual(0.5);
          expect(card.fees.apr.maxMonthlyPct).toBeLessThanOrEqual(5.0);
          expect(card.fees.apr.maxMonthlyPct).toBeGreaterThanOrEqual(card.fees.apr.minMonthlyPct);
        }
      }
    }
  });

  it("audits reward structures, point valuations, and earn caps", () => {
    for (const card of ALL_CARDS) {
      expect(card.rewards.baseRatePer100).toBeGreaterThanOrEqual(0);
      expect(card.rewards.pointValueInRupees).toBeGreaterThanOrEqual(0);
      expect(card.rewards.pointValueInRupees).toBeLessThanOrEqual(2.0); // 1 pt <= ₹2.0
      expect(card.rewards.effectiveBaseRatePct).toBeGreaterThanOrEqual(0);
      expect(card.rewards.effectiveBaseRatePct).toBeLessThanOrEqual(35.0); // Realistic max base earn

      // Accelerated tiers
      for (const tier of card.rewards.acceleratedEarn) {
        expect(tier.ratePct).toBeGreaterThanOrEqual(0);
        expect(tier.ratePct).toBeLessThanOrEqual(50.0);
      }

      // Milestones
      for (const ms of card.rewards.milestones) {
        expect(ms.spend).toBeGreaterThan(0);
        expect(["Monthly", "Quarterly", "Annual"]).toContain(ms.period);
      }
    }
  });

  it("audits eligibility criteria (Age, CIBIL/Credit Score, Employment)", () => {
    for (const card of ALL_CARDS) {
      expect(card.eligibility.minAge).toBeGreaterThanOrEqual(18);
      expect(card.eligibility.maxAge).toBeLessThanOrEqual(75);
      
      // Secured (FD-backed) cards accept new-to-credit (score 0), whereas unsecured cards require 600+
      const isSecured = card.eligibility.fdBacked || card.categories.includes("Secured (FD)");
      if (isSecured) {
        expect(card.eligibility.minCreditScore).toBeGreaterThanOrEqual(0);
      } else {
        expect(card.eligibility.minCreditScore).toBeGreaterThanOrEqual(600);
        expect(card.eligibility.minCreditScore).toBeLessThanOrEqual(850);
      }

      expect(card.eligibility.employmentTypes.length).toBeGreaterThan(0);
    }
  });

  it("verifies no placeholder or dummy strings exist in card dossiers", () => {
    const forbidden = ["lorem", "ipsum", "dummy", "placeholder", "tbd", "todo", "sample data", "test card"];

    for (const card of ALL_CARDS) {
      const cardString = JSON.stringify(card).toLowerCase();
      for (const word of forbidden) {
        expect(cardString.includes(word)).toBe(false);
      }
      // Date verification
      expect(card.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("audits airport lounges and 2026 bank policies", () => {
    expect(AIRPORTS.length).toBeGreaterThanOrEqual(15);
    for (const airport of AIRPORTS) {
      expect(airport.code).toMatch(/^[A-Z]{3}$/);
      expect(airport.city).toBeTruthy();
      expect(airport.lounges.length).toBeGreaterThan(0);
      for (const lounge of airport.lounges) {
        expect(lounge.name).toBeTruthy();
        expect(lounge.terminal).toBeTruthy();
        expect(["Domestic", "International"]).toContain(lounge.type);
        expect(lounge.accessPrograms.length).toBeGreaterThan(0);
      }
    }

    // Bank policies
    const majorBanks = ["hdfc", "icici", "axis", "sbi", "idfcfirst", "indusind", "kotak", "aubank", "amex"];
    for (const bank of majorBanks) {
      const policy = BANK_LOUNGE_POLICIES[bank];
      expect(policy).toBeDefined();
      expect(policy?.spendCriteriaSummary).toBeTruthy();
      expect(policy?.appPath).toBeTruthy();
    }
  });

  it("audits MCC merchant definitions, categories, and card exclusion rules", () => {
    expect(POPULAR_MERCHANTS.length).toBeGreaterThanOrEqual(20);
    for (const merchant of POPULAR_MERCHANTS) {
      expect(merchant.id).toBeTruthy();
      expect(merchant.name).toBeTruthy();
      expect(merchant.mcc).toMatch(/\d{4}/);
    }

    expect(MCC_CATEGORIES.length).toBeGreaterThanOrEqual(15);
    for (const cat of MCC_CATEGORIES) {
      expect(cat.code).toMatch(/^\d{4}$/);
      expect(cat.name).toBeTruthy();
    }

    for (const rule of CARD_MCC_RULES) {
      expect(rule.cardId).toBeTruthy();
      expect(rule.cardName).toBeTruthy();
      expect(rule.mccRules.length).toBeGreaterThan(0);
      for (const mr of rule.mccRules) {
        expect(mr.ratePct).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("audits points & miles transfer partner ratios and sweetspots", () => {
    expect(TRANSFER_PARTNERS.length).toBeGreaterThanOrEqual(8);
    for (const partner of TRANSFER_PARTNERS) {
      expect(partner.id).toBeTruthy();
      expect(partner.name).toBeTruthy();
      expect(partner.approxValueINR).toBeGreaterThan(0);
      expect(partner.popularSweetspots.length).toBeGreaterThan(0);
    }

    for (const ct of CARD_TRANSFERS) {
      expect(ct.cardId).toBeTruthy();
      expect(ct.transferPartners.length).toBeGreaterThan(0);
      for (const tp of ct.transferPartners) {
        expect(tp.cardPointsRequired).toBeGreaterThan(0);
        expect(tp.partnerPointsReceived).toBeGreaterThan(0);
        expect(tp.minTransferBlock).toBeGreaterThan(0);
      }
    }
  });

  it("audits educational learn topics for accuracy and completeness", () => {
    expect(LEARN_TOPICS.length).toBeGreaterThanOrEqual(5);
    for (const topic of LEARN_TOPICS) {
      expect(topic.slug).toBeTruthy();
      expect(topic.title).toBeTruthy();
      expect(topic.summary).toBeTruthy();
      expect(topic.blocks.length).toBeGreaterThan(0);
    }
  });

  it("audits devaluation tracker events and pivot alternatives", () => {
    expect(DEVALUATION_EVENTS.length).toBeGreaterThanOrEqual(5);
    for (const event of DEVALUATION_EVENTS) {
      expect(event.id).toBeTruthy();
      expect(event.cardId).toBeTruthy();
      expect(event.cardName).toBeTruthy();
      expect(event.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["Critical", "Moderate", "Minor", "Positive"]).toContain(event.severity);
      expect(event.changes.length).toBeGreaterThan(0);
      for (const change of event.changes) {
        expect(change.aspect).toBeTruthy();
        expect(change.before).toBeTruthy();
        expect(change.after).toBeTruthy();
      }
    }
  });

  it("audits curated stack combos and synergy structures", () => {
    expect(CURATED_STACK_COMBOS.length).toBeGreaterThanOrEqual(4);
    for (const combo of CURATED_STACK_COMBOS) {
      expect(combo.id).toBeTruthy();
      expect(combo.title).toBeTruthy();
      expect(combo.cards.length).toBeGreaterThanOrEqual(2);
      expect(combo.blendedEffectiveReturnPct).toBeGreaterThan(0);
      expect(combo.annualValueEstimate.netProfitRupees).toBeGreaterThan(0);
      expect(combo.whyItWorks.length).toBeGreaterThan(0);
      expect(combo.watchOuts.length).toBeGreaterThan(0);
    }
  });

  it("audits brand voucher portal rates and channels", () => {
    expect(BRAND_PORTAL_RATES.length).toBeGreaterThanOrEqual(5);
    for (const brand of BRAND_PORTAL_RATES) {
      expect(brand.brandId).toBeTruthy();
      expect(brand.brandName).toBeTruthy();
      expect(brand.bestRatePct).toBeGreaterThan(0);
      expect(brand.rates.length).toBeGreaterThanOrEqual(3);
      for (const rate of brand.rates) {
        expect(rate.cardId).toBeTruthy();
        expect(rate.effectiveEarnPct).toBeGreaterThan(0);
        expect(rate.portalName).toBeTruthy();
      }
    }
  });
});
