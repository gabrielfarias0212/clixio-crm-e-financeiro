import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, Trash2, AlertTriangle, CheckCircle, Clock, ChevronRight, Plus, X, Search } from "lucide-react";

interface Client { id: string; name: string; }

const C = {
  navy: "#1E3A5F", navyBg: "#E8EEF6",
  gold: "#C9A96E", goldBg: "#F5F0E8",
  text: "#1a1a1a", textSub: "#9A9590",
  divider: "#F0EDE8", itemBg: "#FAFAF8", border: "#E8E4DE",
  success: "#52C97A", successBg: "#E6F9EE",
  danger: "#E05252", dangerBg: "#FEE8E8",
  warning: "#D97706", warningBg: "#FEF3C7",
};

interface Gallery {
  id: string; client_id: string; titulo: string | null; tipo: string;
  status: string; created_at: string; finalized_at: string | null;
  limite_incluso: number; valor_extras: number | null; extras_pago: boolean | null;
  client_name?: string;
  cover_thumb_url?: string | null;
}

type Column = "aguardando_selecao" | "selecao_concluida" | "finalizado";

const COLUMNS: { key: Column; label: string; color: string; bg: string; hint: string }[] = [
  { key: "aguardando_selecao", label: "Em andamento", color: "#7C5C20", bg: "#F5F0E8", hint: "Aguardando seleção do cliente" },
  { key: "selecao_concluida",  label: "Em revisão",   color: "#1E3A5F", bg: "#E8EEF6", hint: "Cliente já selecionou as fotos" },
  { key: "finalizado",         label: "Finalizado",   color: "#1A5C32", bg: "#E6F9EE", hint: "Galeria entregue · excluir para liberar espaço" },
];

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export default function ProofingDashboard() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { load(); loadClients(); }, []);

  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("wedding_clients")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");
    setClients((data ?? []) as Client[]);
  }

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("proofing_galleries")
      .select("id, client_id, titulo, tipo, status, created_at, finalized_at, limite_incluso, valor_extras, extras_pago, cover_photo_path")
      .eq("user_id", user.id)
      .neq("status", "aguardando_upload")
      .order("created_at", { ascending: false });

    if (error) { toast.error("Erro ao carregar galerias"); setLoading(false); return; }

    // Fetch client names
    const clientIds = [...new Set((data ?? []).map(g => g.client_id).filter(Boolean))];
    const { data: clients } = await supabase
      .from("wedding_clients")
      .select("id, name")
      .in("id", clientIds);

    const clientMap: Record<string, string> = {};
    (clients ?? []).forEach(c => { clientMap[c.id] = c.name; });

    // Sign cover thumbnails in one batch
    const coverPaths = (data ?? [])
      .map(g => (g as any).cover_photo_path ? (g as any).cover_photo_path.replace(/\.webp$/, '_thumb.webp') : null)
      .filter(Boolean) as string[];
    let coverUrlMap: Record<string, string> = {};
    if (coverPaths.length > 0) {
      const { data: signed } = await supabase.storage.from("proofing-photos").createSignedUrls(coverPaths, 7200);
      (signed || []).forEach((e: any) => { if (e.signedUrl) coverUrlMap[e.path] = e.signedUrl; });
    }

    setGalleries((data ?? []).map(g => {
      const thumbPath = (g as any).cover_photo_path ? (g as any).cover_photo_path.replace(/\.webp$/, '_thumb.webp') : null;
      return { ...g, client_name: clientMap[g.client_id] ?? "—", cover_thumb_url: thumbPath ? (coverUrlMap[thumbPath] ?? null) : null };
    }));
    setLoading(false);
  }

  async function moveGallery(galleryId: string, toStatus: Column) {
    const finalizedAt = toStatus === "finalizado" ? new Date().toISOString() : null;
    const { error } = await supabase.rpc("update_gallery_status", {
      p_gallery_id:   galleryId,
      p_status:       toStatus,
      p_finalized_at: finalizedAt,
    });
    if (error) { toast.error("Erro ao mover galeria: " + error.message); return; }
    setGalleries(prev => prev.map(g => g.id === galleryId
      ? { ...g, status: toStatus, ...(toStatus === "finalizado" ? { finalized_at: finalizedAt } : {}) }
      : g));
    toast.success("Galeria movida!");
  }

  async function deleteGallery(gallery: Gallery) {
    if (!confirm(`Excluir galeria "${gallery.titulo || gallery.tipo}" e todas as fotos?`)) return;
    // Remove photos from storage
    const { data: photos } = await supabase.from("proofing_photos").select("storage_path").eq("gallery_id", gallery.id);
    const paths = (photos ?? []).filter(p => p.storage_path).map(p => p.storage_path!);
    if (paths.length) await supabase.storage.from("proofing-photos").remove(paths);
    await supabase.from("proofing_photos").delete().eq("gallery_id", gallery.id);
    await supabase.from("proofing_galleries").delete().eq("id", gallery.id);
    setGalleries(prev => prev.filter(g => g.id !== gallery.id));
    toast.success("Galeria excluída.");
  }

  const byCol = (key: Column) => {
    const q = search.trim().toLowerCase();
    return galleries.filter(g => {
      if (g.status !== key) return false;
      if (!q) return true;
      return (
        (g.client_name ?? "").toLowerCase().includes(q) ||
        (g.titulo ?? "").toLowerCase().includes(q)
      );
    });
  };

  const needsCleanup = (g: Gallery) =>
    g.status === "finalizado" && g.finalized_at &&
    Date.now() - new Date(g.finalized_at).getTime() >= FIVE_DAYS_MS;

  const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
      <div style={{ width: 24, height: 24, border: `2px solid #E8E4DC`, borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <Layout>
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>📸 Galerias de Seleção</h1>
          <p style={{ fontSize: 13, color: C.textSub, margin: "4px 0 0" }}>
            {galleries.length} galeria{galleries.length !== 1 ? "s" : ""} ativas · Clique em uma galeria para gerenciar
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.navy, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus style={{ width: 15, height: 15 }} /> Nova Galeria
        </button>
      </div>

      {showCreate && (
        <CreateGalleryModal
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreated={(g, clientName) => {
            setGalleries(prev => [{ ...g, client_name: clientName ?? "—" }, ...prev]);
            setShowCreate(false);
            toast.success("Galeria criada!");
          }}
        />
      )}

      {/* Search */}
      <div style={{ marginBottom: 16, position: "relative" }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: C.textSub, pointerEvents: "none" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente ou nome da galeria..."
          style={{ width: "100%", padding: "10px 14px 10px 36px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff", color: C.text, boxSizing: "border-box" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textSub, display: "flex", padding: 2 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
        {COLUMNS.map(col => {
          const cards = byCol(col.key);
          return (
            <div key={col.key} style={{ background: "#F8F7F5", borderRadius: 14, overflow: "hidden" }}>
              {/* Column header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.divider}` }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 99, background: col.bg, color: col.color }}>
                  {col.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textSub }}>{cards.length}</span>
              </div>

              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
                {cards.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "#C5C0BB" }}>
                    Nenhuma galeria
                  </div>
                )}
                {cards.map(g => (
                  <GalleryCard
                    key={g.id}
                    gallery={g}
                    column={col.key}
                    needsCleanup={!!needsCleanup(g)}
                    daysAgo={g.finalized_at ? daysAgo(g.finalized_at) : null}
                    onNavigate={() => navigate(`/galerias/${g.id}`)}
                    onMove={moveGallery}
                    onReactivate={(id) => moveGallery(id, "aguardando_selecao")}
                    onDelete={deleteGallery}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </Layout>
  );
}

function GalleryCard({ gallery, column, needsCleanup, daysAgo, onNavigate, onMove, onReactivate, onDelete }: {
  gallery: Gallery; column: Column; needsCleanup: boolean; daysAgo: number | null;
  onNavigate: () => void;
  onMove: (id: string, to: Column) => void;
  onReactivate: (id: string) => void;
  onDelete: (g: Gallery) => void;
}) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const label = gallery.titulo || (gallery.tipo === "album" ? "Álbum" : "Ensaio");
  const hasExtras = (gallery.valor_extras ?? 0) > 0;
  const extrasPending = hasExtras && !gallery.extras_pago;

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: needsCleanup ? `1.5px solid ${C.warning}` : `1px solid ${C.border}`,
      overflow: "hidden", cursor: "pointer",
      boxShadow: needsCleanup ? `0 0 0 3px ${C.warningBg}` : "none",
    }}>
      {/* Cleanup warning banner */}
      {needsCleanup && (
        <div style={{ background: C.warningBg, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle style={{ width: 12, height: 12, color: C.warning, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.warning }}>
            Finalizado há {daysAgo}d · Exclua para liberar espaço
          </span>
        </div>
      )}

      <div style={{ padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }} onClick={onNavigate}>
        {/* Cover thumbnail */}
        <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: C.itemBg, border: `1px solid ${C.border}` }}>
          {gallery.cover_thumb_url
            ? <img src={gallery.cover_thumb_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{gallery.client_name}</div>
        <div style={{ fontSize: 11, color: C.textSub, marginBottom: 8 }}>
          {label} · {gallery.tipo === "album" ? "Álbum" : "Ensaio"}
          {gallery.limite_incluso > 0 && ` · ${gallery.limite_incluso} fotos`}
        </div>

        {/* Extra payment status */}
        {hasExtras && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99,
            background: extrasPending ? C.dangerBg : C.successBg,
            fontSize: 10, fontWeight: 700, color: extrasPending ? C.danger : "#1A5C32", marginBottom: 8 }}>
            {extrasPending ? <AlertTriangle style={{ width: 9, height: 9 }} /> : <CheckCircle style={{ width: 9, height: 9 }} />}
            {extrasPending ? `${fmt(gallery.valor_extras!)} pendente` : "Extras pagos"}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textSub }}>
          <Clock style={{ width: 10, height: 10 }} />
          {new Date(gallery.created_at).toLocaleDateString("pt-BR")}
          <ChevronRight style={{ width: 10, height: 10, marginLeft: "auto", color: "#C5C0BB" }} />
        </div>
        </div>{/* end flex:1 */}
      </div>

      {/* Action bar */}
      <div style={{ borderTop: `1px solid ${C.divider}`, padding: "8px 14px", display: "flex", gap: 6, alignItems: "center" }} onClick={e => e.stopPropagation()}>
        <a href={`/galeria/${gallery.id}`} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textSub, textDecoration: "none" }}>
          <ExternalLink style={{ width: 11, height: 11 }} /> Ver galeria
        </a>

        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {column === "selecao_concluida" && (
            <>
              <button onClick={() => onMove(gallery.id, "finalizado")}
                style={{ padding: "4px 10px", background: C.successBg, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#1A5C32", cursor: "pointer" }}>
                ✓ Finalizar
              </button>
              <button onClick={() => onReactivate(gallery.id)}
                style={{ padding: "4px 10px", background: C.goldBg, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#7C5C20", cursor: "pointer" }}>
                ↺ Reativar
              </button>
            </>
          )}
          {column === "finalizado" && (
            <button onClick={() => onReactivate(gallery.id)}
              style={{ padding: "4px 10px", background: C.goldBg, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#7C5C20", cursor: "pointer" }}>
              ↺ Reativar
            </button>
          )}
          {column === "finalizado" && (
            <button onClick={() => onDelete(gallery)}
              style={{ padding: "4px 10px", background: C.dangerBg, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, color: C.danger, cursor: "pointer" }}>
              <Trash2 style={{ width: 11, height: 11 }} /> Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CreateGalleryModal ────────────────────────────────────────────────────────
function CreateGalleryModal({ clients, onClose, onCreated }: {
  clients: Client[];
  onClose: () => void;
  onCreated: (gallery: Gallery, clientName: string | null) => void;
}) {
  const [form, setForm] = useState({
    client_id: "", titulo: "", tipo: "ensaio",
    limite_incluso: 0, permite_extras: true, preco_foto_extra: "",
    email_acesso: "", senha_acesso: "", deadline: "", watermark_enabled: true,
    watermark_text: "PROIBIDA A REPRODUÇÃO EM QUALQUER REDE SOCIAL", permite_download: false,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setError("");
    if (!form.email_acesso.trim()) { setError("Informe o email de acesso."); return; }
    if (!form.senha_acesso.trim()) { setError("Informe a senha de acesso."); return; }
    setCreating(true);
    const { data, error: err } = await supabase.rpc("create_proofing_gallery_v2", {
      p_client_id:      form.client_id || null,
      p_titulo:         form.titulo.trim() || null,
      p_tipo:           form.tipo,
      p_limite:         Number(form.limite_incluso) || 0,
      p_permite_extras: form.permite_extras,
      p_preco_extra:    form.permite_extras && form.preco_foto_extra ? Number(form.preco_foto_extra) : null,
      p_email:          form.email_acesso.toLowerCase().trim(),
      p_senha:          form.senha_acesso.trim(),
      p_deadline:       form.deadline || null,
      p_watermark:         form.watermark_enabled,
      p_watermark_text:    form.watermark_text,
      p_permite_download:  form.permite_download,
    });
    setCreating(false);
    if (err) { setError(`Erro: ${err.message}`); return; }
    const clientName = clients.find(c => c.id === form.client_id)?.name ?? null;
    onCreated(data as unknown as Gallery, clientName);
  }

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #E8E4DE", borderRadius: 8, fontSize: 13, color: "#1a1a1a", background: "#fff", boxSizing: "border-box" };
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#9A9590", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
         onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
           onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>Nova Galeria de Seleção</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9A9590" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Client selector */}
          <div>
            <label style={label}>Cliente (opcional)</label>
            <select value={form.client_id} onChange={e => set("client_id", e.target.value)} style={inp}>
              <option value="">— Sem cliente vinculado —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Titulo + tipo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={label}>Título da galeria</label>
              <input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ex: Ensaio Maria" style={inp} />
            </div>
            <div>
              <label style={label}>Tipo</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)} style={inp}>
                <option value="ensaio">Ensaio</option>
                <option value="album">Álbum</option>
                <option value="corporativo">Corporativo</option>
                <option value="familia">Família</option>
                <option value="individual">Individual</option>
              </select>
            </div>
          </div>

          {/* Email + senha */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={label}>Email do cliente *</label>
              <input type="email" value={form.email_acesso} onChange={e => set("email_acesso", e.target.value)} placeholder="cliente@email.com" style={inp} />
            </div>
            <div>
              <label style={label}>Senha de acesso *</label>
              <input value={form.senha_acesso} onChange={e => set("senha_acesso", e.target.value)} placeholder="Ex: Familia2024" style={inp} />
            </div>
          </div>

          {/* Limite + deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={label}>Fotos inclusas</label>
              <input type="number" min={0} value={form.limite_incluso} onChange={e => set("limite_incluso", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={label}>Prazo</label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} style={inp} />
            </div>
          </div>

          {/* Extras */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={form.permite_extras} onChange={e => set("permite_extras", e.target.checked)} id="extras_dash" />
            <label htmlFor="extras_dash" style={{ fontSize: 13, cursor: "pointer" }}>Permitir extras</label>
            {form.permite_extras && (
              <input type="number" min={0} step={0.01} value={form.preco_foto_extra}
                onChange={e => set("preco_foto_extra", e.target.value)}
                placeholder="R$/foto extra" style={{ ...inp, width: 130 }} />
            )}
          </div>

          {/* Watermark */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={form.watermark_enabled} onChange={e => set("watermark_enabled", e.target.checked)} id="wm_dash" />
              <label htmlFor="wm_dash" style={{ fontSize: 13, cursor: "pointer" }}>Aplicar marca d'água nas fotos</label>
            </div>
            {form.watermark_enabled && (
              <input
                value={form.watermark_text}
                onChange={e => set("watermark_text", e.target.value)}
                placeholder="Texto da marca d'água"
                style={{ ...inp, fontSize: 12 }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={form.permite_download} onChange={e => set("permite_download", e.target.checked)} id="dl_dash" />
              <label htmlFor="dl_dash" style={{ fontSize: 13, cursor: "pointer" }}>Permitir download das fotos</label>
            </div>
          </div>

          {error && <div style={{ color: "#E05252", fontSize: 12, padding: "8px 12px", background: "#FEE8E8", borderRadius: 8 }}>{error}</div>}

          <button onClick={submit} disabled={creating}
            style={{ padding: "11px", background: "#1E3A5F", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1, marginTop: 4 }}>
            {creating ? "Criando..." : "Criar Galeria"}
          </button>
        </div>
      </div>
    </div>
  );
}
