import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNews, detectParty, detectScandal, detectSuceso, isBreaking, type NewsItem } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { AppHeader } from "@/components/AppHeader";

const CATEGORIES = ["Todo", "Política", "Urgente", "Escándalos", "Sucesos", "Generalista", "Deportes"];

export function NewsFeed() {
  const [category, setCategory] = useState("Todo");
  const [saved, setSaved] = useState<string[]>([]);

  const { data, isLoading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["news"],
    queryFn: fetchAllNews,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    switch (category) {
      case "Urgente":
        return data.filter(isBreaking);
      case "Escándalos":
        return data.filter(detectScandal);
      case "Sucesos":
        return data.filter(detectSuceso);
      case "Política":
        return data.filter((n) => detectParty(n) !== null || n.category === "Política");
      case "Generalista":
        return data.filter((n) => n.category === "Generalista");
      case "Deportes":
        return data.filter((n) => n.category === "Deportes");
      default:
        return data;
    }
  }, [data, category]);

  const handleSave = (item: NewsItem) => {
    setSaved((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  const sucesosCount = useMemo(() => data?.filter(detectSuceso).length ?? 0, [data]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Estadísticas rápidas */}
      {data && (
        <div className="grid grid-cols-4 gap-0 border-b border-border">
          <div className="text-center py-3">
            <p className="text-lg font-black text-primary">
              {data.filter(detectScandal).length}
            </p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wide">Escándalos</p>
          </div>
          <div className="text-center py-3 border-x border-border">
            <p className="text-lg font-black text-amber-500">
              {data.filter(isBreaking).length}
            </p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wide">Urgentes</p>
          </div>
          <div className="text-center py-3 border-r border-border">
            <p className="text-lg font-black text-orange-500">
              {sucesosCount}
            </p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wide">Sucesos</p>
          </div>
          <div className="text-center py-3">
            <p className="text-lg font-black text-foreground">
              {data.length}
            </p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wide">Noticias</p>
          </div>
        </div>
      )}

      {/* Filtros de categoría */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`tab-pill shrink-0 ${category === cat ? "active" : ""}`}
          >
            {cat === "Sucesos" ? "🔪 Sucesos" : cat}
          </button>
        ))}
      </div>

      {/* Aviso en sección Sucesos */}
      {category === "Sucesos" && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-orange-950/40 border border-orange-800/50">
          <p className="text-[11px] text-orange-400 leading-relaxed">
            ⚠️ <strong>Noticias de sucesos y criminalidad</strong> que la prensa afín al gobierno minimiza o no portadea. Hechos contrastados con fuentes judiciales y policiales.
          </p>
        </div>
      )}

      {/* Lista de noticias */}
      <div className="px-3 pt-3">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Cargando noticias...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-muted-foreground">No hay noticias en esta categoría ahora mismo</p>
          </div>
        )}

        {filtered.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            onSave={handleSave}
            saved={saved.includes(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
