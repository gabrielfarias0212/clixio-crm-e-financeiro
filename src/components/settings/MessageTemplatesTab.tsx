import { useState, useEffect } from "react";
import { MessageTemplate, TemplateFunnelStage, TEMPLATE_STAGE_LABELS,
  fetchMessageTemplates, addMessageTemplate, updateMessageTemplate, deleteMessageTemplate
} from "@/utils/supabase/message-templates";
import { Plus, Copy, Edit2, Trash2, Check, MessageSquare, X, Save } from "lucide-react";

const STAGES = Object.entries(TEMPLATE_STAGE_LABELS) as [TemplateFunnelStage, string][];

const STAGE_COLORS: Record<TemplateFunnelStage, { bg: string; color: string }> = {
  primeiro_contato:  { bg: "#E6F1FB", color: "#185FA5" },
  orcamento_enviado: { bg: "#FAEEDA", color: "#854F0B" },
  negociacao:        { bg: "#FEF3C7", color: "#92400E" },
  fechado:           { bg: "#EAF3DE", color: "#3B6D11" },
  pos_evento:        { bg: "#EEEDFE", color: "#534AB7" },
  geral:             { bg: "#F1EFE8", color: "#5F5E5A" },
};

const DEFAULT_TEMPLATES: Array<Omit<MessageTemplate, "id" | "user_id" | "created_at">> = [
  {
    stage: "primeiro_contato",
    title: "Apresentação inicial",
    body: "Olá, [Nome]! 😊 Tudo bem? Vi que você tem interesse nos meus serviços de fotografia. Adoraria entender melhor o que você está planejando e ver como posso ajudar. Pode me contar mais sobre o evento?"
  },
  {
    stage: "orcamento_enviado",
    title: "Follow-up 3 dias",
    body: "Olá, [Nome]! Espero que esteja tudo bem. Queria saber se você teve a oportunidade de analisar o orçamento que enviei. Fico à disposição para tirar qualquer dúvida ou ajustar algo conforme a sua necessidade. 📸"
  },
  {
    stage: "orcamento_enviado",
    title: "Follow-up 7 dias",
    body: "Oi, [Nome]! Passando para saber se ainda há interesse 😊. Entendo que planejar um evento envolve muitas decisões. Se precisar de mais informações ou quiser conversar sobre o orçamento, é só falar. Minha agenda ainda tem disponibilidade para a sua data!"
  },
  {
    stage: "negociacao",
    title: "Última chance de data",
    body: "Olá, [Nome]! Quero te avisar que recebi outra consulta para a sua data. Como o processo de reserva é por ordem de chegada, gostaria de saber se você tem interesse em garantir antes que a data fique indisponível. Me avise! 🗓️"
  },
  {
    stage: "fechado",
    title: "Confirmação de contrato",
    body: "Que notícia incrível, [Nome]! 🎉 Estou muito feliz em confirmar que vamos trabalhar juntos. Em breve envio o contrato para assinatura e os detalhes de pagamento. Mal posso esperar para fotografar esse momento especial!"
  },
  {
    stage: "pos_evento",
    title: "Aviso de galeria pronta",
    body: "Olá, [Nome]! Tenho uma novidade incrível: a galeria de fotos do seu evento está pronta! 🎉📸 Acesse pelo link: [LINK]. Aproveite cada memória e não esqueça de compartilhar com quem você ama!"
  },
];

function StageChip({ stage }: { stage: TemplateFunnelStage }) {
  const c = STAGE_COLORS[stage];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.color, fontWeight: 500, whiteSpace: "nowrap" }}>
      {TEMPLATE_STAGE_LABELS[stage]}
    </span>
  );
}

