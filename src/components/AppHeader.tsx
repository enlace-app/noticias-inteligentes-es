import { Zap, RefreshCw } from "lucide-react";

interface Props {
  lastUpdated?: Date;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AppHeader({ lastUpdated, onRefresh, isLoading }: Props) {
  const timeAgo = () => {
    if (!lastUpdated) return "Actualizando...";
    const m = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (m < 1) return "ahora mismo";
    if (m < 60) return `hace ${m}m`;
    return `hace ${Math.floor(m / 60)}h`;
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b-2 border-primary safe-top">
      {/* Ticker de última hora */}
      <div className="bg-primary px-3 py-1 flex items-center gap-2 overflow-hidden">
        <span className="text-[10px] font-black text-white uppercase tracking-widest shrink-0">
          ⚡ Última hora
        </span>
        <div className="ticker-wrap flex-1">
          <span className="ticker-text text-[10px] text-white/90">
            España Libre · Noticias sin censura · Las noticias que el PSOE no quiere que veas · Actualización en tiempo real desde 18 fuentes
          </span>
        </div>
      </div>

      {/* Cabecera principal */}
      <div className="flex items-center justify-between px-4 py-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-primary fill-primary" />
            <h1 className="headline text-lg font-black text-foreground tracking-tight">
              ESPAÑA LIBRE
            </h1>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Noticias sin filtro · {timeAgo()}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={`text-primary ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </header>
  );
}
