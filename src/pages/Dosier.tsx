import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const DOCUMENTOS = [
  {
    id: 1,
    titulo: "Ley de Amnistía",
    fecha: "2024-03-14",
    categoria: "Legislación",
    gravedad: 10,
    resumen: "Ley aprobada para amnistiar a los responsables del golpe independentista de 2017 en Cataluña, a cambio de los votos de Junts para la investidura de Sánchez. Beneficia directamente a Carles Puigdemont, prófugo de la justicia.",
    fuente: "BOE",
    url: "https://www.boe.es",
    tags: ["Amnistía", "Cataluña", "Puigdemont", "Investidura"],
  },
  {
    id: 2,
    titulo: "Caso Koldo — Trama de Mascarillas",
    fecha: "2023-02-20",
    categoria: "Corrupción",
    gravedad: 9,
    resumen: "Red de corrupción que cobró comisiones millonarias por la venta de mascarillas al gobierno durante la pandemia. Implica al exministro José Luis Ábalos y a su asesor Koldo García. Fondos desviados al PSOE según la investigación judicial.",
    fuente: "Audiencia Nacional",
    url: "https://www.poderjudicial.es",
    tags: ["Koldo", "Ábalos", "Mascarillas", "Pandemia", "Corrupción"],
  },
  {
    id: 3,
    titulo: "Caso Begoña Gómez",
    fecha: "2024-04-16",
    categoria: "Corrupción",
    gravedad: 9,
    resumen: "La esposa del presidente Pedro Sánchez es investigada por tráfico de influencias y corrupción en los negocios. Usó su posición en la Complutense y su cercanía al poder para favorecer empresas privadas con contratos públicos.",
    fuente: "Juzgado de Instrucción nº 41 de Madrid",
    url: "https://www.poderjudicial.es",
    tags: ["Begoña Gómez", "Tráfico de influencias", "Moncloa"],
  },
  {
    id: 4,
    titulo: "Pactos de Investidura — Documentos secretos",
    fecha: "2023-11-09",
    categoria: "Pactos",
    gravedad: 8,
    resumen: "Los acuerdos firmados con los partidos independentistas para la investidura de Sánchez incluyen cesiones territoriales, traspasos de competencias y compromisos no publicados íntegramente. El PSOE se negó a publicar los anexos completos.",
    fuente: "Congreso de los Diputados",
    url: "https://www.congreso.es",
    tags: ["Investidura", "Junts", "ERC", "Independentismo", "Secreto"],
  },
  {
    id: 5,
    titulo: "Espionaje con Pegasus",
    fecha: "2022-05-02",
    categoria: "Espionaje",
    gravedad: 8,
    resumen: "El gobierno de España espió con el software Pegasus a líderes independentistas, abogados y periodistas. El CNI reconoció parte del espionaje. Nunca se investigaron los mandantes ni se depuraron responsabilidades.",
    fuente: "Citizen Lab / CNI",
    url: "https://citizenlab.ca",
    tags: ["Pegasus", "CNI", "Espionaje", "Cataluña"],
  },
  {
    id: 6,
    titulo: "Reforma del CGPJ — Control de la Justicia",
    fecha: "2023-12-21",
    categoria: "Institucional",
    gravedad: 8,
    resumen: "El gobierno modificó el sistema de elección del Tribunal Constitucional y el CGPJ para colocar magistrados afines. La reforma fue criticada por el Consejo de Europa y la Comisión de Venecia como un ataque al Estado de Derecho.",
    fuente: "Comisión de Venecia",
    url: "https://www.venice.coe.int",
    tags: ["CGPJ", "Justicia", "Tribunal Constitucional", "Estado de Derecho"],
  },
  {
    id: 7,
    titulo: "Deuda pública récord — 1,6 billones",
    fecha: "2024-01-15",
    categoria: "Economía",
    gravedad: 7,
    resumen: "España alcanzó una deuda pública de 1,6 billones de euros bajo el gobierno de Sánchez, el nivel más alto de la historia. El gasto público se disparó sin reducir el déficit estructural, comprometiendo las pensiones futuras.",
    fuente: "Banco de España",
    url: "https://www.bde.es",
    tags: ["Deuda", "Economía", "Déficit", "Pensiones"],
  },
  {
    id: 8,
    titulo: "Ley de Bienestar Animal — Impacto en caza y ganadería",
    fecha: "2023-03-28",
    categoria: "Legislación",
    gravedad: 5,
    resumen: "La ley impulsada por Podemos fue aprobada sin consenso con el sector ganadero y cinegético. Generó caos normativo, contradicciones con leyes autonómicas y fue rechazada por veterinarios y agricultores.",
    fuente: "BOE",
    url: "https://www.boe.es",
    tags: ["Podemos", "Ganadería", "Caza", "Ley"],
  },
];

const CATEGORIA_COLOR: Record<string, string> = {
  "Corrupción":    "text-red-400 bg-red-950/50",
  "Legislación":   "text-blue-400 bg-blue-950/50",
  "Pactos":        "text-purple-400 bg-purple-950/50",
  "Espionaje":     "text-amber-400 bg-amber-950/50",
  "Institucional": "text-orange-400 bg-orange-950/50",
  "Economía":      "text-green-400 bg-green-950/50",
};

function GravedadDots({ nivel }: { nivel: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < nivel
              ? nivel >= 9 ? "bg-red-500"
              : nivel >= 7 ? "bg-orange-500"
              : "bg-amber-500"
              : "bg-secondary"
          }`}
        />
      ))}
    </div>
  );
}

export default function Dosier() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filtro, setFiltro] = useState("Todo");

  const categorias = ["Todo", ...Array.from(new Set(DOCUMENTOS.map((d) => d.categoria)))];

  const filtrados = filtro === "Todo"
    ? DOCUMENTOS
    : DOCUMENTOS.filter((d) => d.categoria === filtro);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">EL DOSIER</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Lo que el gobierno oculta. Documentado y verificado.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar border-b border-border">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`tab-pill shrink-0 ${filtro === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documentos */}
      <div className="px-3 py-3 space-y-3">
        {filtrados.map((doc) => (
          <div
            key={doc.id}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Cabecera del doc */}
            <button
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${CATEGORIA_COLOR[doc.categoria] ?? "text-muted-foreground bg-secondary"}`}>
                      {doc.categoria}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(doc.fecha).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  <h2 className="headline text-sm font-bold text-foreground leading-snug">
                    {doc.titulo}
                  </h2>
                  <div className="mt-2">
                    <GravedadDots nivel={doc.gravedad} />
                  </div>
                </div>
                <div className="shrink-0 text-muted-foreground mt-1">
                  {expanded === doc.id
                    ? <ChevronUp size={16} />
                    : <ChevronDown size={16} />
                  }
                </div>
              </div>
            </button>

            {/* Contenido expandido */}
            {expanded === doc.id && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-slide-in">
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {doc.resumen}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary font-semibold"
                >
                  <ExternalLink size={12} />
                  Fuente: {doc.fuente}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
