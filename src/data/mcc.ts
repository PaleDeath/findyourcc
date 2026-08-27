export interface MerchantMCC {
  id: string;
  name: string;
  category: string;
  mcc: string;
  description: string;
  platform: string[];
  typicalNotes?: string;
}

export interface MCCCategory {
  code: string;
  name: string;
  group: "Dining & Food" | "Shopping & Retail" | "Travel & Transport" | "Utilities & Bills" | "Financial & High Risk" | "Entertainment & Lifestyle" | "Services";
  description: string;
  excludedOnMostCards: boolean;
  commonExclusions: string[];
}

export interface CardRewardRule {
  cardId: string;
  cardName: string;
  issuer: string;
  highlightEarn: string;
  excludedMCCs: string[];
  mccRules: {
    categoryName: string;
    ratePct: number;
    notes?: string;
  }[];
  monthlyCaps?: string;
}

export const POPULAR_MERCHANTS: MerchantMCC[] = [
  {
    id: "swiggy",
    name: "Swiggy (Food & Instamart & Dineout)",
    category: "Food Delivery & Quick Commerce",
    mcc: "5814 / 5411",
    description: "Coded as 5814 (Fast Food) for food orders & Dineout; 5411 (Grocery) for Instamart.",
    platform: ["App", "Web"],
    typicalNotes: "Earns 10% on Swiggy HDFC, 5% on SBI Cashback, 10% on Axis Airtel (via Airtel Thanks / Swiggy tie-up).",
  },
  {
    id: "zomato",
    name: "Zomato & Blinkit",
    category: "Food Delivery & Quick Commerce",
    mcc: "5814 / 5411",
    description: "Zomato dining/food is 5814 (Fast Food); Blinkit is 5411 (Grocery / Supermarkets).",
    platform: ["App", "Web"],
    typicalNotes: "Earns 5% on SBI Cashback, 10% on HSBC Live+ (dining), 4% on Axis Ace.",
  },
  {
    id: "amazon-shopping",
    name: "Amazon India (Retail Shopping)",
    category: "Online Marketplace",
    mcc: "5311 / 5999",
    description: "Standard retail goods coded under General Merchandise / Department Stores.",
    platform: ["App", "Web"],
    typicalNotes: "5% cashback on ICICI Amazon Pay (Prime members), 5% on SBI Cashback.",
  },
  {
    id: "amazon-pay-bills",
    name: "Amazon Pay (Utility / Recharges)",
    category: "Utilities & Wallet",
    mcc: "4900 / 4814",
    description: "Electricity, water, gas bills coded under 4900 (Utilities). Mobile recharges coded under 4814 (Telecom).",
    platform: ["App", "Web"],
    typicalNotes: "2% on Amazon Pay ICICI. Excluded from 5% cashback on SBI Cashback (earns 0% under MCC 4900 exclusion).",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "Online Marketplace",
    mcc: "5311",
    description: "Department stores & eCommerce.",
    platform: ["App", "Web"],
    typicalNotes: "5% unlimited cashback on Flipkart Axis Card, 5% on SBI Cashback.",
  },
  {
    id: "myntra",
    name: "Myntra",
    category: "Fashion & Lifestyle",
    mcc: "5691",
    description: "Men's and Women's Clothing Stores.",
    platform: ["App", "Web"],
    typicalNotes: "7.5% instant discount or cashback on Kotak Myntra, 5% on SBI Cashback.",
  },
  {
    id: "uber",
    name: "Uber India",
    category: "Rides & Cab Services",
    mcc: "4121",
    description: "Taxicabs and Limousines.",
    platform: ["App"],
    typicalNotes: "5% cashback on SBI Cashback, accelerated points on Amex.",
  },
  {
    id: "ola",
    name: "Ola Cabs",
    category: "Rides & Cab Services",
    mcc: "4121",
    description: "Taxicabs and Limousines.",
    platform: ["App"],
  },
  {
    id: "zepto",
    name: "Zepto",
    category: "Quick Commerce / Grocery",
    mcc: "5411",
    description: "Grocery Stores and Supermarkets.",
    platform: ["App"],
    typicalNotes: "5% on SBI Cashback, 10% on HSBC Live+.",
  },
  {
    id: "bigbasket",
    name: "BigBasket / BB Daily",
    category: "Grocery & Supermarkets",
    mcc: "5411",
    description: "Grocery Stores and Supermarkets.",
    platform: ["App", "Web"],
    typicalNotes: "5% on Tata Neu Infinity (via Tata Neu), 5% on SBI Cashback.",
  },
  {
    id: "cred-rentpay",
    name: "CRED RentPay / Housing.com / Cheq",
    category: "Real Estate & Rent",
    mcc: "6513",
    description: "Real Estate Agents and Managers - Rentals.",
    platform: ["App"],
    typicalNotes: "EXCLUDED on almost all cards (0% rewards + 1% processing fee on most banks).",
  },
  {
    id: "bpcl-fuel",
    name: "Bharat Petroleum (BPCL)",
    category: "Fuel Stations",
    mcc: "5541",
    description: "Service Stations / Fuel Dispensers.",
    platform: ["POS Machine"],
    typicalNotes: "7.25% value back on BPCL SBI Card Octane; standard cards get 1% surcharge waiver but 0 reward points.",
  },
  {
    id: "hpcl-fuel",
    name: "Hindustan Petroleum (HPCL)",
    category: "Fuel Stations",
    mcc: "5541 / 5542",
    description: "Fuel Automated Dispensers.",
    platform: ["POS Machine"],
    typicalNotes: "Up to 5% savings on ICICI HPCL Super Saver & IDFC FIRST Power+.",
  },
  {
    id: "iocl-fuel",
    name: "Indian Oil (IOCL)",
    category: "Fuel Stations",
    mcc: "5541",
    description: "Service Stations (with or without ancillary services).",
    platform: ["POS Machine"],
    typicalNotes: "Up to 5% on HDFC IOCL & Axis IOCL.",
  },
  {
    id: "airtel-thanks",
    name: "Airtel Thanks (Broadband / Mobile / DTH)",
    category: "Telecom & Utilities",
    mcc: "4814 / 4900",
    description: "Telecommunication Services & Utility Bill payments.",
    platform: ["App"],
    typicalNotes: "25% cashback on Airtel Axis Card up to ₹250/mo.",
  },
  {
    id: "tata-neu",
    name: "Tata Neu (Croma, 1mg, Westside, Tata CliQ)",
    category: "Tata Ecosystem",
    mcc: "5311 / 5912",
    description: "Department Store / Pharmacy / Electronics.",
    platform: ["App"],
    typicalNotes: "Up to 10% NeuCoins on Tata Neu Infinity Card.",
  },
  {
    id: "makemytrip",
    name: "MakeMyTrip (Flights & Hotels)",
    category: "Travel & Hospitality",
    mcc: "4722 / 4511",
    description: "Travel Agencies and Tour Operators / Airlines.",
    platform: ["App", "Web"],
    typicalNotes: "5 EDGE Miles per ₹100 on Axis Atlas, 5X-10X on HDFC SmartBuy.",
  },
  {
    id: "irctc",
    name: "IRCTC (Train Tickets)",
    category: "Railways & Transit",
    mcc: "4112",
    description: "Passenger Railways.",
    platform: ["Web", "App"],
    typicalNotes: "Up to 10% back on HDFC IRCTC & SBI IRCTC; standard 1% on other cards.",
  },
  {
    id: "bookmyshow",
    name: "BookMyShow",
    category: "Movie & Event Ticketing",
    mcc: "7832 / 7922",
    description: "Motion Picture Theaters & Theatrical Ticket Agencies.",
    platform: ["App", "Web"],
    typicalNotes: "Buy 1 Get 1 offers on ICICI Sapphiro, Axis Magnus, IDFC Wealth, and RBL Play.",
  },
  {
    id: "lic-insurance",
    name: "LIC / HDFC Life / Max Life Insurance",
    category: "Insurance Premiums",
    mcc: "6300",
    description: "Insurance Underwriting, Premiums.",
    platform: ["Web", "Portal"],
    typicalNotes: "Excluded on SBI Cashback, capped at ₹2,000/mo on HDFC Infinia/Regalia.",
  },
  {
    id: "nps-tier1",
    name: "National Pension Scheme (NPS / eNPS)",
    category: "Government & Pension",
    mcc: "9399 / 6012",
    description: "Government Services / Financial Institutions.",
    platform: ["Web"],
    typicalNotes: "0% rewards on most bank credit cards due to MCC 9399 exclusion.",
  },
  {
    id: "tanishq",
    name: "Tanishq / CaratLane",
    category: "Jewellery & Precious Metals",
    mcc: "5944",
    description: "Jewelry, Watch, Clock, and Silverware Stores.",
    platform: ["POS", "Web"],
    typicalNotes: "Excluded on SBI Cashback and Axis Atlas milestones.",
  },
];

