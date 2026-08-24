# CardCompass India — Pass 1

An independent, no-backend credit card discovery app for India. All data bundled locally, all user state in localStorage.

## One necessary substitution

This project runs on TanStack Router (file-based routing), not react-router-dom — the router is fixed for this stack and cannot be swapped. Everything else in the brief is unaffected: same routes, same URLs, same page structure. Links use TanStack's `<Link to="...">` instead of react-router's.

## What gets built in this pass

**1. Data layer**

- `src/data/types.ts` with the exact `CreditCard`, `CardArt`, `Network`, `Segment`, `Category` shapes given (plus optional `officialImageUrl` on `CardArt`).
- One file per issuer under `src/data/issuers/` (hdfc, sbi, axis, icici, amex, kotak, indusind, idfcfirst, rbl, yesbank, aubank, standardchartered, hsbc, federal, bob, pnb, unionbank, canara, idbi, dbs, onecard, others), merged in `src/data/cards.ts`.
- 120+ real Indian cards including the full Amex India lineup and the major co-brands (Amazon Pay ICICI, Flipkart Axis, Swiggy HDFC, Tata Neu Infinity, IRCTC SBI/BoB, Air India SBI, Myntra Kotak, IndianOil, Shoppers Stop, Marriott Bonvoy HDFC, Club Vistara variants). Discontinued products included and flagged.
- Honesty rule enforced throughout: any figure not confidently known gets `dataConfidence: 'Needs review'` rather than an invented number, plus `lastVerified` on every card.
- Helpers: `getCardById`, `filterCards`, `computeEffectiveRate`, plus issuer/category facet builders.
- Data override layer: bundled data merged with a user-supplied JSON override from localStorage, so the Settings export/import can correct data without code changes.

**2. Design system**

- HSL CSS variables in `src/styles.css` + Tailwind tokens: ink/charcoal dark base, warm off-white light, electric indigo accent, gold accent for premium segments. No hex in components.
- Theme toggle: system default, persisted via `usePersistentState`.
- Geometric sans headings (tight tracking, large scale) + legible body sans, loaded via a `<link>` in the root route.
- Motion: 150–250ms spring transitions, staggered grid entrance, skeletons sized to prevent layout shift, all respecting `prefers-reduced-motion`.

**3. Components**

- `<CardArt />` — original stylised SVG/CSS artwork only, no bank imagery. 1.586 aspect ratio, grain texture, embossed number placeholder, inline chip + contactless glyphs, network wordmark as styled text, drop shadow, hover light-sweep, pointer-tilt (off on touch and reduced motion). Metal = brushed gradient, holographic = animated hue shift. `officialImageUrl` overrides when present.
- `<CreditCardTile />` — art, name, issuer, fee line, effective rate, top `bestFor` tags, favourite toggle, compare toggle.
- App shell: responsive header with nav + theme toggle, footer with disclaimer.
- `<Disclaimer />` with the exact supplied text, in the footer and on card detail pages.

**4. Pages**

- `/` Home — hero, quick category entry points, featured/premium picks, "no affiliate links" trust note.
- `/explore` — search, filters (issuer, segment, category, network, fee band, lifetime-free, lounge, RuPay-UPI, status/archive), sort (effective rate, annual fee, name, segment), URL-synced filter state.
- `/card/$id` — detail page (fees, rewards, benefits, eligibility, watch-outs, disclaimer).
- Placeholder routes with clean stubs: `/compare`, `/match` (quiz), `/calculators`, `/settings` (with the working JSON export/import already wired, since it belongs to the data layer).

**5. Responsive behaviour**
Mobile-first, verified at 360px with no overflow. Mobile: 1-up grid, filters in a bottom sheet, sticky bottom action bar (Filters · Compare · Match). Tablet 2-up. Desktop 3-up with sticky left filter rail, max-width 1280px.

## Not in this pass

Calculators, the match quiz, and comparison logic — routes and placeholder pages only, as requested.

## Technical notes

- Strict TypeScript, no `any`; each issuer file typed as `CreditCard[]` so shape errors surface at build.
- `usePersistentState<T>` — SSR-safe (reads storage after hydration to avoid mismatch), JSON-serialised, versioned key prefix.
- Favourites, compare tray, theme, and the data override all live in that hook.
- Every interactive element: visible focus ring, ARIA labels, keyboard operable; WCAG AA contrast in both themes.
- Per-route `head()` metadata with distinct titles/descriptions.
