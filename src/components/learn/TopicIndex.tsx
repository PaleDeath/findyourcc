import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Coins,
  Gauge,
  Globe2,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { LEARN_TOPICS, type LearnIconName, type LearnTopic } from "@/data/learn";
import { TopicBlocks } from "@/components/learn/TopicBlocks";
import { Input } from "@/components/ui/input";

const ICONS: Record<LearnIconName, LucideIcon> = {
  CalendarClock,
  AlertTriangle,
  Gauge,
  Receipt,
  Smartphone,
  ShieldCheck,
  XCircle,
  Globe2,
  Coins,
};

function topicText(topic: LearnTopic): string {
  const blockText = topic.blocks
    .map((b) => {
      if (b.kind === "p") return b.text;
      if (b.kind === "bullets") return `${b.heading ?? ""} ${b.items.join(" ")}`;
      if (b.kind === "callout") return `${b.heading} ${b.text}`;
      return `${b.heading ?? ""} ${b.columns.join(" ")} ${b.rows.flat().join(" ")}`;
    })
    .join(" ");
  return `${topic.title} ${topic.summary} ${blockText}`.toLowerCase();
}

export function TopicIndex() {
  const [query, setQuery] = useState("");

  const topics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LEARN_TOPICS;
    return LEARN_TOPICS.filter((t) => topicText(t).includes(q));
  }, [query]);

  return (
    <section aria-labelledby="explainers" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="explainers" className="font-display text-2xl font-bold tracking-tight">
            Explainers
          </h2>
          <p className="text-sm text-muted-foreground">
            Nine things Indian card issuers would rather you skimmed.
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
            placeholder="Search explainers…"
            aria-label="Search explainers"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Contents" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1.5 text-sm">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <a
                  href={`#${topic.slug}`}
                  className="block rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                  {topic.title.split("—")[0]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {topics.length} explainer{topics.length === 1 ? "" : "s"}
          </p>

          {topics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No explainer matches &ldquo;{query}&rdquo;. Try &ldquo;interest&rdquo;,
              &ldquo;UPI&rdquo; or &ldquo;forex&rdquo;.
            </div>
          ) : (
            topics.map((topic) => {
              const Icon = ICONS[topic.icon];
              return (
                <article
                  key={topic.slug}
                  id={topic.slug}
                  className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-6"
                >
                  <header className="mb-4 flex items-start gap-3">
                    <span className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight">
                        {topic.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{topic.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {topic.readMinutes} min read
                      </p>
                    </div>
                  </header>
                  <TopicBlocks blocks={topic.blocks} />
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
