export interface StackComboCardRole {
  cardId: string;
  cardName: string;
  issuer: string;
  roleDescription: string;
  primarySpendCategories: string[];
  expectedEarnRate: string;
  monthlySpendAllocation: number;
}

export interface StackCombo {
  id: string;
  title: string;
  tagline: string;
  difficulty: "Beginner" | "Intermediate" | "Enthusiast / Advanced";
  totalAnnualFee: number;
  blendedEffectiveReturnPct: number;
  highlightReturnText: string;
  strategySummary: string;
  cards: StackComboCardRole[];
  categoryCoverage: {
    category: string;
    assignedCard: string;
    earnRate: string;
    notes: string;
  }[];
  annualValueEstimate: {
    monthlySpend: number;
    grossRewardRupees: number;
    annualFeeWithGST: number;
    netProfitRupees: number;
  };
  whyItWorks: string[];
  watchOuts: string[];
}

export const CURATED_STACK_COMBOS: StackCombo[] = [
  {
    id: "amex-trifecta-india",
    title: "The Amex Trifecta India",
    tagline: "The golden standard for luxury hotel stays (Taj, Marriott) and Air India / KrisFlyer air miles.",
    difficulty: "Intermediate",
    totalAnnualFee: 11000,
    blendedEffectiveReturnPct: 9.5,
    highlightReturnText: "Up to 9.5% Blended Return in Taj / Marriott Points",
    strategySummary:
      "Combines Platinum Travel (hit ₹4L annual milestone for 48k Taj vouchers) + MRCC (4 monthly txns of ₹1,500 + ₹20k monthly spend for 28k MR pts/yr) + Gold Charge (6 monthly txns of ₹1,000 for 12k MR pts/yr).",
    cards: [
      {
        cardId: "amex-platinum-travel",
        cardName: "Amex Platinum Travel",
        issuer: "American Express",
        roleDescription: "Primary large retail spend & milestone driver up to ₹4 Lakhs/year.",
        primarySpendCategories: ["Shopping", "Travel", "Offline", "Insurance"],
        expectedEarnRate: "8% to 12% via milestone vouchers",
        monthlySpendAllocation: 33333,
      },
      {
        cardId: "amex-mrcc",
        cardName: "Amex Membership Rewards (MRCC)",
        issuer: "American Express",
        roleDescription: "Monthly disciplined ₹20,000 spends (4 x ₹1,500 txns + ₹20k milestone).",
        primarySpendCategories: ["Groceries", "Fuel via HPCL", "Online Vouchers"],
        expectedEarnRate: "Up to 9% via 18k/24k Gold Collection",
        monthlySpendAllocation: 20000,
      },
      {
        cardId: "amex-gold-charge",
        cardName: "Amex Gold Charge Card",
        issuer: "American Express",
        roleDescription: "6 monthly transactions of ₹1,000+ for 1,000 bonus points/mo.",
        primarySpendCategories: ["Utility Vouchers", "Food Delivery", "Subscriptions"],
        expectedEarnRate: "Up to 10% on Reward Multiplier vouchers",
        monthlySpendAllocation: 6000,
      },
    ],
    categoryCoverage: [
      {
        category: "General Retail & Milestone Spends",
        assignedCard: "Amex Platinum Travel",
        earnRate: "48,000 Taj Vouchers on ₹4 Lakh spend",
        notes: "Best spent evenly throughout the year.",
      },
      {
        category: "Everyday Vouchers & Utilities",
        assignedCard: "Amex MRCC",
        earnRate: "2,400 Bonus MR points/month",
        notes: "Requires exactly 4 x ₹1,500 swipes + ₹20k total monthly spend.",
      },
      {
        category: "Reward Multiplier Portals",
        assignedCard: "Amex Gold Charge",
        earnRate: "5X MR Points (up to 15% return)",
        notes: "Use for Gyftr vouchers on Amazon, Myntra, Swiggy.",
      },
    ],
    annualValueEstimate: {
      monthlySpend: 60000,
      grossRewardRupees: 76000,
      annualFeeWithGST: 12980,
      netProfitRupees: 63020,
    },
    whyItWorks: [
      "All three cards pool into a single Amex Membership Rewards account.",
      "MR points never expire as long as one card remains active.",
      "Redeem for 18,000/24,000 points Gold Collection for 0.50p–0.58p rupee value on Taj and Tanishq vouchers.",
    ],
    watchOuts: [
      "Amex acceptance offline is ~75% in Tier 1 and lower in Tier 2/3 cities (keep a RuPay/Visa backup).",
      "Requires disciplined monthly transaction tracking (MRCC 4x and Gold 6x thresholds).",
    ],
  },
  {
    id: "indian-power-stack-daily",
    title: "The Ultimate Indian Daily Driver Stack",
    tagline: "100% spend coverage with zero reward waste: 5% online, 10% food, 25% bills, 1.5% UPI, and 33% travel.",
    difficulty: "Beginner",
    totalAnnualFee: 2000,
    blendedEffectiveReturnPct: 6.8,
    highlightReturnText: "Flat 5% to 25% Cash Savings on Every Rupee",
    strategySummary:
      "SBI Cashback covers every online shopping transaction at 5% direct statement credit. Airtel Axis covers utilities, broadband, and Swiggy/Zomato. Tata Neu Infinity covers all local QR UPI merchant payments at 1.5% NeuCoins.",
    cards: [
      {
        cardId: "sbi-cashback",
        cardName: "SBI Cashback Card",
        issuer: "SBI Card",
        roleDescription: "Online shopping champion across Amazon, Flipkart, Myntra, Nykaa, Quick Commerce.",
        primarySpendCategories: ["Online Shopping", "Electronics", "Fashion"],
        expectedEarnRate: "Flat 5% direct statement credit",
        monthlySpendAllocation: 25000,
      },
      {
        cardId: "axis-airtel",
        cardName: "Airtel Axis Bank Credit Card",
        issuer: "Axis Bank",
        roleDescription: "Bill payments, recharges, Wi-Fi, electricity, Swiggy, and Zomato.",
        primarySpendCategories: ["Utilities & Bills", "Food Delivery", "Telecom"],
        expectedEarnRate: "25% on Airtel, 10% on Utilities, 10% on Swiggy/Zomato/BigBasket",
        monthlySpendAllocation: 10000,
      },
      {
        cardId: "tata-neu-infinity",
        cardName: "Tata Neu Infinity HDFC",
        issuer: "HDFC Bank",
        roleDescription: "RuPay UPI scan-and-pay for daily kirana, tea, dining, and Tata ecosystem (BigBasket, 1mg, Croma).",
        primarySpendCategories: ["RuPay UPI", "Groceries", "Medicines", "Croma"],
        expectedEarnRate: "1.5% on UPI / 5% NeuCoins on Tata Neu",
        monthlySpendAllocation: 15000,
      },
    ],
    categoryCoverage: [
      {
        category: "All Online Shopping (Amazon/Flipkart)",
        assignedCard: "SBI Cashback",
        earnRate: "5% Direct Statement Credit",
        notes: "Capped at ₹5,000 cashback/month (₹1 Lakh spend).",
      },
      {
        category: "Electricity, Gas, Water & Mobile Bills",
        assignedCard: "Airtel Axis",
        earnRate: "10% to 25% Cashback",
        notes: "Via Airtel Thanks app (₹250/mo utility cap, ₹250/mo Airtel cap).",
      },
      {
        category: "Swiggy & Zomato Food Orders",
        assignedCard: "Airtel Axis",
        earnRate: "10% Cashback",
        notes: "Capped at ₹500/month across Swiggy, Zomato, BigBasket.",
      },
      {
        category: "Offline QR Codes & Kirana Stores",
        assignedCard: "Tata Neu Infinity (RuPay)",
        earnRate: "1.5% NeuCoins via UPI",
        notes: "Link directly to BHIM, Google Pay, PhonePe, or Tata Neu UPI.",
      },
    ],
    annualValueEstimate: {
      monthlySpend: 50000,
      grossRewardRupees: 41200,
      annualFeeWithGST: 2360,
      netProfitRupees: 38840,
    },
    whyItWorks: [
      "Pure liquid cashback with zero catalog inflation or complicated points transfer ratios.",
      "Covers 100% of modern Indian household recurring spends.",
      "Low total annual fee (₹999 + ₹500 + ₹1499), fully waived with moderate spends.",
    ],
    watchOuts: [
      "Keep track of monthly category caps on Airtel Axis (₹250/month per bucket).",
      "SBI Cashback does not earn 5% on school fees, utilities, or merchant gift cards.",
    ],
  },
  {
    id: "super-premium-airmiles-stack",
    title: "The Super-Premium Jetsetter Stack",
    tagline: "For high earners: Uncapped 33.3% return on flights & hotels + international Priority Pass with guests.",
    difficulty: "Enthusiast / Advanced",
    totalAnnualFee: 17500,
    blendedEffectiveReturnPct: 14.2,
    highlightReturnText: "Up to 33.3% on Flights & 1:1 Airline Miles Transfers",
    strategySummary:
      "HDFC Infinia Metal acts as the heavy-hitter for flight/hotel bookings via SmartBuy (33.3%) and 1:1 transfers to KrisFlyer/Air India. Axis Atlas serves as the non-SmartBuy direct airline booking machine (5 Edge Miles = 10 Partner Miles on airline websites).",
    cards: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        issuer: "HDFC Bank",
        roleDescription: "Primary card for all SmartBuy portals, vouchers, and domestic/intl lounge with guests.",
        primarySpendCategories: ["Flights & Hotels", "Amazon Vouchers", "Dining", "All Spends"],
        expectedEarnRate: "3.3% base, 16.6% to 33.3% on SmartBuy",
        monthlySpendAllocation: 75000,
      },
      {
        cardId: "axis-atlas",
        cardName: "Axis Bank Atlas",
        issuer: "Axis Bank",
        roleDescription: "Direct airline website spends, overseas forex bookings, and Accor ALL points engine.",
        primarySpendCategories: ["Direct Airline Bookings", "International Forex", "Hotel Portals"],
        expectedEarnRate: "10% on direct airline/hotel portals via Accor ALL",
        monthlySpendAllocation: 50000,
      },
    ],
    categoryCoverage: [
      {
        category: "SmartBuy Flights & 5X Brand Vouchers",
        assignedCard: "HDFC Infinia Metal",
        earnRate: "33.3% on Flights/Hotels / 16.6% on Vouchers",
        notes: "Capped at 10,000 bonus points/calendar month.",
      },
      {
        category: "Direct Airline Bookings (Emirates, Qatar, Singapore)",
        assignedCard: "Axis Atlas",
        earnRate: "5 Edge Miles per ₹100 (= 10 Partner Points / Accor ALL)",
        notes: "Direct on airline apps/websites without SmartBuy markups.",
      },
      {
        category: "Airport Lounges Worldwide",
        assignedCard: "HDFC Infinia Metal",
        earnRate: "Unlimited Domestic & International + Unlimited Add-on Guests",
        notes: "Includes Unlimited Priority Pass with guest access.",
      },
      {
        category: "Golf Games & Lessons",
        assignedCard: "HDFC Infinia Metal",
        earnRate: "Unlimited complimentary golf games worldwide",
        notes: "Book via Infinia concierge.",
      },
    ],
    annualValueEstimate: {
      monthlySpend: 125000,
      grossRewardRupees: 215000,
      annualFeeWithGST: 20650,
      netProfitRupees: 194350,
    },
    whyItWorks: [
      "Infinia covers portal flight bookings and voucher purchases with market-leading 33% value.",
      "Atlas fills the gap where SmartBuy is unavailable (direct boutique hotels, international carriers, Airbnb).",
      "Unlimited lounge access for primary, add-on cardholders, and traveling guests.",
    ],
    watchOuts: [
      "HDFC Infinia is Invite-Only / requires ₹3L+ net monthly salary or ₹10L+ credit limit on existing HDFC card.",
      "Axis Atlas partner transfers are capped at 30,000 Edge Miles/partner group per year.",
    ],
  },
  {
    id: "zero-annual-fee-hero",
    title: "The Zero-Fee Lifetime Free (LTF) Stack",
    tagline: "Zero joining fee, zero annual renewal fee forever with 0% forex, unlimited lounge, and 5% Amazon shopping.",
    difficulty: "Beginner",
    totalAnnualFee: 0,
    blendedEffectiveReturnPct: 4.2,
    highlightReturnText: "₹0 Annual Fee Forever + 0% Forex + 5% Amazon",
    strategySummary:
      "Amazon Pay ICICI provides unconditional 5% on Amazon India. Scapia Federal unlocks 0% forex markup on international spends and domestic lounge access. PNB RuPay Platinum covers daily offline QR code UPI payments.",
    cards: [
      {
        cardId: "icici-amazon-pay",
        cardName: "Amazon Pay ICICI Credit Card",
        issuer: "ICICI Bank",
        roleDescription: "Uncapped 5% cashback on Amazon India and 2% on bill payments.",
        primarySpendCategories: ["Amazon Shopping", "Amazon Pay Bills", "Dining"],
        expectedEarnRate: "5% Amazon / 1% all offline",
        monthlySpendAllocation: 15000,
      },
      {
        cardId: "scapia-federal",
        cardName: "Scapia Federal Credit Card",
        issuer: "Federal Bank",
        roleDescription: "Zero forex markup on overseas travel & international SaaS subscriptions + domestic lounge.",
        primarySpendCategories: ["International Forex", "Travel", "Lounge Access"],
        expectedEarnRate: "0% Forex (saves 4.13%) / 2% to 4% travel coins",
        monthlySpendAllocation: 15000,
      },
      {
        cardId: "pnb-rupay-platinum",
        cardName: "PNB RuPay Platinum / Select",
        issuer: "Punjab National Bank",
        roleDescription: "Lifetime Free RuPay card linked to UPI for daily neighborhood QR scans.",
        primarySpendCategories: ["RuPay UPI", "Small Merchant Payments", "Tea/Groceries"],
        expectedEarnRate: "1% reward points on UPI",
        monthlySpendAllocation: 5000,
      },
    ],
    categoryCoverage: [
      {
        category: "Amazon India Shopping",
        assignedCard: "Amazon Pay ICICI",
        earnRate: "Flat 5% Unlimited Cashback (Prime)",
        notes: "Direct Amazon Pay balance deposit every billing cycle.",
      },
      {
        category: "International & Online Forex (Netflix, Steam, Travel)",
        assignedCard: "Scapia Federal",
        earnRate: "0% Forex Markup (Zero 3.5% + GST fee)",
        notes: "Saves ~₹4,130 on every ₹1 Lakh international spend.",
      },
      {
        category: "Daily Local UPI QR Codes",
        assignedCard: "PNB RuPay Platinum",
        earnRate: "1% Rewards on UPI QR",
        notes: "Zero surcharge on standard merchant QR payments.",
      },
    ],
    annualValueEstimate: {
      monthlySpend: 35000,
      grossRewardRupees: 18400,
      annualFeeWithGST: 0,
      netProfitRupees: 18400,
    },
    whyItWorks: [
      "100% Lifetime Free — no spend conditions to waive renewal fees, no penalty for inactive months.",
      "Ages your credit profile safely with zero recurring holding costs.",
      "Gives top-tier perks (0% forex, Amazon 5%, airport lounge) without premium fees.",
    ],
    watchOuts: [
      "Scapia requires active monthly card spends to unlock complimentary domestic lounge visits.",
      "Amazon Pay cashback is credited as Amazon Pay balance, not direct bank statement credit.",
    ],
  },
];
