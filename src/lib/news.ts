export type NewsItem = {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  image?: string;
  category: string;
};

export const SOURCES: { name: string; url: string; category: string }[] = [
  { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", category: "Generalista" },
  { name: "El Mundo", url: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml", category: "Generalista" },
  { name: "RTVE", url: "https://api.rtve.es/api/noticias.rss", category: "Generalista" },
  { name: "ABC", url: "https://www.abc.es/rss/feeds/abcPortada.xml", category: "Generalista" },
  { name: "20 Minutos", url: "https://www.20minutos.es/rss/", category: "Generalista" },
  { name: "La Vanguardia", url: "https://www.lavanguardia.com/rss/home.xml", category: "Generalista" },
  { name: "El Confidencial", url: "https://rss.elconfidencial.com/espana/", category: "Política" },
  { name: "Marca", url: "https://e00-marca.uecdn.es/rss/portada.xml", category: "Deportes" },
];

const PROXY = "https://api.allorigins.win/raw?url=";

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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

export async function fetchSource(source: { name: string; url: string; category: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${PROXY}${encodeURIComponent(source.url)}`, { cache: "no-store" });
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
    }).filter(n => n.title && n.link);
  } catch {
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.all(SOURCES.map(fetchSource));
  const all = results.flat();
  all.sort((a, b) => {
    const da = new Date(a.pubDate).getTime() || 0;
    const db = new Date(b.pubDate).getTime() || 0;
    return db - da;
  });
  return all;
}
