import Layout from "@/components/Layout";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { compressWithWatermark, compressThumbnail } from "@/utils/proofing";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, Download, Copy, ExternalLink, Trash2,
  CheckCircle, XCircle, AlertCircle, RefreshCw, RotateCcw, Share2, MessageCircle, Star
} from "lucide-react";

const C = {
  navy:"#1E3A5F", navyBg:"#E8EEF6", gold:"#C9A96E", goldBg:"#F5F0E8",
  text:"#1a1a1a", textSub:"#9A9590", divider:"#F0EDE8", itemBg:"#FAFAF8",
  border:"#E8E4DE", success:"#52C97A", successBg:"#E6F9EE",
  danger:"#E05252", dangerBg:"#FEE8E8", warning:"#D97706", warningBg:"#FEF3C7",
};
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Gallery {
  id: string; client_id: string | null; titulo: string | null; tipo: string;
  status: string; email_acesso: string; senha_acesso: string;
  limite_incluso: number; permite_extras: boolean; preco_foto_extra: number | null;
  watermark_enabled: boolean; watermark_text: string; permite_download: boolean; deadline: string | null;
  cover_photo_path?: string | null;
  valor_extras: number | null; extras_pago: boolean | null;
  created_at: string; finalized_at: string | null;
  user_id: string;
}
interface Photo {
  id: string; gallery_id: string; nome_arquivo: string;
  storage_path: string | null; thumbnail_path?: string | null;
  selecionada: boolean; created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  aguardando_upload:  { label: "Aguardando Upload",  color: "#9B9890", bg: "#F5F3F0" },
  aguardando_selecao: { label: "Em andamento",       color: "#7C5C20", bg: "#F5F0E8" },
  selecao_concluida:  { label: "Em revisão",         color: "#1E3A5F", bg: "#E8EEF6" },
  finalizado:         { label: "Finalizado",         color: "#1A5C32", bg: "#E6F9EE" },
};

