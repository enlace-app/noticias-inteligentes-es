import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, Flame } from "lucide-react";

interface Opinion {
  id: string;
  texto: string;
  autor: string;
  fecha: string;
  likes: number;
  likedByMe: boolean;
}

const OPINIONES_INICIALES: Opinion[] = [
  {
    id: "1",
    texto: "Este gobierno es una vergüenza para España. Llevan años robando y mintiendo al pueblo español.",
    autor: "PatriotaEspañol",
    fecha: "2026-06-14T10:00:00",
    likes: 47,
    likedByMe: false,
  },
  {
    id: "2",
    texto: "La ley de amnistía es un golpe a la democracia. Nunca antes un presidente había traicionado así a los españoles.",
    autor: "LibreYEspañol",
    fecha: "2026-06-14T11:30:00",
    likes: 63,
    likedByMe: false,
  },
  {
    id: "3",
    texto: "Los medios de comunicación subvencionados por el gobierno ocultan la realidad. Por eso necesitamos webs como esta.",
    autor: "VerdadSinCensura",
    fecha: "2026-06-14T12:15:00",
    likes: 38,
    likedByMe: false,
  },
  {
    id: "4",
    texto: "El caso Koldo es la punta del iceberg. Hay mucha más corrupción que no se investiga porque los jueces tienen miedo.",
    autor: "EspañaDespierta",
    fecha: "2026-06-14T13:00:00",
    likes: 29,
    likedByMe: false,
  },
  {
    id: "5",
    texto: "Comparto esta web con todos mis contactos. La gente tiene que saber la verdad sobre lo que está pasando en España.",
    autor: "OrgulloEspañol",
    fecha: "2026-06-14T14:00:00",
    likes: 55,
    likedByMe: false,
  },
];

function timeAgo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default function Opiniones() {
  const [opiniones, setOpiniones] = useState<Opinion[]>(() => {
    try {
      const saved = localStorage.getItem("espanalibre_opiniones");
      return saved ? JSON.parse(saved) : OPINIONES_INICIALES;
    } catch {
      return OPINIONES_INICIALES;
    }
  });

  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState(() => localStorage.getItem("espanalibre_autor") ?? "");
  const [enviando, setEnviando] = useState(false);
  const [orden, setOrden] = useState<"recientes" | "populares">("recientes");

  useEffect(() => {
    localStorage.setItem("espanalibre_opiniones", JSON.stringify(opiniones));
  }, [opiniones]);

  const handleEnviar = () => {
    if (!texto.trim() || texto.trim().length < 10) return;
    setEnviando(true);
    const nombreFinal = autor.trim() || "Anónimo";
    localStorage.setItem("espanalibre_autor", nombreFinal);
    const nueva: Opinion = {
      id: Date.now().toString(),
      texto: texto.trim(),
      autor: nombreFinal,
      fecha: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };
    setOpiniones((prev) => [nueva, ...prev]);
    setTexto("");
    setEnviando(false);
  };

  const handleLike = (id: string) => {
    setOpiniones((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, likes: o.likedByMe ? o.likes - 1 : o.likes + 1, likedByMe: !o.likedByMe }
          : o
      )
    );
  };

  const ordenadas = [...opiniones].sort((a, b) =>
    orden === "populares"
      ? b.likes - a.likes
      : new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const top = [...opiniones].sort((a, b) => b.likes - a.likes)[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b-2 border-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={18} className="text-primary" />
          <h1 className="headline text-xl font-black text-foreground">EL PUEBLO HABLA</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Opina libremente. Sin censura. Sin filtros.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{opiniones.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Opiniones</p>
          </div>
          <div className="text-center border-x border-border px-4">
            <p className="text-2xl font-black text-amber-500">
              {opiniones.reduce((acc, o) => acc + o.likes, 0)}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Apoyos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-500">
              {new Set(opiniones.map((o) => o.autor)).size}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Voces</p>
          </div>
        </div>
      </div>

      {/* Opinión más votada */}
      {top && top.likes > 0 && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/50">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={12} className="text-amber-500" />
            <span className="text-[10px] text-amber-500 font-black uppercase tracking-wide">Opinión más votada</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">"{top.texto}"</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-amber-500 font-semibold">— {top.autor}</span>
            <span className="text-[10px] text-amber-500">👍 {top.likes}</span>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="mx-3 mt-3 bg-card border border-border rounded-xl p-3">
        <p className="text-[10px] text-primary font-black uppercase tracking-wide mb-2">
          ✍️ Tu opinión
        </p>
        <input
          type="text"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          placeholder="Tu nombre o apodo (opcional)"
          className="w-full text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground mb-2 outline-none focus:border-primary"
        />
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Di lo que piensas. Aquí no se censura nada..."
          rows={3}
          className="w-full text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground mb-2 outline-none focus:border-primary resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{texto.length}/500</span>
          <button
            onClick={handleEnviar}
            disabled={enviando || texto.trim().length < 10}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            style={{ background: "#DC2626", color: "white" }}
          >
            <Send size={12} />
            Publicar
          </button>
        </div>
      </div>

      {/* Ordenar */}
      <div className="flex gap-2 px-3 mt-3">
        <button
          onClick={() => setOrden("recientes")}
          className={`tab-pill ${orden === "recientes" ? "active" : ""}`}
        >
          Más recientes
        </button>
        <button
          onClick={() => setOrden("populares")}
          className={`tab-pill ${orden === "populares" ? "active" : ""}`}
        >
          Más votadas
        </button>
      </div>

      {/* Lista de opiniones */}
      <div className="px-3 mt-3 space-y-2">
        {ordenadas.map((opinion) => (
          <div key={opinion.id} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-primary">🇪🇸 {opinion.autor}</span>
              <span className="text-[10px] text-muted-foreground">{timeAgo(opinion.fecha)}</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed mb-2">{opinion.texto}</p>
            <button
              onClick={() => handleLike(opinion.id)}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                opinion.likedByMe
                  ? "bg-primary border-primary text-white"
                  : "border-border text-muted-foreground"
              }`}
            >
              <ThumbsUp size={10} />
              {opinion.likes} apoyos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
