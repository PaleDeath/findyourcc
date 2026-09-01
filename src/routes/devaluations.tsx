import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingDown,
  Calendar,
  Building2,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEVALUATION_EVENTS,
  type DevaluationEvent,
  type DevaluationSeverity,
} from "@/data/devaluations";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/devaluations")({
  head: () => ({
    links: canonical("/devaluations"),
    meta: [
      { title: "Indian Credit Card Devaluation Tracker & Changelog — FindYourCC" },
      {
        name: "description",
        content:
          "Live timeline of Indian credit card devaluations (Axis, HDFC, ICICI, SBI, Amex). Track rule changes, lounge spend criteria, voucher caps, and verified pivot cards.",
      },
      { property: "og:title", content: "Credit Card Devaluations & Policy Tracker — FindYourCC" },
      {
        property: "og:description",
        content:
          "Independent tracker for Indian credit card devaluations, rule changes, lounge restrictions, and alternative cards.",
      },
    ],
  }),
  component: DevaluationsTrackerPage,
});

function DevaluationsTrackerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | DevaluationSeverity>("all");
  const [selectedIssuer, setSelectedIssuer] = useState<string>("all");

  const issuers = useMemo(() => {
    const set = new Set<string>();
    DEVALUATION_EVENTS.forEach((e) => set.add(e.issuer));
    return ["all", ...Array.from(set)];
  }, []);

  const filteredEvents = useMemo(() => {
    return DEVALUATION_EVENTS.filter((event) => {
      const matchesSeverity = selectedSeverity === "all" || event.severity === selectedSeverity;
      const matchesIssuer = selectedIssuer === "all" || event.issuer === selectedIssuer;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        event.cardName.toLowerCase().includes(q) ||
        event.issuer.toLowerCase().includes(q) ||
        event.title.toLowerCase().includes(q) ||
        event.summary.toLowerCase().includes(q) ||
        event.affectedCategories.some((cat) => cat.toLowerCase().includes(q));

      return matchesSeverity && matchesIssuer && matchesQuery;
    });
  }, [searchQuery, selectedSeverity, selectedIssuer]);

  const stats = useMemo(() => {
    const critical = DEVALUATION_EVENTS.filter((e) => e.severity === "Critical").length;
    const moderate = DEVALUATION_EVENTS.filter((e) => e.severity === "Moderate").length;
    const total = DEVALUATION_EVENTS.length;
    return { critical, moderate, total };
  }, []);

  return (
    <div className="container-page py-8 lg:py-12 min-w-0">
      {/* Header */}
      <div className="max-w-3xl space-y-3 min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold text-destructive">
          <ShieldAlert className="size-3.5" />
          <span>Independent Policy & Devaluation Intelligence</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Indian Credit Card Devaluation Tracker
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          Banks frequently cut earn rates, cap reward transfers, and raise lounge spend hurdles. We track every major policy revision, explain the exact mathematical impact, and recommend optimal pivot cards.
        </p>
      </div>

      {/* Overview Stat Counters */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
        <div className="card-bevel rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracked Policy Shifts</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-foreground mt-1">
            {stats.total} Events
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Verified across major Indian banks (2023–2026)</p>
        </div>

        <div className="card-bevel rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-destructive">Critical Devaluations</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-destructive mt-1">
            {stats.critical} Critical
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Severe transfer cuts or milestone removals</p>
        </div>

        <div className="card-bevel rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Moderate Adjustments</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {stats.moderate} Moderate
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Lounge spend gates & utility/education fee caps</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by card, bank, or perk (e.g. Axis Atlas, Lounge, SmartBuy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 text-xs rounded-xl"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex w-full sm:w-auto max-w-full overflow-x-auto no-scrollbar gap-1 rounded-xl border border-border bg-surface p-1">
          {(["all", "Critical", "Moderate", "Minor"] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSeverity === sev
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {sev === "all" ? "All Severities" : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Issuer Pills */}
      <div className="mt-3 flex w-full max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">Bank:</span>
        {issuers.map((issuer) => (
          <button
            key={issuer}
            type="button"
            onClick={() => setSelectedIssuer(issuer)}
            className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              selectedIssuer === issuer
                ? "border-foreground bg-foreground text-background font-semibold"
                : "border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {issuer === "all" ? "All Banks" : issuer}
          </button>
        ))}
      </div>

      {/* Events Timeline List */}
      <div className="mt-8 space-y-6 min-w-0">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-medium text-foreground">No devaluations match your search filter.</p>
            <p className="text-xs text-muted-foreground mt-1">Try clearing the search query or selecting "All Banks".</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedSeverity("all");
                setSelectedIssuer("all");
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <article
              key={event.id}
              className="card-bevel rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-5 transition-all min-w-0"
            >
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/60 pb-4 min-w-0">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        event.severity === "Critical"
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : event.severity === "Moderate"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {event.severity} Impact
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">{event.issuer}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Calendar className="size-3" />
                      Effective {event.effectiveDate}
                    </span>
                  </div>

                  <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {event.cardName}: {event.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {event.summary}
                  </p>
                </div>

                <Link
                  to="/card/$id"
                  params={{ id: event.cardId }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  <span>Card Dossier</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Before vs After Comparison Grid */}
              <div className="min-w-0 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Detailed Policy Comparison
                </span>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                  {event.changes.map((change) => (
                    <div
                      key={change.aspect}
                      className="rounded-xl border border-border/70 bg-surface/40 p-3.5 space-y-2 min-w-0 text-xs"
                    >
                      <strong className="text-foreground font-semibold block">{change.aspect}</strong>
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5 text-muted-foreground">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            Before
                          </span>
                          <span className="line-through opacity-75">{change.before}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-foreground font-medium pt-0.5">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-destructive/10 text-destructive shrink-0">
                            Now
                          </span>
                          <span>{change.after}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Mathematical Impact Analysis */}
              <div className="rounded-xl bg-surface/70 border border-border/60 p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <TrendingDown className="size-4 text-destructive" />
                  <span>Real World Mathematical Impact</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{event.impactAnalysis}</p>
              </div>

              {/* Recommended Pivot Alternatives */}
              {event.recommendedAlternatives.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-border/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Recommended Pivot Cards</span>
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {event.recommendedAlternatives.map((alt) => (
                      <Link
                        key={alt.cardId}
                        to="/card/$id"
                        params={{ id: alt.cardId }}
                        className="group flex items-start justify-between rounded-xl border border-border/80 bg-card p-3 transition-all hover:border-foreground/30 hover:bg-surface"
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-bold text-foreground group-hover:underline">
                            {alt.cardName}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{alt.reason}</p>
                        </div>
                        <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0 mt-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <Disclaimer className="mt-12" />
    </div>
  );
}
