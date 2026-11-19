import { Fragment, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Categoria, Lanc } from "@/lib/financas/api";
import { LinhasLancamentos } from "./LinhasLancamentos";

// Meses em ordem do tempo: azul claro → escuro (sequencial; o mais recente é o mais escuro).
const RAMPA = ["#8fb8ea", "#6aa5e8", "#2a78d6", "#1f62b5", "#174b8c", "#103560"];
const MAX_MESES = 6;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const nomeMes = (m: string) => `${MESES[+m.slice(5, 7) - 1]}/${m.slice(2, 4)}`;
const SEM = "Sem categoria";

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p: any) => <div key={p.dataKey} className="flex justify-between gap-4"><span>{p.name}</span><span className="tabular-nums">{brl0(p.value)}</span></div>)}
    </div>
  );
}

export function CategoriasTab({ lancs, categorias, onMudou }: { lancs: Lanc[]; categorias: Categoria[]; onMudou: () => void }) {
  const [dono, setDono] = useState<"todos" | "PF" | "PJ">("todos");
  const [sel, setSel] = useState<string[] | null>(null);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  // Gasto = saída e estorno de qualquer fonte. Pagamento de fatura e transferência ficam fora (não são gasto novo).
  const gastos = useMemo(() => lancs.filter((l) => l.status === "realizado" && (l.tipo === "saida" || l.tipo === "estorno") && (dono === "todos" || l.pertence_a === dono)), [lancs, dono]);
  const mesesDisp = useMemo(() => [...new Set(lancs.filter((l) => l.status === "realizado" && (l.tipo === "saida" || l.tipo === "estorno")).map((l) => l.data.slice(0, 7)))].sort().reverse(), [lancs]);
  const meses = useMemo(() => (sel ?? mesesDisp.slice(0, 3)).slice().sort(), [sel, mesesDisp]);
  const catNome = useMemo(() => new Map(categorias.map((c) => [c.id, c.nome])), [categorias]);
  const nomeCat = (l: Lanc) => (l.categoria_id ? catNome.get(l.categoria_id) ?? "Outros" : SEM);

  function alternarMes(m: string) {
    const atual = meses;
    if (atual.includes(m)) { if (atual.length > 1) setSel(atual.filter((x) => x !== m)); }
    else if (atual.length < MAX_MESES) setSel([...atual, m]);
  }

  const linhas = useMemo(() => {
    const por = new Map<string, { nome: string; porMes: Record<string, number>; total: number; itens: Lanc[] }>();
    for (const l of gastos) {
      const k = l.data.slice(0, 7);
      if (!meses.includes(k)) continue;
      const n = nomeCat(l);
      const r = por.get(n) ?? { nome: n, porMes: {}, total: 0, itens: [] };
      const v = l.tipo === "estorno" ? -l.valor : l.valor;
      r.porMes[k] = (r.porMes[k] ?? 0) + v; r.total += v; r.itens.push(l); por.set(n, r);
    }
    return [...por.values()].filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
  }, [gastos, meses, catNome]);

  const totalMes = (m: string) => linhas.reduce((s, r) => s + (r.porMes[m] ?? 0), 0);
  const grafico = useMemo(() => {
    const top = linhas.slice(0, 8), resto = linhas.slice(8);
    const dados = top.map((r) => ({ nome: r.nome, ...Object.fromEntries(meses.map((m) => [m, Math.round(r.porMes[m] ?? 0)])) }));
    if (resto.length) dados.push({ nome: "Outras", ...Object.fromEntries(meses.map((m) => [m, Math.round(resto.reduce((s, r) => s + (r.porMes[m] ?? 0), 0))])) } as any);
    return dados;
  }, [linhas, meses]);

  const primeiro = meses[0], ultimo = meses[meses.length - 1];
  const variacao = (r: { porMes: Record<string, number> }) => {
    const a = r.porMes[primeiro] ?? 0, b = r.porMes[ultimo] ?? 0;
    return { delta: b - a, pct: a > 0 ? ((b - a) / a) * 100 : null };
  };
  const alternar = (n: string) => setAbertas((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });

  const Chip = ({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={"rounded-full border px-3 py-1 text-xs " + (ativo ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>{children}</button>
  );

  if (mesesDisp.length === 0) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhum gasto importado ainda.</CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Meses (até {MAX_MESES}):</span>
          {mesesDisp.map((m) => <Chip key={m} ativo={meses.includes(m)} onClick={() => alternarMes(m)}>{nomeMes(m)}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">É de:</span>
          {(["todos", "PF", "PJ"] as const).map((d) => <Chip key={d} ativo={dono === d} onClick={() => setDono(d)}>{d === "todos" ? "PF + PJ" : d}</Chip>)}
        </div>
      </div>

      {linhas.length === 0 ? <Card><CardContent className="p-6 text-sm text-muted-foreground">Sem gastos nos meses escolhidos.</CardContent></Card> : (<>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Gasto por categoria, mês a mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(180, grafico.length * (meses.length * 13 + 16) + 40)}>
              <BarChart data={grafico} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }} barCategoryGap={10} barGap={2}>
                <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.08)" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                <YAxis type="category" dataKey="nome" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={<Tip />} />
                <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                {meses.map((m, i) => <Bar key={m} dataKey={m} name={nomeMes(m)} fill={RAMPA[i]} radius={[0, 3, 3, 0]} barSize={11} />)}
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">Os 8 maiores gastos do período; o resto vai em "Outras". Mais escuro = mês mais recente. Pagamento de fatura e transferências não entram (a compra já conta no cartão).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Tabela e variação {meses.length > 1 ? `(${nomeMes(primeiro)} → ${nomeMes(ultimo)})` : ""}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-1 pr-2 font-medium">Categoria</th>
                  {meses.map((m) => <th key={m} className="px-2 py-1 text-right font-medium">{nomeMes(m)}</th>)}
                  {meses.length > 1 && <th className="px-2 py-1 text-right font-medium">Variação</th>}
                </tr></thead>
                <tbody>
                  {linhas.map((r) => {
                    const v = variacao(r), aberta = abertas.has(r.nome);
                    return (<Fragment key={r.nome}>
                      <tr className="cursor-pointer border-t hover:bg-muted/40" onClick={() => alternar(r.nome)}>
                        <td className="py-1.5 pr-2"><span className="inline-flex items-center gap-1">{aberta ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}{r.nome}</span></td>
                        {meses.map((m) => <td key={m} className="px-2 py-1.5 text-right tabular-nums">{r.porMes[m] ? brl(r.porMes[m]) : <span className="text-muted-foreground">—</span>}</td>)}
                        {meses.length > 1 && <td className={"px-2 py-1.5 text-right tabular-nums " + (v.delta > 0 ? "text-red-600" : v.delta < 0 ? "text-emerald-700" : "text-muted-foreground")}>
                          {v.delta === 0 ? "—" : `${v.delta > 0 ? "+" : "−"}${brl(Math.abs(v.delta))}`}{v.pct !== null && v.delta !== 0 ? ` (${v.delta > 0 ? "+" : "−"}${Math.abs(Math.round(v.pct))}%)` : ""}
                        </td>}
                      </tr>
                      {aberta && <tr><td colSpan={meses.length + 2} className="bg-muted/20 px-2 pb-2"><LinhasLancamentos lancs={r.itens} categorias={categorias} onMudou={onMudou} /></td></tr>}
                    </Fragment>);
                  })}
                  <tr className="border-t font-medium">
                    <td className="py-1.5 pr-2">Total</td>
                    {meses.map((m) => <td key={m} className="px-2 py-1.5 text-right tabular-nums">{brl(totalMes(m))}</td>)}
                    {meses.length > 1 && <td className="px-2 py-1.5 text-right tabular-nums">{(() => { const d = totalMes(ultimo) - totalMes(primeiro); return d === 0 ? "—" : `${d > 0 ? "+" : "−"}${brl(Math.abs(d))}`; })()}</td>}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Vermelho = gastou mais que no primeiro mês escolhido; verde = gastou menos. Clique numa categoria para ver os lançamentos e corrigir.</p>
          </CardContent>
        </Card>
      </>)}
    </div>
  );
}
