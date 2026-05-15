import { useEffect, useState } from "react";
import { useForms } from "@/contexts/FormsContext";
import { FormInstance, FormQuestion, FormTemplate, FormResponse } from "@/utils/types";
import { fetchInstancesByClient, fetchResponseByInstance } from "@/utils/forms";
import { Send, Copy, ChevronDown, ChevronUp, FileText, CheckCircle2, Clock, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const C = {
  text:      "#1a1a1a",
  textSub:   "#9A9590",
  divider:   "#F0EDE8",
  itemBg:    "#FAFAF8",
  navy:      "#1E3A5F",
  navyBg:    "#E8EEF6",
  border:    "#E8E4DE",
  success:   "#52C97A",
  successBg: "#E6F9EE",
  amber:     "#E8A838",
  amberBg:   "#FEF3DC",
  danger:    "#E05252",
  dangerBg:  "#FEE8E8",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "Texto livre",
  multiple: "Múltipla escolha",
  boolean: "Sim / Não",
  scale: "Escala (1–5)",
};

function getFormLink(token: string) {
  return `${window.location.origin}/f/${token}`;
}

// ── SendFormDialog ─────────────────────────────────────────────────────────────

function SendFormDialog({
  clientId,
  templates,
  onSend,
  onClose,
}: {
  clientId: string;
  templates: FormTemplate[];
  onSend: (templateId: string, questions: FormQuestion[]) => Promise<void>;
  onClose: () => void;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [sending, setSending] = useState(false);

  const selected = templates.find(t => t.id === templateId);

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    await onSend(selected.id, selected.questions);
    setSending(false);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 440,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${C.divider}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Enviar Formulário</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X style={{ width: 16, height: 16, color: C.textSub }} />
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
              Template
            </label>
            <select
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              style={{
                padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.itemBg, fontSize: 13, color: C.text, cursor: "pointer",
              }}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {selected && (
            <div style={{ padding: "10px 12px", borderRadius: 8, background: C.itemBg, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>
                {selected.questions.length} pergunta{selected.questions.length !== 1 ? "s" : ""}
              </div>
              {selected.description && (
                <div style={{ fontSize: 12, color: C.text }}>{selected.description}</div>
              )}
            </div>
          )}
        </div>

        <div style={{
          padding: "12px 20px", borderTop: `1px solid ${C.divider}`,
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.itemBg, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!templateId || sending}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: templateId && !sending ? C.navy : C.border,
              fontSize: 13, fontWeight: 700, color: "#FFFFFF",
              cursor: templateId && !sending ? "pointer" : "default",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Send style={{ width: 12, height: 12 }} />
            {sending ? "Gerando..." : "Gerar link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ResponseViewer ─────────────────────────────────────────────────────────────

function ResponseViewer({
  questions,
  response,
}: {
  questions: FormQuestion[];
  response: FormResponse;
}) {
  const formatAnswer = (q: FormQuestion): string => {
    const val = response.answers[q.id];
    if (val === undefined || val === null || val === "") return "—";
    if (typeof val === "boolean") return val ? "Sim" : "Não";
    if (typeof val === "number") return `${val} / 5`;
    return String(val);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
      {questions.map((q, i) => (
        <div key={q.id} style={{ padding: "8px 12px", borderRadius: 8, background: C.itemBg, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textSub, marginBottom: 2 }}>
            {i + 1}. {q.question}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
            {formatAnswer(q)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── InstanceCard ───────────────────────────────────────────────────────────────

function InstanceCard({
  inst,
  onDelete,
}: {
  inst: FormInstance;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loadingResp, setLoadingResp] = useState(false);
  const [deletingConfirm, setDeletingConfirm] = useState(false);

  const link = getFormLink(inst.token);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!" });
  };

  const handleExpand = async () => {
    if (!expanded && inst.status === "submitted" && !response) {
      setLoadingResp(true);
      try {
        const resp = await fetchResponseByInstance(inst.id);
        setResponse(resp);
      } catch { /* noop */ }
      finally { setLoadingResp(false); }
    }
    setExpanded(e => !e);
  };

  const statusColor = inst.status === "submitted" ? C.success : inst.status === "expired" ? C.danger : C.amber;
  const statusBg = inst.status === "submitted" ? C.successBg : inst.status === "expired" ? C.dangerBg : C.amberBg;
  const statusLabel = inst.status === "submitted" ? "Respondido" : inst.status === "expired" ? "Expirado" : "Aguardando";
  const StatusIcon = inst.status === "submitted" ? CheckCircle2 : Clock;

  return (
    <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{
        padding: "10px 14px", background: "#FFFFFF",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <StatusIcon style={{ width: 14, height: 14, color: statusColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {inst.title}
          </div>
          <div style={{ fontSize: 11, color: C.textSub }}>
            {format(new Date(inst.created_at), "dd/MM/yyyy", { locale: ptBR })} · {inst.questions.length} perguntas
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px", background: statusBg, color: statusColor }}>
          {statusLabel}
        </span>
        {inst.status !== "submitted" && (
          <button
            onClick={copyLink}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: C.itemBg, fontSize: 11, fontWeight: 600, color: C.text, cursor: "pointer",
            }}
          >
            <Copy style={{ width: 10, height: 10 }} />
            Link
          </button>
        )}
        <button
          onClick={handleExpand}
          style={{
            width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.itemBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          {expanded
            ? <ChevronUp style={{ width: 11, height: 11, color: C.textSub }} />
            : <ChevronDown style={{ width: 11, height: 11, color: C.textSub }} />}
        </button>
        {deletingConfirm ? (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => { onDelete(); setDeletingConfirm(false); }}
              style={{
                padding: "4px 8px", borderRadius: 6, border: "none",
                background: C.danger, fontSize: 11, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
              }}
            >Sim</button>
            <button
              onClick={() => setDeletingConfirm(false)}
              style={{
                padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.itemBg, fontSize: 11, fontWeight: 600, color: C.textSub, cursor: "pointer",
              }}
            >Não</button>
          </div>
        ) : (
          <button
            onClick={() => setDeletingConfirm(true)}
            style={{
              width: 26, height: 26, borderRadius: 6, border: `1px solid #FECDCD`,
              background: C.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <Trash2 style={{ width: 10, height: 10, color: C.danger }} />
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.divider}`, background: C.itemBg }}>
          {inst.status === "submitted" ? (
            loadingResp ? (
              <div style={{ fontSize: 12, color: C.textSub }}>Carregando respostas...</div>
            ) : response ? (
              <ResponseViewer questions={inst.questions} response={response} />
            ) : (
              <div style={{ fontSize: 12, color: C.textSub }}>Nenhuma resposta encontrada.</div>
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                Link do formulário
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{
                  flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: "#FFFFFF", fontSize: 11, color: C.textSub,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {link}
                </div>
                <button
                  onClick={copyLink}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                    background: "#FFFFFF", fontSize: 11, fontWeight: 700, color: C.navy, cursor: "pointer",
                  }}
                >
                  <Copy style={{ width: 11, height: 11 }} />
                  Copiar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ClientFormsSection ─────────────────────────────────────────────────────────

export function ClientFormsSection({ clientId }: { clientId: string }) {
  const { templates, sendForm, removeInstance } = useForms();
  const { toast } = useToast();
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [newInst, setNewInst] = useState<FormInstance | null>(null);

  const loadInstances = async () => {
    try {
      const data = await fetchInstancesByClient(clientId);
      setInstances(data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadInstances(); }, [clientId]);

  const handleSend = async (templateId: string, questions: FormQuestion[]) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return;
    const inst = await sendForm({ client_id: clientId, template_id: templateId, title: tmpl.title, questions });
    if (inst) {
      setInstances(prev => [inst, ...prev]);
      setNewInst(inst);
    }
    setSendOpen(false);
  };

  const handleDelete = async (instId: string) => {
    await removeInstance(instId);
    setInstances(prev => prev.filter(i => i.id !== instId));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileText style={{ width: 14, height: 14, color: C.navy }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            Formulários ({instances.length})
          </span>
        </div>
        <button
          onClick={() => setSendOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 7, border: "none",
            background: C.navy, fontSize: 11, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
          }}
        >
          <Send style={{ width: 11, height: 11 }} />
          Enviar formulário
        </button>
      </div>

      {/* New instance banner */}
      {newInst && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, background: C.successBg,
          border: `1px solid #B8EDD0`, display: "flex", alignItems: "center", gap: 10,
        }}>
          <CheckCircle2 style={{ width: 14, height: 14, color: C.success, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, color: C.text }}>
            Formulário criado! Copie o link e envie ao cliente.
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(getFormLink(newInst.token));
              toast({ title: "Link copiado!" });
            }}
            style={{
              padding: "4px 10px", borderRadius: 6, border: "none",
              background: C.success, fontSize: 11, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
            }}
          >
            Copiar link
          </button>
          <button
            onClick={() => setNewInst(null)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X style={{ width: 12, height: 12, color: C.textSub }} />
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ fontSize: 12, color: C.textSub }}>Carregando...</div>
      ) : instances.length === 0 ? (
        <div style={{
          padding: "20px", textAlign: "center", borderRadius: 10,
          background: C.itemBg, border: `1px dashed ${C.border}`,
        }}>
          <FileText style={{ width: 24, height: 24, color: C.textSub, margin: "0 auto 8px", opacity: 0.4 }} />
          <div style={{ fontSize: 12, color: C.textSub }}>Nenhum formulário enviado para este cliente</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {instances.map(inst => (
            <InstanceCard
              key={inst.id}
              inst={inst}
              onDelete={() => handleDelete(inst.id)}
            />
          ))}
        </div>
      )}

      {/* Send dialog */}
      {sendOpen && (
        <SendFormDialog
          clientId={clientId}
          templates={templates}
          onSend={handleSend}
          onClose={() => setSendOpen(false)}
        />
      )}
    </div>
  );
}
