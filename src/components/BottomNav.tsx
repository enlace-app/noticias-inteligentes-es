import { Home, BarChart2, FileText, Users, TrendingDown, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { path: "/",            icon: Home,         label: "Inicio" },
  { path: "/sanchometro", icon: BarChart2,     label: "Sanchómetro" },
  { path: "/dosier",      icon: FileText,      label: "Dosier" },
  { path: "/troupe",      icon: Users,         label: "Troupe" },
  { path: "/mentiras",    icon: XCircle,       label: "Mentiras" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn(
                "text-[9px] font-semibold truncate",
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