export const MCC_CATEGORIES: MCCCategory[] = [
  {
    code: "5814",
    name: "Fast Food Restaurants",
    group: "Dining & Food",
    description: "Quick service restaurants, food delivery apps (Swiggy, Zomato), coffee shops.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "5812",
    name: "Eating Places & Restaurants",
    group: "Dining & Food",
    description: "Dine-in restaurants, cafes, hotel dining.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "5411",
    name: "Grocery Stores & Supermarkets",
    group: "Dining & Food",
    description: "Supermarkets, hypermarkets, quick-commerce grocery (Blinkit, Instamart, Zepto, D-Mart).",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "5311",
    name: "Department Stores & Marketplaces",
    group: "Shopping & Retail",
    description: "Amazon, Flipkart, Lifestyle, Shoppers Stop, Reliance Retail.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "5691",
    name: "Clothing & Apparel Stores",
    group: "Shopping & Retail",
    description: "Myntra, Zara, H&M, Ajio, Westside, UNIQLO.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "4722",
    name: "Travel Agencies & Tour Operators",
    group: "Travel & Transport",
    description: "MakeMyTrip, Cleartrip, EaseMyTrip, Yatra, Agoda.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "4511",
    name: "Airlines & Air Carriers",
    group: "Travel & Transport",
    description: "Direct flight bookings on Air India, IndiGo, Singapore Airlines, Emirates.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "4121",
    name: "Taxicabs & Ridehailing",
    group: "Travel & Transport",
    description: "Uber, Ola, Rapido, BluSmart.",
    excludedOnMostCards: false,
    commonExclusions: [],
  },
  {
    code: "4900",
    name: "Utilities (Electric, Gas, Water, Sanitary)",
    group: "Utilities & Bills",
    description: "Electricity boards (BESCOM, Tata Power, Adani), piped gas, municipal water bills.",
    excludedOnMostCards: true,
    commonExclusions: ["SBI Cashback (0%)", "HDFC Infinia (Capped at 2,000 pts/mo)", "Axis Atlas (Excluded from milestones)"],
  },
  {
    code: "6513",
    name: "Real Estate Agents & Property Rentals (Rent)",
    group: "Financial & High Risk",
    description: "House rent payments made via CRED RentPay, MagicBricks, Housing.com, Cheq, RedGirraffe.",
    excludedOnMostCards: true,
    commonExclusions: ["SBI Cashback (0%)", "HDFC Cards (0% + 1% fee)", "Axis Cards (0% + 1% fee)", "ICICI Cards (0% + 1% fee)"],
  },
  {
    code: "5541",
    name: "Service Stations / Fuel Pumps",
    group: "Utilities & Bills",
    description: "Petrol, diesel, and EV charging at IndianOil, Bharat Petroleum, HPCL, Shell.",
    excludedOnMostCards: true,
    commonExclusions: ["Standard cards waive 1% surcharge but yield 0 base reward points."],
  },
  {
    code: "6300",
    name: "Insurance Sales, Underwriting & Premiums",
    group: "Financial & High Risk",
    description: "Life insurance (LIC, HDFC Life), health insurance (Star Health), motor insurance.",
    excludedOnMostCards: true,
    commonExclusions: ["SBI Cashback (0%)", "Axis Atlas (0% milestones)", "HDFC Cards (capped per calendar month)"],
  },
  {
    code: "6540",
    name: "POI Funding / Wallet Loads",
    group: "Financial & High Risk",
    description: "Loading Paytm Wallet, Mobikwik, Amazon Pay Wallet, Revolut, prepaid cards.",
    excludedOnMostCards: true,
    commonExclusions: ["Excluded from rewards and spend milestones across 99% of Indian credit cards."],
  },
  {
    code: "9399",
    name: "Government Services & Tax Payments",
    group: "Financial & High Risk",
    description: "Income Tax (TIN-NSDL), GST portal, challans, municipal taxes, passport fees.",
    excludedOnMostCards: true,
    commonExclusions: ["0% rewards on SBI, ICICI, Axis; 1% surcharge charged by payment gateways."],
  },
  {
    code: "8220",
    name: "Colleges, Universities & Professional Schools",
    group: "Services",
    description: "School tuition fees, college semester fees, coaching institutes.",
    excludedOnMostCards: true,
    commonExclusions: ["HDFC & ICICI charge 1% fee for third-party payment apps; excluded on SBI Cashback."],
  },
  {
    code: "5944",
    name: "Jewelry, Watches & Precious Stones",
    group: "Shopping & Retail",
    description: "Tanishq, Kalyan Jewellers, Malabar Gold, Joyalukkas, bullion purchases.",
    excludedOnMostCards: false,
    commonExclusions: ["SBI Cashback (0%)", "Axis Atlas (Excluded from tier spend calculation)"],
  },
];

