import { Zap, RefreshCw, Shield } from "lucide-react";

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
    <header className="sticky top-0 z-50 bg-background safe-top" style={{ borderBottom: "3px solid #DC2626" }}>
      {/* Ticker rojo */}
      <div style={{ background: "#DC2626" }} className="px-3 py-1 flex items-center gap-2 overflow-hidden">
        <span className="text-[10px] font-black text-white uppercase tracking-widest shrink-0">
          ⚡ ÚLTIMA HORA
        </span>
        <div className="ticker-wrap flex-1">
          <span className="ticker-text text-[10px] text-white/90 font-semibold">
            🇪🇸 ESPAÑA LIBRE · La verdad que el gobierno oculta · Noticias sin censura · Por España y su gente · Contra la corrupción socialista · Actualización en tiempo real
          </span>
        </div>
      </div>

      {/* Franja dorada de lema */}
      <div style={{ background: "#1a0a0a", borderBottom: "1px solid #7c1c1c" }} className="px-4 py-1 flex items-center gap-2">
        <Shield size={10} className="text-amber-500 shrink-0" />
        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">
          Por la libertad · Por España · Por la verdad
        </p>
      </div>

      {/* Cabecera principal */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: "#0A0A0F" }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇪🇸</span>
            <div>
              <h1 style={{ fontFamily: "serif", letterSpacing: "-0.02em" }} className="text-xl font-black text-white leading-none">
                ESPAÑA LIBRE
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#DC2626" }}>
                Noticias sin filtro · {timeAgo()}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-full transition-colors disabled:opacity-50"
          style={{ background: "#1a0a0a", border: "1px solid #7c1c1c" }}
        >
          <RefreshCw
            size={16}
            style={{ color: "#DC2626" }}
            className={isLoading ? "animate-spin" : ""}
          />
        </button>
      </div>
    </header>
  );
}
