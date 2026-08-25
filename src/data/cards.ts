import type { Category, CreditCard, Network, Segment } from "./types";

import { amexCards } from "./issuers/amex";
import { aubankCards } from "./issuers/aubank";
import { axisCards } from "./issuers/axis";
import { bobCards } from "./issuers/bob";
import { canaraCards } from "./issuers/canara";
import { dbsCards } from "./issuers/dbs";
import { federalCards } from "./issuers/federal";
import { hdfcCards } from "./issuers/hdfc";
import { hsbcCards } from "./issuers/hsbc";
import { iciciCards } from "./issuers/icici";
import { idbiCards } from "./issuers/idbi";
import { idfcfirstCards } from "./issuers/idfcfirst";
import { indusindCards } from "./issuers/indusind";
import { kotakCards } from "./issuers/kotak";
import { onecardCards } from "./issuers/onecard";
import { othersCards } from "./issuers/others";
import { pnbCards } from "./issuers/pnb";
import { rblCards } from "./issuers/rbl";
import { sbiCards } from "./issuers/sbi";
import { standardcharteredCards } from "./issuers/standardchartered";
import { unionbankCards } from "./issuers/unionbank";
import { yesbankCards } from "./issuers/yesbank";
import { CARD_IMAGE_URLS } from "./images";

const RAW_CARDS: CreditCard[] = [
  ...hdfcCards,
  ...sbiCards,
  ...axisCards,
  ...iciciCards,
  ...amexCards,
  ...kotakCards,
  ...indusindCards,
  ...idfcfirstCards,
  ...rblCards,
  ...yesbankCards,
  ...aubankCards,
  ...standardcharteredCards,
  ...hsbcCards,
  ...federalCards,
  ...bobCards,
  ...pnbCards,
  ...unionbankCards,
  ...canaraCards,
  ...idbiCards,
  ...dbsCards,
  ...onecardCards,
  ...othersCards,
];

/** Cards with the official product image attached where we have a verified URL. */
export const ALL_CARDS: CreditCard[] = RAW_CARDS.map((card) => {
  const url = card.art.officialImageUrl ?? CARD_IMAGE_URLS[card.id];
  return url ? { ...card, art: { ...card.art, officialImageUrl: url } } : card;
});

/** How many cards currently render a real issuer image vs generated artwork. */
export function cardImageCoverage(): { withImage: number; total: number } {
  return {
    withImage: ALL_CARDS.filter((c) => Boolean(c.art.officialImageUrl)).length,
    total: ALL_CARDS.length,
  };
}

export const SEGMENTS: Segment[] = ["Entry", "Mid", "Premium", "Super Premium", "Invite Only"];

export const CATEGORIES: Category[] = [
  "Cashback",
  "Rewards",
  "Travel",
  "Fuel",
  "Shopping",
  "Dining",
  "Business",
  "Student",
  "Secured (FD)",
  "Co-branded",
  "Lifestyle",
  "Forex",
];

export const NETWORKS: Network[] = [
  "Visa",
  "Mastercard",
  "RuPay",
  "American Express",
  "Diners Club",
];

export function getCardById(cards: CreditCard[], id: string): CreditCard | undefined {
  return cards.find((card) => card.id === id);
}

/** Best-case earn rate as a percentage of spend. */
export function computeEffectiveRate(card: CreditCard): number {
  const base = card.rewards.baseRatePer100 * card.rewards.pointValueInRupees;
  return Number.isFinite(base) && base > 0
    ? Number(base.toFixed(2))
    : card.rewards.effectiveBaseRatePct;
}

export function bestAcceleratedRate(card: CreditCard): number {
  return card.rewards.acceleratedEarn.reduce(
    (max, tier) => (tier.ratePct > max ? tier.ratePct : max),
    computeEffectiveRate(card),
  );
}

export function hasLounge(card: CreditCard): boolean {
  return Boolean(card.benefits.loungeDomestic || card.benefits.loungeInternational);
}

