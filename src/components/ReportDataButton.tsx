import { useState } from "react";
import { Copy, Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { CreditCard } from "@/data/types";
import { formatDate, formatFee } from "@/lib/format";

function buildSummary(card: CreditCard, url: string): string {
  return [
    `Card: ${card.name}`,
    `Issuer: ${card.issuer}`,
    `ID: ${card.id}`,
    `Joining fee: ${formatFee(card.fees.joiningFee)}`,
    `Annual fee: ${card.fees.lifetimeFree ? "Lifetime free" : formatFee(card.fees.annualFee)}`,
    `Base earn: ${card.rewards.baseRatePer100} per ₹100 (${card.rewards.effectiveBaseRatePct}% effective)`,
    `Last verified: ${formatDate(card.lastVerified)}`,
    `Page: ${url}`,
    "",
    "What's wrong: ",
  ].join("\n");
}

export function ReportDataButton({ card }: { card: CreditCard }) {
  const [open, setOpen] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : `/card/${card.id}`;
  const summary = buildSummary(card, url);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Summary copied to clipboard");
    } catch {
      toast.error("Couldn't copy — please select and copy manually");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Flag className="size-3.5" aria-hidden="true" />
          Report incorrect data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report incorrect data</DialogTitle>
          <DialogDescription>
            CardCompass has no inbox of its own. Copy the summary below, add what's wrong, and send
            it to whoever maintains this deployment — or fix it yourself by editing the dataset in
            Settings.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          readOnly
          value={summary}
          rows={11}
          aria-label="Data correction summary"
          className="resize-none font-mono text-xs"
        />
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" onClick={copySummary} className="gap-1.5">
            <Copy className="size-4" aria-hidden="true" /> Copy summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
