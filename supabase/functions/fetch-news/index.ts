const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOURCES = [
  { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", category: "Generalista" },
  { name: "El País Política", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada", category: "Política" },
  { name: "El Mundo", url: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml", category: "Generalista" },
  { name: "El Mundo España", url: "https://e00-elmundo.uecdn.es/elmundo/rss/espana.xml", category: "Política" },
  { name: "RTVE", url: "https://api.rtve.es/api/noticias.rss", category: "Generalista" },
  { name: "ABC", url: "https://www.abc.es/rss/feeds/abcPortada.xml", category: "Generalista" },
  { name: "ABC España", url: "https://www.abc.es/rss/feeds/abc_Espana.xml", category: "Política" },
  { name: "20 Minutos", url: "https://www.20minutos.es/rss/", category: "Generalista" },
  { name: "La Vanguardia", url: "https://www.lavanguardia.com/rss/home.xml", category: "Generalista" },
  { name: "El Confidencial", url: "https://rss.elconfidencial.com/espana/", category: "Política" },
  { name: "elDiario.es", url: "https://www.eldiario.es/rss/", category: "Política" },
  { name: "Público", url: "https://www.publico.es/rss/", category: "Política" },
  { name: "OKDiario", url: "https://okdiario.com/feed", category: "Política" },
  { name: "La Razón", url: "https://www.larazon.es/rss/", category: "Política" },
  { name: "Libertad Digital", url: "https://www.libertaddigital.com/rss/", category: "Política" },
  { name: "El Debate", url: "https://eldebate.com/feed/", category: "Política" },
  { name: "Vozpópuli", url: "https://vozpopuli.com/feed/", category: "Política" },
  { name: "Marca", url: "https://e00-marca.uecdn.es/rss/portada.xml", category: "Deportes" },
];

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function extractImage(xml: string): string | undefined {
  const enclosure = xml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  if (enclosure) return enclosure[1];
  const media = xml.match(/<media:(?:content|thumbnail)[^>]*url="([^"]+)"/i);
  if (media) return media[1];
  const img = xml.match(/<img[^>]*src="([^"]+)"/i);
  if (img) return img[1];
  return undefined;
}

async function fetchSource(source: { name: string; url: string; category: string }) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EspañaLibre/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];
    return items.slice(0, 15).map((item, i) => {
      const title = extractTag(item, "title");
      const link = extractTag(item, "link");
      const description = extractTag(item, "description").slice(0, 240);
      const pubDate = extractTag(item, "pubDate");
      return {
        id: `${source.name}-${i}-${link}`,
        title,
        link,
        description,
        pubDate,
        source: source.name,
        category: source.category,
        image: extractImage(item),
      };
    }).filter((n) => n.title && n.link);
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const results = await Promise.all(SOURCES.map(fetchSource));
    const all = results.flat();
    all.sort((a, b) => {
      const da = new Date(a.pubDate).getTime() || 0;
      const db = new Date(b.pubDate).getTime() || 0;
      return db - da;
    });
    return new Response(JSON.stringify({ items: all }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
