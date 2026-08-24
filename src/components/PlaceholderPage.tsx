import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Disclaimer } from "@/components/Disclaimer";

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  lead: string;
  status: string;
  children?: ReactNode;
}

export function PlaceholderPage({
  icon: Icon,
  title,
  lead,
  status,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-base text-muted-foreground">{lead}</p>
        <p className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
          {status}
        </p>
        {children && <div className="flex justify-center">{children}</div>}
        <Disclaimer className="text-left" />
      </div>
    </div>
  );
}
