export interface PortalBrandRate {
  cardId: string;
  cardName: string;
  portalName: string;
  multiplier: string;
  effectiveEarnPct: number;
  monthlyCapText: string;
  notes: string;
}

export interface BrandVoucherPortal {
  brandId: string;
  brandName: string;
  category: "Shopping" | "Food & Grocery" | "Travel" | "Electronics" | "Cab & Transport";
  bestRateCard: string;
  bestRatePct: number;
  rates: PortalBrandRate[];
}

export const BRAND_PORTAL_RATES: BrandVoucherPortal[] = [
  {
    brandId: "amazon-shopping",
    brandName: "Amazon Shopping Vouchers",
    category: "Shopping",
    bestRateCard: "HDFC Infinia (SmartBuy)",
    bestRatePct: 16.6,
    rates: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        portalName: "SmartBuy Gyftr",
        multiplier: "5X Reward Points",
        effectiveEarnPct: 16.6,
        monthlyCapText: "Max 10,000 bonus points/mo",
        notes: "Buy Amazon Shopping Vouchers on SmartBuy Gyftr at 16.6% value back for flights/hotels.",
      },
      {
        cardId: "hdfc-diners-club-black-metal",
        cardName: "HDFC Diners Club Black",
        portalName: "SmartBuy Gyftr",
        multiplier: "5X Reward Points",
        effectiveEarnPct: 16.6,
        monthlyCapText: "Max 7,500 bonus points/mo",
        notes: "5X points on SmartBuy Gyftr instant vouchers.",
      },
      {
        cardId: "amex-mrcc",
        cardName: "Amex MRCC",
        portalName: "Reward Multiplier",
        multiplier: "2X MR Points",
        effectiveEarnPct: 6.0,
        monthlyCapText: "Max 25,000 bonus points/mo",
        notes: "Counts towards the 4 x ₹1,500 monthly milestone transactions.",
      },
      {
        cardId: "sbi-cashback",
        cardName: "SBI Cashback Card",
        portalName: "Direct Swipe on Amazon",
        multiplier: "Flat 5% Statement Credit",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Max ₹5,000 cashback/cycle",
        notes: "Direct online purchase on Amazon.in (excluding gift cards).",
      },
      {
        cardId: "icici-amazon-pay",
        cardName: "Amazon Pay ICICI",
        portalName: "Direct Swipe on Amazon",
        multiplier: "5% Amazon Pay Balance",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Uncapped",
        notes: "Prime members get flat 5% unlimited cashback.",
      },
    ],
  },
  {
    brandId: "swiggy-zomato",
    brandName: "Swiggy & Zomato Food & Instamart",
    category: "Food & Grocery",
    bestRateCard: "HDFC Infinia (SmartBuy Gyftr)",
    bestRatePct: 16.6,
    rates: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        portalName: "SmartBuy Gyftr",
        multiplier: "5X Reward Points",
        effectiveEarnPct: 16.6,
        monthlyCapText: "Part of 10k bonus cap",
        notes: "Buy Swiggy Money / Zomato vouchers on SmartBuy Gyftr.",
      },
      {
        cardId: "axis-airtel",
        cardName: "Airtel Axis Bank",
        portalName: "Direct App Swipe",
        multiplier: "10% Direct Cashback",
        effectiveEarnPct: 10.0,
        monthlyCapText: "Max ₹500/month across Swiggy/Zomato/BigBasket",
        notes: "Direct checkout on Swiggy and Zomato apps.",
      },
      {
        cardId: "sbi-cashback",
        cardName: "SBI Cashback Card",
        portalName: "Direct App Swipe",
        multiplier: "5% Statement Credit",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Part of ₹5,000 cap",
        notes: "Flat 5% direct cashback on food delivery checkouts.",
      },
      {
        cardId: "amex-gold-charge",
        cardName: "Amex Gold Charge",
        portalName: "Reward Multiplier",
        multiplier: "5X MR Points",
        effectiveEarnPct: 15.0,
        monthlyCapText: "Part of 25k bonus cap",
        notes: "Buy Swiggy vouchers via Reward Multiplier.",
      },
    ],
  },
  {
    brandId: "makemytrip-travel",
    brandName: "MakeMyTrip Flights & Hotels",
    category: "Travel",
    bestRateCard: "HDFC Infinia (SmartBuy)",
    bestRatePct: 33.3,
    rates: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        portalName: "SmartBuy Travel",
        multiplier: "10X Points (Flights) / 10X (Hotels)",
        effectiveEarnPct: 33.3,
        monthlyCapText: "Daily 10k pts redemption limit",
        notes: "Book flights/hotels directly on SmartBuy powered by MakeMyTrip/Cleartrip for 33.3% return.",
      },
      {
        cardId: "axis-atlas",
        cardName: "Axis Bank Atlas",
        portalName: "Direct Airline / Hotel Booking",
        multiplier: "5 Edge Miles per ₹100",
        effectiveEarnPct: 10.0,
        monthlyCapText: "Tier based partner cap",
        notes: "5 Edge Miles = 10 Partner Miles (Accor ALL, KrisFlyer, Qatar Avios).",
      },
      {
        cardId: "hdfc-regalia-gold",
        cardName: "HDFC Regalia Gold",
        portalName: "SmartBuy Travel",
        multiplier: "5X Reward Points",
        effectiveEarnPct: 6.6,
        monthlyCapText: "Max 4,000 bonus points/mo",
        notes: "Flight/hotel bookings on SmartBuy.",
      },
    ],
  },
  {
    brandId: "flipkart-myntra",
    brandName: "Flipkart & Myntra Fashion",
    category: "Shopping",
    bestRateCard: "HDFC Infinia (SmartBuy Gyftr)",
    bestRatePct: 16.6,
    rates: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        portalName: "SmartBuy Gyftr",
        multiplier: "5X Reward Points",
        effectiveEarnPct: 16.6,
        monthlyCapText: "Part of 10k bonus cap",
        notes: "Buy Flipkart & Myntra gift vouchers on SmartBuy Gyftr.",
      },
      {
        cardId: "axis-flipkart",
        cardName: "Flipkart Axis Bank",
        portalName: "Direct Flipkart Swipe",
        multiplier: "5% Unlimited Direct Cashback",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Uncapped",
        notes: "Unlimited 5% flat cashback credited to card statement.",
      },
      {
        cardId: "sbi-cashback",
        cardName: "SBI Cashback Card",
        portalName: "Direct Online Swipe",
        multiplier: "5% Statement Credit",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Part of ₹5,000 cap",
        notes: "Flat 5% direct cashback on Flipkart and Myntra.",
      },
      {
        cardId: "amex-mrcc",
        cardName: "Amex MRCC",
        portalName: "Reward Multiplier",
        multiplier: "2X MR Points",
        effectiveEarnPct: 6.0,
        monthlyCapText: "Part of 25k bonus cap",
        notes: "Buy Flipkart / Myntra vouchers on Reward Multiplier.",
      },
    ],
  },
  {
    brandId: "uber-cabs",
    brandName: "Uber Rides & Commute",
    category: "Cab & Transport",
    bestRateCard: "HDFC Infinia (SmartBuy Gyftr)",
    bestRatePct: 16.6,
    rates: [
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        portalName: "SmartBuy Gyftr",
        multiplier: "5X Reward Points",
        effectiveEarnPct: 16.6,
        monthlyCapText: "Part of 10k bonus cap",
        notes: "Buy Uber vouchers via SmartBuy Gyftr and load into Uber wallet.",
      },
      {
        cardId: "sbi-cashback",
        cardName: "SBI Cashback Card",
        portalName: "Direct App Swipe",
        multiplier: "5% Statement Credit",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Part of ₹5,000 cap",
        notes: "Pay directly for Uber rides using SBI Cashback on Uber app.",
      },
      {
        cardId: "amex-gold-charge",
        cardName: "Amex Gold Charge",
        portalName: "Reward Multiplier",
        multiplier: "5X MR Points",
        effectiveEarnPct: 15.0,
        monthlyCapText: "Part of 25k bonus cap",
        notes: "Buy Uber vouchers on Reward Multiplier.",
      },
    ],
  },
  {
    brandId: "croma-electronics",
    brandName: "Croma & Electronics Stores",
    category: "Electronics",
    bestRateCard: "Tata Neu Infinity HDFC",
    bestRatePct: 5.0,
    rates: [
      {
        cardId: "tata-neu-infinity",
        cardName: "Tata Neu Infinity HDFC",
        portalName: "Tata Neu App / Croma Stores",
        multiplier: "5% NeuCoins",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Uncapped",
        notes: "5% NeuCoins on Croma purchases via Tata Neu or offline Croma swipe (1 NeuCoin = ₹1).",
      },
      {
        cardId: "hdfc-infinia-metal",
        cardName: "HDFC Infinia Metal",
        portalName: "SmartBuy Gyftr",
        multiplier: "5X Points",
        effectiveEarnPct: 16.6,
        monthlyCapText: "Part of 10k bonus cap",
        notes: "Buy Croma vouchers on SmartBuy Gyftr.",
      },
      {
        cardId: "sbi-cashback",
        cardName: "SBI Cashback Card",
        portalName: "Croma Online Website",
        multiplier: "5% Statement Credit",
        effectiveEarnPct: 5.0,
        monthlyCapText: "Part of ₹5,000 cap",
        notes: "Direct online payment on croma.com.",
      },
    ],
  },
];
