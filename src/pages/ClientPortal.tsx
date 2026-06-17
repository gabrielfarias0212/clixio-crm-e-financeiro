import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPortalData, PortalClient, PortalStudio } from "@/utils/supabase/portal";

function parseDate(d?: string | null): Date | null {
  if (!d) return null;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return null;
}
function formatDateBR(d?: string | null): string {
  const dt = parseDate(d);
  if (!dt) return "—";
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
function daysUntil(d?: string | null): number | null {
  const dt = parseDate(d);
  if (!dt) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((dt.getTime() - today.getTime()) / 86400000);
}
function heroPhrase(days: number | null, firstName: string): string {
  if (days === null) return `Estamos trabalhando com todo o carinho nas suas memórias, ${firstName}.`;
  if (days > 180) return `Seu grande dia está chegando, ${firstName}. Faltam ${days} dias para a cerimônia.`;
  if (days > 60) return `Quase lá, ${firstName}. Faltam ${days} dias para o momento mais especial da sua vida.`;
  if (days > 14) return `Como está o nervosismo? Faltam apenas ${days} dias para o grande dia, ${firstName}.`;
  if (days > 1) return `O grande dia está logo ali. Faltam apenas ${days} dias — respirem fundo e aproveitem cada instante.`;
  if (days === 1) return `Amanhã é o grande dia! Descansem bem esta noite, ${firstName}.`;
  if (days === 0) return `Hoje é o dia, ${firstName}. Aproveitem cada segundo desta celebração única e inesquecível.`;
  return `Seu casamento foi lindo, ${firstName}. Agora estamos trabalhando com todo o carinho em suas memórias.`;
}

const STEPS = [
  { field: "weddingPhotographed", label: "Fotografado"      },
  { field: "backupCompleted",     label: "Organização"      },
  { field: "curationCompleted",   label: "Seleção"          },
  { field: "previasSent",         label: "Prévias enviadas" },
  { field: "inEditing",           label: "Edição final"     },
  { field: "linkSent",            label: "Galeria entregue" },
  { field: "boxDelivered",        label: "Entrega física",  optional: true },
] as const;

const STAGE_LABELS: Record<string, string> = {
  evento_ensaio: "Aguardando o evento", copia: "Organizando as fotos",
  backup: "Protegendo as memórias", curadoria: "Selecionando os momentos",
  previas_enviadas: "Prévias enviadas", edicao: "Em edição final",
  link_pronto: "Galeria pronta", link_enviado: "Galeria entregue",
  entrega_fisica: "Entrega física realizada", projeto_finalizado: "Trabalho concluído",
};
const STAGE_DESC: Record<string, string> = {
  evento_ensaio: "Estamos aguardando o seu grande dia para começar a trabalhar.",
  copia: "Suas fotos estão sendo organizadas e protegidas com segurança.",
  backup: "Realizando o backup completo de todas as imagens do seu dia.",
  curadoria: "Estamos selecionando cuidadosamente os melhores momentos do seu casamento.",
  previas_enviadas: "Você já recebeu uma seleção das suas fotos. Agora finalizamos a edição completa com todo o carinho.",
  edicao: "Estamos realizando a edição final de cada foto com atenção e dedicação.",
  link_pronto: "Sua galeria está pronta e será enviada em breve.",
  link_enviado: "Sua galeria online já foi enviada. Aproveite cada memória!",
  entrega_fisica: "O pen drive ou álbum foi entregue. Suas memórias estão com você.",
  projeto_finalizado: "Seu trabalho foi concluído com sucesso. Obrigado pela confiança!",
};

function formatCurrency(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ClientPortal() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"loading"|"found"|"not_found">("loading");
  const [client, setClient] = useState<PortalClient | null>(null);
  const [studio, setStudio] = useState<PortalStudio | null>(null);

  useEffect(() => {
    if (!token) { setState("not_found"); return; }
    fetchPortalData(token).then(data => {
      if (data) { setClient(data.client); setStudio(data.studio); setState("found"); }
      else setState("not_found");
    });
  }, [token]);

  if (state === "loading") return (
    <div style={{ minHeight:"100vh", background:"#FAFAF8", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36,height:36,border:"2px solid #E8E4DC",borderTopColor:"#C9A96E",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }} />
        <p style={{ fontFamily:"sans-serif", fontSize:13, color:"#9B9890" }}>Carregando seu espaço...</p>
      </div>
    </div>
  );

  if (state === "not_found" || !client || !studio) return (
    <div style={{ minHeight:"100vh", background:"#FAFAF8", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 20px" }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <p style={{ fontFamily:"Georgia,serif", fontSize:48, fontWeight:300, color:"#E8E4DC", marginBottom:24 }}>404</p>
        <p style={{ fontFamily:"Georgia,serif", fontSize:22, color:"#1A1A18", marginBottom:8 }}>Página não encontrada</p>
        <p style={{ fontFamily:"sans-serif", fontSize:14, color:"#9B9890", lineHeight:1.6 }}>Este link pode estar incorreto ou o acesso pode ter sido desativado. Entre em contato com o fotógrafo.</p>
      </div>
    </div>
  );

  const days = daysUntil(client.weddingDate);
  const firstName = (client.coupleName || client.name).split(/[\s&]/)[0];
  const phrase = heroPhrase(days, firstName);
  const displayName = client.coupleName || client.name;
  const stageLabel = STAGE_LABELS[client.workflowStage ?? ""] ?? "Em andamento";
  const stageDesc  = STAGE_DESC[client.workflowStage ?? ""] ?? "Estamos trabalhando nas suas fotos com carinho.";
  const steps = STEPS.filter(s => !s.optional || !client.semEntregaFisica);
  const completedCount = steps.filter(s => !!(client as any)[s.field]).length;
  const currentIdx = steps.findIndex(s => !(client as any)[s.field]);
  const pct = Math.round((completedCount / steps.length) * 100);

  // Financial: use transactions (type="entrada" = payment received)
  const transactions = client.transactions ?? [];
  const receivedTransactions = transactions.filter(t => t.type === "entrada");
  const totalPaid = receivedTransactions.reduce((acc, t) => acc + t.amount, 0);
  const contractValue = client.contractValue ?? 0;
  const totalRemaining = Math.max(0, contractValue - totalPaid);
  const allPaid = contractValue > 0 && totalRemaining === 0;
  const hasFinancialData = contractValue > 0;

  const C = { white:"#FFFFFF", cream:"#FAFAF8", gold:"#C9A96E", goldLight:"#F0E8D8",
    text:"#1A1A18", textMid:"#5C5A54", textLight:"#9B9890", border:"#E8E4DC", dark:"#1A1A18",
    green:"#2D6A4F", greenBg:"#EBF4EF", amber:"#92400E", amberBg:"#FEF3C7", warm:"#F5F3EF" };

  const f = (delay: number): React.CSSProperties => ({ opacity:0, animation:`fadeUp 0.6s ${delay}s ease forwards` });

  return (
    <div style={{ minHeight:"100vh", background:C.cream, color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Topbar */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {studio.avatarUrl
          ? <img src={studio.avatarUrl} alt={studio.name} style={{ height:32, maxWidth:160, objectFit:"contain" }} />
          : <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, letterSpacing:"0.08em", textTransform:"uppercase" as const }}>{studio.name}</span>
        }
        <span style={{ fontSize:11, color:C.textLight, letterSpacing:"0.1em", textTransform:"uppercase" as const }}>Área exclusiva</span>
      </div>

      {/* Hero */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"60px 20px 52px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, left:"50%", transform:"translateX(-50%)", width:500, height:500, background:"radial-gradient(circle,rgba(201,169,110,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
        <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:C.textLight, marginBottom:16, ...f(0.1) }}>Bem-vindo ao seu espaço</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(32px,6vw,44px)", fontWeight:300, color:C.text, lineHeight:1.15, marginBottom:8, ...f(0.2) }}>
          {displayName}
        </h1>
        <p style={{ fontSize:13, color:C.textLight, marginBottom:days !== null ? 48 : 16, ...f(0.3) }}>
          Casamento · {formatDateBR(client.weddingDate)}
        </p>
        {days !== null && (
          <div style={{ ...f(0.4) }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(72px,14vw,96px)", fontWeight:300, lineHeight:1, color:C.text, letterSpacing:-2 }}>
              {days === 0 ? "Hoje" : Math.abs(days)}
            </div>
            <div style={{ fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.textLight, marginTop:4 }}>
              {days > 0 ? "dias para o grande dia" : days === 0 ? "é o grande dia" : "dias desde o casamento"}
            </div>
          </div>
        )}
        <p style={{ maxWidth:440, margin:"28px auto 0", fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:300, fontStyle:"italic", color:C.textMid, lineHeight:1.6, ...f(0.55) }}>
          {phrase}
        </p>
        <div style={{ width:40, height:1, background:C.gold, margin:"28px auto 0", ...f(0.65) }} />
      </div>

      {/* Main */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"48px 20px 80px", fontFamily:"'DM Sans',sans-serif" }}>

        {/* Stage */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"36px 28px", marginBottom:24, textAlign:"center", ...f(0.7) }}>
          <p style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:C.textLight, marginBottom:12 }}>Etapa atual do trabalho</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(28px,5vw,36px)", fontWeight:600, color:C.text, marginBottom:8 }}>{stageLabel}</h2>
          <p style={{ fontSize:14, color:C.textMid, lineHeight:1.6, maxWidth:380, margin:"0 auto 28px" }}>{stageDesc}</p>

          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:C.textLight }}>Jornada do seu álbum</span>
              <span style={{ fontSize:11, fontWeight:600, color:C.gold }}>{pct}%</span>
            </div>
            <div style={{ height:3, background:C.warm, borderRadius:999 }}>
              <div style={{ height:"100%", borderRadius:999, background:`linear-gradient(90deg,${C.gold},#D4A96E)`, width:`${pct}%` }} />
            </div>
          </div>

          <div style={{ display:"flex", gap:0, marginTop:20, overflowX:"auto" }}>
            {steps.map((step, i) => {
              const done = !!(client as any)[step.field];
              const active = i === currentIdx;
              return (
                <div key={step.field} style={{ flex:1, minWidth:60, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
                  {i < steps.length-1 && <div style={{ position:"absolute", top:13, left:"calc(50% + 13px)", right:"calc(-50% + 13px)", height:1, background:done ? C.dark : C.border }} />}
                  <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, zIndex:1, position:"relative",
                    background: done ? C.dark : active ? C.gold : C.white,
                    border: active ? `1px solid ${C.gold}` : done ? "none" : `1.5px solid ${C.border}`,
                    color: done || active ? C.white : C.textLight,
                    boxShadow: active ? `0 0 0 4px ${C.goldLight}` : "none" }}>
                    {done ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : i+1}
                  </div>
                  <div style={{ fontSize:9, color: active ? C.gold : done ? C.textMid : C.textLight, marginTop:6, textAlign:"center", lineHeight:1.3, maxWidth:62, fontWeight: active ? 600 : 400 }}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize:12, color:C.textLight, marginTop:20, fontStyle:"italic", lineHeight:1.5 }}>
            Cada etapa é realizada com atenção e carinho. Qualidade leva tempo, e suas fotos merecem o melhor.
          </p>
        </div>

        {/* Deadline */}
        {client.portalDeadline && (
          <div style={{ background:C.goldLight, border:`1px solid rgba(201,169,110,0.25)`, borderRadius:16, padding:"20px 28px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", ...f(0.8) }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.gold, marginBottom:4 }}>Previsão de entrega</p>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:C.text }}>{formatDateBR(client.portalDeadline)}</p>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        )}

        {/* Financial summary */}
        {hasFinancialData && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 28px", marginBottom:24, ...f(0.85) }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, color:C.text, marginBottom:4 }}>Situação financeira</h3>
            <p style={{ fontSize:13, color: allPaid ? C.green : C.textLight, marginBottom:24, fontWeight: allPaid ? 500 : 400 }}>
              {allPaid ? "Seu contrato está totalmente quitado. Obrigado pela confiança!" : "Resumo dos seus pagamentos."}
            </p>

            {/* Summary cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom: receivedTransactions.length > 0 ? 24 : 0 }}>
              <div style={{ textAlign:"center", padding:"16px 12px", background:C.warm, borderRadius:12 }}>
                <p style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:C.textLight, marginBottom:6 }}>Contrato</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:C.text }}>{formatCurrency(contractValue)}</p>
              </div>
              <div style={{ textAlign:"center", padding:"16px 12px", background:C.greenBg, borderRadius:12 }}>
                <p style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:C.green, marginBottom:6 }}>Pago</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:C.green }}>{formatCurrency(totalPaid)}</p>
              </div>
              <div style={{ textAlign:"center", padding:"16px 12px", background: totalRemaining > 0 ? C.amberBg : C.greenBg, borderRadius:12 }}>
                <p style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase" as const, color: totalRemaining > 0 ? C.amber : C.green, marginBottom:6 }}>Restante</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color: totalRemaining > 0 ? C.amber : C.green }}>{formatCurrency(totalRemaining)}</p>
              </div>
            </div>

            {/* Transaction list */}
            {receivedTransactions.length > 0 && (
              <div>
                <p style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:C.textLight, marginBottom:12 }}>Histórico de pagamentos</p>
                {receivedTransactions.map((t, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom: i < receivedTransactions.length-1 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <p style={{ fontSize:13, color:C.text, fontWeight:500 }}>{t.description || "Pagamento recebido"}</p>
                      <p style={{ fontSize:11, color:C.textLight, marginTop:2 }}>{formatDateBR(t.date)}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:C.green }}>{formatCurrency(t.amount)}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:999, background:C.greenBg, color:C.green }}>Recebido</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contract */}
        {client.contractLink && (
          <a href={client.contractLink} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.dark, borderRadius:16, padding:"24px 28px", marginBottom:24, textDecoration:"none", ...f(0.9) }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, color:C.white, marginBottom:4 }}>Seu contrato</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)" }}>Acesse o documento assinado a qualquer momento</p>
            </div>
            <div style={{ width:44, height:44, border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
            </div>
          </a>
        )}

        {/* Message */}
        {client.portalMessage && (
          <div style={{ background:C.goldLight, border:`1px solid rgba(201,169,110,0.2)`, borderRadius:16, padding:"28px 28px", ...f(0.95) }}>
            <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.gold, marginBottom:10 }}>Uma mensagem para você</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, fontWeight:300, fontStyle:"italic", color:C.text, lineHeight:1.65 }}>"{client.portalMessage}"</p>
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:48 }}>
          {studio.avatarUrl
            ? <img src={studio.avatarUrl} alt={studio.name} style={{ height:24, objectFit:"contain", opacity:0.35, margin:"0 auto 8px", display:"block" }} />
            : <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:C.textLight, letterSpacing:"0.08em", textTransform:"uppercase" as const, marginBottom:4 }}>{studio.name}</p>
          }
          <p style={{ fontSize:11, color:C.textLight }}>Área exclusiva do cliente · acesso via link privado</p>
        </div>
      </div>
    </div>
  );
}
