import type { LearnBlock } from "@/data/learn";
import { cn } from "@/lib/utils";

export function TopicBlocks({ blocks }: { blocks: LearnBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.kind === "p") {
          return (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {block.text}
            </p>
          );
        }
        if (block.kind === "bullets") {
          return (
            <div key={i}>
              {block.heading ? (
                <p className="mb-2 text-sm font-semibold text-foreground">{block.heading}</p>
              ) : null}
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        if (block.kind === "callout") {
          return (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-4 text-sm leading-relaxed",
                block.tone === "warning" && "border-destructive/40 bg-destructive/5",
                block.tone === "example" && "border-primary/40 bg-primary/5",
                block.tone === "info" && "border-border bg-surface",
              )}
            >
              <p className="mb-1 font-semibold text-foreground">{block.heading}</p>
              <p className="text-foreground/90">{block.text}</p>
            </div>
          );
        }
        return (
          <div key={i} className="overflow-x-auto rounded-lg border border-border">
            {block.heading ? (
              <p className="border-b border-border bg-surface px-4 py-2 text-sm font-semibold">
                {block.heading}
              </p>
            ) : null}
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {block.columns.map((c, j) => (
                    <th key={j} className="px-4 py-2 font-semibold text-muted-foreground">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, j) => (
                  <tr key={j} className="border-b border-border last:border-0">
                    {row.map((cell, k) => (
                      <td key={k} className="px-4 py-2 text-foreground/90">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
