
import React from "react";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Wallet,
  Calculator,
  FileText,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, isLoading } = useProfile();

  const handleLogout = async () => {
    // Simple logout implementation
    navigate("/auth");
  };

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/clients", label: "Clientes", icon: Users },
    { href: "/cash-flow", label: "Financeiro", icon: DollarSign },
    { href: "/personal-control", label: "Controle Pessoal", icon: Wallet },
    { href: "/budgets", label: "Orçamentos", icon: Calculator },
    { href: "/contracts", label: "Contratos", icon: FileText },
    { href: "/calendar", label: "Calendário", icon: Calendar },
  ];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-semibold text-gray-800">
          EasyLancer
        </Link>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-2 ${
                  location.pathname === item.href ? "font-semibold" : ""
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none focus:outline-none rounded-full overflow-hidden border-2 border-transparent hover:border-gray-300 transition-border duration-200">
                {isLoading ? (
                  <Skeleton className="w-8 h-8 rounded-full" />
                ) : (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/company")}>
                Empresa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
