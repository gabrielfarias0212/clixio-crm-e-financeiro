import { Settings2, DollarSign, Building2, Target, Clock, Package } from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyCostsTab } from "@/components/settings/CompanyCostsTab";
import { CompanyDataTab } from "@/components/settings/CompanyDataTab";
import { FinancialGoalsTab } from "@/components/settings/FinancialGoalsTab";
import { DeadlinesTab } from "@/components/settings/DeadlinesTab";
import { PackagesTab } from "@/components/settings/PackagesTab";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
            <Settings2 size={18} className="text-stone-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Configurações</h1>
            <p className="text-sm text-stone-400">Personalize o funcionamento do sistema para sua empresa</p>
          </div>
        </div>

        <Tabs defaultValue="costs">
          <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger value="costs" className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <DollarSign size={13} /> Custos Padrão
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Package size={13} /> Pacotes
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock size={13} /> Prazos
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Target size={13} /> Metas
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 size={13} /> Empresa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="costs"><CompanyCostsTab /></TabsContent>
          <TabsContent value="packages"><PackagesTab /></TabsContent>
          <TabsContent value="deadlines"><DeadlinesTab /></TabsContent>
          <TabsContent value="goals"><FinancialGoalsTab /></TabsContent>
          <TabsContent value="company"><CompanyDataTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
