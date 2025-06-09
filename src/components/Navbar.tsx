
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Home, 
  Upload,
  Package
} from "lucide-react";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/clients", icon: Users, label: "Clientes" },
    { path: "/calendar", icon: Calendar, label: "Agenda" },
    { path: "/cash-flow", icon: DollarSign, label: "Fluxo de Caixa" },
    { path: "/products", icon: Package, label: "Produtos" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">GCLIXIO</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path}>
                  <Button
                    variant={isActive(path) ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/import-clients">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-3 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className="block">
              <Button
                variant={isActive(path) ? "default" : "ghost"}
                className="w-full justify-start flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
