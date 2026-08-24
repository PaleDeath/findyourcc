import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, CreditCard as CreditCardIcon, LayoutGrid } from "lucide-react";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { listIssuers, searchCards } from "@/data/cards";
import { useDataset } from "@/lib/card-store";
import { formatFee } from "@/lib/format";

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/compare", label: "Compare" },
  { to: "/match", label: "Match" },
  { to: "/calculator", label: "Calculator" },
  { to: "/wallet", label: "Wallet" },
  { to: "/learn", label: "Learn" },
  { to: "/settings", label: "Settings" },
] as const;

const MAX_PAGES = 8;
const MAX_ISSUERS = 8;
const MAX_CARDS = 30;

export const COMMAND_PALETTE_OPEN_EVENT = "cardcompass:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(COMMAND_PALETTE_OPEN_EVENT));
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const openPalette = useCallback(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const closePalette = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      window.setTimeout(() => {
        lastFocusedRef.current?.focus?.();
      }, 0);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => {
          if (!prev) lastFocusedRef.current = document.activeElement as HTMLElement | null;
          return !prev;
        });
        return;
      }

      if (event.key === "/" && !isTypingTarget && !open) {
        event.preventDefault();
        openPalette();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, openPalette]);

  useEffect(() => {
    function onOpenRequest() {
      openPalette();
    }
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, onOpenRequest);
    return () => window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, onOpenRequest);
  }, [openPalette]);

  const { cards } = useDataset();
  const issuers = useMemo(() => listIssuers(cards), [cards]);

  const q = normalize(query);

  const filteredPages = useMemo(() => {
    if (!q) return PAGES.slice(0, MAX_PAGES);
    return PAGES.filter((p) => normalize(p.label).includes(q)).slice(0, MAX_PAGES);
  }, [q]);

  const filteredIssuers = useMemo(() => {
    if (!q) return issuers.slice(0, MAX_ISSUERS);
    return issuers.filter((i) => normalize(i.name).includes(q)).slice(0, MAX_ISSUERS);
  }, [issuers, q]);

  // Single source of truth: the same matcher Explore uses.
  const filteredCards = useMemo(() => {
    if (!q) return cards.slice(0, MAX_CARDS);
    return searchCards(cards, q).slice(0, MAX_CARDS);
  }, [cards, q]);

  function go(to: string, search?: Record<string, string>) {
    closePalette(false);
    navigate({ to, search: search as never });
  }

  return (
    // We filter above; cmdk's own fuzzy pass would then hide valid matches.
    <CommandDialog open={open} onOpenChange={closePalette} shouldFilter={false}>
      <DialogTitle className="sr-only">Search FindYourCC</DialogTitle>
      <DialogDescription className="sr-only">
        Jump to a page, issuer or credit card
      </DialogDescription>
      <CommandInput
        placeholder="Search pages, issuers or cards…"
        value={query}
        onValueChange={setQuery}
        aria-label="Search FindYourCC"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {filteredPages.length > 0 && (
          <CommandGroup heading="Pages">
            {filteredPages.map((page) => (
              <CommandItem key={page.to} value={`page-${page.label}`} onSelect={() => go(page.to)}>
                <LayoutGrid aria-hidden="true" />
                <span>{page.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredIssuers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Issuers">
              {filteredIssuers.map((issuer) => (
                <CommandItem
                  key={issuer.id}
                  value={`issuer-${issuer.name}`}
                  onSelect={() => go("/explore", { issuer: issuer.id })}
                >
                  <Building2 aria-hidden="true" />
                  <span>{issuer.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {issuer.count} cards
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredCards.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Cards">
              {filteredCards.map((card) => (
                <CommandItem
                  key={card.id}
                  value={`card-${card.id}-${card.name}-${card.issuer}`}
                  onSelect={() => go("/card/$id".replace("$id", card.id))}
                >
                  <CreditCardIcon aria-hidden="true" />
                  <span className="truncate">{card.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {card.issuer} · {formatFee(card.fees.joiningFee)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