export default function GalleryDetail() {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [studioName, setStudioName] = useState("Fotografia");
  const [clientName, setClientName] = useState<string | null>(null);
  const [clientPhone, setClientPhone] = useState<string | null>(null);
  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [movingStatus, setMovingStatus] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState<"lightroom"|"finder"|"win10"|"win11">("lightroom");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [galleryId]);

  async function load() {
    if (!galleryId) return;
    setLoading(true);
    const { data: g } = await supabase.from("proofing_galleries").select("*").eq("id", galleryId).maybeSingle();
    if (!g) { toast.error("Galeria não encontrada"); navigate("/galerias"); return; }
    setGallery(g as Gallery);

    // Photos
    const { data: ph } = await supabase.from("proofing_photos").select("*").eq("gallery_id", galleryId).order("created_at");
    const photoList = (ph ?? []) as Photo[];
    setPhotos(photoList);

    // Batch signed URLs — 1 call instead of N
    const urls: Record<string, string> = {};
    const pathsToSign = photoList.map(p => p.thumbnail_path || p.storage_path).filter(Boolean) as string[];
    if (pathsToSign.length) {
      const { data: signed } = await supabase.storage.from("proofing-photos").createSignedUrls(pathsToSign, 3600);
      photoList.forEach(p => {
        const path = p.thumbnail_path || p.storage_path;
        const entry = (signed || []).find(s => s.path === path);
        if (entry?.signedUrl) urls[p.id] = entry.signedUrl;
      });
    }
    setPhotoUrls(urls);

    // Client name
    if (g.client_id) {
      const { data: cl } = await supabase.from("wedding_clients").select("name, phone, email").eq("id", g.client_id).maybeSingle();
      if (cl) { setClientName(cl.name); setClientPhone(cl.phone ?? null); setClientEmail(cl.email ?? null); }
    }

    // Studio name
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("photographer_profiles").select("name, company_name").eq("user_id", user.id).maybeSingle();
      if (prof) setStudioName(prof.company_name || prof.name || "Fotografia");
    }

    setLoading(false);
  }

  async function saveSettings(patch: { watermark_enabled?: boolean; watermark_text?: string; permite_download?: boolean }) {
    if (!gallery) return;
    setSavingSettings(true);
    await supabase.rpc("update_gallery_settings", {
      p_gallery_id:       gallery.id,
      p_watermark_enabled: patch.watermark_enabled ?? null,
      p_watermark_text:   patch.watermark_text   ?? null,
      p_permite_download: patch.permite_download  ?? null,
    });
    setGallery(g => g ? { ...g, ...patch } : g);
    setSavingSettings(false);
    toast.success("Configurações salvas!");
  }

  async function moveStatus(newStatus: string) {
    if (!gallery) return;
    setMovingStatus(true);
    const finalizedAt = newStatus === "finalizado" ? new Date().toISOString() : null;
    const { error } = await supabase.rpc("update_gallery_status", {
      p_gallery_id:   gallery.id,
      p_status:       newStatus,
      p_finalized_at: finalizedAt,
    });
    if (error) { toast.error("Erro ao atualizar status: " + error.message); setMovingStatus(false); return; }
    setGallery(g => g ? { ...g, status: newStatus, finalized_at: finalizedAt ?? g.finalized_at } : g);
    toast.success("Status atualizado!");
    setMovingStatus(false);
  }

  async function handleUpload(files: FileList) {
    if (!gallery || !files.length) return;
    const fileArr = Array.from(files);
    setUploading(true);
    setUploadProgress({ done: 0, total: fileArr.length });
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      try {
        const wmark = gallery.watermark_enabled ? (gallery.watermark_text || studioName) : "";
        const [blob, thumbBlob] = await Promise.all([
          compressWithWatermark(file, wmark),
          compressThumbnail(file, wmark),
        ]);
        const uuid = crypto.randomUUID();
        const path = `${gallery.id}/${uuid}.webp`;
        const thumbPath = `${gallery.id}/${uuid}_thumb.webp`;
        const [{ error: upErr }, { error: thumbErr }] = await Promise.all([
          supabase.storage.from("proofing-photos").upload(path, blob, { contentType: "image/webp" }),
          supabase.storage.from("proofing-photos").upload(thumbPath, thumbBlob, { contentType: "image/webp" }),
        ]);
        if (upErr) toast.error(`Erro: ${file.name}`);
        else await supabase.from("proofing_photos").insert({
          gallery_id: gallery.id, nome_arquivo: file.name,
          storage_path: path,
          thumbnail_path: thumbErr ? null : thumbPath,
          selecionada: false,
        });
      } catch { toast.error(`Falha ao processar ${file.name}`); }
      setUploadProgress({ done: i + 1, total: fileArr.length });
    }
    setUploading(false); setUploadProgress(null);
    toast.success("Upload concluído!");
    load();
  }

  async function deletePhoto(photo: Photo) {
    const toRemove = [photo.storage_path, photo.thumbnail_path].filter(Boolean) as string[];
    if (toRemove.length) await supabase.storage.from("proofing-photos").remove(toRemove);
    await supabase.from("proofing_photos").delete().eq("id", photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    toast.success("Foto removida.");
  }

  async function deleteGallery() {
    if (!gallery || !confirm("Excluir esta galeria e todas as fotos permanentemente?")) return;
    const { data: ph } = await supabase.from("proofing_photos").select("storage_path").eq("gallery_id", gallery.id);
    const paths = (ph ?? []).filter(p => p.storage_path).map(p => p.storage_path!);
    if (paths.length) await supabase.storage.from("proofing-photos").remove(paths);
    await supabase.from("proofing_photos").delete().eq("gallery_id", gallery.id);
    await supabase.from("proofing_galleries").delete().eq("id", gallery.id);
    toast.success("Galeria excluída.");
    navigate("/galerias");
  }

  async function setCoverPhoto(path: string | null) {
    if (!gallery) return;
    const { error } = await supabase.rpc("update_gallery_settings", {
      p_gallery_id: gallery.id,
      p_cover_photo_path: path,
    });
    if (error) { toast.error("Erro ao definir capa"); return; }
    setGallery(g => g ? { ...g, cover_photo_path: path } : g);
    toast.success(path ? "Foto definida como capa!" : "Capa removida.");
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/galeria/${gallery!.id}`);
    toast.success("Link copiado!");
  }

  // Export list helpers
  const baseName = (f: string) => f.replace(/\.[^.]+$/, "");
  const selPhotos = photos.filter(p => p.selecionada);
  const selNames = selPhotos.map(p => baseName(p.nome_arquivo));
  const TABS = [
    { key: "lightroom" as const, label: "Lightroom", fmt: (ns: string[]) => ns.join(", "),
      steps: ["No Lightroom, vá para Biblioteca", "Filtro de texto → Nome do arquivo → Contém", "Cole a lista abaixo"] },
    { key: "finder" as const, label: "Finder (Mac)", fmt: (ns: string[]) => ns.map(n => n + ".").join(" OR "),
      steps: ["Abra o Finder (⌘+F)", "Cole a lista abaixo no campo de busca"] },
    { key: "win10" as const, label: "Windows 10", fmt: (ns: string[]) => ns.map(n => `"${n}."`).join(" OR "),
      steps: ["Abra o Windows Explorer", "Cole a lista abaixo no campo de busca"] },
    { key: "win11" as const, label: "Windows 11", fmt: (ns: string[]) => ns.map(n => `"${n}."`).join(" OR "),
      steps: ["Abra o Windows Explorer", "Cole a lista abaixo no campo de busca"] },
  ];
  const activeTab = TABS.find(t => t.key === exportTab)!;
  const CHUNK = 17;
  const chunks: string[] = [];
  for (let i = 0; i < selNames.length; i += CHUNK) chunks.push(activeTab.fmt(selNames.slice(i, i + CHUNK)));

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
      <div style={{ width: 24, height: 24, border: `2px solid #E8E4DC`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!gallery) return null;

  const statusInfo = STATUS_LABELS[gallery.status] ?? STATUS_LABELS["aguardando_selecao"];
  const selectedCount = photos.filter(p => p.selecionada).length;
  const hasExtras = (gallery.valor_extras ?? 0) > 0 && gallery.permite_extras;

  return (
    <Layout>
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 60px" }}>
      {/* Back + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/galerias")}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: C.textSub, fontSize: 13, padding: 0 }}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> Galerias
        </button>
        <span style={{ color: C.divider }}>›</span>
        {clientName && (
          <>
            <Link to={`/clients/${gallery.client_id}`} style={{ fontSize: 13, color: C.textSub, textDecoration: "none" }}>{clientName}</Link>
            <span style={{ color: C.divider }}>›</span>
          </>
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{gallery.titulo || (gallery.tipo === "album" ? "Álbum" : "Ensaio")}</span>
      </div>

      {/* Header card */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>
                {gallery.titulo || (gallery.tipo === "album" ? "Álbum" : "Ensaio")}
              </h1>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: statusInfo.bg, color: statusInfo.color }}>
                {statusInfo.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: C.textSub }}>
              {gallery.tipo} · {gallery.limite_incluso > 0 ? `${gallery.limite_incluso} fotos inclusas` : "Sem limite"}
              {gallery.deadline && ` · Prazo: ${gallery.deadline.split("-").reverse().join("/")}`}
              {clientName && ` · ${clientName}`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setShowShare(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#E8F5E9", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#1B5E20", cursor: "pointer" }}>
              <Share2 style={{ width: 12, height: 12 }} /> Compartilhar
            </button>
            <button onClick={copyLink}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.navyBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.navy, cursor: "pointer" }}>
              <Copy style={{ width: 12, height: 12 }} /> Link
            </button>
            <a href={`/galeria/${gallery.id}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.text, textDecoration: "none" }}>
              <ExternalLink style={{ width: 12, height: 12 }} /> Abrir galeria
            </a>
            <button onClick={deleteGallery}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.dangerBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.danger, cursor: "pointer" }}>
              <Trash2 style={{ width: 12, height: 12 }} /> Excluir
            </button>
          </div>
        </div>

        {/* Access credentials */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 16, padding: "12px 14px", background: C.itemBg, borderRadius: 10 }}>
          <div><div style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</div><div style={{ fontSize: 13, fontWeight: 700 }}>{gallery.email_acesso}</div></div>
          <div><div style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Senha</div><div style={{ fontSize: 13, fontWeight: 700 }}>{gallery.senha_acesso}</div></div>
          {gallery.limite_incluso > 0 && <div><div style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Limite</div><div style={{ fontSize: 13, fontWeight: 700 }}>{gallery.limite_incluso} fotos</div></div>}
          {gallery.preco_foto_extra && <div><div style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Extra</div><div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(gallery.preco_foto_extra)}/foto</div></div>}
          <div><div style={{ fontSize: 10, color: C.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fotos</div><div style={{ fontSize: 13, fontWeight: 700 }}>{photos.length} total · {selectedCount} selecionadas</div></div>
        </div>

        {/* Status actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {gallery.status === "selecao_concluida" && (
            <>
              <button onClick={() => moveStatus("finalizado")} disabled={movingStatus}
                style={{ padding: "8px 16px", background: C.successBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#1A5C32", cursor: "pointer" }}>
                <CheckCircle style={{ width: 13, height: 13, display: "inline", marginRight: 4 }} />Finalizar galeria
              </button>
              <button onClick={() => moveStatus("aguardando_selecao")} disabled={movingStatus}
                style={{ padding: "8px 16px", background: C.goldBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#7C5C20", cursor: "pointer" }}>
                <RotateCcw style={{ width: 13, height: 13, display: "inline", marginRight: 4 }} />Reativar seleção
              </button>
            </>
          )}
          {gallery.status === "finalizado" && (
            <button onClick={() => moveStatus("aguardando_selecao")} disabled={movingStatus}
              style={{ padding: "8px 16px", background: C.goldBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#7C5C20", cursor: "pointer" }}>
              <RotateCcw style={{ width: 13, height: 13, display: "inline", marginRight: 4 }} />Reativar galeria
            </button>
          )}
          {gallery.status === "aguardando_selecao" && (
            <button onClick={() => moveStatus("finalizado")} disabled={movingStatus}
              style={{ padding: "8px 16px", background: C.successBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#1A5C32", cursor: "pointer" }}>
              <CheckCircle style={{ width: 13, height: 13, display: "inline", marginRight: 4 }} />Marcar como finalizado
            </button>
          )}
          {movingStatus && <span style={{ fontSize: 12, color: C.textSub, alignSelf: "center" }}>Atualizando...</span>}
        </div>

        {/* Extras payment */}
        {hasExtras && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: gallery.extras_pago ? C.successBg : C.dangerBg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: gallery.extras_pago ? "#1A5C32" : C.danger }}>
              {gallery.extras_pago ? "✓ Extras pagos" : `Extras pendentes: ${fmt(gallery.valor_extras!)}`}
            </span>
            <button onClick={async () => {
              const newVal = !gallery.extras_pago;
              await supabase.rpc("update_gallery_settings", { p_gallery_id: gallery.id, p_extras_pago: newVal });
              setGallery(g => g ? { ...g, extras_pago: newVal } : g);
            }} style={{ padding: "5px 12px", background: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", color: C.text }}>
              {gallery.extras_pago ? "Desmarcar" : "Confirmar pagamento"}
            </button>
          </div>
        )}
      </div>

      {/* Selection export (when client has selected) */}
      {selectedCount > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{selectedCount} foto{selectedCount !== 1 ? "s" : ""} selecionada{selectedCount !== 1 ? "s" : ""} pelo cliente</span>
            {gallery.limite_incluso > 0 && <span style={{ fontSize: 12, color: C.textSub, marginLeft: 8 }}>de {gallery.limite_incluso} inclusas</span>}
          </div>
          <button onClick={() => setShowExport(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.navyBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
            <Download style={{ width: 13, height: 13 }} /> Exportar lista
          </button>
        </div>
      )}

      {/* Settings panel */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Configurações da galeria</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Watermark toggle + text */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 160 }}>
              <div onClick={() => saveSettings({ watermark_enabled: !gallery.watermark_enabled })}
                style={{ width: 36, height: 20, borderRadius: 99, background: gallery.watermark_enabled ? C.gold : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: gallery.watermark_enabled ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Marca d'água</span>
            </label>
            {gallery.watermark_enabled && (
              <div style={{ flex: 1, minWidth: 220, display: "flex", gap: 8 }}>
                <input
                  defaultValue={gallery.watermark_text}
                  key={gallery.watermark_text}
                  onBlur={e => { if (e.target.value.trim() !== gallery.watermark_text) saveSettings({ watermark_text: e.target.value.trim() || gallery.watermark_text }); }}
                  style={{ flex: 1, padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }}
                  placeholder="Texto da marca d'água"
                />
              </div>
            )}
          </div>

          {/* Download toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div onClick={() => saveSettings({ permite_download: !gallery.permite_download })}
                style={{ width: 36, height: 20, borderRadius: 99, background: gallery.permite_download ? C.success : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: gallery.permite_download ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Permitir download</span>
            </label>
            <span style={{ fontSize: 12, color: C.textSub }}>
              {gallery.permite_download ? "Cliente pode salvar as fotos" : "Protegido contra clique direito e toque longo"}
            </span>
          </div>

          {savingSettings && <span style={{ fontSize: 11, color: C.textSub }}>Salvando...</span>}
        </div>
      </div>

      {/* Upload section */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            Fotos {photos.length > 0 && `(${photos.length})`}
            {gallery.watermark_enabled && <span style={{ fontSize: 11, fontWeight: 400, color: C.textSub, marginLeft: 8 }}>· Marca d'água: "{gallery.watermark_text}"</span>}
          </span>
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.goldBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#7C5C20", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}>
            <Upload style={{ width: 13, height: 13 }} />
            {uploading ? `Enviando ${uploadProgress?.done}/${uploadProgress?.total}...` : "Fazer upload"}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
            onChange={e => e.target.files && handleUpload(e.target.files)} />
        </div>

        {photos.length === 0 ? (
          <div onClick={() => inputRef.current?.click()}
            style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: "48px 20px", textAlign: "center", cursor: "pointer" }}>
            <Upload style={{ width: 32, height: 32, color: C.border, margin: "0 auto 10px" }} />
            <p style={{ fontSize: 13, color: C.textSub, margin: 0 }}>Clique para fazer upload das fotos</p>
            <p style={{ fontSize: 11, color: "#C5C0BB", marginTop: 4 }}>Comprimidas automaticamente · WebP · máx 1800px</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
            {photos.map(photo => (
              <div key={photo.id}
                style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: C.itemBg,
                  border: gallery.cover_photo_path === photo.storage_path ? `2.5px solid ${C.gold}` : photo.selecionada ? `2.5px solid #7CB9E8` : `2px solid transparent` }}
                onMouseEnter={() => setHoveredPhotoId(photo.id)}
                onMouseLeave={() => setHoveredPhotoId(null)}>
                {photoUrls[photo.id]
                  ? <img src={photoUrls[photo.id]} alt={photo.nome_arquivo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", background: C.divider }} />}
                {/* Cover star badge */}
                {gallery.cover_photo_path === photo.storage_path && (
                  <div style={{ position: "absolute", top: 4, left: 4, width: 20, height: 20, background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star style={{ width: 10, height: 10, color: "#fff", fill: "#fff" }} />
                  </div>
                )}
                {photo.selecionada && (
                  <div style={{ position: "absolute", bottom: 4, right: 4, width: 18, height: 18, background: "#7CB9E8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle style={{ width: 11, height: 11, color: "#fff" }} />
                  </div>
                )}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: hoveredPhotoId === photo.id ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0)", transition: "background 0.15s" }}>
                  <button onClick={() => deletePhoto(photo)}
                    style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <XCircle style={{ width: 12, height: 12, color: "#fff" }} />
                  </button>
                  {/* Set as cover button */}
                  {hoveredPhotoId === photo.id && (
                    <button
                      onClick={() => setCoverPhoto(gallery.cover_photo_path === photo.storage_path ? null : photo.storage_path)}
                      style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", padding: "4px 8px", background: gallery.cover_photo_path === photo.storage_path ? "rgba(201,169,110,0.95)" : "rgba(0,0,0,0.72)", border: "none", borderRadius: 6, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Star style={{ width: 9, height: 9, fill: gallery.cover_photo_path === photo.storage_path ? "#fff" : "none" }} />
                      {gallery.cover_photo_path === photo.storage_path ? "Remover capa" : "Definir como capa"}
                    </button>
                  )}
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", padding: "3px 5px" }}>
                  <div style={{ fontSize: 9, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.nome_arquivo}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShare && gallery && (
        <ShareModal
          gallery={gallery}
          clientName={clientName}
          clientPhone={clientPhone}
          clientEmail={clientEmail}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
             onClick={() => setShowExport(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
               onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Exportar fotos selecionadas</span>
              <button onClick={() => setShowExport(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textSub }}>×</button>
            </div>
            <div style={{ display: "flex", borderBottom: `1px solid ${C.divider}`, padding: "0 24px", marginTop: 16 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setExportTab(t.key)}
                  style={{ padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: exportTab === t.key ? C.navy : C.textSub,
                    borderBottom: exportTab === t.key ? `2px solid ${C.navy}` : "2px solid transparent", marginBottom: -1 }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <ul style={{ margin: "0 0 16px", paddingLeft: 18 }}>
                {activeTab.steps.map((s, i) => <li key={i} style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>{s}</li>)}
              </ul>
              {chunks.map((chunk, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  {chunks.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub }}>Parte {idx + 1}</span>
                      <span style={{ fontSize: 12, color: C.textSub }}>{selNames.slice(idx * CHUNK, (idx + 1) * CHUNK).length} fotos</span>
                    </div>
                  )}
                  <div style={{ background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, color: C.text, wordBreak: "break-all", lineHeight: 1.7 }}>{chunk}</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <button onClick={() => { navigator.clipboard.writeText(chunk); toast.success("Copiado!"); }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.text }}>
                        <Copy style={{ width: 12, height: 12 }} /> Copiar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}

// ── ShareModal ────────────────────────────────────────────────────────────────
function ShareModal({ gallery, clientName, clientPhone, clientEmail, onClose }: {
  gallery: Gallery;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState(clientPhone ?? "");
  const [email, setEmail] = useState(clientEmail ?? "");
  const [copied, setCopied] = useState(false);

  const galleryUrl = `${window.location.origin}/galeria/${gallery.id}`;
  const ogUrl = `https://lwdfznskytyjqurxqebu.supabase.co/functions/v1/galeria-og?id=${gallery.id}`;
  const firstName = clientName ? clientName.split(" ")[0] : "cliente";
  const label = gallery.titulo || (gallery.tipo === "album" ? "álbum" : "ensaio");

  const whatsappText = `Olá ${firstName}! 📸 Sua galeria de seleção de fotos está pronta.\n\nAcesse pelo link abaixo e escolha suas fotos favoritas do seu ${label}:\n\n🔗 ${ogUrl}\n📧 E-mail: ${gallery.email_acesso}\n🔑 Senha: ${gallery.senha_acesso}\n\nQualquer dúvida é só me chamar!`;

  const cleanPhone = (p: string) => {
    const digits = p.replace(/\D/g, "");
    return digits.startsWith("55") ? digits : `55${digits}`;
  };

  const openWhatsApp = () => {
    const p = cleanPhone(phone);
    if (p.length < 12) { alert("Informe um telefone válido com DDD."); return; }
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(whatsappText)}`, "_blank");
  };

  const copyAll = () => {
    const text = `Link: ${galleryUrl}\nE-mail: ${gallery.email_acesso}\nSenha: ${gallery.senha_acesso}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const C2 = {
    text: "#1a1a1a", sub: "#9A9590", border: "#E8E4DE",
    bg: "#FAFAF8", navy: "#1E3A5F", navyBg: "#E8EEF6",
    gold: "#C9A96E", goldBg: "#F5F0E8",
    green: "#1B5E20", greenBg: "#E8F5E9",
    waBg: "#25D366",
  };

  const field: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: C2.bg,
    border: `1px solid ${C2.border}`, borderRadius: 8,
    fontSize: 13, color: C2.text, boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
         onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C2.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C2.text }}>
              Compartilhar com {clientName ?? "cliente"}
            </span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C2.sub, lineHeight: 1 }}>×</button>
          </div>
          <p style={{ fontSize: 12, color: C2.sub, margin: "4px 0 0" }}>
            {gallery.titulo || label} · {gallery.tipo}
          </p>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Credentials card */}
          <div style={{ background: C2.bg, border: `1px solid ${C2.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C2.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Dados de acesso do cliente
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C2.sub }}>Link</span>
                <span style={{ color: C2.navy, fontWeight: 600, wordBreak: "break-all", textAlign: "right", maxWidth: 260 }}>{galleryUrl}</span>
              </div>
              <div style={{ height: 1, background: C2.border }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C2.sub }}>E-mail</span>
                <span style={{ fontWeight: 600 }}>{gallery.email_acesso}</span>
              </div>
              <div style={{ height: 1, background: C2.border }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C2.sub }}>Senha</span>
                <span style={{ fontWeight: 600 }}>{gallery.senha_acesso}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={copyAll}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", background: "#fff", border: `1px solid ${C2.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C2.text }}>
                {copied ? "✓ Copiado!" : <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar</>}
              </button>
            </div>
          </div>

          {/* Contact fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C2.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contato
            </div>
            <div>
              <label style={{ fontSize: 11, color: C2.sub, display: "block", marginBottom: 4 }}>E-mail do cliente</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@cliente.com"
                style={field}
              />
              {!clientEmail && (
                <p style={{ fontSize: 11, color: C2.sub, margin: "4px 0 0" }}>
                  Nenhum e-mail cadastrado para este cliente.
                </p>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, color: C2.sub, display: "block", marginBottom: 4 }}>WhatsApp com DDD</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="11999998888"
                style={field}
              />
              {!clientPhone && (
                <p style={{ fontSize: 11, color: C2.sub, margin: "4px 0 0" }}>
                  Nenhum telefone cadastrado para este cliente.
                </p>
              )}
            </div>
          </div>

          {/* Message preview */}
          <div style={{ background: C2.bg, border: `1px solid ${C2.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C2.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Mensagem</div>
            <pre style={{ margin: 0, fontSize: 12, color: C2.text, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>{whatsappText}</pre>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={openWhatsApp}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: C2.waBg, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enviar por WhatsApp
            </button>
            {email && (
              <a href={`mailto:${email}?subject=Sua galeria de seleção de fotos&body=${encodeURIComponent(whatsappText)}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: C2.navyBg, border: `1px solid ${C2.border}`, borderRadius: 10, color: C2.navy, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Enviar por e-mail
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
