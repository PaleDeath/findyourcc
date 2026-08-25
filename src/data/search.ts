import type { CreditCard } from "./types";

export const ISSUER_SYNONYMS: Record<string, string[]> = {
  amex: ["american express", "amex"],
  bob: ["bank of baroda", "bob", "bobcard"],
  pnb: ["punjab national bank", "pnb"],
  sbi: ["sbi card", "sbi", "state bank of india"],
  sc: ["standard chartered", "sc", "scb", "stanchart"],
  scb: ["standard chartered", "sc", "scb", "stanchart"],
  stanchart: ["standard chartered", "sc", "scb", "stanchart"],
  au: ["au small finance bank", "au bank", "aubank"],
  aubank: ["au small finance bank", "au bank", "aubank"],
  idfc: ["idfc first bank", "idfc", "idfc first"],
  ubi: ["union bank of india", "union bank"],
  union: ["union bank of india", "union bank"],
  icici: ["icici bank", "icici"],
  hdfc: ["hdfc bank", "hdfc"],
  kotak: ["kotak mahindra bank", "kotak"],
  indusind: ["indusind bank", "indusind"],
  rbl: ["rbl bank", "rbl"],
  canara: ["canara bank", "canara"],
  federal: ["federal bank", "federal"],
  dbs: ["dbs bank", "dbs"],
  hsbc: ["hsbc india", "hsbc"],
  yes: ["yes bank", "yes"],
};

