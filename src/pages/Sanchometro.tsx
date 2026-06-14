import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNews, detectScandal, detectParty } from "@/lib/news";
import { AlertTriangle, Clock, TrendingUp, Flame } from "lucide-react";

const INICIO_GOBIERNO = new Date("2018-06-02");

const HITOS = [
  { fecha: "2021-06-22", texto: "Indultos a presos del procés", gravedad: 10 },
  { fecha: "2023-11-09", texto: "Ley de Amnistía negociada con independentistas", gravedad: 10 },
  { fecha: "2024-03-01", texto: "Caso Begoña Gómez — tráfico de influencias", gravedad: 9 },
  { fecha: "2023-09-15", texto: "Caso Koldo — compra de mascarillas con sobornos", gravedad: 9 },
  { fecha: "2024-05-10", texto: "Sánchez amenaza con dimitir para ganar tiempo", gravedad: 8 },
  { fecha: "2023-10-26", texto: "Pacto con Junts para investidura — cesiones territoriales", gravedad: 8 },
  { fecha: "2020-03-14", texto: "14 prórrogas del estado de alarma", gravedad: 7 },
  { fecha: "2021-11-15", texto: "Ley Mordaza mantenida pese a promesas electorales", gravedad: 7 },
  { fecha: "2022-06-01", texto: "Espionaje con Pegasus a independentistas — crisis de Estado", gravedad: 8 },
  { fecha: "2019-04-28", texto: "Primer pacto de gobierno con Podemos", gravedad: 6 },
];

function GravedadBar({ nivel }: { nivel: number }) {
  const color =
    nivel >= 10 ? "bg-red-600" :
    nivel >= 8  ? "bg-orange-500" :
    nivel >= 6  ? "bg-amber-500" : "bg-yellow-400";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${nivel * 10}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{"🔥".repeat(Math.ceil(nivel / 3))}</span>
    </div>
  );
}

export default function Sanchometro() {
  const { data } = useQuery({
    queryKey: ["news"],
    queryFn: fetchAllNews,
    staleTime: 2 * 60 * 1000,
  });

  const dias = useMemo(() => {
    const diff = Date.now() - INICIO_GOBIERNO.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, []);

  const stats = useMemo(() => {
    if (!data) return { escandalosPsoe: 0, noticiasPsoe: 0, noticiasTotal: 0 };
    const psoe = data.filter((n) => detectParty(n) === "PSOE");
    return {
      escandalosPsoe: psoe.filter(detectScandal).length,
      noticiasPsoe: psoe.length,
      noticiasTotal: data.length,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6 red-rule">
        <h1 className="headline text-2xl font-black text-white">⚡ SANCHÓMETRO</h1>
        <p className="text-xs text-white/70 mt-1">Contador de escándalos en tiempo real</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Días en el poder */}
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Clock size={20} className="text-primary mx-auto mb-1" />
          <p className="text-5xl font-black text-primary">{dias.toLocaleString("es")}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            días en el poder
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Desde el 2 de junio de 2018
          </p>
        </div>

        {/* Stats de hoy */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <AlertTriangle size={16} className="text-amber-500 mx-auto mb-1" />
            <p className="text-3xl font-black text-amber-500">{stats.escandalosPsoe}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Escándalos hoy
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <TrendingUp size={16} className="text-red-500 mx-auto mb-1" />
            <p className="text-3xl font-black text-red-500">{stats.noticiasPsoe}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Noticias PSOE hoy
            </p>
          </div>
        </div>

        {/* Timeline de hitos */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-primary" />
            <h2 className="headline text-sm font-black uppercase tracking-wide">
              Hitos polémicos
            </h2>
          </div>
          <div className="space-y-4">
            {HITOS.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((hito, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${
                    hito.gravedad >= 10 ? "bg-red-600" :
                    hito.gravedad >= 8  ? "bg-orange-500" : "bg-amber-500"
                  }`} />
                  {i < HITOS.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(hito.fecha).toLocaleDateString("es-ES", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                  <p className="text-xs text-foreground font-semibold mt-0.5">{hito.texto}</p>
                  <GravedadBar nivel={hito.gravedad} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
