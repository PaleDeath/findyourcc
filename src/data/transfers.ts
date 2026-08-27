export interface TransferPartner {
  id: string;
  name: string;
  category: "Hotel" | "Airline";
  alliance?: "Star Alliance" | "SkyTeam" | "oneworld" | "Independent";
  logoText: string;
  approxValueINR: number; // Estimated value in INR per 1 point/mile
  popularSweetspots: string[];
}

export interface CardTransferOption {
  cardId: string;
  cardName: string;
  issuer: string;
  baseRewardName: string; // e.g. "EDGE Miles", "Reward Points", "Membership Rewards"
  transferPartners: {
    partnerId: string;
    ratio: string; // e.g. "1:2" or "1:1" or "2:1"
    cardPointsRequired: number; // e.g. 1
    partnerPointsReceived: number; // e.g. 2
    minTransferBlock: number;
    transferDurationDays: string;
    notes?: string;
  }[];
}

export const TRANSFER_PARTNERS: TransferPartner[] = [
  {
    id: "accor-all",
    name: "Accor Live Limitless (ALL)",
    category: "Hotel",
    logoText: "Accor ALL",
    approxValueINR: 1.80,
    popularSweetspots: [
      "Fixed value: 2,000 points = €40 discount (~₹3,600) on any Accor hotel globally (Novotel, Pullman, Raffles, Fairmont, Sofitel)",
      "Zero blackout dates, can pay 100% of room bill with points",
    ],
  },
  {
    id: "marriott-bonvoy",
    name: "Marriott Bonvoy",
    category: "Hotel",
    logoText: "Marriott",
    approxValueINR: 0.75,
    popularSweetspots: [
      "5th Night Free on award redemptions",
      "JW Marriott, Ritz-Carlton, St. Regis redemptions worldwide",
      "Transfer to 40+ airline partners at 3:1 ratio (+5,000 mile bonus on 60,000 pts transfer)",
    ],
  },
  {
    id: "singapore-krisflyer",
    name: "Singapore Airlines KrisFlyer",
    category: "Airline",
    alliance: "Star Alliance",
    logoText: "KrisFlyer",
    approxValueINR: 1.10,
    popularSweetspots: [
      "India to Singapore in SQ Business Class for ~43,000 miles + minimal taxes",
      "Spontaneous Escapes: 30% discount on select international routes monthly",
      "Star Alliance partner awards across ANA, Lufthansa, Swiss, United",
    ],
  },
  {
    id: "air-india-flyingreturns",
    name: "Air India Flying Returns (Maharaja Club)",
    category: "Airline",
    alliance: "Star Alliance",
    logoText: "Air India",
    approxValueINR: 0.65,
    popularSweetspots: [
      "Domestic India economy tickets starting at 3,500 points",
      "Direct nonstop flights from Delhi/Mumbai to London, US, Tokyo, Frankfurt without high fuel surcharges",
    ],
  },
  {
    id: "qatar-avios",
    name: "Qatar Airways Privilege Club (Avios)",
    category: "Airline",
    alliance: "oneworld",
    logoText: "Qatar Avios",
    approxValueINR: 1.25,
    popularSweetspots: [
      "Qsuite business class to Doha & Europe/USA",
      "1:1 free instant transfer to British Airways, Finnair, and Iberia Avios",
    ],
  },
  {
    id: "turkish-milesandsmiles",
    name: "Turkish Airlines Miles&Smiles",
    category: "Airline",
    alliance: "Star Alliance",
    logoText: "Miles&Smiles",
    approxValueINR: 1.15,
    popularSweetspots: [
      "India to Europe in Business Class for 45,000 miles",
      "Domestic USA flights on United Airlines for 7,500 - 12,500 miles",
    ],
  },
  {
    id: "virgin-atlantic",
    name: "Virgin Atlantic Flying Club",
    category: "Airline",
    alliance: "SkyTeam",
    logoText: "Virgin Atlantic",
    approxValueINR: 0.95,
    popularSweetspots: [
      "Delhi/Mumbai to London Heathrow in Upper Class",
      "ANA Business/First Class redemptions to Tokyo",
    ],
  },
  {
    id: "taj-neupass",
    name: "Taj / IHCL NeuPass & Epicure",
    category: "Hotel",
    logoText: "Taj NeuPass",
    approxValueINR: 1.00,
    popularSweetspots: [
      "1 NeuCoin = ₹1 direct redemption at Taj, Vivanta, SeleQtions, and Ginger across India",
      "Dining and stay settlement with 0 blackout dates",
    ],
  },
  {
    id: "itc-green-points",
    name: "ITC Hotels Club ITC / Green Points",
    category: "Hotel",
    logoText: "Club ITC",
    approxValueINR: 1.00,
    popularSweetspots: [
      "Direct room redemptions across ITC Luxury Collection hotels in India",
      "ITC Grand Chola, ITC Maurya, ITC Gardenia dining vouchers",
    ],
  },
];

