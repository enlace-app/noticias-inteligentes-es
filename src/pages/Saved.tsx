import { useEffect } from "react";
import { useSavedNews } from "@/hooks/useSavedNews";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, ExternalLink, Trash2, Inbox } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";

export default function Saved() {
  const { items, isLoading, remove } = useSavedNews();

  useEffect(() => {
    document.title = "Guardadas · España en directo";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Guardadas" subtitle={`${items.length} noticias`} icon={Bookmark} />

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-3">
            <Inbox className="h-10 w-10 opacity-50" />
            <p>No tienes noticias guardadas todavía.</p>
            <p className="text-xs">Pulsa el icono del marcador en cualquier noticia.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Card key={n.id} className="overflow-hidden">
                <div className="flex gap-3">
                  {n.image && (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-24 sm:w-32 shrink-0 bg-muted"
                    >
                      <img
                        src={n.image}
                        alt={n.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.currentTarget.parentElement!.style.display = "none"))}
                      />
                    </a>
                  )}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {n.source && (
                        <Badge variant="outline" className="text-[10px]">
                          {n.source}
                        </Badge>
                      )}
                      {n.category && (
                        <Badge variant="secondary" className="text-[10px]">
                          {n.category}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                      {n.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-1">
                      <Button asChild size="sm" variant="ghost" className="h-8 px-2">
                        <a href={n.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Abrir
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                        onClick={() => remove(n.newsId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
