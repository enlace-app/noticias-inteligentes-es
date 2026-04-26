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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  ExternalLink,
  Search,
  Radio,
  Sparkles,
  Loader2,
  Zap,
  Bookmark,
  BookmarkCheck,
  Clock,
  Lightbulb,
  Newspaper,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSavedNews } from "@/hooks/useSavedNews";
import { BottomNav } from "@/components/BottomNav";

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
  const { savedIds, toggle: toggleSaved } = useSavedNews();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [source, setSource] = useState("Todas");
  const [, setNow] = useState(Date.now());

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  type SummaryBlocks = {
    what_happened: string;
    why_it_matters: string;
    what_could_happen: string;
    read_seconds: number;
  };
  const [blocksCache, setBlocksCache] = useState<Record<string, SummaryBlocks>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailNews, setDetailNews] = useState<NewsItem | null>(null);
  const [quickMode, setQuickMode] = useState(false);

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

  const runSummarize = async (news: NewsItem) => {
    setActiveNews(news);
    setPanelOpen(true);
    setSummaryError(null);

    if (blocksCache[news.id]) return;

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

      const blocks = result?.blocks as SummaryBlocks | undefined;
      if (blocks && blocks.what_happened) {
        setBlocksCache((prev) => ({ ...prev, [news.id]: blocks }));
      } else {
        // Fallback: convertir texto plano en bloques
        const text = (result?.summary as string) ?? "";
        setBlocksCache((prev) => ({
          ...prev,
          [news.id]: {
            what_happened: text,
            why_it_matters: "",
            what_could_happen: "",
            read_seconds: 60,
          },
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo generar el resumen";
      setSummaryError(msg);
      toast.error(msg);
    } finally {
      setSummarizing(false);
    }
  };

  const handleSummarize = (e: React.MouseEvent, news: NewsItem) => {
    e.preventDefault();
    e.stopPropagation();
    void runSummarize(news);
  };

  const openDetail = (e: React.MouseEvent, news: NewsItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDetailNews(news);
    setDetailOpen(true);
  };

  const detailParty: Party = detailNews
    ? detailNews.category === "Política"
      ? detectParty(detailNews)
      : null
    : null;
  const detailPartyCls = partyCardClasses(detailParty);
  const detailSummary = detailNews ? summaryCache[detailNews.id] ?? "" : "";
  const detailSummarizing =
    summarizing && activeNews?.id === detailNews?.id && !detailSummary;

  const breakingItems = useMemo(
    () => filtered.filter((n) => isBreaking(n)).slice(0, 4),
    [filtered],
  );
  const breakingIds = useMemo(() => new Set(breakingItems.map((n) => n.id)), [breakingItems]);
  const nonBreaking = useMemo(
    () => filtered.filter((n) => !breakingIds.has(n.id)),
    [filtered, breakingIds],
  );
  const featured = nonBreaking[0];
  const rest = nonBreaking.slice(1);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md safe-top">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <Radio className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold tracking-tight truncate">España en directo</h1>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                En vivo · {dataUpdatedAt ? timeAgo(new Date(dataUpdatedAt).toISOString()) : "..."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Actualizar"
              className="h-9 w-9 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar noticias..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "secondary"}
                onClick={() => setCategory(c)}
                className="shrink-0 h-7 text-xs rounded-full"
              >
                {c}
              </Button>
            ))}
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Button
              size="sm"
              variant={source === "Todas" ? "default" : "ghost"}
              onClick={() => setSource("Todas")}
              className="shrink-0 h-7 text-xs rounded-full"
            >
              Todas las fuentes
            </Button>
            {SOURCES.map((s) => (
              <Button
                key={s.name}
                size="sm"
                variant={source === s.name ? "default" : "ghost"}
                onClick={() => setSource(s.name)}
                className="shrink-0 h-7 text-xs rounded-full"
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {breakingItems.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-breaking text-breaking-foreground px-3 py-1 text-sm font-extrabold tracking-wider uppercase animate-pulse">
                    <Zap className="h-3.5 w-3.5" />
                    ¡Última hora!
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Actualizado en directo
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {breakingItems.map((n) => {
                    const party = n.category === "Política" ? detectParty(n) : null;
                    const partyCls = partyCardClasses(party);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={(e) => openDetail(e, n)}
                        className="block text-left w-full"
                      >
                        <Card
                          className={`p-4 border-2 border-breaking ${
                            partyCls || "bg-breaking/5"
                          } hover:shadow-lg transition-all`}
                        >
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <Badge className="bg-breaking text-breaking-foreground hover:bg-breaking/90 text-[10px] uppercase tracking-wider">
                              ¡Última hora!
                            </Badge>
                            {party && (
                              <Badge variant="outline" className={`text-[10px] ${partyCls ? "border-current text-current" : ""}`}>
                                {PARTY_LABEL[party]}
                              </Badge>
                            )}
                            <span className={`text-xs ml-auto ${partyCls ? "opacity-90" : "text-muted-foreground"}`}>
                              {n.source} · {timeAgo(n.pubDate)}
                            </span>
                          </div>
                          <h3 className={`font-bold leading-snug ${partyCls ? "" : "text-foreground"}`}>
                            {n.title}
                          </h3>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {featured && (() => {
              const fParty = featured.category === "Política" ? detectParty(featured) : null;
              const fPartyCls = partyCardClasses(fParty);
              return (
              <Card className={`overflow-hidden hover:shadow-lg transition-all mb-8 group ${fPartyCls || "border-border/60"}`}>
                <div className="grid md:grid-cols-2 gap-0">
                  {featured.image && (
                    <button
                      type="button"
                      onClick={(e) => openDetail(e, featured)}
                      className="aspect-video md:aspect-auto md:h-full overflow-hidden bg-muted block w-full"
                    >
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                      />
                    </button>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={fPartyCls ? "bg-background/20 text-current hover:bg-background/30 border-current/30" : ""}>
                        {featured.source}
                      </Badge>
                      <Badge variant="secondary" className={fPartyCls ? "bg-background/20 text-current hover:bg-background/30" : ""}>
                        {featured.category}
                      </Badge>
                      {fParty && (
                        <Badge variant="outline" className="border-current text-current">
                          {PARTY_LABEL[fParty]}
                        </Badge>
                      )}
                      <span className={`text-xs ml-auto ${fPartyCls ? "opacity-90" : "text-muted-foreground"}`}>
                        {timeAgo(featured.pubDate)}
                      </span>
                    </div>
                    <button type="button" onClick={(e) => openDetail(e, featured)} className="text-left">
                      <h2 className={`text-2xl md:text-3xl font-bold leading-tight mb-3 transition-colors ${fPartyCls ? "hover:opacity-90" : "hover:text-primary"}`}>
                        {featured.title}
                      </h2>
                    </button>
                    <p className={fPartyCls ? "opacity-90 line-clamp-3" : "text-muted-foreground line-clamp-3"}>
                      {featured.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant={fPartyCls ? "secondary" : "default"} onClick={(e) => openDetail(e, featured)}>
                        Ver detalle
                      </Button>
                      <Button size="sm" variant={fPartyCls ? "secondary" : "outline"} onClick={(e) => handleSummarize(e, featured)}>
                        <Sparkles className="h-4 w-4" />
                        Resumir con IA
                      </Button>
                      <Button asChild size="sm" variant="ghost" className={fPartyCls ? "text-current hover:bg-background/20 hover:text-current" : ""}>
                        <a href={featured.link} target="_blank" rel="noopener noreferrer">
                          Fuente
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              );
            })()}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((n) => {
                const party = n.category === "Política" ? detectParty(n) : null;
                const partyCls = partyCardClasses(party);
                const colored = !!partyCls;
                return (
                <Card
                  key={n.id}
                  className={`h-full overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group ${
                    colored ? partyCls + " border-2" : "border-border/60"
                  }`}
                >
                  {n.image && (
                    <button
                      type="button"
                      onClick={(e) => openDetail(e, n)}
                      className="aspect-video overflow-hidden bg-muted block w-full"
                    >
                      <img
                        src={n.image}
                        alt={n.title}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => ((e.currentTarget.parentElement!.style.display = "none"))}
                      />
                    </button>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${colored ? "border-current text-current bg-background/10" : ""}`}
                      >
                        {n.source}
                      </Badge>
                      {party && (
                        <Badge className="bg-background/20 text-current hover:bg-background/30 text-[10px] border border-current/30">
                          {PARTY_LABEL[party]}
                        </Badge>
                      )}
                      <span className={`text-xs ${colored ? "opacity-90" : "text-muted-foreground"}`}>
                        {timeAgo(n.pubDate)}
                      </span>
                    </div>
                    <button type="button" onClick={(e) => openDetail(e, n)} className="text-left">
                      <h3 className={`font-semibold leading-snug mb-2 line-clamp-3 transition-colors ${
                        colored ? "hover:opacity-90" : "hover:text-primary"
                      }`}>
                        {n.title}
                      </h3>
                    </button>
                    <p className={`text-sm line-clamp-3 flex-1 ${colored ? "opacity-90" : "text-muted-foreground"}`}>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSaved(n);
                        }}
                        aria-label={savedIds.has(n.id) ? "Quitar de guardadas" : "Guardar"}
                        className={colored ? "text-current hover:bg-background/20 hover:text-current" : ""}
                      >
                        {savedIds.has(n.id) ? (
                          <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
                );
              })}
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {detailNews && (
            <>
              {detailNews.image && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={detailNews.image}
                    alt={detailNews.title}
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.currentTarget.parentElement!.style.display = "none"))}
                  />
                </div>
              )}
              <div className={`p-6 ${detailPartyCls}`}>
                <DialogHeader className="text-left space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isBreaking(detailNews) && (
                      <Badge className="bg-breaking text-breaking-foreground hover:bg-breaking/90 text-[10px] uppercase tracking-wider animate-pulse">
                        <Zap className="h-3 w-3" />
                        ¡Última hora!
                      </Badge>
                    )}
                    <Badge variant="outline" className={detailPartyCls ? "border-current text-current bg-background/10" : ""}>
                      {detailNews.source}
                    </Badge>
                    <Badge variant="secondary" className={detailPartyCls ? "bg-background/20 text-current hover:bg-background/30" : ""}>
                      {detailNews.category}
                    </Badge>
                    {detailParty && (
                      <Badge variant="outline" className="border-current text-current">
                        {PARTY_LABEL[detailParty]}
                      </Badge>
                    )}
                    <span className={`text-xs ml-auto ${detailPartyCls ? "opacity-90" : "text-muted-foreground"}`}>
                      {timeAgo(detailNews.pubDate)}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                    {detailNews.title}
                  </DialogTitle>
                  <DialogDescription className={`text-base leading-relaxed ${detailPartyCls ? "text-current opacity-95" : "text-foreground/80"}`}>
                    {detailNews.description}
                  </DialogDescription>
                </DialogHeader>

                <div className={`mt-6 rounded-lg border p-4 ${detailPartyCls ? "bg-background/10 border-current/30" : "bg-muted/40"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md ${detailPartyCls ? "bg-background/20 text-current" : "bg-primary/10 text-primary"}`}>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-sm">Resumen con IA</h4>
                  </div>

                  {detailSummarizing ? (
                    <div className={`flex items-center gap-2 text-sm ${detailPartyCls ? "opacity-90" : "text-muted-foreground"}`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando resumen...
                    </div>
                  ) : detailSummary ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{detailSummary}</p>
                  ) : summaryError && activeNews?.id === detailNews.id ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      {summaryError}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className={`text-sm ${detailPartyCls ? "opacity-90" : "text-muted-foreground"}`}>
                        Genera un resumen breve en español con IA.
                      </p>
                      <Button
                        size="sm"
                        variant={detailPartyCls ? "secondary" : "default"}
                        onClick={() => void runSummarize(detailNews)}
                      >
                        <Sparkles className="h-4 w-4" />
                        Generar resumen
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-2 flex-wrap">
                  <Button asChild variant={detailPartyCls ? "secondary" : "default"}>
                    <a href={detailNews.link} target="_blank" rel="noopener noreferrer">
                      Leer noticia completa
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleSaved(detailNews)}
                    className={detailPartyCls ? "bg-transparent border-current text-current hover:bg-background/20 hover:text-current" : ""}
                  >
                    {savedIds.has(detailNews.id) ? (
                      <>
                        <BookmarkCheck className="h-4 w-4" />
                        Guardada
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
