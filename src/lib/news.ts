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
  { name: "El Mundo", category: "Generalista" },
  { name: "RTVE", category: "Generalista" },
  { name: "ABC", category: "Generalista" },
  { name: "20 Minutos", category: "Generalista" },
  { name: "La Vanguardia", category: "Generalista" },
  { name: "El Confidencial", category: "Política" },
  { name: "ABC España", category: "Política" },
  { name: "El Mundo España", category: "Política" },
  { name: "El País Política", category: "Política" },
  { name: "OKDiario", category: "Política" },
  { name: "La Razón", category: "Política" },
  { name: "Libertad Digital", category: "Política" },
  { name: "El Debate", category: "Política" },
  { name: "Vozpópuli", category: "Política" },
  { name: "elDiario.es", category: "Política" },
  { name: "Público", category: "Política" },
  { name: "Marca", category: "Deportes" },
];

export type Party = "PP" | "PSOE" | "VOX" | "SUMAR" | null;

export function detectParty(item: { title: string; description: string }): Party {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const hasPP = /\bpp\b|partido popular|feij[oó]o|ayuso|n[uú][nñ]ez feij/i.test(text);
  const hasPSOE = /\bpsoe\b|pedro s[aá]nchez|moncloa|socialistas?|ferraz|bego[nñ]a g[oó]mez|caso koldo|[aá]balos|amnist[ií]a|lawfare/i.test(text);
  const hasVOX = /\bvox\b|abascal|santiago abascal/i.test(text);
  const hasSUMAR = /\bsumar\b|yolanda d[ií]az|irene montero|\bpodemos\b/i.test(text);
  if (hasPSOE) return "PSOE";
  if (hasPP) return "PP";
  if (hasVOX) return "VOX";
  if (hasSUMAR) return "SUMAR";
  return null;
}

export function detectScandal(item: { title: string; description: string }): boolean {
  const text = `${item.title} ${item.description}`;
  return /escándalo|escandalo|corrupci[oó]n|deteni|imputad|investigad|juzgad|caso koldo|begoña|tráfico de influencias|trafico de influencias|indulto|malversaci[oó]n|espionaje|fraude|soborno|dimitir|dimisi[oó]n|tribunal|juicio|condena|denuncia|irregular/i.test(text);
}

export function detectSuceso(item: { title: string; description: string }): boolean {
  const text = `${item.title} ${item.description}`;
  return /violaci[oó]n|agresion sexual|agresión sexual|apuñal|degoll|asesin|homicid|atac[oó]|paliz|brutal|mena|inmigrante detenid|extranjero detenid|sin papeles detenid|banda criminal|banda organizada|secuestr|robaron|atraco|navaja|machete|pateras?|cayuco|asalt|violen|delito|preso|condena|agresor|maltrat/i.test(text);
}

export function getBiasScore(source: string): number {
  const left = ["elDiario.es", "Público", "El País", "El País Política", "RTVE"];
  const right = ["OKDiario", "Libertad Digital", "El Debate", "Vozpópuli", "ABC", "ABC España"];
  if (left.includes(source)) return 2;
  if (right.includes(source)) return 8;
  return 5;
}

export function getBiasLabel(score: number): string {
  if (score <= 3) return "Izquierda";
  if (score >= 7) return "Derecha";
  return "Centro";
}

const BREAKING_RE = /\b(?:[uú]ltima hora|directo|en directo|urgente|breaking)\b/i;

export function isBreaking(item: { title: string; description: string; pubDate: string }): boolean {
  if (BREAKING_RE.test(item.title) || BREAKING_RE.test(item.description)) return true;
  const t = new Date(item.pubDate).getTime();
  if (!t) return false;
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
