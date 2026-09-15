import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, Trash2, AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react";

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
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("proofing_galleries")
      .select("id, client_id, titulo, tipo, status, created_at, finalized_at, limite_incluso, valor_extras, extras_pago")
      .eq("user_id", user.id)
      .neq("status", "aguardando_upload")
      .order("created_at", { ascending: false });

    if (error) { toast.error("Erro ao carregar galerias"); setLoading(false); return; }

    // Fetch client names
    const clientIds = [...new Set((data ?? []).map(g => g.client_id))];
    const { data: clients } = await supabase
      .from("wedding_clients")
      .select("id, name")
      .in("id", clientIds);

    const clientMap: Record<string, string> = {};
    (clients ?? []).forEach(c => { clientMap[c.id] = c.name; });

    setGalleries((data ?? []).map(g => ({ ...g, client_name: clientMap[g.client_id] ?? "—" })));
    setLoading(false);
  }

  async function moveGallery(galleryId: string, toStatus: Column) {
    const patch: Record<string, unknown> = { status: toStatus };
    if (toStatus === "finalizado") patch.finalized_at = new Date().toISOString();
    const { error } = await supabase.from("proofing_galleries").update(patch).eq("id", galleryId);
    if (error) { toast.error("Erro ao mover galeria"); return; }
    setGalleries(prev => prev.map(g => g.id === galleryId ? { ...g, ...patch } as Gallery : g));
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

  const byCol = (key: Column) => galleries.filter(g => g.status === key);

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
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>📸 Galerias de Seleção</h1>
        <p style={{ fontSize: 13, color: C.textSub, margin: "4px 0 0" }}>
          {galleries.length} galeria{galleries.length !== 1 ? "s" : ""} ativas · Clique em um cliente para gerenciar
        </p>
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
                    onNavigate={() => navigate(`/clients/${g.client_id}`, { state: { openTab: "galeria" } })}
                    onMove={moveGallery}
                    onDelete={deleteGallery}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GalleryCard({ gallery, column, needsCleanup, daysAgo, onNavigate, onMove, onDelete }: {
  gallery: Gallery; column: Column; needsCleanup: boolean; daysAgo: number | null;
  onNavigate: () => void;
  onMove: (id: string, to: Column) => void;
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

      <div style={{ padding: "12px 14px" }} onClick={onNavigate}>
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
      </div>

      {/* Action bar */}
      <div style={{ borderTop: `1px solid ${C.divider}`, padding: "8px 14px", display: "flex", gap: 6, alignItems: "center" }} onClick={e => e.stopPropagation()}>
        <a href={`/galeria/${gallery.id}`} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textSub, textDecoration: "none" }}>
          <ExternalLink style={{ width: 11, height: 11 }} /> Ver galeria
        </a>

        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {column === "selecao_concluida" && (
            <button onClick={() => onMove(gallery.id, "finalizado")}
              style={{ padding: "4px 10px", background: C.successBg, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#1A5C32", cursor: "pointer" }}>
              ✓ Finalizar
            </button>
          )}
          {column === "finalizado" && (
            <button onClick={() => onMove(gallery.id, "selecao_concluida")}
              style={{ padding: "4px 10px", background: C.navyBg, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, color: C.navy, cursor: "pointer" }}>
              ← Devolver
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
