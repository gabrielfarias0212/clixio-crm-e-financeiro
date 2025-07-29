
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, FileText } from "lucide-react";
import { ProfileConfigDialog } from "./ProfileConfigDialog";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  if (!user) return null;
  
  const email = user.email || "";
  const name = user.user_metadata?.name || email.split("@")[0];
  
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleProfileConfig = () => {
    setIsOpen(false);
    setProfileDialogOpen(true);
  };

  const handleBudgets = () => {
    setIsOpen(false);
    navigate('/budgets');
  };

  const handleContracts = () => {
    setIsOpen(false);
    navigate('/contracts');
  };
  
  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-3">
            <div className="flex items-center justify-center rounded-full bg-primary h-8 w-8 text-primary-foreground">
              <span className="text-sm font-medium">{name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="hidden md:inline text-sm font-medium">{name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground truncate">{email}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleProfileConfig}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleBudgets}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Gerador de Orçamentos</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleContracts}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Gerador de Contratos</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileConfigDialog 
        open={profileDialogOpen} 
        onOpenChange={setProfileDialogOpen} 
      />
    </>
  );
}
