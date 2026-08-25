import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchCards } from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { cn } from "@/lib/utils";
import { MAX_COMPARE } from "@/lib/card-store";

interface CardSelectorProps {
  cards: CreditCard[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CardSelector({ cards, selectedIds, onChange }: CardSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;
    return searchCards(cards, search);
  }, [cards, search]);

  const selected = selectedIds
    .map((id) => cards.find((c) => c.id === id))
    .filter((c): c is CreditCard => Boolean(c));

  const canAddMore = selected.length < MAX_COMPARE;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < MAX_COMPARE) {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Cards to model</h2>
        <span className="text-xs text-muted-foreground">
          {selected.length} / {MAX_COMPARE} selected
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {selected.map((card) => (
          <Badge key={card.id} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-1.5 text-sm">
            {card.name}
            <button
              type="button"
              onClick={() => toggle(card.id)}
              aria-label={`Remove ${card.name}`}
              className="grid size-4 place-items-center rounded-full hover:bg-muted-foreground/20"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {selected.length === 0 && (
          <p className="text-sm text-muted-foreground">No cards selected yet.</p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={!canAddMore}
            className="w-full justify-between sm:w-80"
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus className="size-4" aria-hidden="true" />
              {canAddMore ? "Add a card" : `Max ${MAX_COMPARE} cards`}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(24rem,90vw)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search cards by name, bank, acronym (e.g. DCB, MRCC)…"
            />
            <CommandList>
              {filteredCards.length === 0 && <CommandEmpty>No cards found.</CommandEmpty>}
              <CommandGroup>
                {filteredCards.slice(0, 30).map((card) => {
                  const isSelected = selectedIds.includes(card.id);
                  return (
                    <CommandItem
                      key={card.id}
                      value={card.id}
                      onSelect={() => {
                        toggle(card.id);
                      }}
                    >
                      <Check
                        className={cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                      <div className="flex flex-col">
                        <span>{card.name}</span>
                        <span className="text-xs text-muted-foreground">{card.issuer}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
