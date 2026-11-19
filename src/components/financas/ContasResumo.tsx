import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fonte, Lanc } from "@/lib/financas/api";
import { chaveDestino } from "@/lib/financas/importar";

// Mesmas cores validadas do restante do módulo: PF azul, PJ laranja.
const COR = { PF: "#2a78d6", PJ: "#eb6834" } as const;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const nomeMes = (m: string) => `${MESES[+m.slice(5, 7) - 1]}/${m.slice(2, 4)}`;

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p: any) => <div key={p.dataKey} className="flex justify-between gap-4"><span>{p.name}</span><span className="tabular-nums">{brl0(p.value)}</span></div>)}
    </div>
  );
}

interface Mov { entradas: number; deClientes: number; saidas: number; fatura: number; transf: number; top: { nome: string; valor: number }[] }

function movimento(ls: Lanc[]): Mov {
  const m: Mov = { entradas: 0, deClientes: 0, saidas: 0, fatura: 0, transf: 0, top: [] };
  const dest = new Map<string, { nome: string; valor: number }>();
  for (const l of ls) {
    if (l.tipo === "entrada" || l.tipo === "reembolso" || l.tipo === "estorno") { m.entradas += l.valor; if (l.conciliado) m.deClientes += l.valor; }
    else if (l.tipo === "saida") {
      m.saidas += l.valor;
      const k = chaveDestino(l.descricao) || l.descricao;
      const d = dest.get(k) ?? { nome: l.descricao, valor: 0 }; d.valor += l.valor; dest.set(k, d);
    }
    else if (l.tipo === "pagamento_fatura") m.fatura += l.valor;
    else if (l.tipo === "transferencia") m.transf += l.valor;
  }
  m.top = [...dest.values()].sort((a, b) => b.valor - a.valor).slice(0, 5);
  return m;
}

export function ContasResumo({ lancs, fontes, mes }: { lancs: Lanc[]; fontes: Fonte[]; mes: string }) {
  const contas = useMemo(() => fontes.filter((f) => f.tipo === "conta"), [fontes]);
  const reais = useMemo(() => lancs.filter((l) => l.status === "realizado"), [lancs]);

  const cards = useMemo(() => contas.map((c) => ({
    conta: c,
    mov: movimento(reais.filter((l) => l.fonte_id === c.id && (mes === "todos" || l.data.slice(0, 7) === mes))),
    qtd: reais.filter((l) => l.fonte_id === c.id).length,
  })), [contas, reais, mes]);

  // Série mensal (últimos 6 meses com movimento) por conta, para os gráficos comparativos.
  const serie = useMemo(() => {
    const ids = new Set(contas.map((c) => c.id));
    const meses = [...new Set(reais.filter((l) => ids.has(l.fonte_id)).map((l) => l.data.slice(0, 7)))].sort().slice(-6);
    return meses.map((k) => {
      const r: any = { mes: k, nome: nomeMes(k) };
      for (const c of contas) {
        const mv = movimento(reais.filter((l) => l.fonte_id === c.id && l.data.slice(0, 7) === k));
        r[`ent_${c.id}`] = Math.round(mv.entradas); r[`sai_${c.id}`] = Math.round(mv.saidas);
      }
      return r;
    });
  }, [contas, reais]);

  if (contas.length === 0) return null;
  const semDados = cards.every((c) => c.qtd === 0);

  const Comparativo = ({ titulo, prefixo }: { titulo: string; prefixo: "ent" | "sai" }) => (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{titulo}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={<Tip />} />
            <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
            {contas.map((c) => <Bar key={c.id} dataKey={`${prefixo}_${c.id}`} name={c.nome} fill={COR[c.pagador]} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">Contas (extratos)</h2>
        <p className="text-xs text-muted-foreground">Só o movimento importado, sem saldo. Transferências entre suas contas ficam fora de entradas e saídas, e o pagamento de fatura aparece à parte porque as compras já estão nos cartões.</p>
      </div>
      {semDados ? <Card><CardContent className="p-4 text-sm text-muted-foreground">Nenhum extrato de conta importado ainda.</CardContent></Card> : (<>
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map(({ conta, mov }) => {
            const liquido = mov.entradas - mov.saidas - mov.fatura;
            return (
              <Card key={conta.id} style={{ borderTop: `3px solid ${COR[conta.pagador]}` }}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{conta.nome}</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-muted-foreground">Entradas</span><span className="text-right tabular-nums">{brl(mov.entradas)}</span>
                    {mov.deClientes > 0 && <><span className="pl-3 text-xs text-muted-foreground">de clientes (conciliadas)</span><span className="text-right text-xs tabular-nums text-muted-foreground">{brl(mov.deClientes)}</span></>}
                    <span className="text-muted-foreground">Saídas</span><span className="text-right tabular-nums">{brl(mov.saidas)}</span>
                    <span className="text-muted-foreground">Pagamento de fatura</span><span className="text-right tabular-nums">{brl(mov.fatura)}</span>
                    <span className="font-medium">Movimento líquido</span><span className={`text-right font-semibold tabular-nums ${liquido < 0 ? "text-red-600" : ""}`}>{brl(liquido)}</span>
                    <span className="text-xs text-muted-foreground">Transferências (neutras)</span><span className="text-right text-xs tabular-nums text-muted-foreground">{brl(mov.transf)}</span>
                  </div>
                  {mov.top.length > 0 && (
                    <div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">Maiores saídas</div>
                      {mov.top.map((t) => <div key={t.nome} className="flex justify-between gap-3 border-t py-1 text-xs"><span className="truncate">{t.nome}</span><span className="tabular-nums">{brl(t.valor)}</span></div>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {serie.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            <Comparativo titulo="Entradas por mês: contas lado a lado" prefixo="ent" />
            <Comparativo titulo="Saídas por mês: contas lado a lado" prefixo="sai" />
          </div>
        )}
      </>)}
    </div>
  );
}
