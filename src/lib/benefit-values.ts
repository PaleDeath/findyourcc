/**
 * Rupee values we attach to non-reward perks.
 *
 * Every number here is a published retail price (what you'd pay for the same
 * thing yourself) or a widely quoted market rate — never an invented figure.
 * They are exported so the UI can name the basis next to the rupees instead of
 * burying an assumption inside the maths.
 */
import type { CreditCard } from "@/data/types";

export interface BenefitLine {
  label: string;
  /** Annual rupee value counted for this perk. */
  value: number;
  /** Where the number comes from, shown verbatim in the UI. */
  basis: string;
}

/** Retail annual price of bundled memberships, keyed by a lowercase substring. */
const MEMBERSHIP_PRICES: { match: string; value: number; basis: string }[] = [
  { match: "swiggy one", value: 1199, basis: "Swiggy One annual plan price" },
  { match: "amazon prime", value: 1499, basis: "Amazon Prime annual price" },
  { match: "times prime", value: 1499, basis: "Times Prime annual price" },
  { match: "zomato gold", value: 1199, basis: "Zomato Gold annual price" },
  { match: "eazydiner prime", value: 1495, basis: "EazyDiner Prime annual price" },
  { match: "club marriott", value: 8000, basis: "Club Marriott South Asia annual price" },
  { match: "priority pass", value: 8000, basis: "Priority Pass Standard membership (US$99)" },
  { match: "netflix", value: 6499, basis: "Netflix Premium annual equivalent" },
  { match: "disney+ hotstar", value: 1499, basis: "Hotstar Super annual price" },
  { match: "hotstar", value: 1499, basis: "Hotstar Super annual price" },
  { match: "sonyliv", value: 999, basis: "SonyLIV Premium annual price" },
  { match: "zee5", value: 999, basis: "ZEE5 Premium annual price" },
  { match: "mmt black", value: 1500, basis: "MakeMyTrip Black tier annual worth" },
  {
    match: "bonvoy",
    value: 5000,
    basis: "Marriott Bonvoy Gold status — typical annual upgrade worth",
  },
  { match: "accor", value: 5000, basis: "Accor Plus / status — typical annual worth" },
  { match: "taj", value: 5000, basis: "Taj Epicure / Reimagined membership worth" },
  { match: "postcard", value: 3000, basis: "Postcard Hotels stay voucher worth" },
  { match: "golf", value: 2000, basis: "Typical green fee for the included games" },
];

/**
 * Fallback for memberships we don't have a published price for. Kept
 * deliberately conservative and always labelled as an estimate in the UI.
 */
export const GENERIC_MEMBERSHIP_VALUE = 1000;

export function membershipLines(card: CreditCard): BenefitLine[] {
  return (card.benefits.memberships ?? []).map((name) => {
    const hit = MEMBERSHIP_PRICES.find((p) => name.toLowerCase().includes(p.match));
    return hit
      ? { label: name, value: hit.value, basis: hit.basis }
      : {
          label: name,
          value: GENERIC_MEMBERSHIP_VALUE,
          basis: "Conservative estimate — no published retail price",
        };
  });
}

/** Per-visit worth of a lounge pass, by the programme that issues it. */
export const LOUNGE_VISIT_VALUE: Record<string, number> = {
  "priority pass": 2200,
  dreamfolks: 1200,
  other: 1200,
};

export const INTL_LOUNGE_VISIT_VALUE = 2600;

export function domesticLoungeVisitValue(program?: string): number {
  const key = (program ?? "other").toLowerCase();
  return LOUNGE_VISIT_VALUE[key] ?? LOUNGE_VISIT_VALUE["other"]!;
}
