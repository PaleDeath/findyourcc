import { describe, expect, it } from "vitest";
import { ALL_CARDS, filterCards, DEFAULT_FILTERS, searchCards } from "@/data/cards";

describe("searchCards", () => {
  it("returns everything for an empty query", () => {
    expect(searchCards(ALL_CARDS, "  ").length).toBe(ALL_CARDS.length);
  });

  it("finds Axis Bank Select and ranks it at #1 when querying 'axis select' or 'select axis'", () => {
    const axisSelect1 = searchCards(ALL_CARDS, "axis select");
    expect(axisSelect1.length).toBeGreaterThan(0);
    expect(axisSelect1[0]?.id).toBe("axis-select");

    const axisSelect2 = searchCards(ALL_CARDS, "select axis");
    expect(axisSelect2.length).toBeGreaterThan(0);
    expect(axisSelect2[0]?.id).toBe("axis-select");
  });

  it("finds all Select cards and ranks name matches in the top tier when searching 'select'", () => {
    const results = searchCards(ALL_CARDS, "select");
    expect(results.length).toBeGreaterThan(0);
    const topCardNames = results.slice(0, 10).map((c) => c.name.toLowerCase());
    expect(topCardNames.some((name) => name.includes("select"))).toBe(true);
    expect(results.some((c) => c.id === "axis-select")).toBe(true);
  });

  it("prefers exact substring matches over fuzzy ones", () => {
    const results = searchCards(ALL_CARDS, "infinia");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.id).toBe("hdfc-infinia-metal");
  });

  it("matches across multiple tokens in any order", () => {
    const a = searchCards(ALL_CARDS, "hdfc millennia");
    const b = searchCards(ALL_CARDS, "millennia hdfc");
    expect(a[0]?.id).toBe(b[0]?.id);
    expect(a.length).toBeGreaterThan(0);
  });

  it("supports industry acronyms and abbreviations (DCB, MRCC, APAY)", () => {
    const dcb = searchCards(ALL_CARDS, "dcb");
    expect(dcb[0]?.id).toBe("hdfc-diners-club-black-metal");

    const mrcc = searchCards(ALL_CARDS, "mrcc");
    expect(mrcc[0]?.id).toBe("amex-membership-rewards-credit-card");

    const apay = searchCards(ALL_CARDS, "apay");
    expect(apay[0]?.id).toBe("icici-amazon-pay");
  });

  it("supports feature keywords (LTF, UPI, Lounge, Forex)", () => {
    const ltf = searchCards(ALL_CARDS, "ltf");
    expect(ltf.length).toBeGreaterThan(0);
    expect(ltf.every((c) => c.fees.lifetimeFree)).toBe(true);

    const upi = searchCards(ALL_CARDS, "rupay upi");
    expect(upi.length).toBeGreaterThan(0);
    expect(upi.some((c) => c.upi.rupayUpiLinkable)).toBe(true);
  });

  it("falls back to fuzzy typo matching (e.g. infinnia -> Infinia)", () => {
    const results = searchCards(ALL_CARDS, "infinnia");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.id).toBe("hdfc-infinia-metal");
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
