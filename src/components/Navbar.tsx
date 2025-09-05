
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart, CalendarDays, Menu, Users, X, DollarSign, User, Workflow, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when location changes
  useEffect(() => {
    if (open) setOpen(false);
  }, [location.pathname]);

  // Close mobile menu when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  const closeMenu = () => {
    setOpen(false);
  };

  // List of nav items
  const navItems = [{
    name: "Dashboard",
    path: "/",
    icon: <BarChart className="h-5 w-5" />
  }, {
    name: "Clientes",
    path: "/clients",
    icon: <Users className="h-5 w-5" />
  }, {
    name: "CRM",
    path: "/crm",
    icon: <Workflow className="h-5 w-5" />
  }, {
    name: "Fluxo de Trabalho",
    path: "/workflow",
    icon: <GitBranch className="h-5 w-5" />
  }, {
    name: "Calendário",
    path: "/calendar",
    icon: <CalendarDays className="h-5 w-5" />
  }, {
    name: "Financeiro",
    path: "/cash-flow",
    icon: <DollarSign className="h-5 w-5" />
  }];

  return <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/6b189f38-b0b9-4a2e-8ff2-6635102e14a9.png" 
              alt="GCLIXIO Logo" 
              className="h-auto w-[180px]"
            />
          </Link>
        </div>

        {/* Desktop nav */}
        {!isMobile && <nav className="ml-10 flex gap-6">
            {navItems.map(item => <Link key={item.path} to={item.path} className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary", isActive(item.path) ? "text-primary" : "text-gray-600")}>
                {item.icon}
                {item.name}
              </Link>)}
          </nav>}

        {/* User Menu */}
        <UserMenu />

        {/* Mobile menu button */}
        {isMobile && <Button variant="ghost" className="flex items-center gap-1.5 text-sm font-medium" onClick={handleToggle}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>}
      </div>

      {/* Mobile navigation */}
      {isMobile && open && <div className="fixed inset-0 top-16 z-20 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map(item => <Link key={item.path} to={item.path} className={cn("flex items-center gap-2 px-3 py-4 text-base rounded-md font-medium transition-colors hover:bg-gray-100", isActive(item.path) ? "bg-gray-100 text-primary" : "text-gray-600")} onClick={closeMenu}>
                {item.icon}
                {item.name}
              </Link>)}
          </nav>
        </div>}
    </header>;
}
