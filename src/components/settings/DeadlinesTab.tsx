import { useState, useEffect } from "react";
import { Save, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanySettings, saveCompanySettings } from "@/utils/supabase/settings";

interface DeadlineForm {
  deadline_editing:           string;
  deadline_digital_delivery:  string;
  deadline_physical_delivery: string;
  deadline_album:             string;
  deadline_pre_wedding:       string;
  pre_wedding_reminder_days:  string;
}

const EMPTY: DeadlineForm = {
  deadline_editing:           "",
  deadline_digital_delivery:  "",
  deadline_physical_delivery: "",
  deadline_album:             "",
  deadline_pre_wedding:       "",
  pre_wedding_reminder_days:  "",
};

const FIELDS: { key: keyof DeadlineForm; label: string; hint: string }[] = [
  { key: "deadline_editing",           label: "Edição de fotos",         hint: "Dias após a data do evento" },
  { key: "deadline_digital_delivery",  label: "Entrega digital (link)",  hint: "Dias após concluir a edição" },
  { key: "deadline_physical_delivery", label: "Entrega física (box)",    hint: "Dias após aprovação do álbum" },
  { key: "deadline_album",             label: "Pedido de álbum",         hint: "Dias após entrega digital" },
  { key: "deadline_pre_wedding",       label: "Edição do pré-wedding",   hint: "Dias após a data do ensaio" },
  { key: "pre_wedding_reminder_days",  label: "Lembrete de ensaio pré",  hint: "Dias antes do evento para alertar sobre ensaios não agendados (padrão: 90)" },
];

export function DeadlinesTab() {
  const { toast } = useToast();
  const [form, setForm] = useState<DeadlineForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanySettings()
      .then(d => {
        if (d) setForm({
          deadline_editing:           d.deadline_editing           != null ? String(d.deadline_editing)           : "",
          deadline_digital_delivery:  d.deadline_digital_delivery  != null ? String(d.deadline_digital_delivery)  : "",
          deadline_physical_delivery: d.deadline_physical_delivery != null ? String(d.deadline_physical_delivery) : "",
          deadline_album:             d.deadline_album             != null ? String(d.deadline_album)             : "",
          deadline_pre_wedding:       d.deadline_pre_wedding       != null ? String(d.deadline_pre_wedding)       : "",
          pre_wedding_reminder_days:  d.pre_wedding_reminder_days  != null ? String(d.pre_wedding_reminder_days)  : "",
        });
      })
      .catch(e => toast({ title: "Erro ao carregar prazos", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof DeadlineForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    try {
      await saveCompanySettings({
        deadline_editing:           parseInt(form.deadline_editing)           || (null as any),
        deadline_digital_delivery:  parseInt(form.deadline_digital_delivery)  || (null as any),
        deadline_physical_delivery: parseInt(form.deadline_physical_delivery) || (null as any),
        deadline_album:             parseInt(form.deadline_album)             || (null as any),
        deadline_pre_wedding:       parseInt(form.deadline_pre_wedding)       || (null as any),
        pre_wedding_reminder_days:  parseInt(form.pre_wedding_reminder_days)  || (null as any),
      });
      toast({ title: "Prazos salvos com sucesso" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-stone-400 py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-stone-800">Prazos Padrão</h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Defina os prazos da sua empresa para cada etapa do projeto. Serão usados para alertas no Fluxo de Trabalho.
        </p>
      </div>

      <div className="space-y-3">
        {FIELDS.map(({ key, label, hint }) => (
          <div key={key} className="border border-stone-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center flex-shrink-0">
              <Clock size={15} className="text-stone-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-700">{label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{hint}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                placeholder="—"
                value={form[key]}
                onChange={set(key)}
                className="w-20 text-center"
              />
              <span className="text-xs text-stone-400 whitespace-nowrap">dias</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
        <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600">
          Deixe em branco os prazos que não se aplicam ao seu fluxo. Os alertas no Workflow serão calculados automaticamente a partir da data do evento.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={14} />
          {saving ? "Salvando..." : "Salvar prazos"}
        </Button>
      </div>
    </div>
  );
}
