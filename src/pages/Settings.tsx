import { useState } from "react";
import { Settings2, DollarSign, Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyCostsTab } from "@/components/settings/CompanyCostsTab";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
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
          <TabsList className="mb-6 bg-stone-100 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="costs"
              className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <DollarSign size={13} />
              Custos Padrão
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className="flex items-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              disabled
            >
              <Building2 size={13} />
              Empresa
              <span className="ml-1 text-[10px] bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded-full">Em breve</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="costs">
            <CompanyCostsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
