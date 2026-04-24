import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart, CalendarDays, Users, DollarSign,
  Workflow, GitBranch, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "./UserMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard",         path: "/",         icon: BarChart },
  { name: "Clientes",          path: "/clients",  icon: Users },
  { name: "CRM",               path: "/crm",      icon: Workflow },
  { name: "Fluxo de Trabalho", path: "/workflow", icon: GitBranch },
  { name: "Calendário",        path: "/calendar", icon: CalendarDays },
  { name: "Financeiro",        path: "/cash-flow",icon: DollarSign },
];

export function Navbar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // ── MOBILE: top bar ──────────────────────────────────────────
  if (isMobile) {
    return (
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/">
            <img
              src="/lovable-uploads/6b189f38-b0b9-4a2e-8ff2-6635102e14a9.png"
              alt="GCLIXIO Logo"
              className="h-auto w-36"
            />
          </Link>
          <div className="flex items-center gap-2">
            <UserMenu />
            <button
              onClick={() => setOpen(!open)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="bg-white border-t border-stone-100 px-3 py-2 flex flex-col gap-1">
            {navItems.map(({ name, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(path)
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {name}
              </Link>
            ))}
          </nav>
        )}
      </header>
    );
  }

  // ── DESKTOP: sidebar vertical ─────────────────────────────────
  return (
    <TooltipProvider delayDuration={200}>
      <aside className="fixed left-0 top-0 bottom-0 w-14 bg-white border-r border-stone-200 flex flex-col items-center py-4 gap-1 z-50">
        {/* Logo */}
        <Link to="/" className="mb-5 flex-shrink-0">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
            <span className="font-mono text-[10px] font-medium text-stone-50 tracking-tight">
              cx
            </span>
          </div>
        </Link>

        {/* Nav items */}
        {navItems.map(({ name, path, icon: Icon }) => (
          <Tooltip key={path}>
            <TooltipTrigger asChild>
              <Link
                to={path}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  isActive(path)
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                )}
              >
                <Icon size={15} strokeWidth={1.5} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {name}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* UserMenu no rodapé */}
        <div className="mt-auto">
          <UserMenu />
        </div>
      </aside>
    </TooltipProvider>
  );
}
