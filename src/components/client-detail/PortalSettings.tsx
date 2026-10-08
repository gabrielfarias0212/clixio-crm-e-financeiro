import { useRef, useState } from "react";
import { Client } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Globe, Lock, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props { client: Client; }

export function PortalSettings({ client }: Props) {
  const { updateClient } = useClients();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [deadline, setDeadline] = useState(client.portalDeadline ?? "");
  const [message, setMessage] = useState(client.portalMessage ?? "");
  const [deliveryLink, setDeliveryLink] = useState(client.deliveryLink ?? "");
  const [preWeddingDeliveryLink, setPreWeddingDeliveryLink] = useState(client.preWeddingDeliveryLink ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(client.portalCoverUrl ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const portalUrl = client.portalToken
    ? `${window.location.origin}/portal/${client.portalToken}`
    : null;

  const handleToggle = async () => {
    setSaving(true);
    try {
      await updateClient(client.id, { portalEnabled: !client.portalEnabled } as any);
      toast({ title: client.portalEnabled ? "Portal desativado" : "Portal ativado com sucesso" });
    } catch (e: any) {
      toast({ title: "Erro ao atualizar portal", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClient(client.id, { portalDeadline: deadline || null, portalMessage: message || null, deliveryLink: deliveryLink || null, preWeddingDeliveryLink: preWeddingDeliveryLink || null } as any);
      toast({ title: "Configurações salvas" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `portal-covers/${client.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      setCoverUrl(url);
      await updateClient(client.id, { portalCoverUrl: data.publicUrl } as any);
      toast({ title: "Foto de capa atualizada!" });
    } catch (e: any) {
      toast({ title: "Erro ao enviar foto", description: e.message, variant: "destructive" });
    } finally {
      setUploadingCover(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveCover = async () => {
    try {
      setCoverUrl(null);
      await updateClient(client.id, { portalCoverUrl: null } as any);
      toast({ title: "Foto removida" });
    } catch (e: any) {
      toast({ title: "Erro ao remover foto", description: e.message, variant: "destructive" });
    }
  };

  const copyLink = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    toast({ title: "Link copiado!" });
  };

  const C = { border:"#E8E4DC", bg:"#FAFAF8", text:"#1A1A18", sub:"#6B7280",
    gold:"#C9A96E", goldBg:"#F0E8D8", green:"#2D6A4F", greenBg:"#EBF4EF" };

  return (
    <div style={{ background:"#FFFFFF", border:`1px solid ${C.border}`, borderRadius:12, padding:"24px 24px", marginTop:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Globe style={{ width:18, height:18, color:C.gold }} />
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:C.text }}>Portal do Cliente</p>
            <p style={{ fontSize:12, color:C.sub, marginTop:1 }}>Link exclusivo de acompanhamento</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.2s",
            background: client.portalEnabled ? C.greenBg : "#F3F4F6",
            color: client.portalEnabled ? C.green : C.sub }}>
          {client.portalEnabled ? <><Globe style={{width:13,height:13}}/> Ativo</> : <><Lock style={{width:13,height:13}}/> Inativo</>}
        </button>
      </div>

      {/* Link */}
      {portalUrl && (
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
          <p style={{ fontSize:12, color:C.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{portalUrl}</p>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button onClick={copyLink} style={{ padding:"5px 10px", borderRadius:6, border:`1px solid ${C.border}`, background:"#FFFFFF", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:C.sub }}>
              <Copy style={{width:12,height:12}}/> Copiar
            </button>
            {client.portalEnabled && (
              <a href={portalUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding:"5px 10px", borderRadius:6, border:`1px solid ${C.border}`, background:"#FFFFFF", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:C.sub, textDecoration:"none" }}>
                <ExternalLink style={{width:12,height:12}}/> Ver
              </a>
            )}
          </div>
        </div>
      )}

      {/* Cover photo */}
      <div style={{ marginBottom:16 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:8, textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Foto de capa do portal</label>
        {coverUrl ? (
          <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:140 }}>
            <img src={coverUrl} alt="Capa" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))" }} />
            <button onClick={handleRemoveCover}
              style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
              <X style={{width:14,height:14}}/>
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploadingCover}
              style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.65)", border:"none", borderRadius:6, padding:"5px 10px", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              <ImagePlus style={{width:12,height:12}}/> Trocar
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} disabled={uploadingCover}
            style={{ width:"100%", padding:"20px", border:`2px dashed ${C.border}`, borderRadius:10, background:C.bg, cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", gap:8, color:C.sub }}>
            <ImagePlus style={{width:22,height:22, color:C.gold}}/>
            <span style={{ fontSize:12, fontWeight:500 }}>{uploadingCover ? "Enviando..." : "Adicionar foto do casal"}</span>
            <span style={{ fontSize:11 }}>Será exibida como fundo do portal</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleCoverUpload} />
      </div>

      {/* Deadline */}
      <div style={{ marginBottom:12 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:4, textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Previsão de entrega</label>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
          style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, background:"#FFFFFF", outline:"none" }} />
      </div>

      {/* Message */}
      <div style={{ marginBottom:16 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:4, textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Mensagem personalizada</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
          placeholder="Escreva uma mensagem especial para o cliente ver no portal..."
          style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, background:"#FFFFFF", outline:"none", resize:"vertical" as const, fontFamily:"inherit" }} />
      </div>

      {/* Delivery links */}
      <div style={{ marginBottom:12 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:4, textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Link de entrega — Casamento</label>
        <input type="url" value={deliveryLink} onChange={e => setDeliveryLink(e.target.value)}
          placeholder="https://..."
          style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, background:"#FFFFFF", outline:"none" }} />
      </div>

      {client.hasPreWedding && (
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:4, textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Link de entrega — Pré-Wedding</label>
          <input type="url" value={preWeddingDeliveryLink} onChange={e => setPreWeddingDeliveryLink(e.target.value)}
            placeholder="https://..."
            style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, background:"#FFFFFF", outline:"none" }} />
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        style={{ width:"100%", padding:"9px", borderRadius:8, border:"none", background:C.text, color:"#FFFFFF", fontSize:13, fontWeight:600, cursor:"pointer", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  );
}
