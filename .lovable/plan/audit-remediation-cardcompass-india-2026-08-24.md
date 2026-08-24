# Audit remediation — CardCompass India

The uploaded report lists 28 findings (4 critical, 9 high, 9 medium, 6 low). This plan fixes the ones that affect real users and search engines, in priority order.

## Phase 1 — Render real content on the server (critical)

The biggest issue: every card-bearing route hides behind a `hydrated` flag, so the server sends a skeleton. Search engines, link previews and no-JS clients see nothing.

- Render from the bundled dataset immediately; apply the localStorage override after hydration as a _replacement_, not a precondition.
- `hydrated` gates only user-specific bits (favourite stars, compare tray, wallet state).
- Resolve the card in `/card/$id` inside a route loader and throw `notFound()` there, so unknown card IDs return a real 404 instead of a 200 "Loading…" page.
- Routes touched: explore, card detail, compare, wallet, match.

## Phase 2 — Search that behaves the same everywhere (high)

- One exported matcher in `src/data/cards.ts`, used by Explore, the command palette, the calculator card selector and the wallet card picker: same fields, same ranking, same archived-card rule.
- Command palette: pass `shouldFilter={false}` so cmdk stops re-filtering already-filtered results (this is the "search returns nothing" bug).
- Explore search input becomes local state with a ~200ms debounce before syncing to the URL, and `popularityScore` is precomputed per card instead of inside the sort comparator.
- Validate `segment`/`category`/`network`/`cobrand` URL params against the real enums; drop unknown values instead of silently matching nothing.

## Phase 3 — Data honesty and dataset override (high)

- Reward engine: the invented constants (lounge value, ₹1,500-per-membership, etc.) either move to per-card fields or become clearly labelled, user-adjustable assumptions shown in the UI. Fix the module doc so it matches reality.
- Fix `bestTierFor` keyword routing so "all spends"/"everywhere" accelerators count across all categories rather than only offline spends.
- Route every card read through `useDataset()` — home page picks, command palette, compare, settings coverage — so an imported override applies everywhere.

## Phase 4 — Visible polish and correctness (medium)

- Inline pre-paint theme script in `<head>` to kill the light flash for dark-mode users; reconcile the conflicting server/client theme defaults.
- Number-format preference: components subscribe to the setting so Explore and card pages update without a reload.
- `usePersistentState`: validate stored values against schemas on read, move writes into an effect, listen to the native `storage` event for cross-tab sync, and surface quota failures.
- `CardArt`: unique `useId()`-based SVG filter IDs (duplicates currently break the grain effect across tiles), store intrinsic image dimensions to stop layout shift, and eager/high-priority loading for the hero image on card pages.
- Service worker: build-derived cache version, `response.ok` guard before caching, and a size cap.
- SEO: canonical links via `head()`, drop discontinued cards and `/settings` from the sitemap, derive origin dynamically instead of hardcoding `cardcompass.in`, and either ship an OG image or downgrade the twitter card type.

## Phase 5 — Small fixes (low)

- File-size ceiling on dataset import with a clear error instead of a frozen tab.
- "Report incorrect data" mailto currently has no recipient — either set one or reword the dialog to copy-to-clipboard only.
- Add a baseline `public/_headers` (nosniff, referrer policy, frame-ancestors, permissions policy, HSTS).

## Deliberately out of scope

- Production error reporting (Sentry/collector) and CI lint gating — these are deployment/infrastructure decisions outside the app code; happy to add if you want them.
- The full Prettier reformat of 2,600 lint warnings — mechanical but a huge diff; separate pass on request.

## Technical notes

- No backend, no new dependencies expected.
- Adding tests alongside the search matcher and reward engine changes, since those are the computations users make money decisions on.
