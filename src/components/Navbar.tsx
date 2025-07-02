import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Calendar,
  Users,
  DollarSign,
  User,
  Package,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
	const { userProfile, loading } = useUser();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/clients", label: "Clientes", icon: <Users className="h-4 w-4" /> },
    { href: "/services-products", label: "Serviços & Produtos", icon: <Package className="h-4 w-4" /> },
    { href: "/cash-flow", label: "Fluxo de Caixa", icon: <DollarSign className="h-4 w-4" /> },
    { href: "/calendar", label: "Agenda", icon: <Calendar className="h-4 w-4" /> },
    { href: "/personal-control", label: "Controle Pessoal", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="ml-auto flex items-center space-x-4">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <p className="hidden md:block text-sm font-semibold">
              {userProfile?.name}
            </p>
            <Avatar className="hidden md:block">
							<AvatarImage src={user?.avatar_url} />
              <AvatarFallback>{userProfile?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <SheetContent side="left" className="w-full sm:w-64">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Gerencie sua conta e preferências aqui.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigate(item.href);
                    setOpen(false);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 mt-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
