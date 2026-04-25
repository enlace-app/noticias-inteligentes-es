import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toSavedNews, type SavedNews } from "@/types";
import type { NewsItem } from "@/lib/news";
import { toast } from "sonner";

const KEY = ["saved-news"];

export function useSavedNews() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async (): Promise<SavedNews[]> => {
      const { data, error } = await supabase
        .from("saved_news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toSavedNews);
    },
  });

  const savedIds = new Set(query.data?.map((n) => n.newsId) ?? []);

  const save = useMutation({
    mutationFn: async (n: NewsItem) => {
      if (!user) throw new Error("Inicia sesión para guardar noticias");
      const { error } = await supabase.from("saved_news").insert({
        user_id: user.id,
        news_id: n.id,
        title: n.title,
        description: n.description,
        link: n.link,
        image: n.image ?? null,
        source: n.source,
        category: n.category,
        pub_date: n.pubDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Noticia guardada");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (newsId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("saved_news")
        .delete()
        .eq("user_id", user.id)
        .eq("news_id", newsId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Eliminada de guardadas");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggle = (n: NewsItem) => {
    if (savedIds.has(n.id)) remove.mutate(n.id);
    else save.mutate(n);
  };

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    savedIds,
    save: save.mutate,
    remove: remove.mutate,
    toggle,
  };
}
