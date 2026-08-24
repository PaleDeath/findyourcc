import { describe, expect, it } from "vitest";
import { ALL_CARDS, filterCards, DEFAULT_FILTERS, searchCards } from "@/data/cards";

describe("searchCards", () => {
  it("returns everything for an empty query", () => {
    expect(searchCards(ALL_CARDS, "  ").length).toBe(ALL_CARDS.length);
  });

  it("prefers exact substring matches over fuzzy ones", () => {
    const results = searchCards(ALL_CARDS, "infinia");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results.every((c) => `${c.name} ${c.issuer}`.toLowerCase().includes("infinia"))).toBe(
      true,
    );
  });

  it("matches across multiple tokens in any order", () => {
    const a = searchCards(ALL_CARDS, "hdfc millennia");
    const b = searchCards(ALL_CARDS, "millennia hdfc");
    expect(a.map((c) => c.id).sort()).toEqual(b.map((c) => c.id).sort());
    expect(a.length).toBeGreaterThan(0);
  });

  it("falls back to fuzzy matching only when nothing matched exactly", () => {
    expect(searchCards(ALL_CARDS, "infinnia").length).toBeGreaterThan(0);
  });

  it("returns nothing for genuine nonsense", () => {
    expect(searchCards(ALL_CARDS, "zzqqxwv").length).toBe(0);
  });

  it("hides discontinued cards from filtered results by default", () => {
    const results = filterCards(ALL_CARDS, DEFAULT_FILTERS);
    expect(results.some((c) => c.status === "Discontinued")).toBe(false);
    const withArchived = filterCards(ALL_CARDS, { ...DEFAULT_FILTERS, includeArchived: true });
    expect(withArchived.length).toBeGreaterThanOrEqual(results.length);
  });
});
