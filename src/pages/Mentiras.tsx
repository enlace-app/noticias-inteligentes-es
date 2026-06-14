import { useState } from "react";
import { XCircle, CheckCircle, AlertCircle } from "lucide-react";

const MENTIRAS = [
  {
    id: 1,
    promesa: "No voy a subir los impuestos",
    realidad: "Creó 12 nuevos impuestos: banca, energéticas, grandes fortunas, plásticos, digital y más.",
    año: "2019",
    autor: "Pedro Sánchez",
    categoria: "Impuestos",
    gravedad: 10,
  },
  {
    id: 2,
    promesa: "No voy a pactar con Bildu bajo ningún concepto",
    realidad: "Pactó los Presupuestos con Bildu en 2021, 2022 y 2023. Bildu apoya al gobierno regularmente.",
    año: "2019",
    autor: "Pedro Sánchez",
    categoria: "Pactos",
    gravedad: 10,
  },
  {
    id: 3,
    promesa: "Los indultos a los presos del procés no están sobre la mesa",
    realidad: "Concedió los indultos en junio de 2021, 9 meses después de decir esto.",
    año: "2020",
    autor: "Pedro Sánchez",
    categoria: "Cataluña",
    gravedad: 10,
  },
  {
    id: 4,
    promesa: "Nunca habrá amnistía para los independentistas",
    realidad: "Aprobó la Ley de Amnistía en 2024 como condición para su investidura.",
    año: "2021",
    autor: "Pedro Sánchez",
    categoria: "Cataluña",
    gravedad: 10,
  },
  {
    id: 5,
    promesa: "Bajaré el precio de la luz en 6 meses",
    realidad: "El precio de la luz subió un 120% durante su mandato.",
    año: "2018",
    autor: "Pedro Sánchez",
    categoria: "Economía",
    gravedad: 9,
  },
  {
    id: 6,
    promesa: "Derogaremos completamente la reforma laboral del PP",
    realidad: "Solo modificó algunos artículos. La reforma laboral del PP sigue vigente en lo esencial.",
    año: "2020",
    autor: "Yolanda Díaz",
    categoria: "Trabajo",
    gravedad: 8,
  },
  {
    id: 7,
    promesa: "España saldrá de la pandemia más fuerte y más justa",
    realidad: "España fue el país de la UE que más tardó en recuperar el PIB pre-pandemia.",
    año: "2020",
    autor: "Pedro Sánchez",
    categoria: "Economía",
    gravedad: 8,
  },
  {
    id: 8,
    promesa: "Reduciremos el precio del alquiler con la ley de vivienda",
    realidad: "El alquiler subió un 45% desde 2018. La ley de vivienda no frenó ninguna subida.",
    año: "2022",
    autor: "Pedro Sánchez",
    categoria: "Vivienda",
    gravedad: 9,
  },
  {
    id: 9,
    promesa: "No negociaré bajo ningún concepto con quien no condene la violencia",
    realidad: "Negoció con Bildu y EH Bildu de forma regular, incluidos Presupuestos y leyes clave.",
    año: "2019",
    autor: "Pedro Sánchez",
    categoria: "Pactos",
    gravedad: 9,
  },
  {
    id: 10,
    promesa: "Dimitiré si mi familia es investigada judicialmente",
    realidad: "Su esposa fue imputada. Sánchez no dimitió. Escribió una carta y pidió 5 días para reflexionar.",
    año: "2019",
    autor: "Pedro Sánchez",
    categoria: "Ética",
    gravedad: 10,
  },
  {
    id: 11,
    promesa: "Bajaremos el paro al 11% antes de 2020",
    realidad: "El paro en 2024 sigue siendo del 11,7%. No cumplió el objetivo en ningún año.",
    año: "2018",
    autor: "Pedro Sánchez",
    categoria: "Empleo",
    gravedad: 7,
  },
  {
    id: 12,
    promesa: "La ley del Solo sí es sí protegerá mejor a las víctimas",
    realidad: "Más de 1.000 agresores sexuales vieron reducidas sus penas gracias a la ley.",
    año: "2022",
    autor: "Irene Montero",
    categoria: "Justicia",
    gravedad: 9,
  },
];

const CATEGORIAS = ["Todas", ...Array.from(new Set(MENTIRAS.map((m) => m.categoria)))];

const GRAVEDAD_COLOR = (g: number) =>
  g >= 10 ? "text-red-500" :
  g >= 8  ? "text-orange-500" :
  "text-amber-500";

export default function Mentiras() {
  const [filtro, setFiltro] = useState("Todas");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtradas = filtro === "Todas"
    ? MENTIRAS
    : MENTIRAS.filter((m) => m.categoria === filtro);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">
            ARCHIVO DE MENTIRAS
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Lo prometieron. No lo cumplieron. Aquí está la prueba.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{MENTIRAS.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Promesas rotas</p>
          </div>
          <div className="text-center border-x border-border px-3">
            <p className="text-2xl font-black text-amber-500">
              {MENTIRAS.filter((m) => m.gravedad >= 9).length}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Gravedad máxima</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-500">
              {Array.from(new Set(MENTIRAS.map((m) => m.autor))).length}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Mentirosos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar border-b border-border">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => { setFiltro(cat); setExpanded(null); }}
            className={`tab-pill shrink-0 ${filtro === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-3 py-3 space-y-3">
        {filtradas.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex items-start gap-3">
                <XCircle size={16} className="text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {item.categoria}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.año}</span>
                    <span className={`text-[10px] font-bold ${GRAVEDAD_COLOR(item.gravedad)}`}>
                      {"●".repeat(Math.min(item.gravedad, 5))}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground italic leading-snug">
                    "{item.promesa}"
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    — {item.autor}
                  </p>
                </div>
              </div>
            </button>

            {expanded === item.id && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-slide-in">
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide mb-1">
                      La realidad
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {item.realidad}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