export function listIssuers(cards: CreditCard[]): { id: string; name: string; count: number }[] {
  const map = new Map<string, { id: string; name: string; count: number }>();
  for (const card of cards) {
    const entry = map.get(card.issuerId);
    if (entry) entry.count += 1;
    else map.set(card.issuerId, { id: card.issuerId, name: card.issuer, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function totalLoungeVisits(card: CreditCard): number {
  const d = card.benefits.loungeDomestic;
  const i = card.benefits.loungeInternational;
  const domestic = d
    ? d.unlimited || (d.visitsPerYear && d.visitsPerYear >= 999)
      ? 50
      : (d.visitsPerYear ?? (d.visitsPerQuarter ?? 0) * 4)
    : 0;
  const intl = i
    ? i.unlimited || (i.visitsPerYear && i.visitsPerYear >= 999)
      ? 50
      : (i.visitsPerYear ?? 0)
    : 0;
  return domestic + intl;
}

/** Deterministic proxy for how sought-after a card is — derived, never invented per card. */
export function popularityScore(card: CreditCard): number {
  let score = 0;
  score += { Entry: 30, Mid: 45, Premium: 55, "Super Premium": 50, "Invite Only": 25 }[
    card.segment
  ];
  if (card.fees.lifetimeFree) score += 15;
  if (hasLounge(card)) score += 12;
  if (card.upi.rupayUpiLinkable) score += 6;
  if (card.coBrandPartner) score += 8;
  score += Math.min(computeEffectiveRate(card) * 4, 20);
  score += Math.min(card.rewards.acceleratedEarn.length * 2, 10);
  if (card.status !== "Active") score -= 40;
  if (card.fees.annualFee > 20000) score -= 8;
  return Math.round(score);
}

export function listCoBrandPartners(cards: CreditCard[]): string[] {
  const set = new Set<string>();
  for (const card of cards) if (card.coBrandPartner) set.add(card.coBrandPartner);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export type SortKey =
  | "relevance"
  | "rate-desc"
  | "fee-asc"
  | "fee-desc"
  | "lounge-desc"
  | "popularity"
  | "newest"
  | "name-asc"
  | "segment";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "rate-desc", label: "Effective reward rate" },
  { value: "fee-asc", label: "Annual fee (low → high)" },
  { value: "fee-desc", label: "Annual fee (high → low)" },
  { value: "lounge-desc", label: "Lounge visits" },
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest / recently verified" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "segment", label: "Segment" },
];

export const REDEMPTION_MODES = [
  "vouchers",
  "statement-credit",
  "airmiles",
  "hotels",
  "flights-hotels",
] as const;

export type RedemptionMode = (typeof REDEMPTION_MODES)[number];

export const REDEMPTION_LABELS: Record<RedemptionMode, { label: string; description: string }> = {
  vouchers: {
    label: "Gift cards & Vouchers",
    description: "Amazon, Flipkart, brand vouchers & catalogue",
  },
  "statement-credit": {
    label: "Cashback & Statement Credit",
    description: "Direct rupee credit on your card bill",
  },
  airmiles: {
    label: "Air miles & Airline transfers",
    description: "Air India, KrisFlyer, InterMiles, IndiGo 6E",
  },
  hotels: {
    label: "Hotel loyalty points",
    description: "Marriott Bonvoy, Accor, Taj & ITC transfers",
  },
  "flights-hotels": {
    label: "Flight & Hotel booking portals",
    description: "SmartBuy, Travel Edge, EaseMyTrip, Scapia",
  },
};

export function cardMatchesRedemption(card: CreditCard, mode: RedemptionMode): boolean {
  const modesLower = card.rewards.redemptionModes.map((m) => m.toLowerCase());
  const partnersLower = (card.rewards.transferPartners ?? []).map((p) => p.toLowerCase());
  const milestonesLower = card.rewards.milestones.map((m) =>
    (m.benefit + " " + m.period).toLowerCase(),
  );

  switch (mode) {
    case "vouchers":
      return (
        modesLower.some(
          (m) =>
            m.includes("voucher") ||
            m.includes("catalogue") ||
            m.includes("gift") ||
            m.includes("amazon") ||
            m.includes("flipkart") ||
            m.includes("myntra") ||
            m.includes("reliance") ||
            m.includes("shoppers stop") ||
            m.includes("titan") ||
            m.includes("tanishq") ||
            m.includes("ishop") ||
            m.includes("app rewards") ||
            m.includes("white pass"),
        ) || milestonesLower.some((m) => m.includes("voucher") || m.includes("gift"))
      );

    case "statement-credit":
      return (
        card.categories.includes("Cashback") ||
        modesLower.some(
          (m) =>
            m.includes("statement credit") ||
            m.includes("cashback") ||
            m.includes("cash credit") ||
            m.includes("app wallet") ||
            m.includes("swiggy money") ||
            m.includes("freecharge"),
        )
      );

    case "airmiles":
      return (
        partnersLower.some(
          (p) =>
            p.includes("air") ||
            p.includes("airline") ||
            p.includes("krisflyer") ||
            p.includes("miles") ||
            p.includes("indigo") ||
            p.includes("vistara") ||
            p.includes("british") ||
            p.includes("singapore") ||
            p.includes("qatar") ||
            p.includes("cathay") ||
            p.includes("etihad") ||
            p.includes("emirates") ||
            p.includes("flying blue"),
        ) ||
        modesLower.some(
          (m) =>
            m.includes("mile") ||
            m.includes("air") ||
            m.includes("airline") ||
            m.includes("indigo") ||
            m.includes("vistara") ||
            m.includes("krisflyer") ||
            m.includes("intermiles") ||
            m.includes("edge miles") ||
            m.includes("cv points"),
        )
      );

    case "hotels":
      return (
        partnersLower.some(
          (p) =>
            p.includes("marriott") ||
            p.includes("accor") ||
            p.includes("itc") ||
            p.includes("taj") ||
            p.includes("hotel") ||
            p.includes("wyndham") ||
            p.includes("hyatt") ||
            p.includes("ihg"),
        ) ||
        modesLower.some(
          (m) => m.includes("marriott") || m.includes("hotel") || m.includes("club marriott"),
        )
      );

    case "flights-hotels":
      return modesLower.some(
        (m) =>
          m.includes("smartbuy") ||
          m.includes("travel edge") ||
          m.includes("flight") ||
          m.includes("hotel") ||
          m.includes("easemytrip") ||
          m.includes("yatra") ||
          m.includes("ixigo") ||
          m.includes("scapia") ||
          m.includes("travel booking"),
      );

    default:
      return false;
  }
}

export interface CardFilters {
  query: string;
  issuerIds: string[];
  segments: Segment[];
  categories: Category[];
  networks: Network[];
  redemptions: RedemptionMode[];
  maxAnnualFee: number | null;
  lifetimeFreeOnly: boolean;
  loungeOnly: boolean;
  internationalLoungeOnly: boolean;
  rupayUpiOnly: boolean;
  zeroForexOnly: boolean;
  lowForexOnly: boolean;
  golfOnly: boolean;
  movieOffersOnly: boolean;
  diningOffersOnly: boolean;
  selfEmployedOnly: boolean;
  fdBackedOnly: boolean;
  /** The user's own monthly income — keeps cards they can actually qualify for. */
  monthlyIncome: number | null;
  /** The user's own credit score — keeps cards at or below this requirement. */
  creditScore: number | null;
  coBrandPartners: string[];
  includeArchived: boolean;
  sort: SortKey;
}

export const MAX_FEE_SLIDER = 60000;
export const LOW_FOREX_THRESHOLD = 2;

export const DEFAULT_FILTERS: CardFilters = {
  query: "",
  issuerIds: [],
  segments: [],
  categories: [],
  networks: [],
  redemptions: [],
  maxAnnualFee: null,
  lifetimeFreeOnly: false,
  loungeOnly: false,
  internationalLoungeOnly: false,
  rupayUpiOnly: false,
  zeroForexOnly: false,
  lowForexOnly: false,
  golfOnly: false,
  movieOffersOnly: false,
  diningOffersOnly: false,
  selfEmployedOnly: false,
  fdBackedOnly: false,
  monthlyIncome: null,
  creditScore: null,
  coBrandPartners: [],
  includeArchived: false,
  sort: "relevance",
};

const SEGMENT_ORDER: Record<Segment, number> = {
  Entry: 0,
  Mid: 1,
  Premium: 2,
  "Super Premium": 3,
  "Invite Only": 4,
};

function haystackFor(card: CreditCard): string {
  return [
    card.name,
    card.issuer,
    card.coBrandPartner ?? "",
    card.segment,
    ...card.categories,
    ...card.networks,
    ...card.bestFor,
  ]
    .join(" ")
    .toLowerCase();
}

import { searchCreditCards, computeCardScore } from "./search";

export function matchesQuery(card: CreditCard, query: string): boolean {
  if (!query.trim()) return true;
  const qTokens = query.trim().toLowerCase().split(/\s+/);
  return computeCardScore(card, query, qTokens) > 0;
}

export function relevanceScore(card: CreditCard, tokens: string[]): number {
  return computeCardScore(card, tokens.join(" "), tokens);
}

export function searchCards(cards: CreditCard[], query: string): CreditCard[] {
  return searchCreditCards(cards, query);
}

export function cardMonthlyIncomeRequirement(
  card: CreditCard,
  employmentType?: "Salaried" | "Self-employed" | "Student" | "NRI",
): number {
  const e = card.eligibility;
  if (employmentType === "Self-employed" && e.minAnnualIncomeSelfEmployed !== undefined) {
    return Math.round(e.minAnnualIncomeSelfEmployed / 12);
  }
  if (e.minMonthlyIncomeSalaried !== undefined) return e.minMonthlyIncomeSalaried;
  if (e.minAnnualIncomeSalaried !== undefined) return Math.round(e.minAnnualIncomeSalaried / 12);
  if (e.minAnnualIncomeSelfEmployed !== undefined)
    return Math.round(e.minAnnualIncomeSelfEmployed / 12);
  return 0;
}

export function filterCards(cards: CreditCard[], filters: CardFilters): CreditCard[] {
  // Query first, so the fuzzy fallback is decided across the whole dataset.
  const ranked = searchCards(cards, filters.query);
  const queryMatched = new Set(ranked.map((c) => c.id));
  const rank = new Map(ranked.map((c, i) => [c.id, i]));
  const hasQuery = filters.query.trim().length > 0;
  const result = cards.filter((card) => {
    if (!filters.includeArchived && card.status === "Discontinued") return false;
    if (!queryMatched.has(card.id)) return false;
    if (filters.issuerIds.length && !filters.issuerIds.includes(card.issuerId)) return false;
    if (filters.segments.length && !filters.segments.includes(card.segment)) return false;
    if (filters.categories.length && !filters.categories.some((c) => card.categories.includes(c)))
      return false;
    if (filters.networks.length && !filters.networks.some((n) => card.networks.includes(n)))
      return false;
    if (
      filters.redemptions.length &&
      !filters.redemptions.some((r) => cardMatchesRedemption(card, r))
    )
      return false;
    if (filters.maxAnnualFee !== null && card.fees.annualFee > filters.maxAnnualFee) return false;
    if (filters.lifetimeFreeOnly && !card.fees.lifetimeFree) return false;
    if (filters.loungeOnly && !hasLounge(card)) return false;
    if (filters.internationalLoungeOnly && !card.benefits.loungeInternational) return false;
    if (filters.rupayUpiOnly && !card.upi.rupayUpiLinkable) return false;
    if (filters.zeroForexOnly && card.fees.forexMarkupPct !== 0) return false;
    if (filters.lowForexOnly && card.fees.forexMarkupPct > LOW_FOREX_THRESHOLD) return false;
    if (filters.golfOnly && !card.benefits.golf) return false;
    if (filters.movieOffersOnly && !card.benefits.movieOffers) return false;
    if (
      filters.diningOffersOnly &&
      !Boolean(card.benefits.diningPrograms?.length || card.categories.includes("Dining"))
    )
      return false;
    if (filters.selfEmployedOnly && !card.eligibility.employmentTypes.includes("Self-employed"))
      return false;
    if (filters.fdBackedOnly && !card.eligibility.fdBacked) return false;
    if (
      filters.monthlyIncome !== null &&
      cardMonthlyIncomeRequirement(card) > filters.monthlyIncome
    )
      return false;
    if (filters.creditScore !== null && card.eligibility.minCreditScore > filters.creditScore)
      return false;
    if (
      filters.coBrandPartners.length &&
      (!card.coBrandPartner || !filters.coBrandPartners.includes(card.coBrandPartner))
    )
      return false;
    return true;
  });

  const sorted = [...result];
  switch (filters.sort) {
    case "rate-desc":
      sorted.sort((a, b) => bestAcceleratedRate(b) - bestAcceleratedRate(a));
      break;
    case "fee-asc":
      sorted.sort((a, b) => a.fees.annualFee - b.fees.annualFee);
      break;
    case "fee-desc":
      sorted.sort((a, b) => b.fees.annualFee - a.fees.annualFee);
      break;
    case "lounge-desc":
      sorted.sort((a, b) => totalLoungeVisits(b) - totalLoungeVisits(a));
      break;
    case "popularity":
      sorted.sort((a, b) => popularityScore(b) - popularityScore(a));
      break;
    case "newest":
      sorted.sort((a, b) => b.lastVerified.localeCompare(a.lastVerified));
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "segment":
      sorted.sort((a, b) => SEGMENT_ORDER[a.segment] - SEGMENT_ORDER[b.segment]);
      break;
    default:
      sorted.sort((a, b) => {
        if (hasQuery) {
          return (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0);
        }
        if (a.status !== b.status) return a.status === "Active" ? -1 : 1;
        return popularityScore(b) - popularityScore(a);
      });
  }
  return sorted;
}

/**
 * For the empty state: which single filter, if dropped, would bring back results?
 */
export function loosenSuggestions(
  cards: CreditCard[],
  filters: CardFilters,
): { label: string; patch: Partial<CardFilters> }[] {
  const candidates: { label: string; patch: Partial<CardFilters> }[] = [];
  const add = (label: string, patch: Partial<CardFilters>) => {
    if (filterCards(cards, { ...filters, ...patch }).length > 0) candidates.push({ label, patch });
  };
  if (filters.maxAnnualFee !== null) add("Allow any annual fee", { maxAnnualFee: null });
  if (filters.lifetimeFreeOnly) add("Include cards with a fee", { lifetimeFreeOnly: false });
  if (filters.redemptions.length) add("Drop redemption filter", { redemptions: [] });
  if (filters.loungeOnly) add("Drop the lounge requirement", { loungeOnly: false });
  if (filters.internationalLoungeOnly) add("Drop int'l lounge requirement", { internationalLoungeOnly: false });
  if (filters.rupayUpiOnly) add("Drop RuPay UPI", { rupayUpiOnly: false });
  if (filters.zeroForexOnly) add("Allow standard forex", { zeroForexOnly: false });
  if (filters.lowForexOnly) add("Allow normal forex markup", { lowForexOnly: false });
  if (filters.golfOnly) add("Drop golf requirement", { golfOnly: false });
  if (filters.movieOffersOnly) add("Drop movie perks requirement", { movieOffersOnly: false });
  if (filters.diningOffersOnly) add("Drop dining perks requirement", { diningOffersOnly: false });
  if (filters.fdBackedOnly) add("Include unsecured cards", { fdBackedOnly: false });
  if (filters.selfEmployedOnly) add("Drop self-employed filter", { selfEmployedOnly: false });
  if (filters.monthlyIncome !== null) add("Ignore income requirement", { monthlyIncome: null });
  if (filters.creditScore !== null) add("Ignore credit score requirement", { creditScore: null });
  if (filters.issuerIds.length) add("Show all issuers", { issuerIds: [] });
  if (filters.categories.length) add("Show all categories", { categories: [] });
  if (filters.segments.length) add("Show all segments", { segments: [] });
  if (filters.networks.length) add("Show all networks", { networks: [] });
  if (filters.coBrandPartners.length) add("Show all co-brands", { coBrandPartners: [] });
  if (filters.query) add(`Clear the search "${filters.query}"`, { query: "" });
  return candidates.slice(0, 4);
}

/** Cards most similar to `card` — same segment/category neighbourhood, closest fee. */
export function similarCards(cards: CreditCard[], card: CreditCard, limit = 6): CreditCard[] {
  return cards
    .filter((c) => c.id !== card.id && c.status !== "Discontinued")
    .map((c) => {
      let score = 0;
      if (c.segment === card.segment) score += 3;
      score += c.categories.filter((cat) => card.categories.includes(cat)).length * 2;
      if (c.issuerId === card.issuerId) score += 1;
      const feeGap = Math.abs(c.fees.annualFee - card.fees.annualFee);
      score += Math.max(0, 3 - feeGap / 2500);
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Cards from *other* issuers at a similar price point — the usual cross-shop set. */
export function comparedWithCards(cards: CreditCard[], card: CreditCard, limit = 6): CreditCard[] {
  return cards
    .filter((c) => c.id !== card.id && c.issuerId !== card.issuerId && c.status !== "Discontinued")
    .map((c) => ({
      c,
      score:
        (c.segment === card.segment ? 4 : 0) +
        Math.max(0, 4 - Math.abs(c.fees.annualFee - card.fees.annualFee) / 2000) +
        popularityScore(c) / 40,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}
