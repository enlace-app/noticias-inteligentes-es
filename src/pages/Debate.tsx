import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNews, getBiasScore, type NewsItem } from "@/lib/news";
import { Scale, ExternalLink } from "lucide-react";

const LEFT_SOURCES = ["elDiario.es", "Público", "El País", "El País Política", "RTVE"];
const RIGHT_SOURCES = ["OKDiario", "OKDiario Sucesos", "Libertad Digital", "El Debate", "Vozpópuli"];

function getWords(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 4)
  );
}

function similarity(a: string, b: string): number {
  const wa = getWords(a);
  const wb = getWords(b);
  const intersection = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union === 0 ? 0 : intersection / union;
}

function findPairs(items: NewsItem[]) {
  const left = items.filter((n) => LEFT_SOURCES.includes(n.source));
  const right = items.filter((n) => RIGHT_SOURCES.includes(n.source));
  const pairs: { left: NewsItem; right: NewsItem; score: number }[] = [];
  const usedRight = new Set<string>();

  for (const l of left) {
    let best: NewsItem | null = null;
    let bestScore = 0;
    for (const r of right) {
      if (usedRight.has(r.id)) continue;
      const score = similarity(l.title, r.title);
      if (score > bestScore && score > 0.15) {
        bestScore = score;
        best = r;
      }
    }
    if (best) {
      usedRight.add(best.id);
      pairs.push({ left: l, right: best, score: bestScore });
    }
    if (pairs.length >= 8) break;
  }
  return pairs;
}

export default function Debate() {
  const { data, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: fetchAllNews,
    staleTime: 2 * 60 * 1000,
  });

  const pairs = useMemo(() => {
    if (!data) return [];
    return findPairs(data);
  }, [data]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Scale size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">MODO DEBATE</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          El mismo hecho. Dos versiones. Tú decides quién miente.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Buscando debates...</p>
        </div>
      )}

      {!isLoading && pairs.length === 0 && (
        <div className="text-center py-20 px-4">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-sm text-muted-foreground">No hay noticias coincidentes ahora mismo. Vuelve más tarde.</p>
        </div>
      )}

      <div className="px-3 py-3 space-y-4">
        {pairs.map((pair, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Cabecera del debate */}
            <div className="bg-secondary/50 px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Debate #{i + 1}
              </span>
              <span className="text-[10px] text-amber-500 font-bold">
                {Math.round(pair.score * 100)}% coincidencia
              </span>
            </div>

            {/* Dos columnas */}
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* Izquierda */}
              <div className="p-3" style={{ background: "rgba(37,99,235,0.08)" }}>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-wide">
                    {pair.left.source}
                  </span>
                </div>
                <p className="text-[11px] text-foreground font-semibold leading-snug mb-2">
                  {pair.left.title}
                </p>
                {pair.left.description && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                    {pair.left.description.slice(0, 120)}...
                  </p>
                )}
                <a
                  href={pair.left.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold"
                >
                  <ExternalLink size={10} /> Leer
                </a>
              </div>

              {/* Derecha */}
              <div className="p-3" style={{ background: "rgba(220,38,38,0.08)" }}>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-wide">
                    {pair.right.source}
                  </span>
                </div>
                <p className="text-[11px] text-foreground font-semibold leading-snug mb-2">
                  {pair.right.title}
                </p>
                {pair.right.description && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                    {pair.right.description.slice(0, 120)}...
                  </p>
                )}
                <a
                  href={pair.right.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-red-400 font-semibold"
                >
                  <ExternalLink size={10} /> Leer
                </a>
              </div>
            </div>

            {/* ¿Quién miente? */}
            <div className="px-3 py-2 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-bold">¿Quién da la versión correcta?</span>
              <div className="flex gap-2">
                <button className="text-[10px] px-2 py-0.5 rounded border border-blue-800 text-blue-400 hover:bg-blue-950/50 transition-colors">
                  La izquierda
                </button>
                <button className="text-[10px] px-2 py-0.5 rounded border border-red-800 text-red-400 hover:bg-red-950/50 transition-colors">
                  La derecha
                </button>
                <button className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:bg-secondary transition-colors">
                  Los dos mienten
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
