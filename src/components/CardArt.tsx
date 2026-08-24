import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CardArt as CardArtData, Network } from "@/data/types";

const NETWORK_WORDMARK: Record<Network, string> = {
  Visa: "VISA",
  Mastercard: "mastercard",
  RuPay: "RuPay»",
  "American Express": "AMERICAN EXPRESS",
  "Diners Club": "DINERS CLUB",
};

interface CardArtProps {
  art: CardArtData;
  name: string;
  issuer: string;
  network?: Network | undefined;
  /** Rendering size. */
  size?: "sm" | "md" | "lg" | undefined;
  dimmed?: boolean | undefined;
  className?: string | undefined;
}

function usePointerTilt(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [interactive, setInteractive] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setInteractive(false);
      return;
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setInteractive(finePointer);
  }, [enabled, reducedMotion]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      ref.current.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateZ(0)`;
    },
    [interactive],
  );

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return { ref, interactive, onPointerMove, reset };
}

export function CardArt({
  art,
  name,
  issuer,
  network,
  size = "md",
  dimmed = false,
  className,
}: CardArtProps) {
  const { ref, interactive, onPointerMove, reset } = usePointerTilt(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const titleId = useId();
  const grainId = `grain-${titleId.replace(/:/g, "")}`;

  const [c1, c2, c3] = art.gradient;
  const isVertical = art.layout === "vertical";
  const finishLabel =
    art.finish === "metal"
      ? "metal-finish"
      : art.finish === "carbon"
        ? "carbon-fibre-textured"
        : art.finish === "holographic"
          ? "holographic"
          : art.finish === "glossy"
            ? "glossy"
            : "matte";
  const artDescription = `Stylised artwork for ${issuer} ${name}, a ${finishLabel} ${network ? `${network} ` : ""}card`;

  const baseGradient =
    art.finish === "metal"
      ? `linear-gradient(115deg, ${c1} 0%, ${c2} 22%, ${c3 ?? c1} 38%, ${c2} 52%, ${c1} 70%, ${c3 ?? c2} 88%, ${c2} 100%)`
      : art.finish === "carbon"
        ? `linear-gradient(140deg, ${c1}, ${c2} 70%, ${c3 ?? c1})`
        : `linear-gradient(135deg, ${c1} 0%, ${c2} 60%${c3 ? `, ${c3} 100%` : ""})`;

  const textScale = size === "sm" ? "text-[0.55rem]" : size === "lg" ? "text-sm" : "text-[0.7rem]";

  if (art.officialImageUrl && !imageFailed) {
    // Official artwork varies in orientation/ratio; derive the frame from the
    // image itself so nothing sits in a half-empty box.
    const ratio = imageRatio ?? (isVertical ? 1 / 1.586 : 1.586);
    const framedRatio = Math.min(Math.max(ratio, 1 / 1.7), 1.8);
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted/40 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)]",
          dimmed && "opacity-60 saturate-50",
          className,
        )}
        style={{ aspectRatio: `${framedRatio}` }}
      >
        <img
          src={art.officialImageUrl}
          alt={`${issuer} ${name} credit card`}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            const img = event.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setImageRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-contain p-[3%]"
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      role="img"
      aria-labelledby={titleId}
      className={cn(
        "group/art relative isolate w-full overflow-hidden rounded-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] transition-transform duration-200 ease-out will-change-transform",
        dimmed && "opacity-60 saturate-50",
        className,
      )}
      style={{
        aspectRatio: isVertical ? "1 / 1.586" : "1.586 / 1",
        background: baseGradient,
        transformStyle: interactive ? "preserve-3d" : undefined,
      }}
    >
      <span id={titleId} className="sr-only">
        {artDescription}
      </span>
      {/* grain */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16] mix-blend-overlay"
        aria-hidden="true"
      >
        <filter id={`${grainId}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      {/* finish overlays */}
      {art.finish === "glossy" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_0%,rgba(255,255,255,0.42),transparent_55%)]" />
      )}
      {art.finish === "carbon" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px)",
          }}
        />
      )}
      {art.finish === "metal" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 3px)",
          }}
        />
      )}
      {art.finish === "holographic" && (
        <div
          className="cc-holo pointer-events-none absolute inset-0 opacity-55 mix-blend-color-dodge"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(255,0,128,0.5), rgba(0,255,214,0.45) 35%, rgba(255,214,0,0.5) 70%, rgba(120,0,255,0.5))",
          }}
        />
      )}

      {/* hover sheen */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 group-hover/art:opacity-100 group-hover/art:[animation:cc-sheen_900ms_ease-out]" />
      </div>

      {/* content */}
      <div
        className={cn(
          "relative flex h-full w-full flex-col justify-between p-[6%] text-white",
          textScale,
        )}
        style={{ color: "#ffffff" }}
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className="font-semibold uppercase tracking-[0.18em] drop-shadow-sm"
            style={{ color: art.accent }}
          >
            {art.issuerMark}
          </span>
          <ContactlessGlyph />
        </div>

        <div className="flex items-center gap-[4%]">
          <ChipGlyph />
          {size !== "sm" && (
            <span
              className="font-mono tracking-[0.12em] opacity-90"
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 -1px 1px rgba(0,0,0,0.45)" }}
            >
              •••• •••• •••• 1234
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          <span className="max-w-[62%] truncate font-semibold uppercase tracking-wider opacity-95">
            {name}
          </span>
          {network && (
            <span className="shrink-0 font-bold uppercase italic tracking-tight opacity-95">
              {NETWORK_WORDMARK[network]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChipGlyph() {
  return (
    <svg viewBox="0 0 40 30" className="h-[13%] w-auto min-h-4 shrink-0" aria-hidden="true">
      <rect x="0.5" y="0.5" width="39" height="29" rx="5" fill="#e6c878" stroke="#b8963f" />
      <path
        d="M13 0v8H0M13 30v-8H0M27 0v8h13M27 30v-8h13M13 8h14v14H13z"
        fill="none"
        stroke="#b8963f"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function ContactlessGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[14%] w-auto min-h-4 shrink-0 opacity-90"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M7 8a7 7 0 0 1 0 8" />
        <path d="M11 5.5a11 11 0 0 1 0 13" />
        <path d="M15 3a15 15 0 0 1 0 18" />
      </g>
    </svg>
  );
}
