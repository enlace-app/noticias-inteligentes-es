import { supabase } from "@/integrations/supabase/client";

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

export const SOURCES: { name: string; category: string }[] = [
  { name: "El País", category: "Generalista" },
  { name: "El País Política", category: "Política" },
  { name: "El Mundo", category: "Generalista" },
  { name: "El Mundo España", category: "Política" },
  { name: "RTVE", category: "Generalista" },
  { name: "ABC", category: "Generalista" },
  { name: "ABC España", category: "Política" },
  { name: "20 Minutos", category: "Generalista" },
  { name: "La Vanguardia", category: "Generalista" },
  { name: "El Confidencial", category: "Política" },
  { name: "elDiario.es Política", category: "Política" },
  { name: "Público Política", category: "Política" },
  { name: "Marca", category: "Deportes" },
];

export type Party = "PP" | "PSOE" | "VOX" | null;

export function detectParty(item: { title: string; description: string }): Party {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const hasPP =
    /\bpp\b|partido popular|feij[oó]o|ayuso|n[uú][nñ]ez feij/i.test(text);
  const hasPSOE =
    /\bpsoe\b|s[aá]nchez|moncloa|socialistas?|ferraz/i.test(text) &&
    !/psoe-vox|sanchezada/i.test(text);
  const hasVOX = /\bvox\b|abascal|santiago abascal/i.test(text);
  // Priority: if multiple, pick the most specific mentioned first by name
  const counts: { p: Party; n: number }[] = [
    { p: "PP", n: hasPP ? 1 : 0 },
    { p: "PSOE", n: hasPSOE ? 1 : 0 },
    { p: "VOX", n: hasVOX ? 1 : 0 },
  ];
  const hits = counts.filter((c) => c.n > 0);
  if (hits.length === 1) return hits[0].p;
  return null;
}

const BREAKING_RE =
  /\b(?:[uú]ltima hora|directo|en directo|urgente|breaking)\b/i;

export function isBreaking(item: { title: string; description: string; pubDate: string }): boolean {
  if (BREAKING_RE.test(item.title) || BREAKING_RE.test(item.description)) return true;
  const t = new Date(item.pubDate).getTime();
  if (!t) return false;
  // Consider "breaking" anything published in the last 30 minutes
  return Date.now() - t < 30 * 60 * 1000;
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase.functions.invoke("fetch-news");
  if (error) {
    console.error("fetch-news invoke error", error);
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return (data?.items as NewsItem[]) ?? [];
}
