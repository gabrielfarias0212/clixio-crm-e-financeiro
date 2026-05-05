import { useState, useEffect } from "react";
import { Save, Target, TrendingUp, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanySettings, saveCompanySettings } from "@/utils/supabase/settings";

interface GoalForm {
  monthly_revenue_goal: string;
  annual_revenue_goal:  string;
  monthly_events_goal:  string;
}

const EMPTY: GoalForm = {
  monthly_revenue_goal: "",
  annual_revenue_goal:  "",
  monthly_events_goal:  "",
};

export function FinancialGoalsTab() {
  const { toast } = useToast();
  const [form, setForm] = useState<GoalForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanySettings()
      .then(d => {
        if (d) setForm({
          monthly_revenue_goal: d.monthly_revenue_goal != null ? String(d.monthly_revenue_goal) : "",
          annual_revenue_goal:  d.annual_revenue_goal  != null ? String(d.annual_revenue_goal)  : "",
          monthly_events_goal:  d.monthly_events_goal  != null ? String(d.monthly_events_goal)  : "",
        });
      })
      .catch(e => toast({ title: "Erro ao carregar metas", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof GoalForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    const monthly = parseFloat(form.monthly_revenue_goal.replace(",", ".")) || null;
    const annual  = parseFloat(form.annual_revenue_goal.replace(",", "."))  || null;
    const events  = parseInt(form.monthly_events_goal) || null;

    setSaving(true);
    try {
      await saveCompanySettings({
        monthly_revenue_goal: monthly as any,
        annual_revenue_goal:  annual  as any,
        monthly_events_goal:  events  as any,
      });
      toast({ title: "Metas salvas com sucesso" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-stone-400 py-8 text-center">Carregando...</div>;

  const monthlyNum = parseFloat(form.monthly_revenue_goal.replace(",", ".")) || 0;
  const annualNum  = parseFloat(form.annual_revenue_goal.replace(",", "."))  || 0;
  const suggestedAnnual = monthlyNum > 0 ? monthlyNum * 12 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-stone-800">Metas Financeiras</h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Defina suas metas e acompanhe o progresso no painel financeiro.
        </p>
      </div>

      <div className="space-y-5">
        {/* Meta mensal */}
        <div className="border border-stone-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={14} className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-stone-700">Receita Mensal Desejada</p>
          </div>
          <div>
            <Label className="text-xs text-stone-500 mb-1.5 block">Valor (R$)</Label>
            <Input
              placeholder="Ex: 8000"
              value={form.monthly_revenue_goal}
              onChange={set("monthly_revenue_goal")}
              className="max-w-xs"
            />
          </div>
          {monthlyNum > 0 && (
            <p className="text-xs text-stone-400">
              Equivale a R$ {(monthlyNum * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} por ano
            </p>
          )}
        </div>

        {/* Meta anual */}
        <div className="border border-stone-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target size={14} className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-stone-700">Receita Anual Desejada</p>
          </div>
          <div>
            <Label className="text-xs text-stone-500 mb-1.5 block">Valor (R$)</Label>
            <Input
              placeholder={suggestedAnnual > 0 ? `Sugerido: ${suggestedAnnual.toLocaleString("pt-BR")}` : "Ex: 96000"}
              value={form.annual_revenue_goal}
              onChange={set("annual_revenue_goal")}
              className="max-w-xs"
            />
          </div>
          {suggestedAnnual > 0 && !annualNum && (
            <button
              className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
              onClick={() => setForm(f => ({ ...f, annual_revenue_goal: String(suggestedAnnual) }))}
            >
              Usar valor sugerido (meta mensal × 12)
            </button>
          )}
        </div>

        {/* Meta de eventos */}
        <div className="border border-stone-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <CalendarDays size={14} className="text-purple-600" />
            </div>
            <p className="text-sm font-medium text-stone-700">Eventos por Mês</p>
          </div>
          <div>
            <Label className="text-xs text-stone-500 mb-1.5 block">Quantidade desejada</Label>
            <Input
              type="number"
              min={1}
              placeholder="Ex: 4"
              value={form.monthly_events_goal}
              onChange={set("monthly_events_goal")}
              className="max-w-xs"
            />
          </div>
          <p className="text-xs text-stone-400">
            Aparecerá no painel como indicador de ocupação mensal.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={14} />
          {saving ? "Salvando..." : "Salvar metas"}
        </Button>
      </div>
    </div>
  );
}
