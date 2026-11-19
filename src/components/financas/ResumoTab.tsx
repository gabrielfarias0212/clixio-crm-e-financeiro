import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { marcarFatura, type Categoria, type Lanc } from "@/lib/financas/api";
import { LinhasLancamentos } from "./LinhasLancamentos";
import { GraficosResumo } from "./GraficosResumo";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ResumoTab({ lancs, faturas, categorias, onMudou }: { lancs: Lanc[]; faturas: any[]; categorias: Categoria[]; onMudou: () => void }) {
  const [mes, setMes] = useState("todos");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const alternar = (id: string) => setAbertas((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const porFatura = useMemo(() => { const m = new Map<string, Lanc[]>(); for (const l of lancs) if (l.fatura_id) (m.get(l.fatura_id) ?? m.set(l.fatura_id, []).get(l.fatura_id)!).push(l); return m; }, [lancs]);
  const meses = useMemo(() => [...new Set(lancs.map((l) => l.data.slice(0, 7)))].sort().reverse(), [lancs]);

  const q = useMemo(() => {
    const r = { PF_PF: 0, PJ_PJ: 0, PJ_PF: 0, PF_PJ: 0 };
    for (const l of lancs) {
      if (l.status !== "realizado" || (l.tipo !== "saida" && l.tipo !== "estorno")) continue;
      if (mes !== "todos" && l.data.slice(0, 7) !== mes) continue;
      const v = l.tipo === "estorno" ? -l.valor : l.valor;
      (r as any)[`${l.pagador}_${l.pertence_a}`] += v;
    }
    return r;
  }, [lancs, mes]);

  async function pagar(f: any) {
    const hoje = new Date().toISOString().slice(0, 10);
    try { await marcarFatura(f.id, "paga", hoje, f.valor_total); toast.success("Fatura marcada como paga."); onMudou(); }
    catch (e: any) { toast.error(e.message); }
  }
  const hoje = new Date().toISOString().slice(0, 10);

  const Q = ({ t, v, d, alerta }: { t: string; v: number; d: string; alerta?: boolean }) => (
    <Card className={alerta ? "border-amber-400" : ""}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{t}</div><div className="text-xl font-semibold">{brl(v)}</div><div className="text-xs text-muted-foreground">{d}</div></CardContent></Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <span>Período:</span>
        <select className="rounded-md border px-2 py-1" value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="todos">Tudo</option>{meses.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Q t="PF pagou · é PF" v={q.PF_PF} d="gasto pessoal, saiu do pessoal" />
        <Q t="PJ pagou · é PJ" v={q.PJ_PJ} d="gasto da empresa, saiu da empresa" />
        <Q alerta t="PJ pagou · é PF" v={q.PJ_PF} d="retirada implícita: gasto pessoal pago pela empresa" />
        <Q alerta t="PF pagou · é PJ" v={q.PF_PJ} d="a receber da empresa (reembolso)" />
      </div>
      <p className="text-xs text-muted-foreground">Tudo que ainda não foi triado conta como "pago por quem pagou". Classifique na aba Triagem para os quadrantes ficarem corretos.</p>

      <GraficosResumo lancs={lancs} categorias={categorias} mes={mes} />

      <Card>
        <CardHeader><CardTitle className="text-base">Faturas</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {faturas.length === 0 && <div className="text-sm text-muted-foreground">Nenhuma fatura importada.</div>}
          {faturas.map((f) => {
            const vencida = f.status !== "paga" && f.vencimento && f.vencimento < hoje && f.status !== "aberta";
            return (
              <div key={f.id} className="border-b pb-2 text-sm last:border-0">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="flex min-w-[170px] items-center gap-1 text-left font-medium" onClick={() => alternar(f.id)}>
                    {abertas.has(f.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {f.fin_fontes?.nome} · {f.competencia.slice(0, 7)}
                  </button>
                  <div>{brl(Number(f.valor_total))}</div>
                  <div className="text-xs text-muted-foreground">vence {f.vencimento?.split("-").reverse().join("/")} · {(porFatura.get(f.id) ?? []).length} lançamentos</div>
                  <Badge variant={vencida ? "destructive" : f.status === "paga" ? "secondary" : "outline"}>{vencida ? "vencida" : f.status}</Badge>
                  {f.status !== "paga" && f.status !== "aberta" && <Button size="sm" variant="outline" onClick={() => pagar(f)}>Marcar como paga hoje</Button>}
                </div>
                {abertas.has(f.id) && <div className="mt-2 rounded-md border px-3"><LinhasLancamentos lancs={porFatura.get(f.id) ?? []} categorias={categorias} onMudou={onMudou} /></div>}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
