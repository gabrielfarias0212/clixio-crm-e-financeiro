import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressWithWatermark, ProofingGallery, ProofingPhoto } from "@/utils/proofing";
import {
  Upload, Images, Download, CheckCircle, XCircle, Plus, Trash2,
  ExternalLink, Copy, ChevronDown, ChevronUp, AlertCircle, ToggleLeft, ToggleRight
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
  aguardando_upload:  { label: "Aguardando Upload",  color: "#9B9890", bg: "#F5F3F0" },
  aguardando_selecao: { label: "Aguardando Seleção", color: "#7C5C20", bg: "#F5F0E8" },
  selecao_concluida:  { label: "Seleção Concluída",  color: "#1A5C32", bg: "#E6F9EE" },
};

interface ProofingTabProps { clientId: string; clientName: string; }

export function ProofingTab({ clientId, clientName }: ProofingTabProps) {
  const [galleries, setGalleries] = useState<ProofingGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedGallery, setExpandedGallery] = useState<string | null>(null);
  const [studioName, setStudioName] = useState("Fotografia");
  const [pixKey, setPixKey] = useState("");
  const [savingPix, setSavingPix] = useState(false);

  const [form, setForm] = useState({
    titulo: "", tipo: "ensaio", limite_incluso: 0,
    permite_extras: true, preco_foto_extra: "",
    email_acesso: "", senha_acesso: "",
    deadline: "", watermark_enabled: true,
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { loadGalleries(); loadProfile(); }, [clientId]);

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
    else if (error) console.error("loadGalleries error:", error);
    setLoading(false);
  }

  async function createGallery() {
    setFormError("");
    if (!form.email_acesso.trim()) { setFormError("Informe o email de acesso do cliente."); return; }
    if (!form.senha_acesso.trim()) { setFormError("Informe a senha de acesso."); return; }
    setCreating(true);
    const { data, error } = await supabase.rpc("create_proofing_gallery", {
      p_client_id:      clientId,
      p_titulo:         form.titulo.trim() || null,
      p_tipo:           form.tipo,
      p_limite:         Number(form.limite_incluso) || 0,
      p_permite_extras: form.permite_extras,
      p_preco_extra:    form.permite_extras && form.preco_foto_extra ? Number(form.preco_foto_extra) : null,
      p_email:          form.email_acesso.toLowerCase().trim(),
      p_senha:          form.senha_acesso.trim(),
      p_deadline:       form.deadline || null,
      p_watermark:      form.watermark_enabled,
    });
    setCreating(false);
    if (error) {
      console.error("createGallery error:", error);
      setFormError(`Erro ao criar: ${error.message}`);
      return;
    }
    toast.success("Galeria criada!");
    const newGallery = data as ProofingGallery;
    setGalleries(prev => [newGallery, ...prev]);
    setShowCreate(false);
    setExpandedGallery(newGallery.id); // auto-expand so upload appears immediately
    setForm({ titulo: "", tipo: "ensaio", limite_incluso: 0, permite_extras: true, preco_foto_extra: "", email_acesso: "", senha_acesso: "", deadline: "", watermark_enabled: true });
  }

  async function deleteGallery(galleryId: string) {
    if (!confirm("Excluir esta galeria e todas as fotos?")) return;
    const { data: photos } = await supabase.from("proofing_photos").select("storage_path").eq("gallery_id", galleryId);
    const paths = (photos ?? []).filter(p => p.storage_path).map(p => p.storage_path!);
    if (paths.length) await supabase.storage.from("proofing-photos").remove(paths);
    await supabase.from("proofing_galleries").delete().eq("id", galleryId);
    setGalleries(prev => prev.filter(g => g.id !== galleryId));
    if (expandedGallery === galleryId) setExpandedGallery(null);
    toast.success("Galeria excluída.");
  }

  async function toggleExtrasPago(gallery: ProofingGallery) {
    const newVal = !gallery.extras_pago;
    await supabase.from("proofing_galleries").update({ extras_pago: newVal }).eq("id", gallery.id);
    setGalleries(prev => prev.map(g => g.id === gallery.id ? { ...g, extras_pago: newVal } : g));
    toast.success(newVal ? "Extras marcados como pagos." : "Pagamento desmarcado.");
  }

  async function savePixKey() {
    setSavingPix(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("photographer_profiles").update({ pix_key: pixKey.trim() }).eq("user_id", user.id);
      if (!error) toast.success("Chave Pix salva."); else toast.error("Erro ao salvar.");
    }
    setSavingPix(false);
  }

  const galleryLabel = (g: ProofingGallery) =>
    (g as any).titulo || (g.tipo === "album" ? "Álbum" : "Ensaio");

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 28, height: 28, border: "2px solid #E8E4DC", borderTopColor: C.gold, borderRadius: "50%", animation: "_spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Pix Key ── */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub, margin: "0 0 10px" }}>
          Chave Pix (pagamento de extras)
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={pixKey} onChange={e => setPixKey(e.target.value)}
            placeholder="Ex: email, CPF, CNPJ ou chave aleatória"
            style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: "none" }} />
          <button onClick={savePixKey} disabled={savingPix}
            style={{ padding: "8px 16px", background: C.navyBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.navy, cursor: "pointer", opacity: savingPix ? 0.7 : 1 }}>
            {savingPix ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Galerias de Seleção</h3>
        <button onClick={() => { setShowCreate(v => !v); setFormError(""); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.navy, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
          <Plus style={{ width: 13, height: 13 }} /> Nova Galeria
        </button>
      </div>

      {/* ── Create form ── */}
      {showCreate && (
        <div style={{ background: "#fff", border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: "20px 24px" }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: C.text }}>Nova Galeria de Seleção</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Título — full width */}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={lbl}>TÍTULO DA GALERIA (opcional)</label>
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder={`Ex: Ensaio de ${clientName} — Setembro 2026`}
                style={inp} />
            </div>

            <div>
              <label style={lbl}>TIPO</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                <option value="ensaio">Ensaio</option>
                <option value="album">Álbum / Pós-edição</option>
              </select>
            </div>

            <div>
              <label style={lbl}>FOTOS INCLUSAS NO PACOTE</label>
              <input type="number" min={0} value={form.limite_incluso}
                onChange={e => setForm(f => ({ ...f, limite_incluso: Number(e.target.value) }))} style={inp} />
            </div>

            <div>
              <label style={lbl}>EMAIL DE ACESSO DO CLIENTE</label>
              <input type="email" value={form.email_acesso} placeholder="email@exemplo.com"
                onChange={e => setForm(f => ({ ...f, email_acesso: e.target.value }))} style={inp} />
            </div>

            <div>
              <label style={lbl}>SENHA DE ACESSO</label>
              <input value={form.senha_acesso} placeholder="Ex: joao2026"
                onChange={e => setForm(f => ({ ...f, senha_acesso: e.target.value }))} style={inp} />
            </div>

            <div>
              <label style={lbl}>PRAZO (opcional)</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={inp} />
            </div>

            <div>
              <label style={lbl}>EXTRAS (fotos além do limite)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <button onClick={() => setForm(f => ({ ...f, permite_extras: !f.permite_extras }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {form.permite_extras
                    ? <ToggleRight style={{ width: 32, height: 32, color: C.navy }} />
                    : <ToggleLeft style={{ width: 32, height: 32, color: C.textSub }} />}
                </button>
                {form.permite_extras && (
                  <input type="number" min={0} step="0.01" value={form.preco_foto_extra}
                    placeholder="R$ por foto extra"
                    onChange={e => setForm(f => ({ ...f, preco_foto_extra: e.target.value }))}
                    style={{ width: 130, padding: "7px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                )}
              </div>
            </div>

            <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setForm(f => ({ ...f, watermark_enabled: !f.watermark_enabled }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {form.watermark_enabled
                  ? <ToggleRight style={{ width: 28, height: 28, color: C.navy }} />
                  : <ToggleLeft style={{ width: 28, height: 28, color: C.textSub }} />}
              </button>
              <span style={{ fontSize: 13, color: C.text }}>Aplicar marca d'água nas fotos</span>
            </div>
          </div>

          {formError && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.danger, marginTop: 12 }}>
              <AlertCircle style={{ width: 13, height: 13 }} /> {formError}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={createGallery} disabled={creating}
              style={{ padding: "10px 20px", background: C.navy, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1 }}>
              {creating ? "Criando..." : "Criar galeria"}
            </button>
            <button onClick={() => { setShowCreate(false); setFormError(""); }}
              style={{ padding: "10px 16px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.textSub, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Gallery list ── */}
      {galleries.length === 0 ? (
        <div style={{ textAlign: "center" as const, padding: "48px 20px", background: C.itemBg, borderRadius: 14, border: `1px dashed ${C.border}` }}>
          <Images style={{ width: 40, height: 40, color: C.divider, margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: C.textSub, margin: 0 }}>Nenhuma galeria criada ainda.</p>
          <p style={{ fontSize: 12, color: C.divider, marginTop: 4 }}>Clique em "Nova Galeria" para começar.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {galleries.map(g => (
            <GalleryCard
              key={g.id}
              gallery={g}
              label={galleryLabel(g)}
              expanded={expandedGallery === g.id}
              studioName={studioName}
              onToggleExpand={() => setExpandedGallery(v => v === g.id ? null : g.id)}
              onDelete={deleteGallery}
              onCopyLink={() => { navigator.clipboard.writeText(`${window.location.origin}/galeria/${g.id}`); toast.success("Link copiado!"); }}
              onTogglePaid={toggleExtrasPago}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#9A9590", display: "block", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" };
const inp: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1.5px solid #E8E4DE", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#FAFAF8" };

// ── GalleryCard ───────────────────────────────────────────────────────────────
function GalleryCard({ gallery, label, expanded, studioName, onToggleExpand, onDelete, onCopyLink, onTogglePaid }: {
  gallery: ProofingGallery; label: string; expanded: boolean; studioName: string;
  onToggleExpand: () => void; onDelete: (id: string) => void;
  onCopyLink: () => void; onTogglePaid: (g: ProofingGallery) => void;
}) {
  const [photos, setPhotos] = useState<ProofingPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState<"lightroom" | "finder" | "win10" | "win11">("lightroom");
  const inputRef = useRef<HTMLInputElement>(null);

  const status = STATUS_MAP[gallery.status] || STATUS_MAP["aguardando_selecao"];
  const selectedCount = photos.filter(p => p.selecionada).length;

  useEffect(() => { if (expanded) loadPhotos(); }, [expanded]);

  async function loadPhotos() {
    setPhotosLoading(true);
    const { data } = await supabase.from("proofing_photos").select("*").eq("gallery_id", gallery.id).order("created_at", { ascending: true });
    const list = (data ?? []) as ProofingPhoto[];
    setPhotos(list);
    const urls: Record<string, string> = {};
    await Promise.all(list.filter(p => p.storage_path).map(async p => {
      const { data: u } = await supabase.storage.from("proofing-photos").createSignedUrl(p.storage_path!, 3600);
      if (u?.signedUrl) urls[p.id] = u.signedUrl;
    }));
    setPhotoUrls(urls);
    setPhotosLoading(false);
  }

  async function handleUpload(files: FileList) {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: fileArr.length });
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      try {
        const blob = await compressWithWatermark(file, gallery.watermark_enabled ? studioName : "");
        const path = `${gallery.id}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from("proofing-photos").upload(path, blob, { contentType: "image/webp", upsert: false });
        if (upErr) { toast.error(`Erro: ${file.name}`); }
        else {
          await supabase.from("proofing_photos").insert({ gallery_id: gallery.id, nome_arquivo: file.name, storage_path: path, selecionada: false });
        }
      } catch { toast.error(`Falha ao processar ${file.name}`); }
      setUploadProgress({ done: i + 1, total: fileArr.length });
    }
    setUploading(false);
    setUploadProgress(null);
    toast.success("Upload concluído!");
    loadPhotos();
  }

  async function deletePhoto(photo: ProofingPhoto) {
    if (photo.storage_path) await supabase.storage.from("proofing-photos").remove([photo.storage_path]);
    await supabase.from("proofing_photos").delete().eq("id", photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    toast.success("Foto removida.");
  }

  const baseName = (f: string) => f.replace(/\.[^.]+$/, "");

  function buildList(tab: typeof exportTab, names: string[]): string {
    switch (tab) {
      case "lightroom": return names.join(", ");
      case "finder":    return names.map(n => n + ".").join(" OR ");
      case "win10":     return names.map(n => `"${n}."`).join(" OR ");
      case "win11":     return names.map(n => `"${n}."`).join(" OR ");
    }
  }

  function openExport() {
    const sel = photos.filter(p => p.selecionada);
    if (!sel.length) { toast.error("Nenhuma foto selecionada."); return; }
    setShowExport(true);
  }

  function copyList(tab: typeof exportTab) {
    const sel = photos.filter(p => p.selecionada);
    const names = sel.map(p => baseName(p.nome_arquivo));
    navigator.clipboard.writeText(buildList(tab, names));
    toast.success("Lista copiada!");
  }

  const TABS: { key: typeof exportTab; label: string; hint: string; steps: string[] }[] = [
    { key: "lightroom", label: "Lightroom", hint: "Lista para Lightroom",
      steps: ["No Lightroom, vá para o modo de Biblioteca", "Em 'Filtro da biblioteca', filtre por 'Texto'", "Selecione 'Nome do arquivo' e 'Contém'", "Copie e cole a lista abaixo no campo de busca"] },
    { key: "finder", label: "Finder (Mac)", hint: "Lista para Finder (Mac)",
      steps: ["Abra o Finder do Mac", "Pressione ⌘+F para busca avançada", "Copie e cole a lista abaixo no campo de busca"] },
    { key: "win10", label: "Windows 10", hint: "Lista para Windows 10",
      steps: ["Abra o Windows Explorer", "Copie e cole a lista abaixo no campo de busca"] },
    { key: "win11", label: "Windows 11", hint: "Lista para Windows 11",
      steps: ["Abra o Windows Explorer", "Copie e cole a lista abaixo no campo de busca"] },
  ];

  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header row */}
      <div onClick={onToggleExpand} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: expanded ? C.itemBg : "#fff", userSelect: "none" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: status.bg, color: status.color }}>{status.label}</span>
            {gallery.status === "selecao_concluida" && (gallery.valor_extras ?? 0) > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: gallery.extras_pago ? C.successBg : C.dangerBg, color: gallery.extras_pago ? "#1A5C32" : C.danger }}>
                {gallery.extras_pago ? "✓ Extras pagos" : `${fmt(gallery.valor_extras!)} pendente`}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>
            {gallery.tipo === "album" ? "Álbum" : "Ensaio"}
            {gallery.limite_incluso > 0 && ` · ${gallery.limite_incluso} fotos inclusas`}
            {gallery.deadline && ` · Prazo: ${gallery.deadline.split("-").reverse().join("/")}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={onCopyLink} title="Copiar link" style={iconBtn}><Copy style={iconSz} /></button>
          <a href={`/galeria/${gallery.id}`} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ExternalLink style={iconSz} />
          </a>
          <button onClick={() => onDelete(gallery.id)} title="Excluir" style={{ ...iconBtn, border: "1px solid #FECDCD", background: C.dangerBg }}>
            <Trash2 style={{ ...iconSz, color: C.danger }} />
          </button>
        </div>
        {expanded ? <ChevronUp style={{ width: 16, height: 16, color: C.textSub, flexShrink: 0 }} /> : <ChevronDown style={{ width: 16, height: 16, color: C.textSub, flexShrink: 0 }} />}
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.divider}`, padding: 20 }}>

          {/* Access info */}
          <div style={{ background: C.itemBg, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div><span style={{ fontSize: 11, color: C.textSub }}>Email</span><br /><b style={{ fontSize: 13 }}>{gallery.email_acesso}</b></div>
            <div><span style={{ fontSize: 11, color: C.textSub }}>Senha</span><br /><b style={{ fontSize: 13 }}>{gallery.senha_acesso}</b></div>
            {gallery.limite_incluso > 0 && <div><span style={{ fontSize: 11, color: C.textSub }}>Limite</span><br /><b style={{ fontSize: 13 }}>{gallery.limite_incluso} fotos</b></div>}
            {gallery.preco_foto_extra && <div><span style={{ fontSize: 11, color: C.textSub }}>Extra</span><br /><b style={{ fontSize: 13 }}>{fmt(gallery.preco_foto_extra)}/foto</b></div>}
          </div>

          {/* Payment toggle (when finalized + extras) */}
          {gallery.status === "selecao_concluida" && (gallery.valor_extras ?? 0) > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: gallery.extras_pago ? C.successBg : C.dangerBg, border: `1px solid ${gallery.extras_pago ? "#C6E8D4" : "#F5C6C6"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: gallery.extras_pago ? "#1A5C32" : C.danger }}>
                  {gallery.extras_pago ? "Extras confirmados como pagos" : `Extras pendentes: ${fmt(gallery.valor_extras!)}`}
                </div>
                <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{gallery.extras_pago ? "Clique para desmarcar" : "Confirme o recebimento"}</div>
              </div>
              <button onClick={() => onTogglePaid(gallery)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", borderRadius: 8, background: gallery.extras_pago ? "#1A5C32" : C.danger, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {gallery.extras_pago ? <CheckCircle style={{ width: 14, height: 14 }} /> : <AlertCircle style={{ width: 14, height: 14 }} />}
                {gallery.extras_pago ? "Pago" : "Marcar como pago"}
              </button>
            </div>
          )}

          {/* Selection export (when finalized) */}
          {gallery.status === "selecao_concluida" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "10px 14px", background: C.itemBg, borderRadius: 10, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.text }}><b>{selectedCount}</b> foto{selectedCount !== 1 ? "s" : ""} selecionada{selectedCount !== 1 ? "s" : ""} pelo cliente</span>
              <button onClick={openExport}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.navyBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
                <Download style={{ width: 13, height: 13 }} /> Exportar lista
              </button>
            </div>
          )}

          {/* Upload section */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                Fotos {photos.length > 0 && `(${photos.length})`}
              </span>
              <button onClick={() => inputRef.current?.click()} disabled={uploading}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.goldBg, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#7C5C20", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}>
                <Upload style={{ width: 12, height: 12 }} />
                {uploading ? `Enviando ${uploadProgress?.done}/${uploadProgress?.total}...` : "Fazer upload"}
              </button>
              <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
                onChange={e => e.target.files && handleUpload(e.target.files)} />
            </div>

            {photosLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 20, height: 20, border: "2px solid #E8E4DC", borderTopColor: C.gold, borderRadius: "50%", animation: "_spin 0.8s linear infinite" }} />
              </div>
            ) : photos.length === 0 ? (
              <div onClick={() => inputRef.current?.click()}
                style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "36px 20px", textAlign: "center" as const, cursor: "pointer" }}>
                <Upload style={{ width: 28, height: 28, color: C.border, margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: C.textSub, margin: 0 }}>Clique para fazer upload das fotos</p>
                <p style={{ fontSize: 11, color: "#C5C0BB", marginTop: 4 }}>Comprimidas automaticamente · {gallery.watermark_enabled ? "Marca d'água aplicada" : "Sem marca d'água"}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" as any, background: C.itemBg, border: photo.selecionada ? `2px solid ${C.gold}` : "2px solid transparent" }}>
                    {photoUrls[photo.id]
                      ? <img src={photoUrls[photo.id]} alt={photo.nome_arquivo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: C.divider }} />}
                    {photo.selecionada && (
                      <div style={{ position: "absolute", bottom: 3, right: 3, width: 16, height: 16, background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle style={{ width: 10, height: 10, color: "#fff" }} />
                      </div>
                    )}
                    <button onClick={() => deletePhoto(photo)}
                      style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <XCircle style={{ width: 11, height: 11, color: "#fff" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Export Modal ──────────────────────────────────────────── */}
      {showExport && (() => {
        const sel = photos.filter(p => p.selecionada);
        const names = sel.map(p => baseName(p.nome_arquivo));
        const activeTab = TABS.find(t => t.key === exportTab)!;
        const CHUNK = 17;
        const chunks: string[] = [];
        for (let i = 0; i < names.length; i += CHUNK) {
          chunks.push(buildList(exportTab, names.slice(i, i + CHUNK)));
        }
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
               onClick={() => setShowExport(false)}>
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
                 onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Exportar fotos</span>
                <button onClick={() => setShowExport(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textSub, lineHeight: 1, padding: 4 }}>×</button>
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
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>{activeTab.hint}</div>
                <ul style={{ margin: "0 0 16px", paddingLeft: 18 }}>
                  {activeTab.steps.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
                {chunks.map((chunk, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    {chunks.length > 1 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub }}>Parte {idx + 1}</span>
                        <span style={{ fontSize: 12, color: C.textSub }}>{names.slice(idx * CHUNK, (idx + 1) * CHUNK).length} fotos</span>
                      </div>
                    )}
                    <div style={{ background: C.itemBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, color: C.text, wordBreak: "break-all" as const, lineHeight: 1.7 }}>{chunk}</div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <button onClick={() => { navigator.clipboard.writeText(chunk); toast.success("Lista copiada!"); }}
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
        );
      })()}
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 30, height: 30, border: `1px solid #E8E4DE`, borderRadius: 6, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const iconSz: React.CSSProperties = { width: 13, height: 13, color: "#9A9590" };