export const CARD_TRANSFERS: CardTransferOption[] = [
  {
    cardId: "axis-atlas",
    cardName: "Axis Bank Atlas",
    issuer: "Axis Bank",
    baseRewardName: "EDGE Miles",
    transferPartners: [
      {
        partnerId: "accor-all",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "Instant to 24 hours",
        notes: "Best value transfer in India: 1 EDGE Mile = 2 Accor ALL points (~₹3.60 effective return per mile).",
      },
      {
        partnerId: "singapore-krisflyer",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "1 - 3 business days",
        notes: "1 EDGE Mile = 2 KrisFlyer miles.",
      },
      {
        partnerId: "qatar-avios",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "Instant to 48 hours",
        notes: "1 EDGE Mile = 2 Qatar Avios.",
      },
      {
        partnerId: "turkish-milesandsmiles",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "1 - 2 business days",
      },
      {
        partnerId: "air-india-flyingreturns",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "1 - 2 business days",
      },
      {
        partnerId: "marriott-bonvoy",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "1 - 3 business days",
      },
      {
        partnerId: "itc-green-points",
        ratio: "1 : 2",
        cardPointsRequired: 1,
        partnerPointsReceived: 2,
        minTransferBlock: 500,
        transferDurationDays: "1 business day",
      },
    ],
  },
  {
    cardId: "hdfc-infinia-metal",
    cardName: "HDFC Infinia Metal",
    issuer: "HDFC Bank",
    baseRewardName: "Reward Points",
    transferPartners: [
      {
        partnerId: "singapore-krisflyer",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 4 business days",
        notes: "1:1 direct airmile transfer.",
      },
      {
        partnerId: "marriott-bonvoy",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 5 business days",
      },
      {
        partnerId: "air-india-flyingreturns",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 3 business days",
      },
      {
        partnerId: "virgin-atlantic",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 4 business days",
      },
    ],
  },
  {
    cardId: "hdfc-diners-club-black-metal",
    cardName: "HDFC Diners Club Black Metal",
    issuer: "HDFC Bank",
    baseRewardName: "Reward Points",
    transferPartners: [
      {
        partnerId: "singapore-krisflyer",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 4 business days",
      },
      {
        partnerId: "marriott-bonvoy",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 5 business days",
      },
      {
        partnerId: "air-india-flyingreturns",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 3 business days",
      },
    ],
  },
  {
    cardId: "amex-platinum-travel",
    cardName: "Amex Platinum Travel",
    issuer: "American Express",
    baseRewardName: "Membership Rewards (MR)",
    transferPartners: [
      {
        partnerId: "marriott-bonvoy",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "1 - 3 business days",
        notes: "Direct 1:1 transfer to Marriott Bonvoy (with frequent 30% bonus promotions).",
      },
      {
        partnerId: "taj-neupass",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 10000,
        transferDurationDays: "Instant voucher redemption",
        notes: "Taj stay vouchers via Amex rewards catalogue.",
      },
      {
        partnerId: "singapore-krisflyer",
        ratio: "2 : 1",
        cardPointsRequired: 2,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 4 business days",
      },
      {
        partnerId: "virgin-atlantic",
        ratio: "2 : 1",
        cardPointsRequired: 2,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "1 - 2 business days",
      },
      {
        partnerId: "qatar-avios",
        ratio: "2 : 1",
        cardPointsRequired: 2,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "1 - 3 business days",
      },
    ],
  },
  {
    cardId: "amex-mrcc",
    cardName: "Amex Membership Rewards Credit Card",
    issuer: "American Express",
    baseRewardName: "Membership Rewards (MR)",
    transferPartners: [
      {
        partnerId: "marriott-bonvoy",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "1 - 3 business days",
      },
      {
        partnerId: "taj-neupass",
        ratio: "1 : 1",
        cardPointsRequired: 1,
        partnerPointsReceived: 1,
        minTransferBlock: 10000,
        transferDurationDays: "Voucher delivery",
      },
      {
        partnerId: "singapore-krisflyer",
        ratio: "2 : 1",
        cardPointsRequired: 2,
        partnerPointsReceived: 1,
        minTransferBlock: 1000,
        transferDurationDays: "2 - 4 business days",
      },
    ],
  },
];
