
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  CalendarDays, 
  Home, 
  Menu, 
  PlusCircle,
  UserPlus, 
  Users, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const NavItem = ({ 
  to, 
  icon, 
  label,
  isActive,
  onClick
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive ? "bg-gray-100 dark:bg-gray-800 font-medium" : "text-gray-600 dark:text-gray-400"
      )}
      onClick={onClick}
    >
      <span className={cn(
        "transition-colors duration-200",
        isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-500"
      )}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};

export default function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const routes = [
    { path: "/", icon: <Home size={18} />, label: "Dashboard" },
    { path: "/clients", icon: <Users size={18} />, label: "Clientes" },
    { path: "/calendar", icon: <CalendarDays size={18} />, label: "Calendário" }
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const renderNav = () => (
    <nav className="flex flex-col space-y-1">
      {routes.map((route) => (
        <NavItem
          key={route.path}
          to={route.path}
          icon={route.icon}
          label={route.label}
          isActive={location.pathname === route.path}
          onClick={() => setIsOpen(false)}
        />
      ))}
    </nav>
  );

  if (isMobile) {
    return (
      <div className="flex justify-between items-center py-3 px-4 border-b">
        <Link to="/" className="font-semibold text-xl">
          Wedding CRM
        </Link>
        <div className="flex gap-2">
          <Link to="/clients/add">
            <Button size="sm" variant="ghost" className="gap-1">
              <UserPlus size={18} />
            </Button>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[280px]">
              <div className="py-6">{renderNav()}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b">
      <div className="flex justify-between items-center py-3 px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link to="/" className="font-semibold text-xl">
            Wedding CRM
          </Link>
          <div className="hidden md:flex items-center space-x-1">
            {renderNav()}
          </div>
        </div>
        <Link to="/clients/add">
          <Button size="sm" className="gap-1">
            <PlusCircle size={16} />
            <span>Novo Cliente</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
