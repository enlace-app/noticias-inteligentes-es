import { useState } from "react";
import { Users, AlertTriangle, Quote } from "lucide-react";

const MINISTROS = [
  {
    id: 1,
    nombre: "Pedro Sánchez",
    cargo: "Presidente del Gobierno",
    partido: "PSOE",
    desde: "2018",
    emoji: "🎭",
    color: "border-red-500",
    scandals: [
      "Su esposa Begoña Gómez investigada por tráfico de influencias",
      "Plagió parte de su tesis doctoral — admitido parcialmente",
      "Carta pública de 5 días para 'reflexionar' tras imputación de su esposa",
      "Pactó amnistía con independentistas para mantenerse en el poder",
      "Prometió no pactar con Bildu y lo hizo",
    ],
    frases: [
      { texto: "No voy a pactar con Bildu bajo ningún concepto", año: "2019" },
      { texto: "España no tiene un problema de corrupción sistémica", año: "2017" },
      { texto: "El indulto a los presos del procés no está sobre la mesa", año: "2019" },
    ],
  },
  {
    id: 2,
    nombre: "Yolanda Díaz",
    cargo: "Vicepresidenta y Ministra de Trabajo",
    partido: "SUMAR",
    desde: "2020",
    emoji: "✊",
    color: "border-purple-500",
    scandals: [
      "Reforma laboral aprobada por error de un diputado del PP",
      "Prometió derogar la reforma laboral del PP — solo la modificó",
      "Lanzó Sumar gastando fondos públicos según denuncias del PP",
      "SMI subido sin consenso con empresarios ni CEOE",
    ],
    frases: [
      { texto: "Vamos a derogar completamente la reforma laboral", año: "2021" },
      { texto: "España es el país más feminista de Europa", año: "2022" },
    ],
  },
  {
    id: 3,
    nombre: "José Luis Ábalos",
    cargo: "Exministro de Transportes",
    partido: "PSOE",
    desde: "2018",
    emoji: "✈️",
    color: "border-orange-500",
    scandals: [
      "Principal investigado en el Caso Koldo — cobro de comisiones por mascarillas",
      "Reunión clandestina con Delcy Rodríguez en el aeropuerto de Barajas",
      "Uso de fondos reservados sin justificar",
      "Expulsado del grupo parlamentario socialista tras el escándalo",
    ],
    frases: [
      { texto: "Soy el ministro más transparente de la historia", año: "2020" },
      { texto: "No tengo nada que ocultar", año: "2023" },
    ],
  },
  {
    id: 4,
    nombre: "Irene Montero",
    cargo: "Exministra de Igualdad",
    partido: "Podemos",
    desde: "2020",
    emoji: "⚖️",
    color: "border-purple-400",
    scandals: [
      "Ley del 'Solo sí es sí' — redujo penas a más de 1.000 agresores sexuales",
      "Negó los efectos de la ley durante meses pese a las cifras judiciales",
      "Gastos de representación sin justificar en el ministerio",
      "Chalet en Galapagar con Pablo Iglesias a precio de protección oficial",
    ],
    frases: [
      { texto: "La ley del Solo sí es sí es un avance histórico para las mujeres", año: "2022" },
      { texto: "Los jueces están aplicando mal la ley", año: "2023" },
    ],
  },
  {
    id: 5,
    nombre: "Félix Bolaños",
    cargo: "Ministro de Presidencia y Justicia",
    partido: "PSOE",
    desde: "2021",
    emoji: "🏛️",
    color: "border-red-400",
    scandals: [
      "Artífice de la reforma exprés del CGPJ para colocar magistrados afines",
      "Negoció en secreto con Junts los términos de la amnistía",
      "Reforma del Tribunal Constitucional criticada por Comisión de Venecia",
    ],
    frases: [
      { texto: "La independencia judicial en España está garantizada", año: "2023" },
      { texto: "No tocamos la separación de poderes", año: "2022" },
    ],
  },
  {
    id: 6,
    nombre: "Teresa Ribera",
    cargo: "Exvicepresidenta de Transición Ecológica",
    partido: "PSOE",
    desde: "2018",
    emoji: "🌊",
    color: "border-blue-400",
    scandals: [
      "Negligencia en la gestión de la DANA de Valencia — 220 muertos",
      "No activó alertas tempranas pese a avisos de la AEMET",
      "Huyó a Bruselas como comisaria europea tras el desastre",
      "El gobierno tardó días en reconocer la magnitud de la catástrofe",
    ],
    frases: [
      { texto: "España es líder mundial en gestión climática", año: "2022" },
      { texto: "Tenemos los mejores sistemas de alerta temprana de Europa", año: "2023" },
    ],
  },
];

export default function Troupe() {
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<"scandals" | "frases">("scandals");

  const ministro = MINISTROS.find((m) => m.id === selected);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">LA TROUPE</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Fichas completas del gobierno. Lo que hicieron vs lo que prometieron.
        </p>
      </div>

      {!selected ? (
        /* Grid de fichas */
        <div className="px-3 py-3 grid grid-cols-2 gap-3">
          {MINISTROS.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelected(m.id); setTab("scandals"); }}
              className={`bg-card border-2 ${m.color} rounded-xl p-3 text-left transition-transform active:scale-95`}
            >
              <div className="text-3xl mb-2">{m.emoji}</div>
              <h2 className="headline text-xs font-black text-foreground leading-tight">
                {m.nombre}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {m.cargo}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle size={10} className="text-amber-500" />
                <span className="text-[10px] text-amber-500 font-semibold">
                  {m.scandals.length} escándalos
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Ficha detallada */
        <div className="px-3 py-3 animate-slide-in">
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-primary font-semibold mb-3 flex items-center gap-1"
          >
            ← Volver
          </button>

          {ministro && (
            <div className={`bg-card border-2 ${ministro.color} rounded-xl overflow-hidden`}>
              <div className="p-4 border-b border-border">
                <div className="text-4xl mb-2">{ministro.emoji}</div>
                <h2 className="headline text-lg font-black text-foreground">
                  {ministro.nombre}
                </h2>
                <p className="text-xs text-muted-foreground">{ministro.cargo}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {ministro.partido}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Desde {ministro.desde}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setTab("scandals")}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                    tab === "scandals"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  ⚠️ Escándalos ({ministro.scandals.length})
                </button>
                <button
                  onClick={() => setTab("frases")}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                    tab === "frases"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  🤥 Mentiras ({ministro.frases.length})
                </button>
              </div>

              <div className="p-4 space-y-3">
                {tab === "scandals" ? (
                  ministro.scandals.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground leading-relaxed">{s}</p>
                    </div>
                  ))
                ) : (
                  ministro.frases.map((f, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-3">
                      <Quote size={12} className="text-primary mb-1" />
                      <p className="text-xs text-foreground italic leading-relaxed">
                        "{f.texto}"
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">— {f.año}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
