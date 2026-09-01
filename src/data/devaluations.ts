export type DevaluationSeverity = "Critical" | "Moderate" | "Minor" | "Positive";

export interface DevaluationEvent {
  id: string;
  cardId: string;
  cardName: string;
  issuer: string;
  issuerId: string;
  effectiveDate: string;
  title: string;
  summary: string;
  severity: DevaluationSeverity;
  affectedCategories: string[];
  changes: {
    aspect: string;
    before: string;
    after: string;
  }[];
  impactAnalysis: string;
  recommendedAlternatives: {
    cardId: string;
    cardName: string;
    reason: string;
  }[];
}

export const DEVALUATION_EVENTS: DevaluationEvent[] = [
  {
    id: "axis-atlas-2025",
    cardId: "axis-atlas",
    cardName: "Axis Bank Atlas",
    issuer: "Axis Bank",
    issuerId: "axis",
    effectiveDate: "2025-04-20",
    title: "Partner Transfer Capping & Gold Exclusion",
    summary:
      "Axis capped annual Edge Miles redemption to 30,000 miles per partner group and excluded jewellery/gold spends from milestone calculations.",
    severity: "Critical",
    affectedCategories: ["Travel", "Air Miles", "Milestones"],
    changes: [
      {
        aspect: "Group A Partner Cap",
        before: "Unlimited / Up to 1,50,000 miles/year",
        after: "Max 30,000 Edge Miles/partner group per calendar year",
      },
      {
        aspect: "Excluded Spends",
        before: "Standard fuel/wallet exclusions only",
        after: "Gold/Jewellery (MCC 5094, 5944) excluded from milestone points",
      },
      {
        aspect: "Tier Evaluation",
        before: "Spend-based tier valid for 1 full year",
        after: "Stricter quarterly spend audits for Silver/Gold tiers",
      },
    ],
    impactAnalysis:
      "Heavy spenders accumulating 1L+ miles can no longer dump all points into Accor ALL or Singapore KrisFlyer in one go. You must distribute transfers across airlines or hold points across years.",
    recommendedAlternatives: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        reason: "Uncapped 1:1 transfers to KrisFlyer, Air India, and ITC without partner-group caps.",
      },
      {
        cardId: "amex-platinum-travel",
        cardName: "Amex Platinum Travel",
        reason: "Clean ₹48,000 Taj / Marriott Bonvoy value on ₹4 Lakh milestone with zero devaluations.",
      },
    ],
  },
  {
    id: "icici-lounge-spend-2025",
    cardId: "icici-rubyx",
    cardName: "ICICI Bank Cards (Rubyx / Sapphiro / Coral)",
    issuer: "ICICI Bank",
    issuerId: "icici",
    effectiveDate: "2025-01-01",
    title: "₹10,000 Previous Quarter Spend Required for Lounge Access",
    summary:
      "ICICI introduced a mandatory ₹10,000 spend hurdle in the preceding calendar quarter to unlock complimentary domestic airport lounge visits.",
    severity: "Moderate",
    affectedCategories: ["Airport Lounge"],
    changes: [
      {
        aspect: "Lounge Qualification",
        before: "Unconditional complimentary lounge swipes",
        after: "Must spend min ₹10,000 in previous calendar quarter to unlock next quarter visits",
      },
      {
        aspect: "Spa & Add-on Access",
        before: "Included on Sapphiro",
        after: "Shared quota with primary cardholder",
      },
    ],
    impactAnalysis:
      "Infrequent travelers can no longer keep ICICI cards in a drawer just for free airport lounge visits.",
    recommendedAlternatives: [
      {
        cardId: "indusind-tiger",
        cardName: "IndusInd Tiger Credit Card",
        reason: "Unconditional domestic lounge access (2/qtr) with ₹0 spend hurdle and zero annual fee.",
      },
      {
        cardId: "scapia-federal",
        cardName: "Scapia Federal Credit Card",
        reason: "Domestic lounge unlocked with regular monthly spend and zero forex markup.",
      },
    ],
  },
  {
    id: "hdfc-smartbuy-utility-2025",
    cardId: "hdfc-infinia-metal",
    cardName: "HDFC Bank Infinia & Diners Club Black",
    issuer: "HDFC Bank",
    issuerId: "hdfc",
    effectiveDate: "2025-01-15",
    title: "1% Fee on Utility Spends > ₹50,000 & SmartBuy Daily Capping",
    summary:
      "HDFC introduced a 1% fee on monthly utility spends exceeding ₹50,000, 1% fee on education payments through third-party apps, and daily ₹10k caps on SmartBuy hotel/flight reward redemptions.",
    severity: "Moderate",
    affectedCategories: ["Utilities", "Education", "SmartBuy"],
    changes: [
      {
        aspect: "Utility Transactions",
        before: "Zero fee, full reward points",
        after: "1% fee on aggregate utility spends exceeding ₹50,000 per month (max ₹3,000/txn)",
      },
      {
        aspect: "Education (CRED/Paytm)",
        before: "Zero surcharge",
        after: "1% processing fee on third-party education payments",
      },
      {
        aspect: "SmartBuy Flight/Hotel Redemption",
        before: "Redeem up to monthly cap",
        after: "Daily limit of 10,000 reward points redemption on flights/hotels",
      },
    ],
    impactAnalysis:
      "High utility payers and commercial spenders face fee drag. Normal retail spends remain at the market-leading 33.3% rate.",
    recommendedAlternatives: [
      {
        cardId: "axis-airtel",
        cardName: "Airtel Axis Bank Credit Card",
        reason: "Flat 10% direct cashback on utility bills up to ₹250/month via Airtel Thanks app.",
      },
      {
        cardId: "tata-neu-infinity",
        cardName: "Tata Neu Infinity HDFC",
        reason: "5% NeuCoins on utility bill payments via Tata Neu app with no surcharge.",
      },
    ],
  },
  {
    id: "sbi-cashback-exclusions-2024",
    cardId: "sbi-cashback",
    cardName: "SBI Cashback Card",
    issuer: "SBI Card",
    issuerId: "sbi",
    effectiveDate: "2024-11-01",
    title: "Exclusion of Gift Cards, Education, Utilities & Wallet Loads",
    summary:
      "SBI Card removed 5% cashback on merchant gift card portals, school fees, utilities, and railway tickets.",
    severity: "Moderate",
    affectedCategories: ["Gift Cards", "Utilities", "Education", "Railways"],
    changes: [
      {
        aspect: "Online Merchant Gift Cards",
        before: "Earned 5% online cashback",
        after: "0% cashback on MCC 5947 (Card / Gift Shops)",
      },
      {
        aspect: "Railway Bookings (IRCTC)",
        before: "1% base cashback",
        after: "0% cashback",
      },
      {
        aspect: "Monthly Cashback Cap",
        before: "₹10,000 per billing cycle",
        after: "Maintained at ₹5,000 per billing cycle (₹1 Lakh online spend)",
      },
    ],
    impactAnalysis:
      "Still the undisputed king of direct 5% online retail shopping (Amazon, Flipkart, Myntra, Swiggy, Zomato), but gaming through voucher aggregators is blocked.",
    recommendedAlternatives: [
      {
        cardId: "hdfc-millennia",
        cardName: "HDFC Millennia Credit Card",
        reason: "5% cashback on Amazon, Flipkart, Swiggy, Zomato, Myntra with milestone vouchers.",
      },
      {
        cardId: "axis-flipkart",
        cardName: "Flipkart Axis Bank Credit Card",
        reason: "Unlimited 5% flat cashback on Flipkart and Cleartrip.",
      },
    ],
  },
  {
    id: "axis-magnus-devaluation-historical",
    cardId: "axis-magnus",
    cardName: "Axis Bank Magnus",
    issuer: "Axis Bank",
    issuerId: "axis",
    effectiveDate: "2023-09-01",
    title: "Removal of 25,000 Monthly Milestone & 5:2 Transfer Partner Slash",
    summary:
      "The historic devaluation that reshaped the Indian credit card market: removal of the 25k monthly bonus points on ₹1 Lakh spend and devaluation of transfer ratio from 5:4 to 5:2.",
    severity: "Critical",
    affectedCategories: ["Air Miles", "Milestones", "Rewards"],
    changes: [
      {
        aspect: "Monthly Milestone",
        before: "25,000 Edge Reward points on ₹1 Lakh monthly spend (up to 24% return)",
        after: "Completely eliminated for standard Magnus",
      },
      {
        aspect: "Transfer Partner Ratio",
        before: "5:4 (5 Edge Points = 4 Air Miles / Hotel Points)",
        after: "5:2 (5 Edge Points = 2 Air Miles / Hotel Points)",
      },
      {
        aspect: "Annual Fee",
        before: "₹10,000 + GST with fee waiver",
        after: "₹12,500 + GST for Magnus Burgundy",
      },
    ],
    impactAnalysis:
      "Transformed Magnus from the most profitable card in Indian history to a niche card strictly for Axis Burgundy banking clients.",
    recommendedAlternatives: [
      {
        cardId: "axis-atlas",
        cardName: "Axis Bank Atlas",
        reason: "Maintains 1:2 transfer ratio (1 Edge Mile = 2 Partner Points) with direct milestone tier points.",
      },
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        reason: "The true reigning super-premium king with 1:1 transfers and 33.3% SmartBuy return.",
      },
    ],
  },
  {
    id: "amex-reward-multiplier-caps-2025",
    cardId: "amex-mrcc",
    cardName: "American Express (MRCC / Platinum Travel / Gold Charge)",
    issuer: "American Express",
    issuerId: "amex",
    effectiveDate: "2025-02-01",
    title: "Reward Multiplier Monthly Cap Tuning & Merchant Updates",
    summary:
      "Amex tuned monthly bonus multiplier limits on Amazon and Flipkart vouchers via Reward Multiplier portal to 25,000 bonus points per month.",
    severity: "Minor",
    affectedCategories: ["Rewards", "Shopping Vouchers"],
    changes: [
      {
        aspect: "Reward Multiplier Cap",
        before: "Up to 50,000 bonus points/mo",
        after: "25,000 bonus MR points/calendar month per card",
      },
      {
        aspect: "Gold Collection 18k/24k",
        before: "₹9,000 Taj voucher for 18,000 points / ₹14,000 for 24,000 points",
        after: "Retained with 0.50p–0.58p rupee valuation on Taj and Tanishq",
      },
    ],
    impactAnalysis:
      "Minor impact on regular users spending under ₹50,000/month on vouchers. The Amex Trifecta strategy remains intact.",
    recommendedAlternatives: [
      {
        cardId: "amex-platinum-travel",
        cardName: "Amex Platinum Travel",
        reason: "Best ₹4 Lakh milestone card yielding 48k Taj vouchers + 40,000 MR points annually.",
      },
    ],
  },
];
