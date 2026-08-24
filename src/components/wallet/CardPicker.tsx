import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { filterCards, DEFAULT_FILTERS } from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { formatFee } from "@/lib/format";

interface CardPickerProps {
  cards: CreditCard[];
  ownedIds: string[];
  onAdd: (id: string) => void;
}

function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function CardPicker({ cards, ownedIds, onAdd }: CardPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounced(query, 200);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return filterCards(cards, { ...DEFAULT_FILTERS, query: debouncedQuery })
      .filter((c) => !ownedIds.includes(c.id))
      .slice(0, 8);
  }, [cards, debouncedQuery, ownedIds]);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by card name or issuer to add it to your wallet…"
          aria-label="Search cards to add to wallet"
          className="pl-9"
        />
      </div>

      {open && debouncedQuery.trim() && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">No cards match "{debouncedQuery}".</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((card) => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(card.id);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface focus:bg-surface focus:outline-none"
                  >
                    <div className="w-14 shrink-0">
                      <CardArt art={card.art} name={card.name} issuer={card.issuer} size="sm" />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{card.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {card.issuer} · {formatFee(card.fees.annualFee)}
                      </span>
                    </span>
                    <Plus className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end border-t border-border p-1.5">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="mr-1 size-3.5" aria-hidden="true" /> Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
