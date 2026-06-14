import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react";

const DATOS = [
  {
    categoria: "Deuda y Déficit",
    items: [
      {
        titulo: "Deuda pública",
        valor: "1.647.000 M€",
        variacion: "+387.000M desde 2018",
        tendencia: "mala",
        descripcion: "España debe 1,6 billones de euros. Cada español debe 34.000€ sin haberlo pedido.",
        fuente: "Banco de España 2024",
      },
      {
        titulo: "Déficit público",
        valor: "3,5% PIB",
        variacion: "Por encima del límite UE (3%)",
        tendencia: "mala",
        descripcion: "España gasta más de lo que ingresa cada año. La UE exige reducirlo.",
        fuente: "Eurostat 2024",
      },
      {
        titulo: "Deuda por ciudadano",
        valor: "34.200€",
        variacion: "+8.000€ desde 2018",
        tendencia: "mala",
        descripcion: "Lo que debe cada español al nacer, incluyendo bebés y jubilados.",
        fuente: "Banco de España 2024",
      },
    ],
  },
  {
    categoria: "Empleo",
    items: [
      {
        titulo: "Paro juvenil",
        valor: "28,6%",
        variacion: "El doble que la media UE (14%)",
        tendencia: "mala",
        descripcion: "Casi 1 de cada 3 jóvenes españoles está en paro. El peor dato de Europa occidental.",
        fuente: "Eurostat 2024",
      },
      {
        titulo: "Tasa de paro general",
        valor: "11,7%",
        variacion: "2ª más alta de la UE",
        tendencia: "mala",
        descripcion: "Solo Grecia supera a España en desempleo dentro de la Unión Europea.",
        fuente: "EPA INE 2024",
      },
      {
        titulo: "Trabajadores pobres",
        valor: "12,5%",
        variacion: "+2% desde 2019",
        tendencia: "mala",
        descripcion: "Personas que trabajan pero no llegan a fin de mes. Récord histórico.",
        fuente: "INE 2024",
      },
    ],
  },
  {
    categoria: "Vivienda",
    items: [
      {
        titulo: "Precio alquiler medio",
        valor: "1.200€/mes",
        variacion: "+45% desde 2018",
        tendencia: "mala",
        descripcion: "El alquiler se ha disparado un 45% en 6 años. La ley de vivienda no ha frenado nada.",
        fuente: "Idealista 2024",
      },
      {
        titulo: "Esfuerzo para comprar piso",
        valor: "8,5 años de sueldo",
        variacion: "+2 años desde 2018",
        tendencia: "mala",
        descripcion: "Un español necesita 8,5 años de sueldo íntegro para comprar una vivienda media.",
        fuente: "Banco de España 2024",
      },
    ],
  },
  {
    categoria: "Coste de vida",
    items: [
      {
        titulo: "IPC acumulado 2018-2024",
        valor: "+22,4%",
        variacion: "Mayor subida desde los 80",
        tendencia: "mala",
        descripcion: "Lo que costaba 100€ en 2018 ahora cuesta 122,40€. El poder adquisitivo se ha hundido.",
        fuente: "INE 2024",
      },
      {
        titulo: "Precio luz (tarifa regulada)",
        valor: "180€/MWh",
        variacion: "+120% desde 2018",
        tendencia: "mala",
        descripcion: "La factura de la luz se ha más que duplicado bajo el gobierno de Sánchez.",
        fuente: "OMIE 2024",
      },
      {
        titulo: "Precio gasolina",
        valor: "1,65€/litro",
        variacion: "+0,35€ desde 2018",
        tendencia: "mala",
        descripcion: "Pese a las bonificaciones temporales, la gasolina sigue cara. Las bonificaciones las pagamos todos.",
        fuente: "CORES 2024",
      },
    ],
  },
  {
    categoria: "Impuestos",
    items: [
      {
        titulo: "Presión fiscal",
        valor: "38,5% PIB",
        variacion: "Récord histórico",
        tendencia: "mala",
        descripcion: "España recauda más impuestos que nunca. El gobierno llama a esto 'redistribución'.",
        fuente: "OCDE 2024",
      },
      {
        titulo: "Nuevos impuestos 2018-2024",
        valor: "12 nuevos tributos",
        variacion: "Prometió no subir impuestos",
        tendencia: "mala",
        descripcion: "Impuesto a la banca, energéticas, grandes fortunas, plásticos, digital... prometió no subirlos.",
        fuente: "Ministerio de Hacienda",
      },
    ],
  },
];

const TENDENCIA_ICON = {
  buena: <TrendingUp size={14} className="text-green-500" />,
  mala:  <TrendingDown size={14} className="text-red-500" />,
  neutra: <Minus size={14} className="text-muted-foreground" />,
};

const TENDENCIA_COLOR = {
  buena:  "text-green-500",
  mala:   "text-red-500",
  neutra: "text-muted-foreground",
};

export default function Numeros() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("Deuda y Déficit");

  const categorias = DATOS.map((d) => d.categoria);
  const seccion = DATOS.find((d) => d.categoria === categoria);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">ESPAÑA EN NÚMEROS</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Datos reales. Sin propaganda. Lo que el gobierno no te cuenta.
        </p>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar border-b border-border">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoria(cat); setExpanded(null); }}
            className={`tab-pill shrink-0 ${categoria === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Datos */}
      <div className="px-3 py-3 space-y-3">
        {seccion?.items.map((item, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === item.titulo ? null : item.titulo)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    {item.titulo}
                  </p>
                  <p className={`text-2xl font-black ${TENDENCIA_COLOR[item.tendencia as keyof typeof TENDENCIA_COLOR]}`}>
                    {item.valor}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {TENDENCIA_ICON[item.tendencia as keyof typeof TENDENCIA_ICON]}
                    <span className="text-[10px] text-muted-foreground">{item.variacion}</span>
                  </div>
                </div>
              </div>
            </button>

            {expanded === item.titulo && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-slide-in">
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {item.descripcion}
                </p>
                <p className="text-[10px] text-primary font-semibold">
                  📊 Fuente: {item.fuente}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
