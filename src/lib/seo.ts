/** Shared SEO helpers for route head() functions. TanStack Start has no react-helmet; use Route head(). */

/**
 * Canonical origin. Derived from the environment so a rename or custom domain
 * doesn't leave stale absolute URLs baked into the markup.
 */
export const SITE_ORIGIN: string = (
  (typeof import.meta !== "undefined" ? import.meta.env?.["VITE_SITE_ORIGIN"] : undefined) ??
  "https://cardcompassin.lovable.app"
).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical <link> for a route. Always absolute, always self-referencing. */
export function canonical(path: string) {
  return [{ rel: "canonical", href: absoluteUrl(path) }];
}

export interface SeoInput {
  title: string;
  description: string;
  type?: "website" | "article";
  noindex?: boolean;
}

export function seoMeta({ title, description, type = "website", noindex }: SeoInput) {
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return meta;
}

export function jsonLdScript(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}
