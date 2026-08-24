/**
 * Shared spend-profile model used by the Match quiz, Calculator and Wallet pages.
 * Everything is client-side and persisted in localStorage under `spend-profile`.
 */

export type SpendKey =
  | "online"
  | "groceries"
  | "dining"
  | "fuel"
  | "travel"
  | "bills"
  | "rent"
  | "education"
  | "insurance"
  | "offline";

export interface SpendCategoryMeta {
  key: SpendKey;
  label: string;
  hint: string;
  max: number;
}

export const SPEND_CATEGORIES: SpendCategoryMeta[] = [
  {
    key: "online",
    label: "Online shopping",
    hint: "Amazon, Flipkart, Myntra, quick commerce",
    max: 100000,
  },
  {
    key: "groceries",
    label: "Groceries & supermarket",
    hint: "BigBasket, DMart, kirana",
    max: 60000,
  },
  {
    key: "dining",
    label: "Dining & food delivery",
    hint: "Restaurants, Swiggy, Zomato",
    max: 60000,
  },
  { key: "fuel", label: "Fuel", hint: "Petrol, diesel, CNG", max: 30000 },
  { key: "travel", label: "Travel & hotels", hint: "Flights, trains, hotels, cabs", max: 150000 },
  {
    key: "bills",
    label: "Bills & utilities",
    hint: "Electricity, mobile, broadband, DTH",
    max: 40000,
  },
  { key: "rent", label: "Rent", hint: "Usually excluded or surcharged", max: 100000 },
  { key: "education", label: "Education", hint: "School and college fees", max: 100000 },
  { key: "insurance", label: "Insurance premiums", hint: "Life, health, motor", max: 60000 },
  {
    key: "offline",
    label: "Other offline spends",
    hint: "Retail, pharmacy, everything else",
    max: 100000,
  },
];

export type SpendProfile = Record<SpendKey, number>;

export const DEFAULT_SPEND: SpendProfile = {
  online: 15000,
  groceries: 8000,
  dining: 6000,
  fuel: 4000,
  travel: 5000,
  bills: 5000,
  rent: 0,
  education: 0,
  insurance: 2000,
  offline: 6000,
};

export function monthlyTotal(profile: SpendProfile): number {
  return SPEND_CATEGORIES.reduce((sum, c) => sum + (profile[c.key] || 0), 0);
}

export function annualTotal(profile: SpendProfile): number {
  return monthlyTotal(profile) * 12;
}

export const BRANDS = [
  "Amazon",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Myntra",
  "Tata Neu",
  "IRCTC",
  "Uber",
  "BookMyShow",
] as const;

export type Brand = (typeof BRANDS)[number];

export type Goal = "cashback" | "travel" | "lounge" | "first-card" | "build-credit" | "business";

export const GOALS: { value: Goal; label: string; hint: string }[] = [
  { value: "cashback", label: "Maximum cashback", hint: "Straight rupees back, no point maths" },
  {
    value: "travel",
    label: "Travel miles & points",
    hint: "Airline/hotel transfers and big redemptions",
  },
  {
    value: "lounge",
    label: "Airport lounge access",
    hint: "Comfort at the airport, domestic + international",
  },
  { value: "first-card", label: "My first credit card", hint: "Easy approval, low or no fee" },
  {
    value: "build-credit",
    label: "Build or rebuild credit",
    hint: "Secured / FD-backed options welcome",
  },
  {
    value: "business",
    label: "Business spends",
    hint: "High limits, GST-friendly, business rewards",
  },
];

export type EmploymentType = "Salaried" | "Self-employed" | "Student" | "NRI";

export type ScoreBand = "750+" | "700-749" | "650-699" | "<650" | "unknown";

export const SCORE_BANDS: { value: ScoreBand; label: string; approx: number }[] = [
  { value: "750+", label: "750 or above", approx: 780 },
  { value: "700-749", label: "700 – 749", approx: 720 },
  { value: "650-699", label: "650 – 699", approx: 670 },
  { value: "<650", label: "Below 650", approx: 620 },
  { value: "unknown", label: "I don't know", approx: 730 },
];

export interface MatchAnswers {
  monthlyIncome: number;
  employment: EmploymentType;
  scoreBand: ScoreBand;
  goal: Goal;
  spend: SpendProfile;
  brands: Brand[];
  travelPerYear: number;
  international: boolean;
  feeTolerance: number;
  existingCardIds: string[];
}

export const DEFAULT_ANSWERS: MatchAnswers = {
  monthlyIncome: 75000,
  employment: "Salaried",
  scoreBand: "unknown",
  goal: "cashback",
  spend: { ...DEFAULT_SPEND },
  brands: [],
  travelPerYear: 2,
  international: false,
  feeTolerance: 2500,
  existingCardIds: [],
};