export const CARD_MCC_RULES: CardRewardRule[] = [
  {
    cardId: "sbi-cashback",
    cardName: "SBI Cashback Card",
    issuer: "SBI Card",
    highlightEarn: "Flat 5% online merchant cashback",
    monthlyCaps: "₹5,000 maximum cashback per billing cycle (₹1,00,000 eligible spend)",
    excludedMCCs: ["4900", "6513", "5541", "5542", "6300", "6540", "9399", "8220", "5944", "6211"],
    mccRules: [
      { categoryName: "Online Shopping & Food Delivery (Amazon, Swiggy, Flipkart)", ratePct: 5, notes: "Direct statement credit" },
      { categoryName: "Offline Point of Sale (POS) Spends", ratePct: 1, notes: "All verified offline merchant swipes" },
      { categoryName: "Utility Bills (4900) & School Fees (8220)", ratePct: 0, notes: "Explicitly excluded from cashback" },
      { categoryName: "Rent Payments (6513) & Wallet Loads (6540)", ratePct: 0, notes: "0% rewards" },
      { categoryName: "Fuel (5541/5542) & Jewellery (5944)", ratePct: 0, notes: "0% rewards" },
    ],
  },
  {
    cardId: "hdfc-infinia-metal",
    cardName: "HDFC Infinia Metal",
    issuer: "HDFC Bank",
    highlightEarn: "3.3% Base (5 pts/₹150) | Up to 33.3% via SmartBuy",
    monthlyCaps: "SmartBuy accelerated points capped at 10,000 pts/calendar month",
    excludedMCCs: ["6513", "6540", "5541"],
    mccRules: [
      { categoryName: "SmartBuy Hotels & Flights", ratePct: 33.3, notes: "10X reward points (1 pt = ₹1 for flights/hotels)" },
      { categoryName: "SmartBuy Apple & Tanishq Vouchers", ratePct: 16.6, notes: "5X reward points" },
      { categoryName: "General Retail Spends", ratePct: 3.33, notes: "5 reward points per ₹150 spent" },
      { categoryName: "Utility Spends (4900)", ratePct: 3.33, notes: "Capped at 2,000 reward points per calendar month" },
      { categoryName: "Insurance Premiums (6300)", ratePct: 3.33, notes: "Capped at 10,000 reward points per day" },
      { categoryName: "Rent Payments (6513) & Wallet Loads (6540)", ratePct: 0, notes: "0% rewards + 1% processing fee" },
    ],
  },
  {
    cardId: "axis-atlas",
    cardName: "Axis Bank Atlas",
    issuer: "Axis Bank",
    highlightEarn: "2 EDGE Miles / ₹100 on general | 5 EDGE Miles / ₹100 on Travel",
    monthlyCaps: "Travel accelerated earn capped at ₹2,00,000 monthly spend",
    excludedMCCs: ["6513", "6540", "5541", "6300", "9399", "5944", "8220"],
    mccRules: [
      { categoryName: "Direct Airline & Hotel Spends (4511, 7011)", ratePct: 10, notes: "5 EDGE Miles / ₹100 (1 Mile = 2 Partner Points)" },
      { categoryName: "All Other General Spends", ratePct: 4, notes: "2 EDGE Miles / ₹100" },
      { categoryName: "Excluded from Milestone Thresholds", ratePct: 0, notes: "Rent (6513), Wallet (6540), Fuel (5541), Govt (9399), Jewellery (5944), Insurance (6300)" },
    ],
  },
  {
    cardId: "swiggy-hdfc",
    cardName: "Swiggy HDFC Bank Card",
    issuer: "HDFC Bank",
    highlightEarn: "10% on Swiggy | 5% on 1,000+ Online Merchants",
    monthlyCaps: "₹1,500/mo cap on 10% Swiggy; ₹1,500/mo cap on 5% online shopping",
    excludedMCCs: ["4900", "6513", "5541", "6540", "6300", "9399"],
    mccRules: [
      { categoryName: "Swiggy App (Food, Instamart, Dineout, Genie)", ratePct: 10, notes: "Credited as Swiggy Money cashback" },
      { categoryName: "Top Online Merchants (Amazon, Flipkart, Myntra, Uber, Nykaa, etc.)", ratePct: 5, notes: "1,000+ curated MCCs" },
      { categoryName: "Other General Spends & POS", ratePct: 1, notes: "Unlimited 1% cashback" },
      { categoryName: "Utilities, Rent, Wallet & Fuel", ratePct: 0, notes: "Excluded from cashback" },
    ],
  },
  {
    cardId: "axis-airtel",
    cardName: "Airtel Axis Bank Card",
    issuer: "Axis Bank",
    highlightEarn: "25% on Airtel Thanks | 10% on Utilities, Swiggy, Zomato, BigBasket",
    monthlyCaps: "₹250/mo on Airtel (25%); ₹250/mo on Utilities (10%); ₹500/mo on Swiggy/Zomato/BB (10%)",
    excludedMCCs: ["6513", "6540", "5541", "9399"],
    mccRules: [
      { categoryName: "Airtel Mobile, Broadband, DTH, Wi-Fi via Airtel Thanks App", ratePct: 25, notes: "₹250 cashback max/month" },
      { categoryName: "Utility Bill Payments via Airtel Thanks App (Electricity, Gas, Water)", ratePct: 10, notes: "₹250 cashback max/month" },
      { categoryName: "Swiggy, Zomato & BigBasket Orders", ratePct: 10, notes: "₹500 cashback max/month combined" },
      { categoryName: "All Other Eligible Retail Spends", ratePct: 1, notes: "Unlimited 1% cashback" },
      { categoryName: "Fuel, Rent, Wallet & Jewellery", ratePct: 0, notes: "Excluded from cashback" },
    ],
  },
  {
    cardId: "tata-neu-infinity",
    cardName: "Tata Neu Infinity HDFC Card",
    issuer: "HDFC Bank",
    highlightEarn: "Up to 10% NeuCoins on Tata Neu ecosystem | 1.5% on UPI RuPay",
    monthlyCaps: "500 NeuCoins/month on UPI spends",
    excludedMCCs: ["6513", "6540", "5541"],
    mccRules: [
      { categoryName: "Tata Brands on Tata Neu App (BigBasket, Croma, 1mg, Air India)", ratePct: 10, notes: "5% NeuCoins on Card + 5% NeuPass" },
      { categoryName: "RuPay UPI Spends (Merchant QR Codes)", ratePct: 1.5, notes: "1.5% back as NeuCoins" },
      { categoryName: "All Non-Tata Domestic & International Spends", ratePct: 1.5, notes: "1.5% back as NeuCoins" },
      { categoryName: "Fuel & Rent", ratePct: 0, notes: "Excluded" },
    ],
  },
];
