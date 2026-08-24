import { useRef, useState } from "react";
import { canonical } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Laptop, Moon, RotateCcw, Sun, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { ALL_CARDS, cardImageCoverage } from "@/data/cards";
import { parseDataset, useCompareTray, useDataset, useFavourites } from "@/lib/card-store";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useNumberFormatMode, type NumberFormatMode } from "@/lib/format-prefs";
import { formatCompactINR, formatINR } from "@/lib/format";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

const NUMBER_FORMAT_OPTIONS: { value: NumberFormatMode; label: string }[] = [
  { value: "full", label: "Full — \u20b91,50,000" },
  { value: "compact", label: "Compact — \u20b91.5 L" },
];

export const Route = createFileRoute("/settings")({
  head: () => ({
    links: canonical("/settings"),
    meta: [
      { title: "Settings & dataset tools — FindYourCC" },
      {
        name: "description",
        content:
          "Export the full FindYourCC credit card dataset as JSON, upload a corrected file, or reset your saved cards and preferences.",
      },
      { property: "og:title", content: "Settings & dataset tools — FindYourCC" },
      {
        property: "og:description",
        content: "Export, correct and re-import the Indian credit card dataset as JSON.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { cards, isOverridden, setOverride } = useDataset();
  const imageCoverage = cardImageCoverage();
  const favourites = useFavourites();
  const compare = useCompareTray();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { mode, setMode } = useTheme();
  const [numberFormat, setNumberFormat] = useNumberFormatMode();

  const resetAll = () => {
    if (typeof window === "undefined") return;
    if (!window.confirm("Clear every FindYourCC setting saved in this browser?")) return;
    Object.keys(window.localStorage)
      .filter(
        (key) =>
          key.startsWith("cardcompass.") || key.startsWith("cc:") || key.startsWith("findyourcc."),
      )
      .forEach((key) => window.localStorage.removeItem(key));
    toast.success("Local data cleared");
    window.setTimeout(() => window.location.reload(), 400);
  };

  const download = () => {
    const blob = new Blob([JSON.stringify({ cards }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `findyourcc-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${cards.length} cards`);
  };

  const upload = async (file: File) => {
    // Guard against a huge file locking up the tab before we ever parse it.
    const MAX_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const message = "That file is over 8 MB — export a fresh copy and trim it before uploading.";
      setError(message);
      toast.error(message);
      return;
    }
    const text = await file.text();
    const result = parseDataset(text);

    if ("error" in result) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    setError(null);
    setOverride(result.cards);
    toast.success(`Loaded ${result.cards.length} cards from your file`);
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything here lives in this browser only — there is no account and no server.
      </p>

      <section className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Dataset</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Currently showing {cards.length} cards
            {isOverridden ? " from your uploaded file" : " from the bundled dataset"} (bundled build
            has {ALL_CARDS.length}). Export, correct the JSON, and upload it back to override the
            bundled data without touching code.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {imageCoverage.withImage} of {imageCoverage.total} cards show the issuer&rsquo;s
            official product photo; the rest fall back to generated artwork. You can add or fix an
            image for any card by setting{" "}
            <code className="font-mono text-xs">art.officialImageUrl</code> in the exported JSON.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={download}>
            <Download className="size-4" aria-hidden="true" /> Export JSON
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" aria-hidden="true" /> Import JSON
          </Button>
          {isOverridden && (
            <Button variant="ghost" onClick={() => setOverride(null)}>
              <RotateCcw className="size-4" aria-hidden="true" /> Revert to bundled data
            </Button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Upload corrected dataset JSON"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a theme, or follow whatever your device is set to.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Theme">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={mode === option.value ? "default" : "outline"}
              onClick={() => setMode(option.value)}
              aria-pressed={mode === option.value}
              className="min-h-11"
            >
              <option.icon className="size-4" aria-hidden="true" /> {option.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Number formatting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All amounts use the Indian numbering system. Pick whether large figures are shortened to
            lakh/crore or written out in full.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Number format">
          {NUMBER_FORMAT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={numberFormat === option.value ? "default" : "outline"}
              onClick={() => setNumberFormat(option.value)}
              aria-pressed={numberFormat === option.value}
              className="min-h-11"
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Preview:{" "}
          <span className="font-medium text-foreground">
            {numberFormat === "full" ? formatINR(150000) : formatCompactINR(150000)}
          </span>{" "}
          annual spend
        </p>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Saved on this device</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{favourites.ids.length} favourite cards</li>
          <li>{compare.ids.length} cards in the comparison tray</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="min-h-11" onClick={compare.clear}>
            Clear comparison tray
          </Button>
          <Button variant="destructive" className="min-h-11" onClick={resetAll}>
            <Trash2 className="size-4" aria-hidden="true" /> Reset all local data
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Resetting clears favourites, the comparison tray, your wallet, spend profile, quiz
          answers, any uploaded dataset and these preferences — then reloads the page.
        </p>
      </section>

      <Disclaimer className="mt-8" />
    </div>
  );
}
