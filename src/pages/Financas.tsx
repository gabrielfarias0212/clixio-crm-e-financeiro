import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImportarTab } from "@/components/financas/ImportarTab";
import { TriagemTab } from "@/components/financas/TriagemTab";
import { ContasTab } from "@/components/financas/ContasTab";
import { ResumoTab } from "@/components/financas/ResumoTab";
import { ConciliacaoTab } from "@/components/financas/ConciliacaoTab";
import { ManualTab } from "@/components/financas/ManualTab";
import { listarCategorias, listarFaturas, listarFontes, listarLancamentos, type Categoria, type Fonte, type Lanc } from "@/lib/financas/api";

export const FINANCAS_FLAG = "clixio_financas";

export default function Financas() {
  const [lancs, setLancs] = useState<Lanc[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [faturas, setFaturas] = useState<any[]>([]);
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [aba, setAba] = useState("resumo");
  const [importando, setImportando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [l, c, f, fo] = await Promise.all([listarLancamentos(), listarCategorias(), listarFaturas(), listarFontes()]);
      setLancs(l); setCats(c); setFaturas(f); setFontes(fo);
      return l;
    } catch (e: any) { toast.error("Erro ao carregar Finanças: " + (e.message ?? e)); return null; }
  }, []);

  const pendConc = lancs.filter((l) => l.status === "realizado" && ((l.tipo === "entrada" && !l.conciliado && l.clixio_match_status !== "rejeitado") || (l.tipo === "pagamento_fatura" && !l.conciliado))).length;

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
            <TabsTrigger value="resumo">Cartões</TabsTrigger>
            <TabsTrigger value="contas">Contas</TabsTrigger>
            <TabsTrigger value="triagem">Triagem</TabsTrigger>
            <TabsTrigger value="conciliacao">Conciliação{pendConc > 0 ? ` (${pendConc})` : ""}</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="triagem"><TriagemTab lancs={lancs} categorias={cats} onMudou={carregar} /></TabsContent>
          <TabsContent value="resumo"><ResumoTab fontes={fontes} lancs={lancs} faturas={faturas} categorias={cats} onMudou={carregar} onImportar={() => setImportando(true)} onTriagem={() => setAba("triagem")} pendConc={pendConc} onConciliar={() => setAba("conciliacao")} /></TabsContent>
          <TabsContent value="contas"><ContasTab lancs={lancs} fontes={fontes} categorias={cats} onMudou={carregar} onImportar={() => setImportando(true)} /></TabsContent>
          <TabsContent value="conciliacao"><ConciliacaoTab lancs={lancs} faturas={faturas} onMudou={carregar} /></TabsContent>
          <TabsContent value="manual"><ManualTab categorias={cats} onMudou={carregar} /></TabsContent>
        </Tabs>
        <Dialog open={importando} onOpenChange={setImportando}>
          <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
            <DialogHeader><DialogTitle>Importar extrato ou fatura</DialogTitle></DialogHeader>
            <ImportarTab onImportado={async () => { const l = await carregar(); setImportando(false); const conc = (l ?? []).some((x) => x.status === "realizado" && ((x.tipo === "entrada" && !x.conciliado && x.clixio_match_status !== "rejeitado") || (x.tipo === "pagamento_fatura" && !x.conciliado))); setAba(conc ? "conciliacao" : "triagem"); }} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