export const CARD_ACRONYMS: Record<string, string[]> = {
  dcb: ["hdfc-diners-club-black-metal", "hdfc-diners-black"],
  dcbm: ["hdfc-diners-club-black-metal"],
  dcp: ["hdfc-diners-club-privilege", "hdfc-diners-privilege"],
  mrcc: ["amex-membership-rewards-credit-card", "amex-mrcc"],
  apay: ["icici-amazon-pay", "amazon-pay-icici"],
  infy: ["hdfc-infinia-metal", "hdfc-infinia"],
  bms: ["rbl-play", "kotak-pvr-inox", "kotak-pvr-platinum"],
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyMatch(word: string, token: string): boolean {
  if (token.length < 4 || Math.abs(word.length - token.length) > 2) return false;
  const maxDist = token.length <= 5 ? 1 : 2;
  return levenshtein(word, token) <= maxDist;
}

interface CardTokenInfo {
  id: string;
  nameTokens: string[];
  nameFull: string;
  issuerTokens: string[];
  issuerFull: string;
  coBrandTokens: string[];
  categoryTokens: string[];
  networkTokens: string[];
  featureTokens: string[];
  bestForTokens: string[];
}

function extractCardTokens(card: CreditCard): CardTokenInfo {
  const normName = normalize(card.name);
  const normIssuer = normalize(card.issuer);
  const normCobrand = normalize(card.coBrandPartner ?? "");
  const normCategories = card.categories.map(normalize);
  const normNetworks = card.networks.map(normalize);
  const normBestFor = card.bestFor.map(normalize);

  const features: string[] = [];
  if (card.fees.lifetimeFree) features.push("lifetime free", "ltf", "zero fee", "no annual fee");
  if (card.upi.rupayUpiLinkable) features.push("upi", "rupay upi", "bhim upi");
  if (card.benefits.loungeDomestic || card.benefits.loungeInternational)
    features.push("lounge", "airport lounge", "domestic lounge", "international lounge");
  if (card.fees.forexMarkupPct <= 1.99)
    features.push("forex", "zero forex", "low forex", "no forex");
  if (card.categories.includes("Fuel") || card.benefits.fuelSurchargeWaiver)
    features.push("fuel", "petrol", "diesel");
  if (card.benefits.movieOffers) features.push("movie", "bms", "bookmyshow", "cinema");

  return {
    id: card.id,
    nameTokens: normName.split(" ").filter(Boolean),
    nameFull: normName,
    issuerTokens: normIssuer.split(" ").filter(Boolean),
    issuerFull: normIssuer,
    coBrandTokens: normCobrand ? normCobrand.split(" ").filter(Boolean) : [],
    categoryTokens: normCategories,
    networkTokens: normNetworks,
    featureTokens: features,
    bestForTokens: normBestFor,
  };
}

export function computeCardScore(card: CreditCard, query: string, qTokens: string[]): number {
  const normQ = normalize(query);
  if (!normQ) return 100;

  const info = extractCardTokens(card);
  let score = 0;

  // 1. Direct Acronym Match (+500)
  if (CARD_ACRONYMS[normQ]?.includes(card.id)) {
    score += 500;
  }

  // 2. Full Name Exact / Prefix Match
  const combined = info.issuerFull + " " + info.nameFull;
  if (info.nameFull === normQ || combined === normQ) {
    score += 350;
  } else if (info.nameFull.startsWith(normQ) || combined.startsWith(normQ)) {
    score += 240;
  } else if (info.nameFull.includes(normQ)) {
    score += 180;
  }

  // 3. ID direct match
  if (card.id.toLowerCase().includes(normQ.replace(/\s+/g, "-"))) {
    score += 120;
  }

  // 4. Token-level matching across fields
  let matchedTokens = 0;

  for (const token of qTokens) {
    let tokenScore = 0;

    // Check Name words
    if (info.nameTokens.includes(token)) {
      tokenScore += 90;
    } else if (info.nameTokens.some((w) => w.startsWith(token))) {
      tokenScore += 60;
    } else if (info.nameFull.includes(token)) {
      tokenScore += 35;
    } else if (info.nameTokens.some((w) => isFuzzyMatch(w, token))) {
      tokenScore += 30;
    }

    // Check Issuer / Issuer Synonyms
    if (info.issuerTokens.includes(token)) {
      tokenScore += 45;
    } else if (ISSUER_SYNONYMS[token]?.some((syn) => info.issuerFull.includes(syn))) {
      tokenScore += 45;
    } else if (info.issuerTokens.some((w) => w.startsWith(token))) {
      tokenScore += 25;
    } else if (info.issuerTokens.some((w) => isFuzzyMatch(w, token))) {
      tokenScore += 20;
    }

    // Check Co-brand Partner
    if (info.coBrandTokens.includes(token)) {
      tokenScore += 65;
    } else if (info.coBrandTokens.some((w) => w.startsWith(token))) {
      tokenScore += 40;
    }

    // Check Network
    if (info.networkTokens.some((n) => n.includes(token))) {
      tokenScore += 30;
    }

    // Check Features (LTF, UPI, Lounge, Forex, Fuel, Movie)
    if (info.featureTokens.some((f) => f.includes(token))) {
      tokenScore += 35;
    }

    // Check Category
    if (info.categoryTokens.some((c) => c.includes(token))) {
      tokenScore += 20;
    }

    // Check bestFor (Demoted so it never drowns out cards with the word in their name)
    if (info.bestForTokens.some((b) => b.includes(token))) {
      tokenScore += 2;
    }

    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  }

  // Must match all tokens (or direct acronym match)
  if (matchedTokens < qTokens.length && score < 100) {
    return 0;
  }

  // Active status bonus & popularity bonus as tiebreaker
  if (card.status === "Active") score += 5;
  score += Math.min(card.popularity ?? 50, 100) / 20;
  score -= Math.min(info.nameTokens.length, 10) / 40;

  return score;
}

export function searchCreditCards(cards: CreditCard[], query: string): CreditCard[] {
  const q = query.trim();
  if (!q) return cards;

  const qTokens = normalize(q).split(" ").filter(Boolean);
  if (qTokens.length === 0) return cards;

  const scored = cards
    .map((card) => ({
      card,
      score: computeCardScore(card, q, qTokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((entry) => entry.card);
}
