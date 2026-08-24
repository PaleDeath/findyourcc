// Typed content for the /learn education hub. No JSX/HTML strings — pure structured
// content so the UI can render it richly and consistently.

export type LearnIconName =
  | "CalendarClock"
  | "AlertTriangle"
  | "Gauge"
  | "Receipt"
  | "Smartphone"
  | "ShieldCheck"
  | "XCircle"
  | "Globe2"
  | "Coins";

export type LearnBlock =
  | { kind: "p"; text: string }
  | { kind: "bullets"; heading?: string; items: string[] }
  | { kind: "callout"; tone: "info" | "warning" | "example"; heading: string; text: string }
  | { kind: "table"; heading?: string; columns: string[]; rows: string[][] };

export interface LearnTopic {
  slug: string;
  title: string;
  summary: string;
  icon: LearnIconName;
  readMinutes: number;
  blocks: LearnBlock[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: "billing-cycle-vs-due-date",
    title:
      "Billing cycle vs statement cycle vs due date — how the interest-free period really works",
    summary:
      "Three dates, one confusing calendar. Here's what each one means and how to milk the maximum interest-free period on every rupee you spend.",
    icon: "CalendarClock",
    readMinutes: 5,
    blocks: [
      {
        kind: "p",
        text: "Every Indian credit card runs on a repeating 28–31 day window called the billing cycle (or statement cycle) — say the 5th of one month to the 4th of the next. At the end of that window, the issuer freezes everything you owe into a statement and sends it to you, usually within a day or two. The due date is roughly 15–20 days after the statement is generated — that's the last date you can pay without being charged interest or reported late.",
      },
      {
        kind: "p",
        text: "The 'interest-free period' or grace period is the gap between the day you actually spend and the due date on the statement that spend lands on. Spend right after your statement is generated and you get the longest possible float — often 45–50 days of using the bank's money for free. Spend the day before your statement is generated and you might get barely 18–20 days before that amount is due.",
      },
      {
        kind: "callout",
        tone: "example",
        heading: "Worked example",
        text: "Cycle: 5th to 4th, due date the 24th. A ₹10,000 purchase on the 6th (just after cycle start) sits interest-free until the 24th of the following month — about 49 days. The same purchase made on the 3rd (just before cycle close) is billed almost immediately and due by the 24th of the very next month — only about 21 days of float.",
      },
      {
        kind: "p",
        text: "The interest-free period is a single, all-or-nothing benefit: it applies only if you pay your entire previous statement balance in full by the due date. The moment you carry forward even ₹1 as unpaid, most Indian issuers withdraw the grace period on all new transactions too — interest starts accruing from the transaction date itself, not from the due date. This is the single most misunderstood rule in Indian credit cards, and it's why revolvers (people who pay only the minimum) end up paying interest on nearly everything they buy, not just the leftover balance.",
      },
      {
        kind: "bullets",
        heading: "Practical takeaways",
        items: [
          "Big planned purchases are cheapest right after your statement date — you get the longest free credit.",
          "Always pay the full statement balance, not just the minimum due, to keep the grace period alive.",
          "Your bank's app shows the exact 'statement generated' and 'payment due' dates — check them, they rarely match the calendar month.",
          "Autopay/e-mandate (NACH) for at least the full statement amount removes the risk of forgetting a due date entirely.",
        ],
      },
    ],
  },
  {
    slug: "minimum-due-trap",
    title: "The minimum-due trap and the real APR maths",
    summary:
      "Paying just the minimum due feels harmless. It isn't — the real annualised cost of revolving Indian credit card debt is often 40–50%. Here's the full maths, GST included.",
    icon: "AlertTriangle",
    readMinutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Indian statements show a 'Total Amount Due' and a much smaller 'Minimum Amount Due' (MAD), typically 5% of the outstanding balance plus any EMIs, GST and fees. Paying only the MAD keeps your account 'not overdue' and protects your CIBIL record from a late-payment mark — but it is one of the most expensive ways to borrow money in India.",
      },
      {
        kind: "p",
        text: "Two things happen the instant you don't pay in full. First, the bank charges monthly interest — typically 2.5% to 3.75% — on the revolved balance, calculated daily from the transaction date (not the due date). Second, as covered in the billing-cycle explainer, you lose the interest-free period on every new purchase until you pay your full balance again, so fresh spends also start accruing interest immediately.",
      },
      {
        kind: "callout",
        tone: "example",
        heading: "Worked example: ₹50,000 revolved at 3.5% a month",
        text: "Month 1 interest: ₹50,000 × 3.5% = ₹1,750. GST at 18% on that interest: ₹315. So the visible interest charge line alone is ₹2,065 for one month on ₹50,000 — before any new spending. If you keep revolving and add fresh spends of, say, ₹15,000 that month (now also interest-bearing from day one since the grace period is gone), the next month's interest is charged on a larger base, compounding the cost month after month.",
      },
      {
        kind: "p",
        text: "Add up interest + GST over a year of pure revolving and the effective annual percentage rate (APR) commonly works out to 42–48%, even though the bank only ever quotes a 'monthly' rate that sounds small. This is because interest compounds monthly and GST is layered on top of every interest charge. Compare this to a personal loan (11–16% APR) or even a 0% EMI conversion, and revolving on a credit card is almost always the costliest form of borrowing available to a salaried Indian.",
      },
      {
        kind: "bullets",
        heading: "How to escape the trap",
        items: [
          "If you can't clear the full statement, at minimum pay more than the MAD — every extra rupee reduces the interest base immediately.",
          "Consider converting a large one-off purchase to a bank EMI (often 12–16% APR) rather than revolving it on the card at 40%+ effective.",
          "Stop using the card for new spends the moment you're revolving — every fresh swipe now earns interest from day one.",
          "A short-term personal loan or a family loan to clear the card balance is almost always cheaper than a second month of revolving.",
        ],
      },
    ],
  },
  {
    slug: "credit-utilisation-and-cibil",
    title: "Credit utilisation and CIBIL — the 30% rule, multiple cards, and enquiries",
    summary:
      "Your utilisation ratio is one of the biggest levers on your CIBIL score. Here's why keeping it under 30%, spreading spends across cards, and limiting hard enquiries actually matters.",
    icon: "Gauge",
    readMinutes: 5,
    blocks: [
      {
        kind: "p",
        text: "Credit utilisation is simply your total outstanding balance divided by your total credit limit, across all cards, expressed as a percentage. CIBIL (and other Indian bureaus like Experian and Equifax) treat this as one of the strongest signals of near-term default risk, second only to your repayment history. It's typically calculated both per-card and in aggregate, and it's usually the figure reported as of your statement date — not the day you check your score.",
      },
      {
        kind: "p",
        text: "The commonly cited '30% rule' says keeping utilisation under 30% of your total limit is 'safe', 30–50% starts to dent your score, and beyond 50% is treated as a real warning sign, even if you always pay in full and on time. This isn't an official RBI rule — it's an industry heuristic baked into bureau scoring models — but the data backing it is strong enough that most credit counsellors in India treat it as gospel.",
      },
      {
        kind: "callout",
        tone: "info",
        heading: "Why more cards can help, not hurt",
        text: "Adding a second or third card increases your total available limit without necessarily increasing your spending, which mechanically lowers your utilisation ratio. A person spending ₹40,000 a month with a single ₹60,000-limit card runs a risky ~67% utilisation; the same spend across two cards totalling ₹2,00,000 in limit drops utilisation to 20%. This is the main reason 'credit limit enhancement' requests and holding a few well-managed cards are viewed positively by lenders — provided you're not opening many cards in a short window.",
      },
      {
        kind: "p",
        text: "Enquiries are the other side of this. A hard enquiry happens when a lender pulls your credit report because you've applied for a card or loan — this can shave a few points off your score and stays visible for up to two years. A soft enquiry (like checking your own score, or a bank's 'pre-approved offer' check) doesn't affect your score at all. Applying for four cards in a month looks like financial stress to an algorithm, even if your intent was just to compare offers; space applications out by at least a few months where possible.",
      },
      {
        kind: "bullets",
        heading: "Quick rules of thumb",
        items: [
          "Keep aggregate utilisation under 30%, and ideally under 10% for the best score impact.",
          "If a big one-off expense will spike utilisation, pay it down before the statement date rather than waiting for the due date.",
          "Request credit limit enhancements periodically instead of applying for new cards purely to raise your ceiling.",
          "Space out new card applications; each hard enquiry has a small but real, compounding effect on your score.",
        ],
      },
    ],
  },
  {
    slug: "excluded-and-surcharged-categories",
    title: "Why rent, wallet loads, fuel and education spends are excluded or surcharged",
    summary:
      "Reward points don't apply everywhere, and some categories even attract a surcharge. The economics behind interchange, MDR and rent-payment platforms explain why.",
    icon: "Receipt",
    readMinutes: 5,
    blocks: [
      {
        kind: "p",
        text: "Every time you swipe a credit card, the merchant pays a Merchant Discount Rate (MDR) — a small percentage fee split between the card network, the issuing bank and the payment processor. This MDR is what ultimately funds your reward points, cashback and lounge access. On most retail categories MDR is around 1–2%, comfortably funding a 1–2% reward rate. But a handful of categories have wafer-thin margins or regulatory MDR caps, which is exactly why banks exclude them from rewards or add surcharges of their own.",
      },
      {
        kind: "bullets",
        heading: "Why these specific categories are treated differently",
        items: [
          "Rent payments: landlords don't normally accept cards, so third-party platforms (Cred, NoBroker, RedGiraffe) route the payment and typically charge the tenant a 1–3% convenience/processing fee to cover their own costs plus the card's MDR — banks almost universally exclude rent from rewards because it's a 'proxy' cash-equivalent transaction, not real retail spend.",
          "Wallet loads and gift card purchases: loading a Paytm/Amazon Pay wallet or buying a gift card is treated as a cash-equivalent transaction — it can be used to bypass MDR rules elsewhere, so issuers exclude it from earning and some flag heavy wallet-loading as card misuse.",
          "Fuel: petrol pumps run on very thin retail margins, so the government mandates a fuel surcharge waiver rule (typically 1% surcharge waived on transactions in a set band, e.g. ₹400–₹5,000) rather than allowing MDR to be passed on freely — reward earning on fuel is usually excluded or capped for the same margin reason.",
          "Education: many colleges accept cards only through third-party platforms (like CRED, Payzapp-linked partners) that add a 1–2% convenience fee to cover the MDR the institution won't absorb; card issuers commonly exclude education spends via these routes from reward earning to prevent 'rate arbitrage' where people pay fees just to churn points.",
          "Government payments and utility bill payments: often capped or excluded because MDR on these is regulated or negligible, leaving no margin to fund rewards.",
        ],
      },
      {
        kind: "callout",
        tone: "info",
        heading: "GST and surcharges",
        text: "Any convenience fee or surcharge charged on these transactions itself attracts 18% GST, so a platform's advertised '1% fee' on a ₹30,000 rent payment is actually ₹300 + ₹54 GST = ₹354 — always check the total, not just the headline percentage.",
      },
      {
        kind: "p",
        text: "The practical implication: read your card's Most Important Terms and Conditions (MITC) document for the 'excluded categories' list before assuming every rupee you spend earns points. And when a rent or education platform's fee (plus GST) costs more than the reward points you'd earn are actually worth, you're paying to lose money, not to earn rewards.",
      },
    ],
  },
  {
    slug: "rupay-credit-card-on-upi",
    title: "RuPay credit card on UPI explained",
    summary:
      "India's biggest recent credit card innovation lets you scan-and-pay with a credit card via UPI. Here's what earns rewards, what doesn't, and which cards actually support it.",
    icon: "Smartphone",
    readMinutes: 5,
    blocks: [
      {
        kind: "p",
        text: "Since 2022, NPCI has allowed RuPay credit cards to be linked to a UPI ID (via apps like BHIM, and now most major UPI apps), so you can scan any UPI QR code and pay using your credit card's credit line instead of your bank account balance. This is a uniquely Indian feature — Visa and Mastercard credit cards cannot be linked to UPI, only RuPay can, because the interchange and settlement rules were built specifically around RuPay's network.",
      },
      {
        kind: "p",
        text: "This matters because a huge share of everyday Indian spending — the local kirana store, the street vendor, an auto ride — happens over a UPI QR code, not a card machine. Before RuPay-UPI, none of that spend could earn credit card rewards at all. Now it can, provided your specific card's product page/MITC says it's eligible for rewards on UPI spends — some issuers deliberately exclude UPI transactions from reward earning even on a RuPay-UPI-enabled card, so this needs checking per-card, not assumed.",
      },
      {
        kind: "callout",
        tone: "info",
        heading: "The ₹2,000 rule of thumb",
        text: "NPCI's interchange structure for RuPay-UPI credit transactions is more favourable to merchants on smaller-ticket payments, and several issuers have set internal thresholds (commonly cited as ₹2,000) below which small merchant UPI transactions earn full or accelerated rewards, while larger transactions or P2P transfers may earn reduced or no rewards. Treat ₹2,000 as a rough anchor, not a universal law — always confirm your card's own reward exclusions for UPI.",
      },
      {
        kind: "bullets",
        heading: "What typically does NOT earn on RuPay-UPI",
        items: [
          "Person-to-person (P2P) transfers, i.e. paying a friend or family member directly — almost universally excluded, to prevent reward farming.",
          "Wallet loads and cash-equivalent categories, same exclusions as regular card spends.",
          "Very high-value UPI transactions on some cards, which may be capped or reward-reduced.",
        ],
      },
      {
        kind: "bullets",
        heading: "Which cards support it (broad categories, always confirm current status)",
        items: [
          "Most major issuers now offer at least one RuPay variant enabled for UPI linking — look specifically for 'RuPay' on the card face, since Visa/Mastercard variants of the same card cannot be linked.",
          "Linking is done from within your UPI app: Settings → add credit/debit card → select the RuPay credit card, then verify with card details and set a UPI PIN.",
          "Some premium RuPay cards intentionally exclude UPI spends from rewards or milestones entirely — the presence of RuPay-UPI compatibility does not guarantee it earns anything.",
        ],
      },
    ],
  },
  {
    slug: "secured-vs-unsecured-cards",
    title: "Secured (FD-backed) vs unsecured cards — who they're for, and how to graduate",
    summary:
      "No income proof, no problem: a fixed-deposit-backed card is often the easiest way into the credit system in India. Here's how limits work and how to move up.",
    icon: "ShieldCheck",
    readMinutes: 5,
    blocks: [
      {
        kind: "p",
        text: "An unsecured credit card is the 'normal' kind — the bank extends you a credit line purely based on your income, employment and existing credit history, with no collateral. A secured card, by contrast, is backed by a fixed deposit (FD) you open with the same bank; your credit limit is typically 80–100% of the FD amount, and the FD keeps earning its normal interest throughout. If you default, the bank simply recovers dues from the FD rather than chasing you through collections.",
      },
      {
        kind: "p",
        text: "Secured cards exist for people the unsecured underwriting model doesn't serve well: students with no income, freelancers and gig workers without payslips, new-to-credit young professionals, people who've recently moved to India, or anyone rebuilding credit after a default or a thin/damaged CIBIL file. The bank's risk is covered by your own money, so approval is fast and largely independent of income proof or existing credit score — often just KYC plus the FD.",
      },
      {
        kind: "callout",
        tone: "info",
        heading: "How the limit actually moves",
        text: "Some banks allow 'top-up' FDs — you can add more to the same FD to raise your credit limit without a fresh application. Others require breaking and re-opening a larger FD. A few premium secured products (aimed at HNIs against large FDs) come with lounge access and reward rates comparable to unsecured premium cards — 'secured' does not always mean 'basic'.",
      },
      {
        kind: "p",
        text: "Used and paid off responsibly for 8–12 months, a secured card builds exactly the same kind of positive repayment history on your CIBIL report as any unsecured card — the bureau doesn't distinguish 'secured' as a lesser category. This is the core of the 'graduation' path: build 6–12 months of on-time payments and healthy utilisation on the secured card, then either ask the issuing bank to convert it to an unsecured card and release the FD, or apply fresh for an unsecured card elsewhere with your now-improved CIBIL score as proof of reliability.",
      },
      {
        kind: "bullets",
        heading: "Practical tips",
        items: [
          "Use the secured card for small recurring spends (subscriptions, groceries) and pay in full every month — the goal is a clean history, not maximising rewards.",
          "Ask your bank directly about their secured-to-unsecured 'graduation' policy and typical timeline before opening the FD.",
          "Don't break the FD early just to close the card unless necessary — a short average account age can itself be a mild negative for your credit file.",
          "Compare FD interest rate lock-in terms too — some 'credit card FDs' pay slightly lower interest than a regular FD as a trade-off for the linked card.",
        ],
      },
    ],
  },
  {
    slug: "how-to-close-a-card-safely",
    title: "How to close a credit card safely",
    summary:
      "Closing a card badly can dent your CIBIL score and cost you real money. Follow this order, and know your rights under the RBI's 7-day closure rule.",
    icon: "XCircle",
    readMinutes: 5,
    blocks: [
      {
        kind: "p",
        text: "Closing a credit card isn't just calling customer care and asking — done in the wrong order it can leave you with lost reward points, an unexpected annual fee renewal, or a temporary CIBIL score dip. Follow a fixed sequence and you'll avoid all three.",
      },
      {
        kind: "bullets",
        heading: "The safe closure sequence",
        items: [
          "1. Redeem or transfer your reward points first — most issuers forfeit unused points the moment a card is closed, and points cannot usually be recovered afterwards.",
          "2. Clear every outstanding due in full, including any pending EMIs, and wait for that payment to reflect (usually 3–5 working days) before requesting closure.",
          "3. Cancel or move any autopay/e-mandate (NACH), SIPs, OTT subscriptions or utility billers linked to the card, so nothing bounces after closure.",
          "4. Call customer care or use the app/net-banking to submit a formal closure request; get a service request / ticket number.",
          "5. Ask specifically for a 'no dues' closure confirmation letter or email — this is your proof if any dispute arises later.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        heading: "The RBI 7-day rule",
        text: "Per RBI's Master Direction on Credit Card and Debit Card issuance, once you've submitted a valid closure request with no dues outstanding, the bank must close the card within 7 working days. If it fails to do so, the bank is liable to pay a penalty of ₹500 per day of delay to the cardholder until the closure is completed — this is a genuine, enforceable right, not a courtesy.",
      },
      {
        kind: "p",
        text: "Closing a card also reduces your total available credit limit, which can spike your aggregate utilisation ratio even if your spending hasn't changed — this can cause a temporary dip in your CIBIL score. If the card being closed is your oldest one, you also lose some 'average account age', a smaller but real scoring factor. Neither is a reason to keep paying for a card you don't want, but it's worth timing the closure (e.g. not right before a big loan application) and considering whether downgrading to a no-fee variant of the same card is a gentler alternative to full closure.",
      },
      {
        kind: "bullets",
        heading: "Before you call",
        items: [
          "Check whether a downgrade to a lifetime-free (LTF) variant preserves your credit history and limit better than closing outright.",
          "Time the request well before your next annual fee is due — issuers don't always prorate/refund a fee already charged.",
          "Keep the closure confirmation for at least 2 years; disputes over 'not actually closed' cards do happen.",
        ],
      },
    ],
  },
  {
    slug: "forex-markup-vs-zero-forex",
    title: "Forex markup vs zero-forex cards — the real cost of spending abroad",
    summary:
      "A 3.5% forex markup sounds small until GST and dynamic currency conversion tricks are added in. Here's when a zero-forex card actually pays for itself.",
    icon: "Globe2",
    readMinutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Whenever you swipe an Indian credit card abroad (or on a foreign-currency website), the transaction is converted to INR at the network's exchange rate, and the issuer adds a forex markup on top — typically 2% to 3.5% of the transaction value on regular cards. GST at 18% is then charged on that markup amount (and, separately, GST also applies on a slab basis to the overall forex transaction value itself under RBI/GST rules for outward remittance-linked transactions), so the effective total cost of a 'standard' forex markup is closer to 3.5–4.1% once GST is layered in.",
      },
      {
        kind: "callout",
        tone: "example",
        heading: "Worked example",
        text: "A $500 (~₹42,000) hotel booking on a card with a 3.5% forex markup: markup = ₹1,470. GST at 18% on the markup = ₹265. Total forex cost = ₹1,735, i.e. roughly 4.1% on top of the base amount — before you've even compared exchange rates.",
      },
      {
        kind: "p",
        text: "A zero-forex-markup card removes that 3.5%+ charge entirely, letting you pay the interbank-linked network rate with no markup. These cards typically come with an annual fee (sometimes waived on spend), so the maths is simple: if your annual overseas/foreign-currency spend comfortably exceeds what a 3.5%+ markup would have cost you, a zero-forex card pays for itself. Roughly, ₹1.5–2 lakh a year in foreign spend is often the break-even point against a ₹3,000–₹5,000 annual fee zero-forex card — frequent travellers and anyone shopping regularly on international websites clear this easily.",
      },
      {
        kind: "callout",
        tone: "warning",
        heading: "The Dynamic Currency Conversion (DCC) trap",
        text: "Abroad, a merchant terminal or ATM will often ask 'pay in INR or local currency?' — choosing INR triggers Dynamic Currency Conversion, where the merchant's own bank (not your card network) sets the exchange rate, almost always worse than the network rate, plus its own hidden markup on top of your card's forex markup. Always choose to pay in the local currency, never in INR, when given the choice — this single habit can save more than switching cards does.",
      },
      {
        kind: "bullets",
        heading: "Quick checklist for overseas spending",
        items: [
          "Get a dedicated zero-forex-markup card before a foreign trip if you don't already have one — approval can take a couple of weeks.",
          "Always decline DCC / 'pay in INR' prompts on foreign terminals and ATMs.",
          "Check if your card also waives forex markup on foreign-currency online purchases, not just physical swipes abroad — policies differ.",
          "Notify your bank of travel dates if required, to avoid transactions being flagged or blocked.",
        ],
      },
    ],
  },
  {
    slug: "points-devaluation",
    title: "Points devaluation — why 1 point almost never equals ₹1",
    summary:
      "Reward programmes are designed so the 'best' redemption looks generous while the average redemption quietly earns you far less. Here's how to value a programme honestly.",
    icon: "Coins",
    readMinutes: 6,
    blocks: [
      {
        kind: "p",
        text: "Card marketing loves round numbers like '1 point = ₹1' — but that rate almost always applies only to the worst redemption option, usually statement credit or catalogue merchandise, and even then often with conditions (minimum point thresholds, processing fees, or only on select categories). The same points, redeemed through better channels, are frequently worth 2–4x more. Understanding the full 'redemption ladder' — not just the headline rate — is the only way to value a card's rewards honestly.",
      },
      {
        kind: "bullets",
        heading: "A typical Indian redemption ladder, worst to best",
        items: [
          "Cash equivalents / bill payments: often the worst rate, sometimes with an added redemption fee — treat this as the floor value of a point, not its true value.",
          "Catalogue / merchandise / vouchers: usually marginally better than cash, but inventory and 'MRP inflation' on catalogue items can quietly claw the value back.",
          "Airline miles / hotel points via transfer partners: typically the best value, since airline and hotel loyalty currencies can be redeemed for business/first class seats or premium rooms worth far more than their 'point cost' would suggest in cash terms.",
          "Milestone/bonus categories: some programmes give a one-time value boost (e.g. bonus points) for redeeming into a specific partner rather than cash — another reason the same point balance isn't worth one flat number.",
        ],
      },
      {
        kind: "callout",
        tone: "example",
        heading: "Why this matters in rupees",
        text: "A card that markets '4 points per ₹150 spent, 1 point = ₹1' sounds like a 0.67% return. But if those points can be transferred to an airline programme at a good ratio and used for a redemption that would have cost ₹8 per point in cash to buy the same flight, the effective return on spend is closer to 5%. Conversely, a programme advertising a headline '5X points' but where points are only redeemable for ₹0.25 of statement credit is actually a weaker programme than a plain 1.5% flat cashback card.",
      },
      {
        kind: "p",
        text: "Devaluation is also a moving target: airlines and hotel partners periodically increase the number of points/miles needed for the same reward (a 'devaluation event'), and card issuers can change transfer ratios or retire partners with little notice — always check a programme's current terms rather than relying on older reviews, including ones on this site.",
      },
      {
        kind: "bullets",
        heading: "How to value a rewards programme honestly",
        items: [
          "Calculate the ₹-per-point value only for redemptions you'd realistically use, not the best-case headline example.",
          "Discount 'up to' redemption rates — always assume the average, not the ceiling.",
          "Prefer transfer partners you already use (an airline you actually fly, a hotel chain you actually stay at) over a theoretically higher but unusable transfer rate.",
          "For most people who won't optimise premium travel redemptions, a simple flat-rate cashback card is often mathematically equal to or better than a complex points programme.",
        ],
      },
    ],
  },
];

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "APR",
    definition:
      "Annual Percentage Rate — the true annualised cost of borrowing, including interest and compounding, not just the quoted monthly rate.",
    example: "A 3.5%/month card rate compounds to roughly 42–48% APR when revolved.",
  },
  {
    term: "MAD",
    definition:
      "Minimum Amount Due — the smallest payment (often ~5% of the balance) that keeps your account from being marked overdue, while interest still accrues on the rest.",
  },
  {
    term: "MITC",
    definition:
      "Most Important Terms and Conditions — the mandatory summary document every Indian issuer must publish listing fees, interest rates and exclusions in plain language.",
  },
  {
    term: "EMI conversion",
    definition:
      "Converting a large purchase or your revolving balance into fixed monthly instalments at a set interest rate, usually far cheaper than revolving normally.",
  },
  {
    term: "DCC",
    definition:
      "Dynamic Currency Conversion — a foreign merchant terminal offering to bill you in INR instead of local currency, usually at a worse rate than your card network offers.",
    example: "Always choose 'local currency', never DCC, when paying abroad.",
  },
  {
    term: "MDR",
    definition:
      "Merchant Discount Rate — the fee a merchant pays on every card transaction, split between issuer, network and processor; it's what funds your rewards.",
  },
  {
    term: "CIBIL",
    definition:
      "TransUnion CIBIL — India's largest credit bureau; also used loosely to mean your credit score (300–900 range).",
  },
  {
    term: "CVV",
    definition:
      "Card Verification Value — the 3-digit security code on the back of a card, required for most card-not-present transactions.",
  },
  {
    term: "NPCI",
    definition:
      "National Payments Corporation of India — the body that runs UPI, RuPay and other domestic payment rails.",
  },
  {
    term: "DreamFolks",
    definition:
      "A lounge-access aggregator platform that many Indian card issuers use in the backend to power complimentary airport lounge visits.",
  },
  {
    term: "Priority Pass",
    definition:
      "A global airport lounge membership programme, often bundled free with premium Indian travel credit cards for a set number of visits a year.",
  },
  {
    term: "Milestone spend",
    definition:
      "A spending threshold (e.g. ₹3 lakh/year) that unlocks a bonus voucher or fee waiver on a card, separate from regular per-transaction rewards.",
  },
  {
    term: "Joining fee",
    definition:
      "A one-time fee charged when a credit card is first issued, separate from the recurring annual fee.",
  },
  {
    term: "Annual fee",
    definition:
      "A yearly recurring fee for holding a card, often waived if annual spend crosses a set threshold.",
  },
  {
    term: "LTF",
    definition:
      "Lifetime Free — a card with no joining or annual fee ever, as opposed to fee-waiver-on-spend cards.",
  },
  {
    term: "Fuel surcharge waiver",
    definition:
      "A waiver (commonly 1%) on the surcharge fuel pumps otherwise add for card payments, usually capped to transactions within a specific rupee band.",
  },
  {
    term: "Forex markup",
    definition:
      "The percentage fee (typically 2–3.5%) an issuer adds on top of the network exchange rate for foreign currency transactions.",
    example: "A 3.5% forex markup plus 18% GST on it works out to roughly 4.1% total.",
  },
  {
    term: "Statement cycle",
    definition:
      "The recurring ~30-day window (e.g. 5th to 4th) at the end of which all transactions are compiled into a bill.",
  },
  {
    term: "Grace period",
    definition:
      "The interest-free window between a purchase and its due date, available only if the previous statement was paid in full.",
  },
  {
    term: "Cash advance",
    definition:
      "Withdrawing cash using a credit card at an ATM; it carries a separate (usually higher) fee and interest accrues from day one with no grace period.",
  },
  {
    term: "Over-limit fee",
    definition:
      "A charge applied if you spend beyond your assigned credit limit, where the issuer permits it at all.",
  },
  {
    term: "Add-on card",
    definition:
      "A supplementary card issued on a primary cardholder's account (e.g. for a spouse), sharing the same credit limit.",
  },
  {
    term: "Revolving credit",
    definition:
      "Carrying forward part of your balance to the next billing cycle instead of paying in full, triggering interest and loss of grace period.",
  },
  {
    term: "Credit utilisation ratio",
    definition:
      "Your total outstanding balance divided by your total credit limit across all cards, expressed as a percentage; a key CIBIL scoring factor.",
  },
  {
    term: "Hard enquiry",
    definition:
      "A credit report pull triggered by an actual card/loan application, which can slightly and temporarily lower your score.",
  },
  {
    term: "Soft enquiry",
    definition:
      "A credit report check that doesn't affect your score, such as checking your own CIBIL report or a bank's pre-approved offer check.",
  },
  {
    term: "Chargeback",
    definition:
      "A formal dispute process to reverse a fraudulent or incorrect transaction, initiated with your issuing bank.",
  },
  {
    term: "EMI tenure",
    definition:
      "The number of months over which a converted purchase or balance is repaid in equal instalments.",
  },
  {
    term: "Reward point value",
    definition:
      "The effective rupee worth of one reward point for a specific redemption, which varies by redemption channel (cash, catalogue, travel transfer).",
  },
  {
    term: "Redemption ladder",
    definition:
      "The ranked set of ways to redeem points, from lowest value (e.g. statement credit) to highest value (e.g. airline transfer partners).",
  },
  {
    term: "Co-branded card",
    definition:
      "A card issued jointly with a specific airline, hotel or retail brand, offering accelerated rewards or perks tied to that brand.",
  },
  {
    term: "Secured card",
    definition:
      "A credit card backed by a fixed deposit, with the limit set as a percentage of the FD amount; used for building or rebuilding credit.",
  },
  {
    term: "Credit limit enhancement",
    definition:
      "A request (or automatic offer) to raise your assigned credit limit, based on your income and repayment history.",
  },
  {
    term: "Autopay / e-mandate",
    definition:
      "An automated instruction letting the issuer debit your bank account for the bill amount on the due date, preventing missed payments.",
  },
  {
    term: "NACH",
    definition:
      "National Automated Clearing House — the RBI-backed system used to set up bank-side autopay mandates, including for credit card bill payments.",
  },
  {
    term: "UPI-linked RuPay CC",
    definition:
      "A RuPay credit card linked to a UPI ID so it can be used to scan-and-pay at any UPI QR code, not just card machines.",
  },
  {
    term: "GST on charges",
    definition:
      "18% Goods and Services Tax applied to most credit card fees and interest charges — always add this to any headline percentage.",
  },
  {
    term: "Late payment slab",
    definition:
      "A tiered fee structure where the late payment charge increases with the size of the overdue amount, as disclosed in the MITC.",
  },
  {
    term: "Interchange",
    definition:
      "The portion of the merchant discount rate paid to the card-issuing bank on every transaction, distinct from the network and processor's share.",
  },
  {
    term: "Billing cycle",
    definition:
      "Another term for the statement cycle — the recurring period after which transactions are compiled into a bill.",
  },
  {
    term: "Total Amount Due",
    definition:
      "The full outstanding balance shown on a statement; paying this in full (not just the MAD) preserves the interest-free grace period.",
  },
  {
    term: "Welcome benefit",
    definition:
      "A one-time bonus (points, voucher or fee waiver) offered for activating a new card, usually after a first transaction within a set window.",
  },
  {
    term: "Balance transfer",
    definition:
      "Moving an outstanding balance from one credit card to another (or to a loan) at a lower promotional interest rate.",
  },
];
