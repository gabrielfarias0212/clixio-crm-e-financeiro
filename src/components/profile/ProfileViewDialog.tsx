
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePhotographerProfile } from "@/hooks/usePhotographerProfile";
import { Separator } from "@/components/ui/separator";

type ProfileViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
};

export function ProfileViewDialog({ open, onOpenChange, onEdit }: ProfileViewDialogProps) {
  const { profile, loading } = usePhotographerProfile();

  const initial = (profile?.brand_name || profile?.company_name || "U").slice(0, 1).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Minha conta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.logo_url || undefined} alt="Foto de perfil" />
              <AvatarFallback className="text-base">{initial}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">
                {profile?.brand_name || profile?.company_name || "Usuário"}
              </div>
              <div className="text-sm text-muted-foreground">{profile?.email || "-"}</div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Empresa</div>
              <div className="text-sm font-medium">{profile?.company_name || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Marca/Nome</div>
              <div className="text-sm font-medium">{profile?.brand_name || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">WhatsApp</div>
              <div className="text-sm font-medium">{profile?.whatsapp || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">E-mail</div>
              <div className="text-sm font-medium">{profile?.email || "-"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">Website</div>
              <div className="text-sm font-medium break-all">{profile?.website || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Facebook</div>
              <div className="text-sm font-medium break-all">{profile?.facebook || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Instagram</div>
              <div className="text-sm font-medium break-all">{profile?.instagram || "-"}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onEdit();
                }}
              >
                Editar perfil
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