export function MessageTemplatesTab() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<TemplateFunnelStage | "">("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<{ title: string; stage: TemplateFunnelStage; body: string }>({
    title: "", stage: "geral", body: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMessageTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDefaults() {
    setSaving(true);
    try {
      for (const t of DEFAULT_TEMPLATES) {
        await addMessageTemplate(t);
      }
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      await addMessageTemplate(form);
      await load();
      setCreating(false);
      setForm({ title: "", stage: "geral", body: "" });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      await updateMessageTemplate(id, form);
      await load();
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteMessageTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  }

  function handleCopy(body: string, id: string) {
    navigator.clipboard.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function startEdit(t: MessageTemplate) {
    setForm({ title: t.title, stage: t.stage, body: t.body });
    setEditingId(t.id);
    setCreating(false);
  }

  const filtered = filterStage ? templates.filter(t => t.stage === filterStage) : templates;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "7px 10px", borderRadius: 8,
    border: "1px solid var(--color-border-tertiary)",
    background: "var(--color-background-secondary)",
    fontSize: 13, color: "var(--color-text-primary)",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)",
    textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 4,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Templates de Mensagem</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Textos prontos para cada etapa do funil — copie com 1 clique
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {templates.length === 0 && !loading && (
            <button
              onClick={handleSeedDefaults}
              disabled={saving}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)",
                background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 12,
                color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Carregar exemplos
            </button>
          )}
          <button
            onClick={() => { setCreating(true); setEditingId(null); setForm({ title: "", stage: "geral", body: "" }); }}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "none",
              background: "#639922", color: "#fff", cursor: "pointer", fontSize: 12,
              display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
            }}
          >
            <Plus size={14} /> Novo template
          </button>
        </div>
      </div>

      {/* Stage filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterStage("")}
          style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 500,
            border: "1px solid",
            background: filterStage === "" ? "#639922" : "transparent",
            borderColor: filterStage === "" ? "#639922" : "var(--color-border-tertiary)",
            color: filterStage === "" ? "#fff" : "var(--color-text-secondary)",
          }}
        >Todos</button>
        {STAGES.map(([stage, label]) => {
          const c = STAGE_COLORS[stage];
          const active = filterStage === stage;
          return (
            <button key={stage} onClick={() => setFilterStage(stage)}
              style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 500,
                border: "1px solid",
                background: active ? c.color : "transparent",
                borderColor: active ? c.color : "var(--color-border-tertiary)",
                color: active ? "#fff" : "var(--color-text-secondary)",
              }}
            >{label}</button>
          );
        })}
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Novo template</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={labelStyle}>Título</label>
              <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Follow-up 3 dias" />
            </div>
            <div>
              <label style={labelStyle}>Etapa do funil</label>
              <select style={inputStyle} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as TemplateFunnelStage }))}>
                {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Mensagem <span style={{ fontWeight: 400, color: "var(--color-text-secondary)", textTransform: "none" }}>— use [Nome], [DATA], [LINK] para variáveis</span></label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "inherit" }}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Olá, [Nome]! ..."
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setCreating(false)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", fontSize: 12 }}>
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.body.trim()}
              style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#639922", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
              <Save size={13} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Templates list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-secondary)" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-secondary)" }}>
          <MessageSquare size={32} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
          <div style={{ fontSize: 14 }}>Nenhum template encontrado</div>
          {templates.length === 0 && (
            <div style={{ fontSize: 12, marginTop: 4 }}>Clique em "Carregar exemplos" para começar com templates prontos</div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              background: "var(--color-background-primary)",
              border: editingId === t.id ? "1.5px solid #639922" : "0.5px solid var(--color-border-tertiary)",
              borderRadius: 12, padding: 14, transition: "border-color .15s",
            }}>
              {editingId === t.id ? (
                /* Edit form inline */
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>Título</label>
                      <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Etapa</label>
                      <select style={inputStyle} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as TemplateFunnelStage }))}>
                        {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Mensagem</label>
                    <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
                      value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setEditingId(null)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", fontSize: 12 }}>
                      Cancelar
                    </button>
                    <button onClick={() => handleUpdate(t.id)} disabled={saving}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#639922", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5, fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
                      <Save size={12} /> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</span>
                      <StageChip stage={t.stage} />
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => handleCopy(t.body, t.id)}
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--color-border-tertiary)", background: copiedId === t.id ? "#EAF3DE" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copiedId === t.id ? "#3B6D11" : "var(--color-text-secondary)" }}
                        title="Copiar mensagem">
                        {copiedId === t.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                      <button onClick={() => startEdit(t)}
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}
                        title="Editar">
                        <Edit2 size={13} />
                      </button>
                      {deleteConfirm === t.id ? (
                        <div style={{ display: "flex", gap: 3 }}>
                          <button onClick={() => handleDelete(t.id)}
                            style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#E24B4A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                            title="Confirmar exclusão">
                            <Trash2 size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(t.id)}
                          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}
                          title="Excluir">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 10px" }}>
                    {t.body}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
