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
  { name: "Marca", category: "Deportes" },
];

export async function fetchAllNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase.functions.invoke("fetch-news");
  if (error) {
    console.error("fetch-news invoke error", error);
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return (data?.items as NewsItem[]) ?? [];
}
