import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { galleryAuth, togglePhoto, finalizeSelection, generatePixEMV, ProofingPhoto, ProofingGallery } from "@/utils/proofing";
import { Check, Heart, X, Clock, AlertCircle, ChevronRight, Copy, CheckCircle } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const daysUntil = (d: string) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dt = new Date(d + "T00:00:00");
  return Math.round((dt.getTime() - today.getTime()) / 86400000);
};

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 28, color = "#C9A96E" }: { size?: number; color?: string }) {
  return (
    <>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: size, height: size, border: "2px solid #E8E4DC",
        borderTopColor: color, borderRadius: "50%",
        animation: "_spin 0.8s linear infinite",
      }} />
    </>
  );
}

type Mode = "login" | "loading" | "gallery" | "finalized" | "payment";

interface Session {
  gallery: ProofingGallery & { proofing_photos: ProofingPhoto[] };
  clientName: string; studioName: string; pixKey: string | null;
  email: string; password: string;
  selectedCount: number; valorExtras: number;
  photos: (ProofingPhoto & { url?: string; thumbnail_url?: string })[];
}

export default function ProofingGalleryPage() {
  const { galleryId } = useParams<{ galleryId: string }>();
  const [mode, setMode] = useState<Mode>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const pendingToggles = useRef(new Set<string>());

  // Try restore session from sessionStorage
  useEffect(() => {
    if (!galleryId) return;
    const saved = sessionStorage.getItem(`proofing_${galleryId}`);
    if (saved) {
      try {
        const { email: e, password: p } = JSON.parse(saved);
        setEmail(e); setPassword(p);
        handleLogin(e, p, true);
      } catch { sessionStorage.removeItem(`proofing_${galleryId}`); }
    }
  }, [galleryId]);

  // Fetch cover photo before login
  useEffect(() => {
    if (!galleryId) return;
    fetch("https://lwdfznskytyjqurxqebu.supabase.co/functions/v1/proofing-gallery-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_cover", gallery_id: galleryId }),
    })
      .then(r => r.json())
      .then(d => { if (d.cover_url) setCoverUrl(d.cover_url); })
      .catch(() => {});
  }, [galleryId]);

  const handleLogin = async (e?: string, p?: string, silent = false) => {
    const em = e ?? email; const pw = p ?? password;
    if (!em.trim() || !pw.trim()) { setLoginError("Preencha o email e a senha."); return; }
    if (!silent) setLoginLoading(true);
    setLoginError("");
    try {
      const data = await galleryAuth(galleryId!, em.trim(), pw);
      const g = data.gallery;
      const selCount = (g.proofing_photos || []).filter(p => p.selecionada).length;
      const sess: Session = {
        gallery: g, clientName: data.client_name, studioName: data.studio_name,
        pixKey: data.pix_key, email: em.trim(), password: pw,
        selectedCount: selCount, valorExtras: g.valor_extras ?? 0,
        photos: g.proofing_photos || [],
      };
      setSession(sess);
      sessionStorage.setItem(`proofing_${galleryId}`, JSON.stringify({ email: em.trim(), password: pw }));
      setMode(g.status === "selecao_concluida" ? "finalized" : "gallery");
    } catch (err: any) {
      setLoginError(err.message || "Email ou senha incorretos.");
      sessionStorage.removeItem(`proofing_${galleryId}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggle = useCallback(async (photo: ProofingPhoto) => {
    if (!session || pendingToggles.current.has(photo.id)) return;
    if (session.gallery.status === "selecao_concluida") return;
    pendingToggles.current.add(photo.id);

    const newSel = !photo.selecionada;

    // Optimistic update
    setSession(s => {
      if (!s) return s;
      const photos = s.photos.map(p => p.id === photo.id ? { ...p, selecionada: newSel } : p);
      const selectedCount = photos.filter(p => p.selecionada).length;
      const extras = Math.max(0, selectedCount - s.gallery.limite_incluso);
      const valorExtras = s.gallery.permite_extras ? extras * (s.gallery.preco_foto_extra ?? 0) : 0;
      return { ...s, photos, selectedCount, valorExtras };
    });

    try {
      const result = await togglePhoto(session.gallery.id, session.email, session.password, photo.id, newSel);
      setSession(s => s ? { ...s, selectedCount: result.selected_count, valorExtras: result.valor_extras ?? 0 } : s);
    } catch {
      // Revert on error
      setSession(s => {
        if (!s) return s;
        const photos = s.photos.map(p => p.id === photo.id ? { ...p, selecionada: !newSel } : p);
        return { ...s, photos };
      });
    } finally {
      pendingToggles.current.delete(photo.id);
    }
  }, [session]);

  const handleFinalize = async () => {
    if (!session) return;
    if (session.selectedCount === 0) return;
    setFinalizing(true);
    try {
      await finalizeSelection(session.gallery.id, session.email, session.password);
      setSession(s => s ? { ...s, gallery: { ...s.gallery, status: "selecao_concluida" } } : s);
      if (session.valorExtras > 0 && session.gallery.permite_extras) {
        setMode("payment");
      } else {
        setMode("finalized");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  const pixString = session?.pixKey && session?.valorExtras > 0
    ? generatePixEMV(session.pixKey, session.valorExtras, session.studioName)
    : null;

  const copyPix = () => {
    if (!pixString) return;
    navigator.clipboard.writeText(pixString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const whatsappMsg = session
    ? encodeURIComponent(
        `Olá! Acabei de concluir a seleção da minha galeria e precisaria pagar o valor adicional de ${fmt(session.valorExtras)} pelas fotos extras. Pode me ajudar?`
      )
    : "";

  // ── LOGIN ──
  if (mode === "login" || (mode === "loading" && !session)) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflow: "hidden" }}>
        {/* Cover photo background */}
        {coverUrl && (
          <>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(18px) brightness(0.55)", transform: "scale(1.08)", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1 }} />
          </>
        )}
        {!coverUrl && <div style={{ position: "absolute", inset: 0, background: "#FAFAF8", zIndex: 0 }} />}
        <div style={{ width: "100%", maxWidth: 400, background: coverUrl ? "rgba(255,255,255,0.92)" : "#fff", borderRadius: 20, padding: "40px 36px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", position: "relative", zIndex: 2, backdropFilter: coverUrl ? "blur(8px)" : "none" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, background: "#F5F0E8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Heart style={{ width: 24, height: 24, color: "#C9A96E" }} />
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1A1A18", margin: "0 0 6px" }}>Galeria de Seleção</h1>
            <p style={{ fontSize: 13, color: "#9B9890", margin: 0 }}>Entre com seus dados de acesso</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="email" placeholder="Seu email" value={email}
              onChange={e => { setEmail(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ padding: "12px 14px", border: "1.5px solid #E8E4DC", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAF8" }}
            />
            <input
              type="password" placeholder="Senha de acesso" value={password}
              onChange={e => { setPassword(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ padding: "12px 14px", border: "1.5px solid #E8E4DC", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAF8" }}
            />
            {loginError && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#E05252" }}>
                <AlertCircle style={{ width: 13, height: 13 }} /> {loginError}
              </div>
            )}
            <button
              onClick={() => handleLogin()}
              disabled={loginLoading}
              style={{ padding: "13px", background: "#C9A96E", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loginLoading ? "not-allowed" : "pointer", opacity: loginLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loginLoading ? <Spinner size={18} color="#fff" /> : "Acessar galeria"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const { gallery, photos, selectedCount, valorExtras, studioName } = session;
  const totalPhotos = photos.length;
  const limitIncluso = gallery.limite_incluso;
  const hasExtras = valorExtras > 0 && gallery.permite_extras;
  const deadline = gallery.deadline;
  const days = deadline ? daysUntil(deadline) : null;

  // ── FINALIZED ──
  if (mode === "finalized") {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, background: "#E6F9EE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle style={{ width: 36, height: 36, color: "#52C97A" }} />
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: "#1A1A18", marginBottom: 10 }}>Seleção concluída!</h1>
          <p style={{ fontSize: 14, color: "#9B9890", lineHeight: 1.6, marginBottom: 8 }}>
            Você selecionou <strong>{selectedCount} fotos</strong>. {studioName} foi notificado e em breve entrará em contato.
          </p>
        </div>
      </div>
    );
  }

  // ── PAYMENT ──
  if (mode === "payment") {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 20, padding: "36px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: "#1A1A18", marginBottom: 4 }}>Pagamento de extras</h1>
          <p style={{ fontSize: 13, color: "#9B9890", marginBottom: 24 }}>
            Você selecionou {selectedCount - limitIncluso} fotos além do pacote. Valor a pagar:
          </p>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#1A1A18", marginBottom: 28 }}>{fmt(valorExtras)}</div>

          {pixString ? (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9B9890", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Pix — Copia e Cola</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixString)}`}
                alt="QR Code Pix"
                style={{ width: 180, height: 180, display: "block", margin: "0 auto 14px", borderRadius: 10 }}
              />
              <button onClick={copyPix} style={{ width: "100%", padding: "11px", background: copied ? "#E6F9EE" : "#F5F0E8", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: copied ? "#1A6633" : "#8A6A30", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                {copied ? "Copiado!" : "Copiar código Pix"}
              </button>
            </div>
          ) : null}

          <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: 16, marginTop: pixString ? 4 : 0 }}>
            <p style={{ fontSize: 12, color: "#9B9890", marginBottom: 10 }}>Prefere pagar por cartão?</p>
            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "#25D366", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
            >
              Pagar pelo WhatsApp
            </a>
          </div>
          <p style={{ fontSize: 11, color: "#C5C0BB", textAlign: "center", marginTop: 16 }}>
            Após o pagamento, {studioName} confirmará e dará início à edição.
          </p>
        </div>
      </div>
    );
  }

  // ── GALLERY ──
  const overLimit = Math.max(0, selectedCount - limitIncluso);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3F0" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E4DC", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A18" }}>{studioName}</span>
            <span style={{ fontSize: 12, color: "#9B9890", marginLeft: 8 }}>
              {gallery.tipo === "album" ? "Seleção de Álbum" : "Seleção de Ensaio"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {deadline && days !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: days <= 3 ? "#E05252" : "#9B9890" }}>
                <Clock style={{ width: 12, height: 12 }} />
                {days <= 0 ? "Prazo encerrado" : `${days} dia${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`}
              </div>
            )}
            <div style={{ background: hasExtras ? "#FDF2F2" : "#F0FAF4", border: `1px solid ${hasExtras ? "#F5C6C6" : "#C6E8D4"}`, borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: hasExtras ? "#7A1A1A" : "#1A5C32" }}>
              {selectedCount}{limitIncluso > 0 ? `/${limitIncluso}` : ""} selecionada{selectedCount !== 1 ? "s" : ""}
              {hasExtras && <span style={{ marginLeft: 4, color: "#E05252" }}>+{fmt(valorExtras)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      {limitIncluso > 0 && (
        <div style={{ background: overLimit > 0 ? "#FDF2F2" : "#F5F3F0", borderBottom: "1px solid #E8E4DC", padding: "8px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", fontSize: 12, color: overLimit > 0 ? "#B04040" : "#9B9890" }}>
            {overLimit > 0
              ? `Você selecionou ${overLimit} foto${overLimit > 1 ? "s" : ""} além do pacote. Valor adicional: ${fmt(valorExtras)}`
              : `Seu pacote inclui ${limitIncluso} foto${limitIncluso !== 1 ? "s" : ""}. ${limitIncluso - selectedCount > 0 ? `Você ainda pode selecionar ${limitIncluso - selectedCount} mais.` : "Você atingiu o limite do pacote."}`
            }
          </div>
        </div>
      )}

      {/* Photo grid */}
      {totalPhotos === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <p style={{ color: "#9B9890", fontSize: 14 }}>Nenhuma foto disponível ainda.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 12px" }}>
          <div style={{ columns: "auto 200px", columnGap: 8 }}>
            {photos.map(photo => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                onToggle={handleToggle}
                onView={setViewPhoto}
                disabled={gallery.status === "selecao_concluida"}
                allowDownload={gallery.permite_download ?? true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      {gallery.status !== "selecao_concluida" && (
        <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #E8E4DC", padding: "14px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#9B9890" }}>
              {totalPhotos} foto{totalPhotos !== 1 ? "s" : ""} no total
            </div>
            <button
              onClick={handleFinalize}
              disabled={finalizing || selectedCount === 0}
              style={{ padding: "11px 24px", background: selectedCount > 0 ? "#C9A96E" : "#E8E4DC", border: "none", borderRadius: 10, color: selectedCount > 0 ? "#fff" : "#B5B0AA", fontSize: 13, fontWeight: 700, cursor: selectedCount > 0 && !finalizing ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
            >
              {finalizing ? <Spinner size={16} color="#fff" /> : <><ChevronRight style={{ width: 14, height: 14 }} />Concluir seleção</>}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {viewPhoto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setViewPhoto(null)}
        >
          <button onClick={() => setViewPhoto(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 18, height: 18, color: "#fff" }} />
          </button>
          <img src={viewPhoto} alt="" draggable="false" onContextMenu={e => { if (!(session?.gallery?.permite_download ?? true)) e.preventDefault(); }} style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, userSelect: "none" } as React.CSSProperties} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function PhotoTile({ photo, onToggle, onView, disabled, allowDownload }: {
  photo: ProofingPhoto & { url?: string; thumbnail_url?: string };
  onToggle: (p: ProofingPhoto) => void;
  onView: (url: string) => void;
  disabled: boolean;
  allowDownload: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{ breakInside: "avoid", marginBottom: 8, position: "relative", borderRadius: 8, overflow: "hidden", cursor: "pointer", border: photo.selecionada ? "3px solid #C9A96E" : "3px solid transparent", transition: "border 0.15s" }}
    >
      {!loaded && <div style={{ width: "100%", aspectRatio: "1", background: "#E8E4DC" }} />}
      {(photo.thumbnail_url || photo.url) && (
        <img
          src={photo.thumbnail_url || photo.url}
          alt={photo.nome_arquivo}
          loading="lazy"
          decoding="async"
          draggable="false"
          style={{ width: "100%", display: loaded ? "block" : "none", objectFit: "cover", userSelect: "none", WebkitUserSelect: "none" }}
          onLoad={() => setLoaded(true)}
          onClick={() => !disabled && onToggle(photo)}
          onDoubleClick={() => (photo.url || photo.thumbnail_url) && onView(photo.url || photo.thumbnail_url!)}
          onContextMenu={e => { if (!allowDownload) e.preventDefault(); }}
        />
      )}
      {/* Transparent overlay to block long-press save on mobile when download not allowed */}
      {!allowDownload && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 2, WebkitTouchCallout: "none" } as React.CSSProperties}
          onContextMenu={e => e.preventDefault()}
          onClick={() => !disabled && onToggle(photo)}
          onDoubleClick={() => (photo.url || photo.thumbnail_url) && onView(photo.url || photo.thumbnail_url!)}
        />
      )}
      {/* Selection badge */}
      <div
        onClick={e => { e.stopPropagation(); if (!disabled) onToggle(photo); }}
        style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 28, borderRadius: "50%",
          background: photo.selecionada ? "#C9A96E" : "rgba(255,255,255,0.85)",
          border: `2px solid ${photo.selecionada ? "#C9A96E" : "rgba(200,196,190,0.7)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: disabled ? "default" : "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "all 0.15s",
        }}
      >
        {photo.selecionada && <Check style={{ width: 14, height: 14, color: "#fff" }} />}
      </div>
    </div>
  );
}
