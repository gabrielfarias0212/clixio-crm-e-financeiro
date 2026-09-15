import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressWithWatermark, ProofingGallery, ProofingPhoto } from "@/utils/proofing";
import {
  Upload, Images, Download, CheckCircle, XCircle, Plus, Trash2,
  ExternalLink, Eye, ToggleLeft, ToggleRight, Copy, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const C = {
  navy: "#1E3A5F", navyBg: "#E8EEF6",
  gold: "#C9A96E", goldBg: "#F5F0E8",
  text: "#1a1a1a", textSub: "#9A9590",
  divider: "#F0EDE8", itemBg: "#FAFAF8", border: "#E8E4DE",
  success: "#52C97A", successBg: "#E6F9EE",
  danger: "#E05252", dangerBg: "#FEE8E8",
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  aguardando_upload:  { label: "Aguardando Upload", color: "#9B9890", bg: "#F5F3F0" },
  aguardando_selecao: { label: "Aguardando Seleção", color: "#7C5C20", bg: "#F5F0E8" },
  selecao_concluida:  { label: "Seleção Concluída", color: "#1A5C32", bg: "#E6F9EE" },
};

interface ProofingTabProps {
  clientId: string;
  clientName: string;
}

export function ProofingTab({ clientId, clientName }: ProofingTabProps) {
  const [galleries, setGalleries] = useState<ProofingGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedGallery, setExpandedGallery] = useState<string | null>(null);
  const [studioName, setStudioName] = useState("Fotografia");
  const [pixKey, setPixKey] = useState("");

  // Create form state
  const [form, setForm] = useState({
    tipo: "ensaio", limite_incluso: 0, permite_extras: true,
    preco_foto_extra: "", email_acesso: "", senha_acesso: "",
    deadline: "", watermark_enabled: true,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGalleries();
    loadProfile();
  }, [clientId]);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("photographer_profiles")
      .select("name, company_name, pix_key")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setStudioName(data.company_name || data.name || "Fotografia");
      setPixKey(data.pix_key || "");
    }
  }

  async function loadGalleries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("proofing_galleries")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (!error && data) setGalleries(data as ProofingGallery[]);
    setLoading(false);
  }

  async function createGallery() {
    if (!form.email_acesso || !form.senha_acesso) {
      toast.error("Preencha o email e senha de acesso."); return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("proofing_galleries")
      .insert({
        client_id: clientId,
        tipo: form.tipo,
        limite_incluso: Number(form.limite_incluso),
        permite_extras: form.permite_extras,
        preco_foto_extra: form.permite_extras && form.preco_foto_extra ? Number(form.preco_foto_extra) : null,
        email_acesso: form.email_acesso.toLowerCase().trim(),
        senha_acesso: form.senha_acesso,
        deadline: form.deadline || null,
        watermark_enabled: form.watermark_enabled,
        status: "aguardando_selecao",
      })
      .select()
      .single();
    setCreating(false);
    if (error) { toast.error("Erro ao criar galeria."); return; }
    toast.success("Galeria criada!");
    setGalleries(prev => [data as ProofingGallery, ...prev]);
    setShowCreate(false);
    setExpandedGallery(data.id);
    setForm({ tipo: "ensaio", limite_incluso: 0, permite_extras: true, preco_foto_extra: "", email_acesso: "", senha_acesso: "", deadline: "", watermark_enabled: true });
  }

  async function deleteGallery(galleryId: string) {
    if (!confirm("Excluir esta galeria e todas as fotos?")) return;
    // Delete photos from storage first
    const { data: photos } = await supabase
      .from("proofing_photos")
      .select("storage_path")
      .eq("gallery_id", galleryId);
    if (photos?.length) {
      const paths = photos.filter(p => p.storage_path).map(p => p.storage_path!);
      if (paths.length) await supabase.storage.from("proofing-photos").remove(paths);
    }
    await supabase.from("proofing_galleries").delete().eq("id", galleryId);
    setGalleries(prev => prev.filter(g => g.id !== galleryId));
    toast.success("Galeria excluída.");
  }

  async function toggleExtrasPago(gallery: ProofingGallery) {
    const newVal = !gallery.extras_pago;
    const { error } = await supabase
      .from("proofing_galleries")
      .update({ extras_pago: newVal })
      .eq("id", gallery.id);
    if (!error) {
      setGalleries(prev => prev.map(g => g.id === gallery.id ? { ...g, extras_pago: newVal } : g));
      toast.success(newVal ? "Extras marcados como pagos." : "Pagamento desmarcado.");
    }
  }

  async function savePixKey() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("photographer_profiles")
      .update({ pix_key: pixKey.trim() })
      .eq("user_id", user.id);
    if (!error) toast.success("Chave Pix salva.");
    else toast.error("Erro ao salvar chave Pix.");
  }

  const galleryUrl = (g: ProofingGallery) =>
    `${window.location.origin}/galeria/${g.id}`;

  const copyLink = (g: ProofingGallery) => {
    navigator.clipboard.writeText(galleryUrl(g));
    toast.success("Link copiado!");
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 28, height: 28, border: "2px solid #E8E4DC", borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Pix Key config */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub, margin: "0 0 10px" }}>
          Chave Pix (para pagamento de extras)
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={pixKey}
            onChange={e => setPixKey(e.target.value)}
            placeholder="Ex: email, CPF, CNPJ ou chave aleatória"
            style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          <button onClick={savePixKey} style={{ padding: "8px 16px", background: C.navyBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
            Salvar
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
          Galerias de Seleção
        </h3>
        <button
          onClick={() => setShowCreate(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.navy, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}
        >
          <Plus style={{ width: 13, height: 13 }} /> Nova Galeria
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: "#fff", border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: "20px 24px" }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: C.text }}>Nova Galeria de Seleção</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 4 }}>TIPO</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}>
                <option value="ensaio">Ensaio</option>
                <option value="album">Álbum / Pós-edição</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 4 }}>FOTOS INCLUSAS NO PACOTE</label>
              <input type="number" min={0} value={form.limite_incluso}
                onChange={e => setForm(f => ({ ...f, limite_incluso: Number(e.target.value) }))}
                style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 4 }}>EMAIL DE ACESSO DO CLIENTE</label>
              <input type="email" value={form.email_acesso} placeholder="email@exemplo.com"
                onChange={e => setForm(f => ({ ...f, email_acesso: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 4 }}>SENHA DE ACESSO</label>
              <input value={form.senha_acesso} placeholder="Ex: nome123"
                onChange={e => setForm(f => ({ ...f, senha_acesso: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 4 }}>PRAZO (opcional)</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 4 }}>PERMITE EXTRAS</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <button onClick={() => setForm(f => ({ ...f, permite_extras: !f.permite_extras }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {form.permite_extras
                    ? <ToggleRight style={{ width: 32, height: 32, color: C.navy }} />
                    : <ToggleLeft style={{ width: 32, height: 32, color: C.textSub }} />}
                </button>
                {form.permite_extras && (
                  <input type="number" min={0} step="0.01" value={form.preco_foto_extra}
                    placeholder="R$/foto extra"
                    onChange={e => setForm(f => ({ ...f, preco_foto_extra: e.target.value }))}
                    style={{ width: 110, padding: "6px 8px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
                )}
              </div>
            </div>
            <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setForm(f => ({ ...f, watermark_enabled: !f.watermark_enabled }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {form.watermark_enabled
                  ? <ToggleRight style={{ width: 28, height: 28, color: C.navy }} />
                  : <ToggleLeft style={{ width: 28, height: 28, color: C.textSub }} />}
              </button>
              <span style={{ fontSize: 12, color: C.text }}>Aplicar marca d'água nas fotos</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={createGallery} disabled={creating} style={{ padding: "10px 20px", background: C.navy, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1 }}>
              {creating ? "Criando..." : "Criar galeria"}
            </button>
            <button onClick={() => setShowCreate(false)} style={{ padding: "10px 16px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.textSub, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Gallery list */}
      {galleries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", background: C.itemBg, borderRadius: 14, border: `1px dashed ${C.border}` }}>
          <Images style={{ width: 40, height: 40, color: C.divider, margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: C.textSub }}>Nenhuma galeria de seleção criada ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {galleries.map(g => (
            <GalleryCard
              key={g.id}
              gallery={g}
              expanded={expandedGallery === g.id}
              studioName={studioName}
              onToggleExpand={() => setExpandedGallery(v => v === g.id ? null : g.id)}
              onDelete={deleteGallery}
              onCopyLink={copyLink}
              onTogglePaid={toggleExtrasPago}
              onRefresh={loadGalleries}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────
function GalleryCard({ gallery, expanded, studioName, onToggleExpand, onDelete, onCopyLink, onTogglePaid, onRefresh }: {
  gallery: ProofingGallery; expanded: boolean; studioName: string;
  onToggleExpand: () => void;
  onDelete: (id: string) => void;
  onCopyLink: (g: ProofingGallery) => void;
  onTogglePaid: (g: ProofingGallery) => void;
  onRefresh: () => void;
}) {
  const [photos, setPhotos] = useState<ProofingPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const status = STATUS_MAP[gallery.status] || STATUS_MAP["aguardando_selecao"];

  useEffect(() => {
    if (expanded) loadPhotos();
  }, [expanded]);

  async function loadPhotos() {
    setPhotosLoading(true);
    const { data } = await supabase
      .from("proofing_photos")
      .select("*")
      .eq("gallery_id", gallery.id)
      .order("created_at", { ascending: true });
    const list = (data ?? []) as ProofingPhoto[];
    setPhotos(list);

    // Generate signed URLs
    const urls: Record<string, string> = {};
    await Promise.all(
      list.filter(p => p.storage_path).map(async p => {
        const { data: u } = await supabase.storage
          .from("proofing-photos")
          .createSignedUrl(p.storage_path!, 3600);
        if (u?.signedUrl) urls[p.id] = u.signedUrl;
      })
    );
    setPhotoUrls(urls);
    setPhotosLoading(false);
  }

  async function handleUpload(files: FileList) {
    if (!files.length) return;
    const fileArr = Array.from(files);
    setUploading(true);
    setUploadProgress({ done: 0, total: fileArr.length });

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      try {
        const blob = gallery.watermark_enabled
          ? await compressWithWatermark(file, studioName)
          : await compressWithWatermark(file, "");
        const ext = "webp";
        const path = `${gallery.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upError } = await supabase.storage
          .from("proofing-photos")
          .upload(path, blob, { contentType: "image/webp", upsert: false });
        if (upError) { toast.error(`Erro ao enviar ${file.name}`); continue; }
        await supabase.from("proofing_photos").insert({
          gallery_id: gallery.id,
          nome_arquivo: file.name,
          storage_path: path,
          selecionada: false,
        });
      } catch (e) {
        toast.error(`Falha ao processar ${file.name}`);
      }
      setUploadProgress({ done: i + 1, total: fileArr.length });
    }
    setUploading(false);
    setUploadProgress(null);
    toast.success("Upload concluído!");
    loadPhotos();
  }

  async function deletePhoto(photo: ProofingPhoto) {
    if (photo.storage_path) {
      await supabase.storage.from("proofing-photos").remove([photo.storage_path]);
    }
    await supabase.from("proofing_photos").delete().eq("id", photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
  }

  function exportSelection() {
    const selected = photos.filter(p => p.selecionada);
    if (!selected.length) { toast.error("Nenhuma foto selecionada ainda."); return; }
    const content = selected.map(p => p.nome_arquivo).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selecao_${gallery.tipo}_${gallery.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${selected.length} arquivos exportados.`);
  }

  const selectedCount = photos.filter(p => p.selecionada).length;

  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Card header */}
      <div
        onClick={onToggleExpand}
        style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: expanded ? C.itemBg : "#fff" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              {gallery.tipo === "album" ? "Álbum" : "Ensaio"}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: status.bg, color: status.color }}>
              {status.label}
            </span>
            {gallery.status === "selecao_concluida" && (gallery.valor_extras ?? 0) > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: gallery.extras_pago ? C.successBg : C.dangerBg, color: gallery.extras_pago ? "#1A5C32" : C.danger }}>
                {gallery.extras_pago ? "✓ Extras pagos" : `${fmt(gallery.valor_extras!)} pendente`}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>
            {gallery.limite_incluso > 0 ? `${gallery.limite_incluso} fotos inclusas` : "Sem limite"}
            {gallery.deadline && ` · Prazo: ${gallery.deadline.split("-").reverse().join("/")}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onCopyLink(gallery)} title="Copiar link" style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 6, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Copy style={{ width: 13, height: 13, color: C.textSub }} />
          </button>
          <a href={`/galeria/${gallery.id}`} target="_blank" rel="noopener noreferrer" title="Abrir galeria" style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 6, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <ExternalLink style={{ width: 13, height: 13, color: C.textSub }} />
          </a>
          <button onClick={() => onDelete(gallery.id)} title="Excluir" style={{ width: 30, height: 30, border: "1px solid #FECDCD", borderRadius: 6, background: C.dangerBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 style={{ width: 13, height: 13, color: C.danger }} />
          </button>
        </div>
        {expanded ? <ChevronUp style={{ width: 16, height: 16, color: C.textSub, flexShrink: 0 }} /> : <ChevronDown style={{ width: 16, height: 16, color: C.textSub, flexShrink: 0 }} />}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.divider}`, padding: "20px" }}>

          {/* Access info */}
          <div style={{ background: C.itemBg, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div><span style={{ fontSize: 11, color: C.textSub }}>Email</span><br /><span style={{ fontSize: 13, fontWeight: 600 }}>{gallery.email_acesso}</span></div>
            <div><span style={{ fontSize: 11, color: C.textSub }}>Senha</span><br /><span style={{ fontSize: 13, fontWeight: 600 }}>{gallery.senha_acesso}</span></div>
            {gallery.limite_incluso > 0 && <div><span style={{ fontSize: 11, color: C.textSub }}>Limite</span><br /><span style={{ fontSize: 13, fontWeight: 600 }}>{gallery.limite_incluso} fotos</span></div>}
            {gallery.preco_foto_extra && <div><span style={{ fontSize: 11, color: C.textSub }}>Extra</span><br /><span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(gallery.preco_foto_extra)}/foto</span></div>}
          </div>

          {/* Payment toggle */}
          {gallery.status === "selecao_concluida" && (gallery.valor_extras ?? 0) > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: gallery.extras_pago ? C.successBg : C.dangerBg, border: `1px solid ${gallery.extras_pago ? "#C6E8D4" : "#F5C6C6"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: gallery.extras_pago ? "#1A5C32" : C.danger }}>
                  {gallery.extras_pago ? "Extras confirmados como pagos" : `Extras pendentes: ${fmt(gallery.valor_extras!)}`}
                </span>
                <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
                  {gallery.extras_pago ? "Clique para desmarcar" : "Confirme o recebimento do pagamento"}
                </div>
              </div>
              <button
                onClick={() => onTogglePaid(gallery)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", borderRadius: 8, background: gallery.extras_pago ? "#1A5C32" : C.danger, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                {gallery.extras_pago ? <CheckCircle style={{ width: 14, height: 14 }} /> : <AlertCircle style={{ width: 14, height: 14 }} />}
                {gallery.extras_pago ? "Pago" : "Marcar como pago"}
              </button>
            </div>
          )}

          {/* Selection summary */}
          {gallery.status === "selecao_concluida" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: C.text }}>
                <strong>{selectedCount}</strong> fotos selecionadas pelo cliente
              </div>
              <button onClick={exportSelection} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.navyBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
                <Download style={{ width: 13, height: 13 }} /> Exportar lista (.txt)
              </button>
            </div>
          )}

          {/* Upload section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Fotos ({photos.length})
              </span>
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.goldBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#7C5C20", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}
              >
                <Upload style={{ width: 12, height: 12 }} />
                {uploading ? `${uploadProgress?.done}/${uploadProgress?.total}` : "Fazer upload"}
              </button>
              <input
                ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
                onChange={e => e.target.files && handleUpload(e.target.files)}
              />
            </div>

            {photosLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                <div style={{ width: 20, height: 20, border: "2px solid #E8E4DC", borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : photos.length === 0 ? (
              <div
                onClick={() => inputRef.current?.click()}
                style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "32px 20px", textAlign: "center", cursor: "pointer" }}
              >
                <Upload style={{ width: 28, height: 28, color: C.border, margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: C.textSub, margin: 0 }}>Clique ou arraste fotos para fazer upload</p>
                <p style={{ fontSize: 11, color: C.divider, margin: "4px 0 0" }}>Comprimidas automaticamente · Marca d'água aplicada</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", background: C.itemBg, border: photo.selecionada ? `2px solid ${C.gold}` : "2px solid transparent" }}>
                    {photoUrls[photo.id] ? (
                      <img src={photoUrls[photo.id]} alt={photo.nome_arquivo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: C.divider }} />
                    )}
                    {photo.selecionada && (
                      <div style={{ position: "absolute", bottom: 4, right: 4, width: 18, height: 18, background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle style={{ width: 11, height: 11, color: "#fff" }} />
                      </div>
                    )}
                    <button
                      onClick={() => deletePhoto(photo)}
                      style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <XCircle style={{ width: 12, height: 12, color: "#fff" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
