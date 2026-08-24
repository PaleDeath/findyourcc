# Real card images for every card

Today every card front is procedurally generated (gradient, chip, wordmark). This pass replaces that with the actual product image of each card, sourced from the issuer's own website, for all ~190 cards — with the generated artwork kept only as a fallback.

## How images get attached

- Each card already supports `art.officialImageUrl`. We fill it in per card.
- Image URLs come from the issuer's own site or its official CDN (e.g. the product image used on the bank's card page). No third-party aggregator images.
- Research is split across parallel workers, one batch of issuers each, so all ~190 cards get looked up: HDFC/SBI, Axis/ICICI/Amex, Kotak/IndusInd/IDFC/RBL, Yes/AU/SC/HSBC/Federal, PSU banks and fintechs.
- Every URL is fetched and checked before it is written in: must return an image, be a plausible card front, and not be a placeholder. A card whose image cannot be verified keeps the generated artwork and is listed in the summary.
- URLs live in one lookup file per issuer alongside the existing card data, so a broken link is a one-line fix later.

## Rendering changes

- `CardArt` gets a real image path: correct card aspect ratio, `object-contain` on a soft neutral plate so wide/tall/transparent PNGs all sit correctly instead of being cropped.
- If an image fails to load at runtime (hotlink blocked, link rotted, offline), the component silently swaps back to the generated artwork — no broken-image icon anywhere.
- Lazy loading, `decoding="async"`, and explicit dimensions so the grid does not shift while images stream in.
- Alt text stays descriptive: issuer + card name.
- Hover/tilt and the archived dimming still apply; finish overlays (metal sheen, holo) are dropped for real images since the photo already carries the finish.

## Coverage and honesty

- Settings gains a small "card images" line showing how many cards have a real image vs generated art.
- The existing JSON override can already set `art.officialImageUrl`, so you can correct or add any image without a code change.
- Footer/disclaimer wording is extended once to note that card images are the property of their respective issuers and are used for identification only.

## Technical notes

- No new dependencies, no backend; URLs are static data in `src/data/issuers/*`.
- Image loading error handling is local component state in `CardArt.tsx` (`useState` + `onError`), so SSR renders the `<img>` and hydration handles failures.
- Verification runs as a script during the build pass only; nothing runs at app runtime.
