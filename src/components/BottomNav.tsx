import { NavLink } from "react-router-dom";
import { Home, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/saved", label: "Guardadas", icon: Bookmark },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-bottom">
      <div className="container mx-auto max-w-3xl grid grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110",
                  )}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
