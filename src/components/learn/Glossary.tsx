import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GLOSSARY } from "@/data/learn";
import { Input } from "@/components/ui/input";

export function Glossary() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = GLOSSARY.filter(
      (t) =>
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.example ?? "").toLowerCase().includes(q),
    );
    const map = new Map<string, typeof filtered>();
    for (const term of [...filtered].sort((a, b) => a.term.localeCompare(b.term))) {
      const letter = term.term[0]?.toUpperCase() ?? "#";
      const list = map.get(letter);
      if (list) list.push(term);
      else map.set(letter, [term]);
    }
    return [...map.entries()];
  }, [query]);

  const count = groups.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <section aria-labelledby="glossary" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="glossary" className="font-display text-2xl font-bold tracking-tight">
            Glossary
          </h2>
          <p className="text-sm text-muted-foreground">
            The jargon on your statement, in plain English.
          </p>
        </div>
        <div className="relative sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search glossary"
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {count} term{count === 1 ? "" : "s"}
      </p>

      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing matches &ldquo;{query}&rdquo;. Try a shorter word.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([letter, terms]) => (
            <div key={letter}>
              <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-primary">
                {letter}
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                {terms.map((term) => (
                  <div key={term.term} className="rounded-xl border border-border bg-card p-4">
                    <dt className="text-sm font-semibold">{term.term}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{term.definition}</dd>
                    {term.example ? (
                      <dd className="mt-2 text-xs text-muted-foreground/80">
                        <span className="font-medium text-foreground/80">Example:</span>{" "}
                        {term.example}
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
