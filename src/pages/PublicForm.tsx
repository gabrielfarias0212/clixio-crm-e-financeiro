import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FormInstance, FormQuestion } from "@/utils/types";
import { fetchInstanceByToken, submitFormResponse } from "@/utils/forms";
import { CheckCircle2, Camera } from "lucide-react";

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
  danger:    "#E05252",
};

type Answers = Record<string, string | string[] | boolean | number>;

// ── Question renderers ─────────────────────────────────────────────────────────

function QuestionBlock({
  q,
  idx,
  value,
  onChange,
  error,
}: {
  q: FormQuestion;
  idx: number;
  value: Answers[string] | undefined;
  onChange: (v: Answers[string]) => void;
  error: boolean;
}) {
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 12,
      border: `1px solid ${error ? C.danger : C.border}`,
      padding: "16px 18px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
          {idx + 1}. {q.question}
        </span>
        {q.required && (
          <span style={{ color: C.danger, marginLeft: 3, fontSize: 14 }}>*</span>
        )}
      </div>

      {q.type === "text" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder="Sua resposta..."
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.itemBg,
            fontSize: 14, color: C.text, resize: "vertical", boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      )}

      {q.type === "multiple" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(q.options ?? []).map((opt, i) => {
            const selected = (value as string) === opt;
            return (
              <label
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${selected ? C.navy : C.border}`,
                  background: selected ? C.navyBg : C.itemBg,
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${selected ? C.navy : C.border}`,
                  background: selected ? C.navy : "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF" }} />}
                </div>
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={selected}
                  onChange={() => onChange(opt)}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: 14, color: selected ? C.navy : C.text, fontWeight: selected ? 600 : 400 }}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === "boolean" && (
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Sim", val: true },
            { label: "Não", val: false },
          ].map(({ label, val }) => {
            const selected = value === val;
            return (
              <button
                key={label}
                onClick={() => onChange(val)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${selected ? C.navy : C.border}`,
                  background: selected ? C.navyBg : C.itemBg,
                  fontSize: 14, fontWeight: selected ? 700 : 400,
                  color: selected ? C.navy : C.text,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "scale" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[1, 2, 3, 4, 5].map(n => {
              const selected = value === n;
              return (
                <button
                  key={n}
                  onClick={() => onChange(n)}
                  style={{
                    width: 48, height: 48, borderRadius: 8, cursor: "pointer",
                    border: `2px solid ${selected ? C.navy : C.border}`,
                    background: selected ? C.navy : C.itemBg,
                    fontSize: 16, fontWeight: 700,
                    color: selected ? "#FFFFFF" : C.text,
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textSub, padding: "0 4px" }}>
            <span>Péssimo</span>
            <span>Excelente</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: C.danger, marginTop: 8 }}>
          Por favor, responda esta pergunta.
        </div>
      )}
    </div>
  );
}

// ── PublicFormPage ─────────────────────────────────────────────────────────────

export default function PublicFormPage() {
  const { token } = useParams<{ token: string }>();

  const [instance, setInstance] = useState<FormInstance | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not_found" | "already_submitted" | "submitted" | "error">("loading");
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("not_found"); return; }
    fetchInstanceByToken(token).then(inst => {
      if (!inst) { setStatus("not_found"); return; }
      if (inst.status === "submitted") { setStatus("already_submitted"); return; }
      if (inst.status === "expired") { setStatus("not_found"); return; }
      setInstance(inst);
      setStatus("found");
    }).catch(() => setStatus("error"));
  }, [token]);

  const setAnswer = (qId: string, val: Answers[string]) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setErrors(prev => ({ ...prev, [qId]: false }));
  };

  const handleSubmit = async () => {
    if (!instance) return;
    const newErrors: Record<string, boolean> = {};
    instance.questions.forEach(q => {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === "" || val === null) {
          newErrors[q.id] = true;
        }
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    try {
      await submitFormResponse(instance.id, answers);
      setStatus("submitted");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ──────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.itemBg }}>
        <div style={{ fontSize: 14, color: C.textSub }}>Carregando formulário...</div>
      </div>
    );
  }

  if (status === "not_found" || status === "error") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.itemBg, padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Formulário não encontrado</div>
          <div style={{ fontSize: 14, color: C.textSub }}>
            Este link pode ter expirado ou não existe. Entre em contato com seu fotógrafo para solicitar um novo link.
          </div>
        </div>
      </div>
    );
  }

  if (status === "already_submitted") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.itemBg, padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <CheckCircle2 style={{ width: 48, height: 48, color: C.success, margin: "0 auto 16px" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Formulário já respondido</div>
          <div style={{ fontSize: 14, color: C.textSub }}>
            Suas respostas já foram registradas. Obrigado!
          </div>
        </div>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.itemBg, padding: 20 }}>
        <div style={{
          background: "#FFFFFF", borderRadius: 16, padding: "40px 32px",
          textAlign: "center", maxWidth: 400, width: "100%",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        }}>
          <CheckCircle2 style={{ width: 48, height: 48, color: C.success, margin: "0 auto 16px" }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 10 }}>
            Respostas enviadas!
          </div>
          <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.6 }}>
            Obrigado por responder. Suas respostas foram registradas e em breve entraremos em contato.
          </div>
          <div style={{
            marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12, color: C.textSub,
          }}>
            <Camera style={{ width: 14, height: 14 }} />
            Powered by Clixio CRM
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: C.itemBg, padding: "32px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header card */}
        <div style={{
          background: "#FFFFFF", borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: "24px 24px 20px",
          borderTop: `4px solid ${C.navy}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Camera style={{ width: 18, height: 18, color: C.navy }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Questionário
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
            {instance!.title}
          </h1>
          <div style={{ fontSize: 13, color: C.textSub }}>
            {instance!.questions.filter(q => q.required).length > 0 && (
              <>Campos marcados com <span style={{ color: C.danger }}>*</span> são obrigatórios.</>
            )}
          </div>
        </div>

        {/* Questions */}
        {instance!.questions.map((q, idx) => (
          <QuestionBlock
            key={q.id}
            q={q}
            idx={idx}
            value={answers[q.id]}
            onChange={val => setAnswer(q.id, val)}
            error={!!errors[q.id]}
          />
        ))}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: "14px", borderRadius: 10, border: "none",
            background: submitting ? C.border : C.navy,
            fontSize: 15, fontWeight: 700, color: "#FFFFFF",
            cursor: submitting ? "default" : "pointer",
            boxShadow: submitting ? "none" : "0 4px 12px rgba(30,58,95,0.25)",
          }}
        >
          {submitting ? "Enviando..." : "Enviar respostas"}
        </button>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 11, color: C.textSub, paddingBottom: 16 }}>
          <Camera style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
          Powered by Clixio CRM
        </div>
      </div>
    </div>
  );
}
