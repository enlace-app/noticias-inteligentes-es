import { useState } from "react";
import { Scale, Clock, AlertTriangle } from "lucide-react";

const CASOS = [
  {
    id: 1,
    titulo: "Caso Begoña Gómez",
    juzgado: "Juzgado de Instrucción nº 41 de Madrid",
    juez: "Juan Carlos Peinado",
    inicio: "2024-04-16",
    estado: "Activo",
    gravedad: 10,
    imputados: ["Begoña Gómez"],
    delitos: ["Tráfico de influencias", "Corrupción en los negocios"],
    resumen: "La esposa del presidente es investigada por usar su posición para favorecer empresas privadas con contratos públicos y avalar proyectos con el sello de la Moncloa.",
    novedades: "El juez citó a declarar a Pedro Sánchez como testigo. Primera vez en la historia que un presidente en activo declara ante un juez por un caso que implica a su familia.",
  },
  {
    id: 2,
    titulo: "Caso Koldo",
    juzgado: "Audiencia Nacional",
    juez: "Ismael Moreno",
    inicio: "2023-02-20",
    estado: "Activo",
    gravedad: 9,
    imputados: ["José Luis Ábalos", "Koldo García", "Víctor de Aldama"],
    delitos: ["Cohecho", "Tráfico de influencias", "Blanqueo de capitales"],
    resumen: "Red de corrupción que cobró comisiones millonarias por contratos de mascarillas durante la pandemia. Implica al exministro Ábalos y su asesor personal.",
    novedades: "El comisionista Víctor de Aldama declaró que el dinero llegaba al PSOE. Ábalos fue expulsado del grupo parlamentario socialista.",
  },
  {
    id: 3,
    titulo: "Caso Fiscal General del Estado",
    juzgado: "Tribunal Supremo",
    juez: "Ángel Hurtado",
    inicio: "2024-05-15",
    estado: "Activo",
    gravedad: 8,
    imputados: ["Álvaro García Ortiz"],
    delitos: ["Revelación de secretos", "Vulneración de datos fiscales"],
    resumen: "El Fiscal General del Estado filtró datos fiscales reservados del novio de Isabel Díaz Ayuso a un periodista afín al gobierno. Primera imputación de un Fiscal General en la historia de España.",
    novedades: "El Tribunal Supremo admitió a trámite la denuncia. García Ortiz sigue en el cargo pese a estar imputado, con el respaldo expreso de Pedro Sánchez.",
  },
  {
    id: 4,
    titulo: "Caso Tesis Doctoral Sánchez",
    juzgado: "Juzgado de lo Penal nº 3 de Madrid",
    juez: "En investigación",
    inicio: "2024-02-01",
    estado: "Activo",
    gravedad: 7,
    imputados: ["Pedro Sánchez"],
    delitos: ["Falsedad documental", "Plagio"],
    resumen: "La tesis doctoral de Pedro Sánchez contiene párrafos copiados sin citar las fuentes originales. La Universidad Camilo José Cela donde se presentó también está bajo escrutinio.",
    novedades: "Varios expertos académicos certificaron el plagio. El gobierno bloqueó la investigación parlamentaria.",
  },
  {
    id: 5,
    titulo: "Caso Mediador — José Luis Ábalos",
    juzgado: "Audiencia Nacional",
    juez: "Ismael Moreno",
    inicio: "2024-07-10",
    estado: "Activo",
    gravedad: 9,
    imputados: ["José Luis Ábalos", "Víctor de Aldama"],
    delitos: ["Cohecho", "Malversación", "Organización criminal"],
    resumen: "Investigación sobre una presunta red de corrupción que usaba la influencia de Ábalos como ministro para conseguir contratos públicos a cambio de comisiones.",
    novedades: "Se investigan pagos en metálico y viajes en aviones privados. El caso se acumuló con el Caso Koldo por estar relacionados.",
  },
  {
    id: 6,
    titulo: "DANA Valencia — Negligencia Institucional",
    juzgado: "Juzgados de Valencia",
    juez: "Varios juzgados",
    inicio: "2024-11-05",
    estado: "Activo",
    gravedad: 10,
    imputados: ["Teresa Ribera", "Carlos Mazón"],
    delitos: ["Homicidio imprudente", "Negligencia grave"],
    resumen: "Más de 220 muertos en la DANA de Valencia. Investigación sobre si las alertas tempranas se activaron tarde y si hubo negligencia en la gestión de la emergencia.",
    novedades: "Teresa Ribera huyó a Bruselas como comisaria europea. El gobierno tardó días en reconocer la magnitud. Familiares de víctimas presentaron denuncias penales.",
  },
];

const ESTADO_COLOR: Record<string, string> = {
  "Activo":    "bg-red-950/60 text-red-400 border-red-800",
  "Archivado": "bg-secondary text-muted-foreground border-border",
  "Sentencia": "bg-amber-950/60 text-amber-400 border-amber-800",
};

const GRAVEDAD_COLOR = (g: number) =>
  g >= 10 ? "text-red-500" :
  g >= 8  ? "text-orange-500" : "text-amber-500";

export default function Casos() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Scale size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">CASOS ABIERTOS</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Procedimientos judiciales activos contra miembros del gobierno.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-2xl font-black text-red-500">
              {CASOS.filter((c) => c.estado === "Activo").length}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Casos activos</p>
          </div>
          <div className="text-center border-x border-border px-4">
            <p className="text-2xl font-black text-orange-500">
              {Array.from(new Set(CASOS.flatMap((c) => c.imputados))).length}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Imputados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-amber-500">
              {Array.from(new Set(CASOS.flatMap((c) => c.delitos))).length}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Delitos distintos</p>
          </div>
        </div>
      </div>

      {/* Lista de casos */}
      <div className="px-3 py-3 space-y-3">
        {CASOS.map((caso) => (
          <div
            key={caso.id}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === caso.id ? null : caso.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ESTADO_COLOR[caso.estado]}`}>
                      {caso.estado === "Activo" && "⚡ "}{caso.estado}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Desde {new Date(caso.inicio).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  <h2 className="headline text-sm font-black text-foreground leading-snug">
                    {caso.titulo}
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {caso.juzgado}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <AlertTriangle size={10} className={GRAVEDAD_COLOR(caso.gravedad)} />
                    <span className={`text-[10px] font-bold ${GRAVEDAD_COLOR(caso.gravedad)}`}>
                      Gravedad {caso.gravedad}/10
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {expanded === caso.id && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-slide-in space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Resumen</p>
                  <p className="text-xs text-foreground leading-relaxed">{caso.resumen}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Última novedad</p>
                  <p className="text-xs text-amber-400 leading-relaxed">{caso.novedades}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Imputados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {caso.imputados.map((imp) => (
                      <span key={imp} className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/50 text-red-400 border border-red-800">
                        {imp}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Delitos investigados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {caso.delitos.map((d) => (
                      <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <Clock size={10} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Juez: {caso.juez}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
