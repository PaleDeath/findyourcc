import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import {
  Plane,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  CreditCard as CreditCardIcon,
  MapPin,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AIRPORTS, BANK_LOUNGE_POLICIES, type Airport, type AirportLounge } from "@/data/lounges";
import { useDataset } from "@/lib/card-store";
import { CardArt } from "@/components/CardArt";
import { formatFee } from "@/lib/format";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/lounge")({
  head: () => ({
    links: canonical("/lounge"),
    meta: [
      { title: "Airport Lounge Access Checker (2026) — FindYourCC" },
      {
        name: "description",
        content:
          "Instant credit card airport lounge access checker across 49+ Indian airports and 150+ credit cards. Check spend criteria, 2026 HDFC vouchers, and terminal lounges.",
      },
      { property: "og:title", content: "Airport Lounge Access Checker (2026) — FindYourCC" },
      {
        property: "og:description",
        content:
          "Check domestic and international airport lounge eligibility, quarterly spend thresholds, and terminal lounge locations in India.",
      },
    ],
  }),
  component: LoungeCheckerPage,
});

function LoungeCheckerPage() {
  const { cards } = useDataset();

  // Search & filter states
  const [selectedAirportCode, setSelectedAirportCode] = useState<string>("DEL");
  const [selectedTerminal, setSelectedTerminal] = useState<string>("all");
  const [selectedCardId, setSelectedCardId] = useState<string>("hdfc-infinia-metal");
  const [airportQuery, setAirportQuery] = useState("");
  const [cardSearchQuery, setCardSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"checker" | "bank-rules" | "top-cards">("checker");

  const activeAirport = useMemo(() => {
    return AIRPORTS.find((a) => a.code === selectedAirportCode) ?? AIRPORTS[0];
  }, [selectedAirportCode]);

  const terminals = useMemo(() => {
    if (!activeAirport) return [];
    const set = new Set<string>();
    activeAirport.lounges.forEach((l) => set.add(l.terminal));
    return Array.from(set);
  }, [activeAirport]);

  const filteredAirports = useMemo(() => {
    if (!airportQuery.trim()) return AIRPORTS;
    const q = airportQuery.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q),
    );
  }, [airportQuery]);

  const filteredCards = useMemo(() => {
    if (!cardSearchQuery.trim()) return cards.filter((c) => c.status === "Active");
    const q = cardSearchQuery.toLowerCase();
    return cards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        c.networks.some((n) => n.toLowerCase().includes(q)),
    );
  }, [cards, cardSearchQuery]);

  const selectedCard = useMemo(() => {
    return cards.find((c) => c.id === selectedCardId) ?? cards[0];
  }, [cards, selectedCardId]);

  const displayedLounges = useMemo(() => {
    if (!activeAirport) return [];
    if (selectedTerminal === "all") return activeAirport.lounges;
    return activeAirport.lounges.filter((l) => l.terminal === selectedTerminal);
  }, [activeAirport, selectedTerminal]);

  // Evaluate card eligibility
  const cardDomesticLounge = selectedCard?.benefits.loungeDomestic;
  const cardIntlLounge = selectedCard?.benefits.loungeInternational;
  const hasDomestic = Boolean(cardDomesticLounge?.unlimited || (cardDomesticLounge?.visitsPerQuarter && cardDomesticLounge.visitsPerQuarter > 0) || (cardDomesticLounge?.visitsPerYear && cardDomesticLounge.visitsPerYear > 0));
  const hasIntl = Boolean(cardIntlLounge?.unlimited || (cardIntlLounge?.visitsPerQuarter && cardIntlLounge.visitsPerQuarter > 0) || (cardIntlLounge?.visitsPerYear && cardIntlLounge.visitsPerYear > 0));

  const bankPolicy = selectedCard ? BANK_LOUNGE_POLICIES[selectedCard.issuerId] : null;

  // Top lounge cards in index
  const topLoungeCards = useMemo(() => {
    return [...cards]
      .filter((c) => c.status === "Active" && (c.benefits.loungeDomestic || c.benefits.loungeInternational))
      .sort((a, b) => {
        const aScore = (a.benefits.loungeDomestic?.unlimited ? 100 : (a.benefits.loungeDomestic?.visitsPerQuarter ?? 0) * 4) +
          (a.benefits.loungeInternational?.unlimited ? 100 : (a.benefits.loungeInternational?.visitsPerYear ?? 0));
        const bScore = (b.benefits.loungeDomestic?.unlimited ? 100 : (b.benefits.loungeDomestic?.visitsPerQuarter ?? 0) * 4) +
          (b.benefits.loungeInternational?.unlimited ? 100 : (b.benefits.loungeInternational?.visitsPerYear ?? 0));
        return bScore - aScore;
      })
      .slice(0, 8);
  }, [cards]);

  return (
    <div className="container-page py-8 lg:py-12">
      {/* Hero Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Plane className="size-3.5" />
          <span>Airport Lounge Access Intelligence (2026 Guide)</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Airport Lounge Access Checker
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Check if your card unlocks airport lounges across 49+ Indian airports. Verify visit quotas, 2026 spend criteria, HDFC vouchers, and terminal locations before you fly.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex w-full max-w-full items-center gap-2 overflow-x-auto no-scrollbar border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("checker")}
          className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "checker"
              ? "bg-foreground text-background shadow-xs"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="size-3.5" />
          <span>Lounge & Card Checker</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bank-rules")}
          className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "bank-rules"
              ? "bg-foreground text-background shadow-xs"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-3.5" />
          <span>2026 Bank Spend & Voucher Rules</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("top-cards")}
          className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "top-cards"
              ? "bg-foreground text-background shadow-xs"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>Top Lounge Cards in India</span>
        </button>
      </div>

      {activeTab === "checker" && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Airport & Card Selectors */}
          <div className="space-y-6 lg:col-span-5">
            {/* Step 1: Pick Airport */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step 1</span>
                <Badge variant="outline" className="text-[11px] font-mono">{activeAirport.code}</Badge>
              </div>
              <h2 className="mt-1 font-display text-base font-semibold text-foreground">Select Departure Airport</h2>

              <div className="mt-3">
                <Input
                  placeholder="Search city or airport code (e.g. DEL, Mumbai, BLR)..."
                  value={airportQuery}
                  onChange={(e) => setAirportQuery(e.target.value)}
                  className="h-10 min-h-[44px] text-xs"
                />
              </div>

              <div className="mt-3 grid max-h-56 grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                {filteredAirports.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      setSelectedAirportCode(airport.code);
                      setSelectedTerminal("all");
                    }}
                    className={`flex min-h-[44px] items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                      selectedAirportCode === airport.code
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-surface/60 text-foreground hover:bg-surface border border-border/50"
                    }`}
                  >
                    <span className="truncate">{airport.city}</span>
                    <span className="font-mono text-[10px] opacity-80">{airport.code}</span>
                  </button>
                ))}
              </div>

              {/* Terminal filter */}
              {terminals.length > 1 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Terminal</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTerminal("all")}
                      className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                        selectedTerminal === "all"
                          ? "bg-foreground text-background font-semibold"
                          : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Terminals
                    </button>
                    {terminals.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSelectedTerminal(term)}
                        className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                          selectedTerminal === term
                            ? "bg-foreground text-background font-semibold"
                            : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Pick Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step 2</span>
                <span className="text-xs text-muted-foreground">{cards.length} cards indexed</span>
              </div>
              <h2 className="mt-1 font-display text-base font-semibold text-foreground">Select Your Credit Card</h2>

              <div className="mt-3">
                <Input
                  placeholder="Search card name or bank (e.g. Infinia, Atlas, Tiger, Sapphiro)..."
                  value={cardSearchQuery}
                  onChange={(e) => setCardSearchQuery(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {filteredCards.map((c) => {
                  const isSelected = selectedCardId === c.id;
                  const hasLounge = c.benefits.loungeDomestic || c.benefits.loungeInternational;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCardId(c.id)}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "bg-surface/50 text-foreground hover:bg-surface border border-border/50"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium truncate">{c.name}</div>
                        <div className="text-[10px] opacity-75">{c.issuer}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasLounge ? (
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${isSelected ? "border-white/40 text-white" : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"}`}>
                            Lounge ✓
                          </Badge>
                        ) : (
                          <span className="text-[10px] opacity-60">No lounge</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Card Eligibility Verdict & Lounges at Airport */}
          <div className="space-y-6 lg:col-span-7">
            {/* Verdict Banner */}
            <div className={`rounded-2xl border p-6 transition-all ${
              hasDomestic || hasIntl
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                : "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    hasDomestic || hasIntl ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {hasDomestic || hasIntl ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Access Verdict
                    </span>
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                      {hasDomestic || hasIntl ? "Complimentary Lounge Access Available" : "No Complimentary Lounge Access"}
                    </h3>
                  </div>
                </div>

                <Link
                  to="/card/$id"
                  params={{ id: selectedCard.id }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Card Deep Dive</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {/* Card Specs Summary */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
                <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                  <div className="text-[11px] text-muted-foreground">Domestic Visits</div>
                  <div className="font-display text-base font-bold text-foreground mt-0.5">
                    {cardDomesticLounge?.unlimited
                      ? "Unlimited"
                      : cardDomesticLounge?.visitsPerQuarter
                        ? `${cardDomesticLounge.visitsPerQuarter} / quarter`
                        : cardDomesticLounge?.visitsPerYear
                          ? `${cardDomesticLounge.visitsPerYear} / year`
                          : "None"}
                  </div>
                </div>

                <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                  <div className="text-[11px] text-muted-foreground">International</div>
                  <div className="font-display text-base font-bold text-foreground mt-0.5">
                    {cardIntlLounge?.unlimited
                      ? "Unlimited"
                      : cardIntlLounge?.visitsPerQuarter
                        ? `${cardIntlLounge.visitsPerQuarter} / quarter`
                        : cardIntlLounge?.visitsPerYear
                          ? `${cardIntlLounge.visitsPerYear} / year`
                          : "None"}
                  </div>
                </div>

                <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                  <div className="text-[11px] text-muted-foreground">Program Network</div>
                  <div className="font-display text-base font-bold text-foreground mt-0.5 truncate">
                    {cardIntlLounge?.program || cardDomesticLounge?.program || selectedCard.networks.join(", ")}
                  </div>
                </div>

                <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                  <div className="text-[11px] text-muted-foreground">Annual Fee</div>
                  <div className="font-display text-base font-bold text-foreground mt-0.5">
                    {formatFee(selectedCard.fees.annualFee, selectedCard.fees.lifetimeFree)}
                  </div>
                </div>
              </div>

              {/* Spend Condition Warning / Info */}
              {(cardDomesticLounge?.spendCondition || bankPolicy?.spendCriteriaSummary) && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-surface/80 p-3 text-xs text-muted-foreground border border-border/50">
                  <Info className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <strong className="text-foreground font-semibold">Spend Requirement: </strong>
                    {cardDomesticLounge?.spendCondition ?? bankPolicy?.spendCriteriaSummary}
                  </div>
                </div>
              )}
            </div>

            {/* Lounges at Selected Airport */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span>Lounges at {activeAirport.city} ({activeAirport.code})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeAirport.name}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">{displayedLounges.length} lounges</Badge>
              </div>

              <div className="grid gap-3 pt-2">
                {displayedLounges.map((lounge) => (
                  <div
                    key={lounge.id}
                    className="rounded-xl border border-border/80 bg-surface/50 p-4 transition-all hover:border-foreground/20 hover:bg-surface"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-sm font-bold text-foreground">{lounge.name}</h4>
                          <Badge variant={lounge.type === "Domestic" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {lounge.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{lounge.terminal}</span>
                          <span>•</span>
                          <span>{lounge.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                        <Clock className="size-3" />
                        <span>{lounge.operatingHours}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-border/50">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">Accepted:</span>
                      {lounge.accessPrograms.map((prog) => (
                        <span
                          key={prog}
                          className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground"
                        >
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank App Unlock Instructions */}
            {bankPolicy && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>How to verify & unlock access in {bankPolicy.bankName} App</span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono bg-surface p-2.5 rounded-lg border border-border/60">
                  {bankPolicy.appPath}
                </p>
                {bankPolicy.voucherProcess && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Voucher Claim: </strong>
                    {bankPolicy.voucherProcess}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bank-rules" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              2026 Bank-by-Bank Airport Lounge Access Policies
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Indian issuers overhauled lounge eligibility in 2025–2026. Here is the definitive spend criteria, voucher claim process, and app navigation paths.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(BANK_LOUNGE_POLICIES).map((policy) => (
                <div key={policy.bankId} className="rounded-xl border border-border bg-surface/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-foreground">{policy.bankName}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">{policy.defaultNetwork}</Badge>
                  </div>
                  <div className="text-xs space-y-2">
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase">Spend Requirement</div>
                      <p className="text-foreground mt-0.5">{policy.spendCriteriaSummary}</p>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase">Mobile App Path</div>
                      <p className="text-muted-foreground font-mono text-[11px] mt-0.5 bg-background p-2 rounded border border-border/50">{policy.appPath}</p>
                    </div>
                    {policy.voucherProcess && (
                      <div>
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase">Voucher Process</div>
                        <p className="text-muted-foreground text-[11px] mt-0.5">{policy.voucherProcess}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "top-cards" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Best Credit Cards for Airport Lounge Access in India
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Cards with the highest complimentary visit quotas, lowest spend hurdles, and international Priority Pass / DreamFolks access.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topLoungeCards.map((card) => {
                const dom = card.benefits.loungeDomestic;
                const intl = card.benefits.loungeInternational;
                return (
                  <div key={card.id} className="flex flex-col justify-between rounded-xl border border-border bg-surface/50 p-4 transition-all hover:border-foreground/30 hover:bg-surface">
                    <div>
                      <div className="relative mb-3.5">
                        <CardArt card={card} />
                      </div>
                      <h3 className="font-display text-sm font-bold text-foreground line-clamp-1">{card.name}</h3>
                      <div className="text-xs text-muted-foreground">{card.issuer}</div>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Domestic:</span>
                          <strong className="text-foreground">
                            {dom?.unlimited ? "Unlimited" : dom?.visitsPerQuarter ? `${dom.visitsPerQuarter}/qtr` : dom?.visitsPerYear ? `${dom.visitsPerYear}/yr` : "None"}
                          </strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">International:</span>
                          <strong className="text-foreground">
                            {intl?.unlimited ? "Unlimited" : intl?.visitsPerYear ? `${intl.visitsPerYear}/yr` : intl?.visitsPerQuarter ? `${intl.visitsPerQuarter}/qtr` : "None"}
                          </strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Annual Fee:</span>
                          <strong className="text-foreground">{formatFee(card.fees.annualFee, card.fees.lifetimeFree)}</strong>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/card/$id"
                      params={{ id: card.id }}
                      className="mt-4 w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View Card Details
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Disclaimer className="mt-12" />
    </div>
  );
}
