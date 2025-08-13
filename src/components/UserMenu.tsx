
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, IdCard } from "lucide-react";
import { ProfileConfigDialog } from "./ProfileConfigDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileViewDialog } from "./profile/ProfileViewDialog";
import { usePhotographerProfile } from "@/hooks/usePhotographerProfile";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileViewOpen, setProfileViewOpen] = useState(false);
  const { profile } = usePhotographerProfile();
  
  if (!user) return null;
  
  const email = user.email || "";
  const fallbackName = user.user_metadata?.name || email.split("@")[0];

  const displayName = useMemo(() => {
    return profile?.brand_name || profile?.company_name || fallbackName;
  }, [profile, fallbackName]);

  const avatarUrl = profile?.logo_url || undefined;
  const initial = (displayName || "U").charAt(0).toUpperCase();
  
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleProfileConfig = () => {
    setIsOpen(false);
    setProfileDialogOpen(true);
  };

  const handleProfileView = () => {
    setIsOpen(false);
    setProfileViewOpen(true);
  };
  
  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{initial}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{initial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{email}</div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleProfileView}>
            <IdCard className="mr-2 h-4 w-4" />
            <span>Minha conta</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleProfileConfig}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileViewDialog 
        open={profileViewOpen} 
        onOpenChange={setProfileViewOpen}
        onEdit={() => setProfileDialogOpen(true)}
      />

      <ProfileConfigDialog 
        open={profileDialogOpen} 
        onOpenChange={setProfileDialogOpen} 
      />
    </>
  );
}
