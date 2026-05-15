import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useForms } from "@/contexts/FormsContext";
import { useClients } from "@/contexts/ClientsContext";
import { FormTemplate, FormQuestion, FormInstance, FormQuestionType } from "@/utils/types";
import { Plus, Trash2, Edit2, Copy, Send, ChevronDown, ChevronUp, GripVertical, Check, X, FileText, LayoutTemplate, Clock, CheckCircle2, Users } from "lucide-react";
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

const QUESTION_TYPE_LABELS: Record<FormQuestionType, string> = {
  text: "Texto livre",
  multiple: "Múltipla escolha",
  boolean: "Sim / Não",
  scale: "Escala (1–5)",
};

const CATEGORY_LABELS: Record<string, string> = {
  pre_wedding: "Pré-Wedding",
  debutante: "15 Anos",
  feedback: "Feedback",
  corporativo: "Corporativo",
};

function newQuestion(): FormQuestion {
  return {
    id: crypto.randomUUID(),
    type: "text",
    question: "",
    required: false,
    options: [],
  };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string || "";

function getFormLink(token: string): string {
  const origin = window.location.origin;
  return `${origin}/f/${token}`;
}

// ── QuestionEditor ─────────────────────────────────────────────────────────────

function QuestionEditor({
  q,
  onChange,
  onRemove,
}: {
  q: FormQuestion;
  onChange: (q: FormQuestion) => void;
  onRemove: () => void;
}) {
  const [optionInput, setOptionInput] = useState("");

  const addOption = () => {
    const v = optionInput.trim();
    if (!v) return;
    onChange({ ...q, options: [...(q.options ?? []), v] });
    setOptionInput("");
  };

  const removeOption = (i: number) => {
    onChange({ ...q, options: (q.options ?? []).filter((_, idx) => idx !== i) });
  };

  return (
    <div style={{
      background: C.itemBg, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Row 1: type + required + remove */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={q.type}
          onChange={e => onChange({ ...q, type: e.target.value as FormQuestionType, options: [] })}
          style={{
            padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: "#FFFFFF", fontSize: 12, color: C.text, cursor: "pointer",
          }}
        >
          {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textSub, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={q.required}
            onChange={e => onChange({ ...q, required: e.target.checked })}
          />
          Obrigatória
        </label>
        <button
          onClick={onRemove}
          style={{
            marginLeft: "auto", width: 26, height: 26, borderRadius: 6,
            border: `1px solid #FECDCD`, background: C.dangerBg,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <Trash2 style={{ width: 11, height: 11, color: C.danger }} />
        </button>
      </div>

      {/* Question text */}
      <input
        value={q.question}
        onChange={e => onChange({ ...q, question: e.target.value })}
        placeholder="Digite a pergunta..."
        style={{
          padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
          background: "#FFFFFF", fontSize: 13, color: C.text, width: "100%", boxSizing: "border-box",
        }}
      />

      {/* Options (multiple choice only) */}
      {q.type === "multiple" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(q.options ?? []).map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                flex: 1, padding: "5px 10px", borderRadius: 6,
                border: `1px solid ${C.border}`, background: "#FFFFFF", fontSize: 12, color: C.text,
              }}>{opt}</span>
              <button
                onClick={() => removeOption(i)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
              >
                <X style={{ width: 12, height: 12, color: C.textSub }} />
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={optionInput}
              onChange={e => setOptionInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addOption()}
              placeholder="Nova opção..."
              style={{
                flex: 1, padding: "5px 10px", borderRadius: 6,
                border: `1px solid ${C.border}`, background: "#FFFFFF", fontSize: 12, color: C.text,
              }}
            />
            <button
              onClick={addOption}
              style={{
                padding: "5px 10px", borderRadius: 6,
                background: C.navyBg, border: `1px solid ${C.navy}40`,
                fontSize: 12, fontWeight: 600, color: C.navy, cursor: "pointer",
              }}
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {q.type === "scale" && (
        <div style={{ fontSize: 11, color: C.textSub, padding: "2px 0" }}>
          Escala de 1 (mínimo) a 5 (máximo)
        </div>
      )}
    </div>
  );
}

// ── TemplateBuilderModal ───────────────────────────────────────────────────────

function TemplateBuilderModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: FormTemplate;
  onSave: (payload: Pick<FormTemplate, "title" | "description" | "category" | "questions">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [questions, setQuestions] = useState<FormQuestion[]>(
    initial?.questions.length ? initial.questions : [newQuestion()]
  );

  const updateQ = (idx: number, q: FormQuestion) =>
    setQuestions(prev => prev.map((item, i) => i === idx ? q : item));
  const removeQ = (idx: number) =>
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  const addQ = () => setQuestions(prev => [...prev, newQuestion()]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), category, questions });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 640,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${C.divider}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
            {initial ? "Editar Template" : "Novo Template"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X style={{ width: 18, height: 18, color: C.textSub }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
              Título *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Preferências para Casamento"
              style={{
                padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.itemBg, fontSize: 14, color: C.text, width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Description + Category row */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
                Descrição
              </label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve descrição..."
                style={{
                  padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.itemBg, fontSize: 13, color: C.text, width: "100%", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ width: 150, display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.itemBg, fontSize: 13, color: C.text, cursor: "pointer",
                }}
              >
                <option value="">Sem categoria</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
              Perguntas ({questions.length})
            </div>
            {questions.map((q, idx) => (
              <QuestionEditor
                key={q.id}
                q={q}
                onChange={uq => updateQ(idx, uq)}
                onRemove={() => removeQ(idx)}
              />
            ))}
            <button
              onClick={addQ}
              style={{
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
                padding: "9px", borderRadius: 8,
                border: `1px dashed ${C.border}`, background: "transparent",
                fontSize: 12, fontWeight: 600, color: C.textSub, cursor: "pointer",
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Adicionar pergunta
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 22px", borderTop: `1px solid ${C.divider}`,
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.itemBg, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: title.trim() ? C.navy : C.border,
              fontSize: 13, fontWeight: 700, color: "#FFFFFF", cursor: title.trim() ? "pointer" : "default",
            }}
          >
            {initial ? "Salvar alterações" : "Criar template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SendFormModal ──────────────────────────────────────────────────────────────

function SendFormModal({
  template,
  clients,
  onSend,
  onClose,
}: {
  template: FormTemplate;
  clients: { id: string; name: string }[];
  onSend: (clientId: string, questions: FormQuestion[]) => void;
  onClose: () => void;
}) {
  const [clientId, setClientId] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>(template.questions);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 500,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${C.divider}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
            Enviar: {template.title}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X style={{ width: 18, height: 18, color: C.textSub }} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{
                padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.itemBg, fontSize: 13, color: C.text, cursor: "pointer",
              }}
            >
              <option value="">Selecione o cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
              Perguntas incluídas ({questions.length})
            </div>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                padding: "8px 12px", borderRadius: 8, background: C.itemBg,
                border: `1px solid ${C.border}`, fontSize: 12, color: C.text,
                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
              }}>
                <span style={{ flex: 1 }}>{i + 1}. {q.question || <em style={{ color: C.textSub }}>sem texto</em>}</span>
                {q.required && (
                  <span style={{ fontSize: 9, fontWeight: 700, background: C.amberBg, color: "#A07010", borderRadius: 999, padding: "1px 6px", whiteSpace: "nowrap" }}>
                    Obrig.
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: "14px 22px", borderTop: `1px solid ${C.divider}`,
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.itemBg, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button
            onClick={() => clientId && onSend(clientId, questions)}
            disabled={!clientId}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: clientId ? C.navy : C.border,
              fontSize: 13, fontWeight: 700, color: "#FFFFFF", cursor: clientId ? "pointer" : "default",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Send style={{ width: 13, height: 13 }} />
            Gerar link
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TemplateCard ───────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  clients,
  onEdit,
  onDelete,
  onSend,
}: {
  template: FormTemplate;
  clients: { id: string; name: string }[];
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const categoryLabel = template.category ? CATEGORY_LABELS[template.category] ?? template.category : null;

  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 12,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{template.title}</span>
            {template.is_default && (
              <span style={{ fontSize: 9, fontWeight: 700, background: C.navyBg, color: C.navy, borderRadius: 999, padding: "1px 6px" }}>
                Padrão
              </span>
            )}
            {categoryLabel && (
              <span style={{ fontSize: 9, fontWeight: 700, background: C.amberBg, color: "#A07010", borderRadius: 999, padding: "1px 6px" }}>
                {categoryLabel}
              </span>
            )}
          </div>
          {template.description && (
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{template.description}</div>
          )}
          <div style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>
            {template.questions.length} pergunta{template.questions.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: C.itemBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
            title="Ver perguntas"
          >
            {expanded
              ? <ChevronUp style={{ width: 12, height: 12, color: C.textSub }} />
              : <ChevronDown style={{ width: 12, height: 12, color: C.textSub }} />}
          </button>
          <button
            onClick={onEdit}
            style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
              background: C.itemBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
            title="Editar"
          >
            <Edit2 style={{ width: 11, height: 11, color: C.textSub }} />
          </button>
          {!template.is_default && (
            <button
              onClick={onDelete}
              style={{
                width: 28, height: 28, borderRadius: 6, border: `1px solid #FECDCD`,
                background: C.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              title="Excluir"
            >
              <Trash2 style={{ width: 11, height: 11, color: C.danger }} />
            </button>
          )}
          <button
            onClick={onSend}
            style={{
              height: 28, padding: "0 12px", borderRadius: 6, border: "none",
              background: C.navy, display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
            }}
          >
            <Send style={{ width: 11, height: 11 }} />
            Enviar
          </button>
        </div>
      </div>

      {/* Expandable questions preview */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.divider}`, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {template.questions.map((q, i) => (
            <div key={q.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, color: C.textSub, fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.text }}>{q.question || <em style={{ color: C.textSub }}>sem texto</em>}</div>
                <div style={{ fontSize: 10, color: C.textSub }}>
                  {QUESTION_TYPE_LABELS[q.type]}
                  {q.required ? " · obrigatória" : ""}
                  {q.type === "multiple" && q.options?.length ? ` · ${q.options.length} opções` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── InstanceRow ────────────────────────────────────────────────────────────────

function InstanceRow({
  inst,
  clientName,
  onDelete,
}: {
  inst: FormInstance;
  clientName: string;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const link = getFormLink(inst.token);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!" });
  };

  const statusColor = inst.status === "submitted" ? C.success : inst.status === "expired" ? C.danger : C.amber;
  const statusBg = inst.status === "submitted" ? C.successBg : inst.status === "expired" ? C.dangerBg : C.amberBg;
  const statusLabel = inst.status === "submitted" ? "Respondido" : inst.status === "expired" ? "Expirado" : "Aguardando";

  return (
    <div style={{
      padding: "10px 14px", background: C.itemBg, borderRadius: 8,
      border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {inst.title}
        </div>
        <div style={{ fontSize: 11, color: C.textSub }}>
          {clientName} · {format(new Date(inst.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px",
        background: statusBg, color: statusColor,
      }}>
        {statusLabel}
      </span>
      <button
        onClick={copyLink}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
          background: "#FFFFFF", fontSize: 11, fontWeight: 600, color: C.text, cursor: "pointer",
        }}
      >
        <Copy style={{ width: 11, height: 11 }} />
        Copiar link
      </button>
      <button
        onClick={onDelete}
        style={{
          width: 26, height: 26, borderRadius: 6, border: `1px solid #FECDCD`,
          background: C.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <Trash2 style={{ width: 10, height: 10, color: C.danger }} />
      </button>
    </div>
  );
}

// ── FormsPage ──────────────────────────────────────────────────────────────────

type Tab = "templates" | "enviados";

export default function FormsPage() {
  const { templates, instances, loading, addTemplate, editTemplate, removeTemplate, sendForm, removeInstance } = useForms();
  const { clients } = useClients();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("templates");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState<FormTemplate | null>(null);
  const [sentLinkInst, setSentLinkInst] = useState<FormInstance | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Formulários | Clixio CRM";
  }, []);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));

  const handleSaveTemplate = async (payload: Pick<FormTemplate, "title" | "description" | "category" | "questions">) => {
    if (editingTemplate) {
      await editTemplate(editingTemplate.id, payload);
    } else {
      await addTemplate(payload);
    }
    setBuilderOpen(false);
    setEditingTemplate(null);
  };

  const handleSendForm = async (clientId: string, questions: FormQuestion[]) => {
    if (!sendingTemplate) return;
    const inst = await sendForm({
      client_id: clientId,
      template_id: sendingTemplate.id,
      title: sendingTemplate.title,
      questions,
    });
    setSendingTemplate(null);
    if (inst) {
      setSentLinkInst(inst);
      setTab("enviados");
    }
  };

  const pending = instances.filter(i => i.status === "pending").length;
  const submitted = instances.filter(i => i.status === "submitted").length;

  return (
    <Layout>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>

        {/* Header card */}
        <div style={{
          background: "#FFFFFF", borderRadius: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
          padding: "18px 22px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
              Formulários
            </h1>
            <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
              Crie e envie questionários personalizados para seus clientes
            </div>
          </div>
          <button
            onClick={() => { setEditingTemplate(null); setBuilderOpen(true); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: C.navy, fontSize: 12, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Novo Template
          </button>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Templates", value: templates.length, accent: C.navy, icon: LayoutTemplate },
            { label: "Aguardando Resposta", value: pending, accent: C.amber, icon: Clock },
            { label: "Respondidos", value: submitted, accent: C.success, icon: CheckCircle2 },
          ].map(({ label, value, accent, icon: Icon }) => (
            <div key={label} style={{
              background: "#FFFFFF", borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
              borderTop: `3px solid ${accent}`, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon style={{ width: 16, height: 16, color: accent }} />
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textSub }}>
                  {label}
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginTop: 6 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `2px solid ${C.divider}`, marginBottom: 16 }}>
          {([
            { key: "templates", label: "Templates" },
            { key: "enviados", label: `Enviados (${instances.length})` },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 16px", background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                color: tab === key ? C.navy : C.textSub,
                borderBottom: tab === key ? `2px solid ${C.navy}` : "2px solid transparent",
                marginBottom: -2,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.textSub }}>Carregando...</div>
        ) : tab === "templates" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {templates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textSub }}>
                <FileText style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.25 }} />
                <div style={{ fontSize: 13 }}>Nenhum template ainda</div>
              </div>
            ) : (
              templates.map(tpl => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  clients={clients}
                  onEdit={() => { setEditingTemplate(tpl); setBuilderOpen(true); }}
                  onDelete={() => setDeletingTemplateId(tpl.id)}
                  onSend={() => setSendingTemplate(tpl)}
                />
              ))
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {instances.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textSub }}>
                <Send style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.25 }} />
                <div style={{ fontSize: 13 }}>Nenhum formulário enviado ainda</div>
              </div>
            ) : (
              instances.map(inst => (
                <InstanceRow
                  key={inst.id}
                  inst={inst}
                  clientName={clientMap[inst.client_id] ?? "Cliente"}
                  onDelete={() => removeInstance(inst.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Sent link banner */}
        {sentLinkInst && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: C.navy, borderRadius: 12, padding: "14px 20px", zIndex: 999,
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)", maxWidth: 480, width: "90%",
          }}>
            <CheckCircle2 style={{ width: 18, height: 18, color: C.success, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Formulário criado!</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {getFormLink(sentLinkInst.token)}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getFormLink(sentLinkInst.token));
                toast({ title: "Link copiado!" });
              }}
              style={{
                padding: "6px 12px", borderRadius: 6, border: "none",
                background: "rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 700,
                color: "#FFFFFF", cursor: "pointer",
              }}
            >
              Copiar
            </button>
            <button
              onClick={() => setSentLinkInst(null)}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.6)" }} />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deletingTemplateId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 14, padding: "24px", width: 320,
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)", textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Excluir template?</div>
            <div style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>
              Esta ação não pode ser desfeita.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => setDeletingTemplateId(null)}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.itemBg, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { removeTemplate(deletingTemplateId); setDeletingTemplateId(null); }}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: C.danger, fontSize: 13, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Builder Modal */}
      {builderOpen && (
        <TemplateBuilderModal
          initial={editingTemplate ?? undefined}
          onSave={handleSaveTemplate}
          onClose={() => { setBuilderOpen(false); setEditingTemplate(null); }}
        />
      )}

      {/* Send Form Modal */}
      {sendingTemplate && (
        <SendFormModal
          template={sendingTemplate}
          clients={clients}
          onSend={handleSendForm}
          onClose={() => setSendingTemplate(null)}
        />
      )}
    </Layout>
  );
}
