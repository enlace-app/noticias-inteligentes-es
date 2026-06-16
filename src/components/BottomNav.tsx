import { Home, BarChart2, FileText, Users, XCircle, TrendingDown, Scale, MessageSquare, Swords } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { path: "/",            icon: Home,         label: "Inicio" },
  { path: "/sanchometro", icon: BarChart2,     label: "Sanchómetro" },
  { path: "/dosier",      icon: FileText,      label: "Dosier" },
  { path: "/debate",      icon: Swords,        label: "Debate" },
  { path: "/opiniones",   icon: MessageSquare, label: "Pueblo" },
  { path: "/troupe",      icon: Users,         label: "Troupe" },
  { path: "/mentiras",    icon: XCircle,       label: "Mentiras" },
  { path: "/numeros",     icon: TrendingDown,  label: "Números" },
  { path: "/casos",       icon: Scale,         label: "Casos" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div
        className="flex items-center py-1 px-1 gap-1"
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
      >
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{ minWidth: "60px" }}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors flex-shrink-0",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn(
                "text-[9px] font-semibold whitespace-nowrap",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
