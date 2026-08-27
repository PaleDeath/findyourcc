import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import {
  Tag,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  POPULAR_MERCHANTS,
  MCC_CATEGORIES,
  CARD_MCC_RULES,
  type MerchantMCC,
  type MCCCategory,
  type CardRewardRule,
} from "@/data/mcc";
import { useDataset } from "@/lib/card-store";

export const Route = createFileRoute("/mcc")({
  head: () => ({
    links: canonical("/mcc"),
    meta: [
      { title: "MCC Code Guide & Card Exclusion Lookup India — FindYourCC" },
      {
        name: "description",
        content:
          "Search 80+ Indian merchants and 300+ MCC codes. Check credit card reward eligibility and exclusions on Swiggy, Amazon, CRED, fuel, utilities and rent.",
      },
      { property: "og:title", content: "MCC Code Guide & Card Exclusion Lookup India — FindYourCC" },
      {
        property: "og:description",
        content:
          "Verify merchant category codes (MCC), card exclusions, and reward rates before making large spends.",
      },
    ],
  }),
  component: MCCGuidePage,
});

function MCCGuidePage() {
  const { cards } = useDataset();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedCardId, setSelectedCardId] = useState<string>("sbi-cashback");
  const [activeTab, setActiveTab] = useState<"merchants" | "cards" | "categories">("merchants");

  // Merchant search
  const filteredMerchants = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_MERCHANTS;
    const q = searchQuery.toLowerCase();
    return POPULAR_MERCHANTS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.mcc.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Categories search & filter
  const groups = ["all", "Dining & Food", "Shopping & Retail", "Travel & Transport", "Utilities & Bills", "Financial & High Risk", "Services"] as const;

  const filteredCategories = useMemo(() => {
    return MCC_CATEGORIES.filter((c) => {
      const matchesGroup = selectedGroup === "all" || c.group === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.code.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [selectedGroup, searchQuery]);

  const activeCardRule = useMemo(() => {
    return CARD_MCC_RULES.find((c) => c.cardId === selectedCardId) ?? CARD_MCC_RULES[0];
  }, [selectedCardId]);

  return (
    <div className="container-page py-8 lg:py-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Tag className="size-3.5" />
          <span>India Merchant Category Codes & Reward Exclusions</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          MCC Code Guide & Exclusion Finder
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Banks use 4-digit MCC codes to determine reward earn rates and exclusions. Check merchant codes (Swiggy, Amazon, CRED, Utility, Rent) and see which cards give 5% vs 0%.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("merchants")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "merchants"
              ? "bg-foreground text-background shadow-xs"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="size-3.5" />
          <span>Merchant Lookup (80+ Brands)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "cards"
              ? "bg-foreground text-background shadow-xs"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="size-3.5" />
          <span>Card Exclusion & Cashback Breakdown</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "categories"
              ? "bg-foreground text-background shadow-xs"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5" />
          <span>MCC Category Directory</span>
        </button>
      </div>

      {/* Tab 1: Merchant Lookup */}
      {activeTab === "merchants" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search merchant (e.g. Swiggy, Amazon, CRED, BPCL, NPS)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground">{filteredMerchants.length} merchants shown</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground line-clamp-1">{merchant.name}</h3>
                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                      MCC {merchant.mcc}
                    </Badge>
                  </div>
                  <div className="text-xs text-primary font-medium mt-1">{merchant.category}</div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{merchant.description}</p>
                </div>

                {merchant.typicalNotes && (
                  <div className="mt-3 pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground bg-surface/60 p-2 rounded-lg">
                    <strong className="text-foreground font-medium">Reward Note: </strong>
                    {merchant.typicalNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Card Exclusions & Rules */}
      {activeTab === "cards" && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Card selector */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-base font-semibold text-foreground">Select Card</h2>
              <p className="text-xs text-muted-foreground mt-1">Select a popular card to view its verified MCC earning rates and exclusions.</p>
              
              <div className="mt-4 space-y-1.5">
                {CARD_MCC_RULES.map((rule) => {
                  const isSelected = rule.cardId === selectedCardId;
                  return (
                    <button
                      key={rule.cardId}
                      type="button"
                      onClick={() => setSelectedCardId(rule.cardId)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "bg-surface/50 text-foreground hover:bg-surface border border-border/50"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{rule.cardName}</div>
                        <div className="text-[10px] opacity-75">{rule.issuer}</div>
                      </div>
                      <span className="text-[10px] opacity-80 shrink-0 font-mono">
                        {rule.excludedMCCs.length} exclusions
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card Rules Matrix */}
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{activeCardRule.cardName}</h3>
                  <p className="text-xs text-primary font-medium mt-0.5">{activeCardRule.highlightEarn}</p>
                </div>
                <Link to="/card/$id" params={{ id: activeCardRule.cardId }}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Full Specs
                  </Button>
                </Link>
              </div>

              {activeCardRule.monthlyCaps && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <Info className="size-4 shrink-0" />
                  <span><strong>Monthly Cap: </strong>{activeCardRule.monthlyCaps}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Reward Slabs</h4>
                <div className="divide-y divide-border/60 rounded-xl border border-border bg-surface/40 overflow-hidden">
                  {activeCardRule.mccRules.map((rule, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-foreground">{rule.categoryName}</div>
                        {rule.notes && <div className="text-[11px] text-muted-foreground">{rule.notes}</div>}
                      </div>
                      <div className="shrink-0">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                          rule.ratePct >= 5
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : rule.ratePct > 0
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}>
                          {rule.ratePct > 0 ? `${rule.ratePct}% Return` : "0% Excluded"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Explicitly Excluded MCC Codes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeCardRule.excludedMCCs.map((mcc) => {
                    const matchedCat = MCC_CATEGORIES.find((c) => c.code === mcc);
                    return (
                      <Badge key={mcc} variant="secondary" className="text-[11px] py-1 px-2.5">
                        <span className="font-mono font-bold mr-1">{mcc}</span>
                        <span>{matchedCat ? `(${matchedCat.name.split(" ")[0]})` : ""}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: All Categories */}
      {activeTab === "categories" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {groups.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedGroup === grp
                      ? "bg-foreground text-background font-semibold"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {grp === "all" ? "All Categories" : grp}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{filteredCategories.length} codes</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((cat) => (
              <div key={cat.code} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    MCC {cat.code}
                  </Badge>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    cat.excludedOnMostCards
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {cat.excludedOnMostCards ? "Common Exclusion" : "Standard Rewards"}
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                {cat.commonExclusions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Known Card Bans: </strong>
                    {cat.commonExclusions.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
