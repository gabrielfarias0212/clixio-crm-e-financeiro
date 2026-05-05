import { useState, useEffect } from "react";
import { Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanySettings, saveCompanySettings, CompanySettings } from "@/utils/supabase/settings";

const EMPTY: CompanySettings = {
  company_name: "",
  cnpj: "",
  phone: "",
  city: "",
  email: "",
};

export function CompanyDataTab() {
  const { toast } = useToast();
  const [form, setForm] = useState<CompanySettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanySettings()
      .then(d => { if (d) setForm(d); })
      .catch(e => toast({ title: "Erro ao carregar dados", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    try {
      await saveCompanySettings(form);
      toast({ title: "Dados salvos com sucesso" });
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
        <h2 className="text-base font-semibold text-stone-800">Dados da Empresa</h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Informações que aparecem nos relatórios e documentos gerados.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className="text-xs text-stone-500 mb-1.5 block">Nome da empresa / marca</Label>
          <Input
            placeholder="Ex: Gabriel Farias Fotografia"
            value={form.company_name ?? ""}
            onChange={set("company_name")}
          />
        </div>

        <div>
          <Label className="text-xs text-stone-500 mb-1.5 block">CNPJ</Label>
          <Input
            placeholder="00.000.000/0000-00"
            value={form.cnpj ?? ""}
            onChange={set("cnpj")}
          />
        </div>

        <div>
          <Label className="text-xs text-stone-500 mb-1.5 block">Telefone / WhatsApp</Label>
          <Input
            placeholder="(00) 00000-0000"
            value={form.phone ?? ""}
            onChange={set("phone")}
          />
        </div>

        <div>
          <Label className="text-xs text-stone-500 mb-1.5 block">Cidade</Label>
          <Input
            placeholder="Ex: São Paulo, SP"
            value={form.city ?? ""}
            onChange={set("city")}
          />
        </div>

        <div>
          <Label className="text-xs text-stone-500 mb-1.5 block">E-mail de contato</Label>
          <Input
            type="email"
            placeholder="contato@empresa.com"
            value={form.email ?? ""}
            onChange={set("email")}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={14} />
          {saving ? "Salvando..." : "Salvar dados"}
        </Button>
      </div>
    </div>
  );
}
