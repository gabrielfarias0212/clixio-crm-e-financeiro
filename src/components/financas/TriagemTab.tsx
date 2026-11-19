import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { criarCategoria, salvarRegra, type Categoria, type Lanc } from "@/lib/financas/api";
import { chaveDestino } from "@/lib/financas/importar";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Grupo { chave: string; nome: string; ids: string[]; total: number; qtd: number; pendentes: number; pagadores: Set<string> }

export function TriagemTab({ lancs, categorias, onMudou }: { lancs: Lanc[]; categorias: Categoria[]; onMudou: () => void }) {
  const [todos, setTodos] = useState(false);
  const [cat, setCat] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  const grupos = useMemo(() => {
    const m = new Map<string, Grupo>();
    for (const l of lancs) {
      if (l.status !== "realizado" || (l.tipo !== "saida" && l.tipo !== "estorno")) continue;
      const k = chaveDestino(l.descricao);
      if (!k) continue;
      const g = m.get(k) ?? { chave: k, nome: l.descricao, ids: [], total: 0, qtd: 0, pendentes: 0, pagadores: new Set() };
      g.ids.push(l.id); g.qtd++; g.total += l.tipo === "estorno" ? -l.valor : l.valor; g.pagadores.add(l.pagador);
      if (!l.categoria_id) g.pendentes++;
      m.set(k, g);
    }
    return [...m.values()].filter((g) => todos || g.pendentes > 0).sort((a, b) => b.total - a.total);
  }, [lancs, todos]);

  async function aplicar(g: Grupo, pertence: "PF" | "PJ") {
    setSalvando(g.chave);
    try {
      await salvarRegra(g.chave, cat[g.chave] || null, pertence, g.ids);
      toast.success(`${g.qtd} lançamentos de "${g.nome}" marcados como ${pertence}. Regra salva.`);
      onMudou();
    } catch (e: any) { toast.error("Erro: " + (e.message ?? e)); } finally { setSalvando(null); }
  }

  const [novaCat, setNovaCat] = useState("");
  async function addCat() {
    const n = novaCat.trim();
    if (!n) return;
    try { await criarCategoria(n, "variavel"); setNovaCat(""); toast.success(`Categoria "${n}" criada`); onMudou(); }
    catch (e: any) { toast.error("Erro: " + (e.message ?? e)); }
  }

  const pend = grupos.reduce((s, g) => s + (g.pendentes > 0 ? 1 : 0), 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{pend} destinos aguardando decisão, do maior valor para o menor. Cada escolha vira regra e vale para o passado e para as próximas importações.</div>
        <Button variant="outline" size="sm" onClick={() => setTodos(!todos)}>{todos ? "Só pendentes" : "Mostrar todos"}</Button>
      </div>
      <div className="flex items-center gap-2">
        <Input className="max-w-xs" value={novaCat} onChange={(e) => setNovaCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} placeholder="Nova categoria (ex.: Insumos fotográficos)" />
        <Button variant="outline" size="sm" onClick={addCat}>Criar categoria</Button>
      </div>
      {grupos.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">Nada pendente. Importe um arquivo na aba Importar.</CardContent></Card>}
      {grupos.map((g) => (
        <Card key={g.chave}>
          <CardContent className="flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-[200px] flex-1">
              <div className="text-sm font-medium">{g.nome}</div>
              <div className="text-xs text-muted-foreground">{g.qtd} lançamentos · {brl(g.total)} · pago por {[...g.pagadores].join("/")}{g.pendentes === 0 && <Badge className="ml-2" variant="secondary">classificado</Badge>}</div>
            </div>
            <Select value={cat[g.chave] ?? ""} onValueChange={(v) => setCat({ ...cat, [g.chave]: v })}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>{categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" disabled={salvando === g.chave} onClick={() => aplicar(g, "PF")}>É pessoal (PF)</Button>
            <Button size="sm" variant="secondary" disabled={salvando === g.chave} onClick={() => aplicar(g, "PJ")}>É da empresa (PJ)</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
