import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Fonte, Lanc } from "@/lib/financas/api";
import { addMes, nomeMes } from "@/lib/financas/periodo";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const hojeMes = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

// Gasto do mês aberto em conta e cartão, para empresa (PJ) e pessoal (PF).
// Cartão conta no mês da fatura; conta, no mês da data. Pagamento de fatura e transferência ficam fora.
export function ResumoDoMes({ lancs, fontes, faturas }: { lancs: Lanc[]; fontes: Fonte[]; faturas: any[] }) {
  const agora = hojeMes();
  const [mes, setMes] = useState(agora);
  const tipoFonte = useMemo(() => new Map(fontes.map((f) => [f.id, f.tipo])), [fontes]);
  const comp = useMemo(() => new Map<string, string>(faturas.map((f) => [f.id, String(f.competencia).slice(0, 7)])), [faturas]);
  const t = useMemo(() => {
    const r = { PJ: { conta: 0, cartao: 0 }, PF: { conta: 0, cartao: 0 } };
    for (const l of lancs) {
      if (l.status !== "realizado" || (l.tipo !== "saida" && l.tipo !== "estorno")) continue;
      const k = (l.fatura_id && comp.get(l.fatura_id)) || l.data.slice(0, 7);
      if (k !== mes) continue;
      const lado = tipoFonte.get(l.fonte_id) === "cartao" ? "cartao" : "conta";
      r[l.pertence_a === "PJ" ? "PJ" : "PF"][lado] += l.tipo === "estorno" ? -l.valor : l.valor;
    }
    return r;
  }, [lancs, comp, tipoFonte, mes]);

  const bloco = (titulo: string, cor: string, v: { conta: number; cartao: number }, nota?: string) => (
    <Card style={{ borderTop: `3px solid ${cor}` }}><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{titulo}</div>
      <div className="text-2xl font-semibold tabular-nums">{brl(v.conta + v.cartao)}</div>
      <div className="mt-1 text-sm text-muted-foreground">conta {brl(v.conta)} · cartão {brl(v.cartao)}</div>
      {nota && <div className="mt-1 text-xs text-muted-foreground">{nota}</div>}
    </CardContent></Card>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Gastos do mês</span>
        <div className="flex items-center rounded-md border">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMes(addMes(mes, -1))} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-[72px] px-2 text-center text-sm font-medium">{nomeMes(mes)}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={mes >= agora} onClick={() => setMes(addMes(mes, 1))} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {bloco("Empresa (PJ)", "#eb6834", t.PJ, mes === agora ? "É o valor de despesas que aparece no Dashboard." : undefined)}
        {bloco("Pessoal (PF)", "#2a78d6", t.PF)}
      </div>
    </div>
  );
}
