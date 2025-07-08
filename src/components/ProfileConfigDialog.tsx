
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Save, X } from "lucide-react";

interface ProfileData {
  company_name: string;
  logo_url: string;
  brand_name: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
}

interface ProfileConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileConfigDialog({ open, onOpenChange }: ProfileConfigDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    company_name: '',
    logo_url: '',
    brand_name: '',
    whatsapp: '',
    email: '',
    website: '',
    facebook: '',
    instagram: ''
  });

  useEffect(() => {
    if (open && user) {
      loadProfileData();
    }
  }, [open, user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('photographer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          company_name: data.company_name || '',
          logo_url: data.avatar_url || '',
          brand_name: data.name || '',
          whatsapp: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          facebook: '',
          instagram: ''
        });
      }
    } catch (error) {
      console.error('Exception loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('photographer_profiles')
        .upsert({
          user_id: user.id,
          company_name: profileData.company_name,
          avatar_url: profileData.logo_url,
          name: profileData.brand_name,
          phone: profileData.whatsapp,
          email: profileData.email,
          website: profileData.website,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Configurar Perfil
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={profileData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Digite o nome da sua empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_name">Nome/Marca</Label>
              <Input
                id="brand_name"
                value={profileData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Nome da marca ou profissional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL da Logo/Foto</Label>
            <Input
              id="logo_url"
              value={profileData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={profileData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profileData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.meusite.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={profileData.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                placeholder="@meuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={profileData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@meuperfil"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
