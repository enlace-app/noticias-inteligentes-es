import type { LucideIcon } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, icon: Icon, right }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md safe-top">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
