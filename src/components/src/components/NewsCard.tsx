import { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, AlertTriangle, Zap } from "lucide-react";
import { detectParty, detectScandal, getBiasScore, getBiasLabel, isBreaking, type NewsItem } from "@/lib/news";
import { cn } from "@/lib/utils";

interface Props {
  item: NewsItem;
  onSave?: (item: NewsItem) => void;
  saved?: boolean;
}

const PARTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  PSOE: { bg: "bg-red-950/60",   text: "text-red-400",    border: "border-l-red-500" },
  PP:   { bg: "bg-blue-950/60",  text: "text-blue-400",   border: "border-l-blue-500" },
  VOX:  { bg: "bg-green-950/60", text: "text-green-400",  border: "border-l-green-500" },
  SUMAR:{ bg: "bg-purple-950/60",text: "text-purple-400", border: "border-l-purple-500" },
};

export function NewsCard({ item, onSave, saved }: Props) {
  const [voted, setVoted] = useState<"real" | "propaganda" | null>(null);

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
    <article
      className={cn(
        "rounded-lg border border-border border-l-4 p-3 mb-3 animate-slide-in transition-colors",
        partyStyle ? `${partyStyle.bg} ${partyStyle.border}` : "bg-card border-l-border"
      )}
    >
      {/* BADGES superiores */}
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
      <h2 className="headline text-sm font-bold text-foreground leading-snug mb-1">
        {item.title}
      </h2>

      {/* Descripción */}
      {item.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Barra de sesgo */}
      <div className="mb-2">
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
      <div className="flex items-center justify-between mt-2">
        {/* Votación */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setVoted("real")}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded border transition-colors",
              voted === "real"
                ? "bg-green-600 border-green-600 text-white"
                : "border-border text-muted-foreground hover:border-green-600"
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
                : "border-border text-muted-foreground hover:border-red-600"
            )}
          >
            👎 Propaganda
          </button>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{timeAgo()}</span>
          {onSave && (
            <button
              onClick={() => onSave(item)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {saved ? <BookmarkCheck size={14} className="text-primary" /> : <Bookmark size={14} />}
            </button>
          )}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
