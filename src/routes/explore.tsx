import { useEffect, useMemo, useState } from "react";
import { canonical } from "@/lib/seo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProgressiveCardGrid } from "@/components/ProgressiveCardGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DEFAULT_FILTERS,
  REDEMPTION_LABELS,
  SORT_OPTIONS,
  filterCards,
  loosenSuggestions,
  type CardFilters,
  type SortKey,
} from "@/data/cards";
import { formatCompactINR } from "@/lib/format";
import {
  bool,
  csv,
  csvCategories,
  csvNetworks,
  csvRedemptions,
  csvSegments,
  num,
  str,
} from "@/lib/search-params";
import { useCompareTray, useDataset, useFavourites } from "@/lib/card-store";

interface ExploreSearch {
  q?: string | undefined;
  issuer?: string | undefined;
  segment?: string | undefined;
  category?: string | undefined;
  network?: string | undefined;
  redemption?: string | undefined;
  cobrand?: string | undefined;
  maxFee?: number | undefined;
  income?: number | undefined;
  score?: number | undefined;
  ltf?: boolean | undefined;
  lounge?: boolean | undefined;
  intlLounge?: boolean | undefined;
  upi?: boolean | undefined;
  zeroForex?: boolean | undefined;
  forex?: boolean | undefined;
  golf?: boolean | undefined;
  movie?: boolean | undefined;
  dining?: boolean | undefined;
  self?: boolean | undefined;
  fd?: boolean | undefined;
  archived?: boolean | undefined;
  sort?: SortKey | undefined;
  filters?: boolean | undefined;
}

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => {
    const out: ExploreSearch = {};
    const q = str(search["q"]);
    if (q) out.q = q;
    const issuer = str(search["issuer"]);
    if (issuer) out.issuer = issuer;
    const segment = str(search["segment"]);
    if (segment) out.segment = segment;
    const category = str(search["category"]);
    if (category) out.category = category;
    const network = str(search["network"]);
    if (network) out.network = network;
    const redemption = str(search["redemption"]);
    if (redemption) out.redemption = redemption;
    const cobrand = str(search["cobrand"]);
    if (cobrand) out.cobrand = cobrand;
    const maxFee = num(search["maxFee"]);
    if (maxFee !== undefined) out.maxFee = maxFee;
    const income = num(search["income"]);
    if (income !== undefined) out.income = income;
    const score = num(search["score"]);
    if (score !== undefined) out.score = score;
    if (bool(search["ltf"])) out.ltf = true;
    if (bool(search["lounge"])) out.lounge = true;
    if (bool(search["intlLounge"])) out.intlLounge = true;
    if (bool(search["upi"])) out.upi = true;
    if (bool(search["zeroForex"])) out.zeroForex = true;
    if (bool(search["forex"])) out.forex = true;
    if (bool(search["golf"])) out.golf = true;
    if (bool(search["movie"])) out.movie = true;
    if (bool(search["dining"])) out.dining = true;
    if (bool(search["self"])) out.self = true;
    if (bool(search["fd"])) out.fd = true;
    if (bool(search["archived"])) out.archived = true;
    if (bool(search["filters"])) out.filters = true;
    const sort = str(search["sort"]);
    if (sort && SORT_OPTIONS.some((s) => s.value === sort)) out.sort = sort as SortKey;
    return out;
  },
  head: () => ({
    links: canonical("/explore"),
    meta: [
      { title: "Explore Indian credit cards — FindYourCC" },
      {
        name: "description",
        content:
          "Search and filter 180+ Indian credit cards by issuer, segment, category, network, annual fee, income, credit score, lounge access and RuPay UPI support.",
      },
      { property: "og:title", content: "Explore Indian credit cards — FindYourCC" },
      {
        property: "og:description",
        content:
          "Filter every major Indian credit card by fee, rewards, lounge access and UPI support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const { cards } = useDataset();
  const favourites = useFavourites();
  const compare = useCompareTray();
  const [sheetOpen, setSheetOpen] = useState(Boolean(search.filters));
  const [queryInput, setQueryInput] = useState(search.q ?? "");

  // Keep the input in step with back/forward navigation.
  useEffect(() => {
    setQueryInput(search.q ?? "");
  }, [search.q]);

  // Debounce typing so every keystroke doesn't push a history entry.
  useEffect(() => {
    const next = queryInput.trim();
    if (next === (search.q ?? "")) return;
    const timer = window.setTimeout(() => {
      void navigate({
        to: ".",
        search: (prev) => ({ ...prev, q: next || undefined }),
        replace: true,
      });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [queryInput, search.q, navigate]);

  const filters = useMemo<CardFilters>(
    () => ({
      ...DEFAULT_FILTERS,
      query: search.q ?? "",
      issuerIds: csv(search.issuer),
      segments: csvSegments(search.segment),
      categories: csvCategories(search.category),
      networks: csvNetworks(search.network),
      redemptions: csvRedemptions(search.redemption),
      coBrandPartners: csv(search.cobrand),
      maxAnnualFee: search.maxFee ?? null,
      monthlyIncome: search.income ?? null,
      creditScore: search.score ?? null,
      lifetimeFreeOnly: Boolean(search.ltf),
      loungeOnly: Boolean(search.lounge),
      internationalLoungeOnly: Boolean(search.intlLounge),
      rupayUpiOnly: Boolean(search.upi),
      zeroForexOnly: Boolean(search.zeroForex),
      lowForexOnly: Boolean(search.forex),
      golfOnly: Boolean(search.golf),
      movieOffersOnly: Boolean(search.movie),
      diningOffersOnly: Boolean(search.dining),
      selfEmployedOnly: Boolean(search.self),
      fdBackedOnly: Boolean(search.fd),
      includeArchived: Boolean(search.archived),
      sort: search.sort ?? "relevance",
    }),
    [search],
  );

  const results = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const suggestions = useMemo(
    () => (results.length === 0 ? loosenSuggestions(cards, filters) : []),
    [cards, filters, results.length],
  );

  const toParams = (merged: CardFilters): ExploreSearch => {
    const params: ExploreSearch = {};
    if (merged.query) params.q = merged.query;
    if (merged.issuerIds.length) params.issuer = merged.issuerIds.join(",");
    if (merged.segments.length) params.segment = merged.segments.join(",");
    if (merged.categories.length) params.category = merged.categories.join(",");
    if (merged.networks.length) params.network = merged.networks.join(",");
    if (merged.redemptions.length) params.redemption = merged.redemptions.join(",");
    if (merged.coBrandPartners.length) params.cobrand = merged.coBrandPartners.join(",");
    if (merged.maxAnnualFee !== null) params.maxFee = merged.maxAnnualFee;
    if (merged.monthlyIncome !== null) params.income = merged.monthlyIncome;
    if (merged.creditScore !== null) params.score = merged.creditScore;
    if (merged.lifetimeFreeOnly) params.ltf = true;
    if (merged.loungeOnly) params.lounge = true;
    if (merged.internationalLoungeOnly) params.intlLounge = true;
    if (merged.rupayUpiOnly) params.upi = true;
    if (merged.zeroForexOnly) params.zeroForex = true;
    if (merged.lowForexOnly) params.forex = true;
    if (merged.golfOnly) params.golf = true;
    if (merged.movieOffersOnly) params.movie = true;
    if (merged.diningOffersOnly) params.dining = true;
    if (merged.selfEmployedOnly) params.self = true;
    if (merged.fdBackedOnly) params.fd = true;
    if (merged.includeArchived) params.archived = true;
    if (merged.sort !== "relevance") params.sort = merged.sort;
    return params;
  };

  const patch = (next: Partial<CardFilters>) => {
    void navigate({ to: ".", search: toParams({ ...filters, ...next }), replace: true });
  };

  const reset = () => void navigate({ to: ".", search: {}, replace: true });

  const activeChips: { label: string; clear: Partial<CardFilters> }[] = [
    ...filters.redemptions.map((r) => ({
      label: REDEMPTION_LABELS[r].label,
      clear: { redemptions: filters.redemptions.filter((x) => x !== r) },
    })),
    ...filters.issuerIds.map((id) => ({
      label: cards.find((c) => c.issuerId === id)?.issuer ?? id,
      clear: { issuerIds: filters.issuerIds.filter((x) => x !== id) },
    })),
    ...filters.segments.map((s) => ({
      label: s,
      clear: { segments: filters.segments.filter((x) => x !== s) },
    })),
    ...filters.categories.map((c) => ({
      label: c,
      clear: { categories: filters.categories.filter((x) => x !== c) },
    })),
    ...filters.networks.map((n) => ({
      label: n,
      clear: { networks: filters.networks.filter((x) => x !== n) },
    })),
    ...filters.coBrandPartners.map((p) => ({
      label: p,
      clear: { coBrandPartners: filters.coBrandPartners.filter((x) => x !== p) },
    })),
    ...(filters.maxAnnualFee !== null
      ? [
          {
            label: `Fee ≤ ${formatCompactINR(filters.maxAnnualFee)}`,
            clear: { maxAnnualFee: null },
          },
        ]
      : []),
    ...(filters.monthlyIncome !== null
      ? [
          {
            label: `Income ${formatCompactINR(filters.monthlyIncome)}/mo`,
            clear: { monthlyIncome: null },
          },
        ]
      : []),
    ...(filters.creditScore !== null
      ? [{ label: `Score ${filters.creditScore}+`, clear: { creditScore: null } }]
      : []),
    ...(filters.lifetimeFreeOnly
      ? [{ label: "Lifetime free", clear: { lifetimeFreeOnly: false } }]
      : []),
    ...(filters.loungeOnly ? [{ label: "Domestic lounge", clear: { loungeOnly: false } }] : []),
    ...(filters.internationalLoungeOnly
      ? [{ label: "Int'l lounge", clear: { internationalLoungeOnly: false } }]
      : []),
    ...(filters.zeroForexOnly ? [{ label: "0% Zero forex", clear: { zeroForexOnly: false } }] : []),
    ...(filters.lowForexOnly ? [{ label: "Low forex", clear: { lowForexOnly: false } }] : []),
    ...(filters.rupayUpiOnly ? [{ label: "RuPay UPI", clear: { rupayUpiOnly: false } }] : []),
    ...(filters.golfOnly ? [{ label: "Golf games", clear: { golfOnly: false } }] : []),
    ...(filters.movieOffersOnly ? [{ label: "Movie offers", clear: { movieOffersOnly: false } }] : []),
    ...(filters.diningOffersOnly ? [{ label: "Dining perks", clear: { diningOffersOnly: false } }] : []),
    ...(filters.selfEmployedOnly
      ? [{ label: "Self-employed", clear: { selfEmployedOnly: false } }]
      : []),
    ...(filters.fdBackedOnly ? [{ label: "Secured / FD", clear: { fdBackedOnly: false } }] : []),
  ];

  const activeCount = activeChips.length;

  return (
    <div className="container-page py-6 sm:py-8 min-w-0">
      <header className="mb-6 space-y-2 min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Explore cards
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {cards.length} Indian credit cards, structured field by field — fees, real earn rates,
          exclusions and the fine print issuers bury.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search by card name, bank, perk (e.g. Lounge, LTF, UPI)…"
            aria-label="Search cards"
            className="h-10 rounded-xl border-border/80 bg-surface/60 pl-10 text-xs font-medium backdrop-blur-xs focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/[0.03]"
          />
        </div>

        <label className="sr-only" htmlFor="sort">
          Sort results
        </label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(event) => patch({ sort: event.target.value as SortKey })}
          className="h-10 rounded-xl border border-border/80 bg-surface/60 px-3 text-xs font-medium text-foreground backdrop-blur-xs transition-colors hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-popover text-foreground">
              {option.label}
            </option>
          ))}
        </select>

        <Button variant="outline" className="btn-tactile h-10 rounded-xl lg:hidden" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr] min-w-0">
        <aside className="hidden lg:block min-w-0">
          <div className="card-bevel sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border/80 bg-card p-5 dark:border-white/[0.08]">
            <FilterPanel cards={cards} filters={filters} onChange={patch} onReset={reset} />
          </div>
        </aside>

        <section aria-label="Card results" className="min-w-0">
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {activeChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => patch(chip.clear)}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:border-white/10 dark:bg-white/[0.04]"
                >
                  {chip.label}
                  <X className="size-3" aria-hidden="true" />
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
            </div>
          )}

          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-mono text-xs font-semibold tabular-nums text-muted-foreground" aria-live="polite">
              Showing {results.length} of {cards.length} cards
            </p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="btn-tactile inline-flex items-center gap-1 text-xs font-semibold text-foreground/80 hover:text-foreground hover:underline"
              >
                <X className="size-3" aria-hidden="true" /> Reset filters
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-medium">No cards match those filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Loosen one thing and you&rsquo;ll get results back:
              </p>
              {suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      onClick={() => patch(s.patch)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              )}
              <Button variant="ghost" className="mt-4" onClick={reset}>
                Reset all filters
              </Button>
            </div>
          ) : (
            <ProgressiveCardGrid
              cards={results}
              favouriteIds={favourites.ids}
              compareIds={compare.ids}
              onToggleFavourite={favourites.toggle}
              onToggleCompare={compare.toggle}
            />
          )}
        </section>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">
            <FilterPanel cards={cards} filters={filters} onChange={patch} onReset={reset} />
            <Button className="mt-6 w-full" onClick={() => setSheetOpen(false)}>
              Show {results.length} cards
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
