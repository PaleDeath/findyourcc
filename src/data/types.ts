export type Network = "Visa" | "Mastercard" | "RuPay" | "American Express" | "Diners Club";

export type Segment = "Entry" | "Mid" | "Premium" | "Super Premium" | "Invite Only";

export type Category =
  | "Cashback"
  | "Rewards"
  | "Travel"
  | "Fuel"
  | "Shopping"
  | "Dining"
  | "Business"
  | "Student"
  | "Secured (FD)"
  | "Co-branded"
  | "Lifestyle"
  | "Forex";

export type CardStatus = "Active" | "Discontinued" | "Invite Only" | "Temporarily Paused";

export type CardFinish = "matte" | "metal" | "glossy" | "carbon" | "holographic";

export interface CardArt {
  gradient: [string, string, string?];
  finish: CardFinish;
  layout: "horizontal" | "vertical";
  accent: string;
  issuerMark: string;
  /** Optional override: if supplied, the generated artwork is replaced by this image. */
  officialImageUrl?: string;
}

export interface AcceleratedEarn {
  label: string;
  multiplier: string;
  ratePct: number;
  monthlyCapPoints?: number;
  brands?: string[];
}

export interface Milestone {
  spend: number;
  period: "Monthly" | "Quarterly" | "Annual";
  benefit: string;
  valueInRupees?: number;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  issuerId: string;
  networks: Network[];
  segment: Segment;
  categories: Category[];
  status: CardStatus;
  coBrandPartner?: string;
  art: CardArt;
  fees: {
    joiningFee: number;
    annualFee: number;
    lifetimeFree: boolean;
    firstYearFree: boolean;
    feeWaiverSpend?: number;
    addOnCardFee?: number;
    forexMarkupPct: number;
    cashAdvancePct?: number;
    apr: { minMonthlyPct: number; maxMonthlyPct: number };
    latePaymentSlabs?: string;
  };
  rewards: {
    baseRatePer100: number;
    pointValueInRupees: number;
    effectiveBaseRatePct: number;
    redemptionModes: string[];
    transferPartners?: string[];
    acceleratedEarn: AcceleratedEarn[];
    milestones: Milestone[];
    earningExclusions: string[];
    pointsExpiry?: string;
  };
  benefits: {
    loungeDomestic?: {
      visitsPerQuarter?: number;
      visitsPerYear?: number;
      program?: string;
      spendCondition?: string;
      guestVisits?: number;
      unlimited?: boolean;
    };
    loungeInternational?: {
      visitsPerQuarter?: number;
      visitsPerYear?: number;
      program?: "Priority Pass" | "DreamFolks" | "Other" | string;
      spendCondition?: string;
      guestVisits?: number;
      unlimited?: boolean;
    };
    golf?: string;
    fuelSurchargeWaiver?: { pct: number; minTxn: number; maxTxn: number; monthlyCap: number };
    insurance?: { type: string; cover: number }[];
    concierge?: boolean;
    memberships?: string[];
    diningPrograms?: string[];
    movieOffers?: string;
    emiAndOther?: string[];
  };
  eligibility: {
    minAge: number;
    maxAge: number;
    minMonthlyIncomeSalaried?: number;
    minAnnualIncomeSalaried?: number;
    minAnnualIncomeSelfEmployed?: number;
    minCreditScore: number;
    employmentTypes: ("Salaried" | "Self-employed" | "Student" | "NRI")[];
    fdBacked?: boolean;
    minFdAmount?: number;
    cityAvailability: "Pan-India" | "Select cities";
    documents: string[];
  };
  upi: { rupayUpiLinkable: boolean; rewardsOnUpiSpends?: string };
  bestFor: string[];
  watchOuts: string[];
  applyUrl?: string;
  mitcUrl?: string;
  lastVerified: string;
  dataConfidence: "High" | "Medium" | "Needs review";
}
