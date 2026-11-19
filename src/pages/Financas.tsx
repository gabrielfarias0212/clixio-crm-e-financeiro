import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ImportarTab } from "@/components/financas/ImportarTab";
import { TriagemTab } from "@/components/financas/TriagemTab";
import { ResumoTab } from "@/components/financas/ResumoTab";
import { ManualTab } from "@/components/financas/ManualTab";
import { listarCategorias, listarFaturas, listarLancamentos, type Categoria, type Lanc } from "@/lib/financas/api";

export const FINANCAS_FLAG = "clixio_financas";

export default function Financas() {
  const [lancs, setLancs] = useState<Lanc[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [faturas, setFaturas] = useState<any[]>([]);
  const [aba, setAba] = useState("importar");

  const carregar = useCallback(async () => {
    try {
      const [l, c, f] = await Promise.all([listarLancamentos(), listarCategorias(), listarFaturas()]);
      setLancs(l); setCats(c); setFaturas(f);
    } catch (e: any) { toast.error("Erro ao carregar Finanças: " + (e.message ?? e)); }
  }, []);

  useEffect(() => { try { localStorage.setItem(FINANCAS_FLAG, "1"); } catch { /* sem storage */ } carregar(); }, [carregar]);

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Finanças</h1>
          <p className="text-sm text-muted-foreground">Contas e cartões, pessoal e empresa. Separado do Financeiro (que cuida das entradas de clientes).</p>
        </div>
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList>
            <TabsTrigger value="importar">Importar</TabsTrigger>
            <TabsTrigger value="triagem">Triagem</TabsTrigger>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="importar"><ImportarTab onImportado={() => { carregar(); setAba("triagem"); }} /></TabsContent>
          <TabsContent value="triagem"><TriagemTab lancs={lancs} categorias={cats} onMudou={carregar} /></TabsContent>
          <TabsContent value="resumo"><ResumoTab lancs={lancs} faturas={faturas} categorias={cats} onMudou={carregar} /></TabsContent>
          <TabsContent value="manual"><ManualTab categorias={cats} onMudou={carregar} /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
