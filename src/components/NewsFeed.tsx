import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  detectParty,
  fetchAllNews,
  isBreaking,
  SOURCES,
  type NewsItem,
  type Party,
} from "@/lib/news";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  RefreshCw,
  ExternalLink,
  Search,
  Radio,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REFRESH_MS = 60_000;

const PARTY_LABEL: Record<Exclude<Party, null>, string> = {
  PP: "PP",
  PSOE: "PSOE",
  VOX: "VOX",
};

function partyCardClasses(party: Party): string {
  switch (party) {
    case "PP":
      return "bg-party-pp text-party-pp-foreground border-party-pp";
    case "PSOE":
      return "bg-party-psoe text-party-psoe-foreground border-party-psoe";
    case "VOX":
      return "bg-party-vox text-party-vox-foreground border-party-vox";
    default:
      return "";
  }
}

const REFRESH_MS = 60_000;

function timeAgo(date: string): string {
  const d = new Date(date).getTime();
  if (!d) return "";
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

const CATEGORIES = ["Todas", ...Array.from(new Set(SOURCES.map((s) => s.category)))];

export function NewsFeed() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [source, setSource] = useState("Todas");
  const [, setNow] = useState(Date.now());

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryCache, setSummaryCache] = useState<Record<string, string>>({});

  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["news"],
    queryFn: fetchAllNews,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let items: NewsItem[] = data ?? [];
    if (category !== "Todas") items = items.filter((n) => n.category === category);
    if (source !== "Todas") items = items.filter((n) => n.source === source);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, category, source, query]);

  const handleSummarize = async (e: React.MouseEvent, news: NewsItem) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveNews(news);
    setPanelOpen(true);
    setSummaryError(null);

    if (summaryCache[news.id]) {
      setSummary(summaryCache[news.id]);
      return;
    }

    setSummary("");
    setSummarizing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("summarize-news", {
        body: {
          title: news.title,
          description: news.description,
          source: news.source,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      const text = (result?.summary as string) ?? "";
      setSummary(text);
      setSummaryCache((prev) => ({ ...prev, [news.id]: text }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo generar el resumen";
      setSummaryError(msg);
      toast.error(msg);
    } finally {
      setSummarizing(false);
    }
  };

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">España en directo</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  En vivo · {dataUpdatedAt ? timeAgo(new Date(dataUpdatedAt).toISOString()) : "..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar noticias..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Actualizar"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "secondary"}
                onClick={() => setCategory(c)}
                className="shrink-0"
              >
                {c}
              </Button>
            ))}
            <span className="w-px bg-border mx-1 shrink-0" />
            <Button
              size="sm"
              variant={source === "Todas" ? "default" : "ghost"}
              onClick={() => setSource("Todas")}
              className="shrink-0"
            >
              Todas las fuentes
            </Button>
            {SOURCES.map((s) => (
              <Button
                key={s.name}
                size="sm"
                variant={source === s.name ? "default" : "ghost"}
                onClick={() => setSource(s.name)}
                className="shrink-0"
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-72 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No se han encontrado noticias con estos filtros.
          </div>
        ) : (
          <>
            {featured && (
              <Card className="overflow-hidden hover:shadow-lg transition-all border-border/60 mb-8 group">
                <div className="grid md:grid-cols-2 gap-0">
                  {featured.image && (
                    <a
                      href={featured.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video md:aspect-auto md:h-full overflow-hidden bg-muted block"
                    >
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                      />
                    </a>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge>{featured.source}</Badge>
                      <Badge variant="secondary">{featured.category}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {timeAgo(featured.pubDate)}
                      </span>
                    </div>
                    <a href={featured.link} target="_blank" rel="noopener noreferrer">
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                    </a>
                    <p className="text-muted-foreground line-clamp-3">{featured.description}</p>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <Button size="sm" onClick={(e) => handleSummarize(e, featured)}>
                        <Sparkles className="h-4 w-4" />
                        Resumir con IA
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <a href={featured.link} target="_blank" rel="noopener noreferrer">
                          Leer noticia
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((n) => (
                <Card
                  key={n.id}
                  className="h-full overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all border-border/60 flex flex-col group"
                >
                  {n.image && (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video overflow-hidden bg-muted block"
                    >
                      <img
                        src={n.image}
                        alt={n.title}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => ((e.currentTarget.parentElement!.style.display = "none"))}
                      />
                    </a>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {n.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{timeAgo(n.pubDate)}</span>
                    </div>
                    <a href={n.link} target="_blank" rel="noopener noreferrer">
                      <h3 className="font-semibold leading-snug mb-2 line-clamp-3 hover:text-primary transition-colors">
                        {n.title}
                      </h3>
                    </a>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {n.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => handleSummarize(e, n)}
                        className="flex-1"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Resumir con IA
                      </Button>
                      <Button asChild size="sm" variant="ghost" aria-label="Abrir noticia">
                        <a href={n.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-10">
              {filtered.length} noticias · Actualización automática cada minuto
            </p>
          </>
        )}
      </main>

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <SheetTitle className="text-base">Resumen con IA</SheetTitle>
            </div>
            {activeNews && (
              <SheetDescription className="text-foreground/90 leading-snug">
                <span className="block text-xs text-muted-foreground mb-1">
                  {activeNews.source} · {timeAgo(activeNews.pubDate)}
                </span>
                <span className="font-medium text-foreground">{activeNews.title}</span>
              </SheetDescription>
            )}
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {summarizing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando resumen...
              </div>
            ) : summaryError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {summaryError}
              </div>
            ) : summary ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            ) : null}

            {activeNews && (
              <Button asChild variant="outline" className="w-full">
                <a href={activeNews.link} target="_blank" rel="noopener noreferrer">
                  Leer noticia completa
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center pt-2">
              Resumen generado por IA. Puede contener imprecisiones.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
