import { createFileRoute } from "@tanstack/react-router";
import { ALL_CARDS } from "@/data/cards";

const STATIC_PATHS = [
  { path: "/", priority: "1.0" },
  { path: "/explore", priority: "0.9" },
  { path: "/match", priority: "0.9" },
  { path: "/compare", priority: "0.7" },
  { path: "/calculator", priority: "0.7" },
  { path: "/wallet", priority: "0.6" },
  { path: "/learn", priority: "0.8" },
];

function buildSitemap(origin: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    ...STATIC_PATHS.map((entry) => ({
      loc: `${origin}${entry.path}`,
      lastmod: today,
      priority: entry.priority,
    })),
    // Discontinued products stay reachable but are kept out of the sitemap.
    ...ALL_CARDS.filter((card) => card.status !== "Discontinued").map((card) => ({
      loc: `${origin}/card/${card.id}`,
      lastmod: (card.lastVerified ?? today).slice(0, 10),
      priority: "0.6",
    })),
  ];

  const body = entries
    .map(
      (entry) =>
        `  <url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod><priority>${entry.priority}</priority></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        return new Response(buildSitemap(origin), {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
