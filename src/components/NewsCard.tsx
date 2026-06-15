import { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, AlertTriangle, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { detectParty, detectScandal, getBiasScore, getBiasLabel, isBreaking, type NewsItem } from "@/lib/news";
import { cn } from "@/lib/utils";

interface Props {
  item: NewsItem;
  onSave?: (item: NewsItem) => void;
  saved?: boolean;
}

const PARTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  PSOE: { bg: "bg-red-950/60",    text: "text-red-400",    border: "border-l-red-500" },
  PP:   { bg: "bg-blue-950/60",   text: "text-blue-400",   border: "border-l-blue-500" },
  VOX:  { bg: "bg-green-950/60",  text: "text-green-400",  border: "border-l-green-500" },
  SUMAR:{ bg: "bg-purple-950/60", text: "text-purple-400", border: "border-l-purple-500" },
};

export function NewsCard({ item, onSave, saved }: Props) {
  const [voted, setVoted] = useState<"real" | "propaganda" | null>(null);
  const [expanded, setExpanded] = useState(false);

  const party     = detectParty(item);
  const scandal   = detectScandal(item);
  const breaking  = isBreaking(item);
  const bias      = getBiasScore(item.source);
  const biasLabel = getBiasLabel(bias);
  const partyStyle = party ? PARTY_STYLES[party] : null;

  const timeAgo = () => {
    const diff = Date.now() - new Date(item.pubDate).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "ahora";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <article className={cn(
      "rounded-lg border border-border border-l-4 mb-3 animate-slide-in overflow-hidden",
      partyStyle ? `${partyStyle.bg} ${partyStyle.border}` : "bg-card border-l-border"
    )}>
      {/* Cabecera pulsable */}
      <button className="w-full text-left p-3" onClick={() => setExpanded(!expanded)}>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {breaking && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white scandal-pulse">
              <Zap size={10} /> URGENTE
            </span>
          )}
          {scandal && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black scandal-pulse">
              <AlertTriangle size={10} /> ESCÁNDALO
            </span>
          )}
          {party && (
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", partyStyle?.text, "bg-black/30")}>
              {party}
            </span>
          )}
        </div>

        {/* Imagen */}
        {item.image && (
          <img
            src={item.image}
            alt=""
            className="w-full h-36 object-cover rounded mb-2 opacity-90"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Titular */}
        <h2 className="text-sm font-bold text-foreground leading-snug mb-2">
          {item.title}
        </h2>

        {/* Expand indicator */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Cerrar" : "Leer más"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{item.source}</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo()}</span>
          </div>
        </div>
      </button>

      {/* Contenido expandido */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-3 animate-slide-in">

          {/* Descripción completa */}
          {item.description && (
            <p className="text-xs text-foreground leading-relaxed mb-3">
              {item.description}
            </p>
          )}

          {/* Barra de sesgo */}
          <div className="mb-3">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
              <span>Izquierda</span>
              <span className="font-semibold">{item.source} · {biasLabel}</span>
              <span>Derecha</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="absolute top-0 h-full w-2 rounded-full bg-primary"
                style={{ left: `${(bias / 10) * 100 - 2}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-transparent to-red-600/30 rounded-full" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <button
                onClick={() => setVoted("real")}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded border transition-colors",
                  voted === "real"
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-border text-muted-foreground"
                )}
              >
                👍 Real
              </button>
              <button
                onClick={() => setVoted("propaganda")}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded border transition-colors",
                  voted === "propaganda"
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-border text-muted-foreground"
                )}
              >
                👎 Propaganda
              </button>
            </div>
            <div className="flex items-center gap-2">
              {onSave && (
                <button onClick={() => onSave(item)} className="text-muted-foreground hover:text-primary transition-colors">
                  {saved ? <BookmarkCheck size={14} className="text-primary" /> : <Bookmark size={14} />}
                </button>
              )}
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
