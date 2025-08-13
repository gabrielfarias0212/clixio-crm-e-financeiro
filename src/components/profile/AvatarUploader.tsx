
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUp, Loader2 } from "lucide-react";

type AvatarUploaderProps = {
  userId: string;
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export function AvatarUploader({ userId, value, onChange, label = "Foto de perfil", className }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação simples de tipo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Erro no upload",
          description: "Não foi possível enviar a imagem. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      onChange(publicUrl);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi enviada com sucesso.",
      });
    } finally {
      setUploading(false);
      // limpar o valor do input para permitir reupload do mesmo arquivo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const initial = (userId || "U").slice(0, 1).toUpperCase();

  return (
    <div className={`flex items-center gap-4 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={value || undefined} alt="Foto de perfil" />
          <AvatarFallback className="text-sm">{initial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">PNG, JPG até ~5MB</span>
        </div>
      </div>

      <div className="ml-auto">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <Button type="button" variant="secondary" onClick={handlePick} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <ImageUp className="mr-2 h-4 w-4" />
              Trocar foto
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
