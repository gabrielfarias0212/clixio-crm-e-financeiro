import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Categoria, Lanc } from "@/lib/financas/api";
import { mesNoPeriodo, mesPelaData, type MesDe, type Periodo } from "@/lib/financas/periodo";

// Cores validadas (azul/laranja, categórico slots 1 e 2: passam nos testes de daltonismo e contraste).
const COR = { PF: "#2a78d6", PJ: "#eb6834" } as const;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const nomeMes = (m: string) => `${MESES[+m.slice(5, 7) - 1]}/${m.slice(2, 4)}`;

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p: any) => <div key={p.dataKey} className="flex justify-between gap-4"><span>{p.name}</span><span className="tabular-nums">{brl(p.value)}</span></div>)}
    </div>
  );
}

export function GraficosResumo({ lancs, categorias, periodo, mesDe = mesPelaData }: { lancs: Lanc[]; categorias: Categoria[]; periodo: Periodo | null; mesDe?: MesDe }) {
  const gastos = useMemo(() => lancs.filter((l) => l.status === "realizado" && (l.tipo === "saida" || l.tipo === "estorno")), [lancs]);
  const valor = (l: Lanc) => (l.tipo === "estorno" ? -l.valor : l.valor);

  const porMes = useMemo(() => {
    const m = new Map<string, { mes: string; PF: number; PJ: number }>();
    for (const l of gastos) {
      const k = mesDe(l);
      const r = m.get(k) ?? { mes: k, PF: 0, PJ: 0 };
      r[l.pertence_a] += valor(l); m.set(k, r);
    }
    return [...m.values()].filter((r) => !periodo || r.mes <= periodo.ate).sort((a, b) => (a.mes < b.mes ? -1 : 1)).slice(-6).map((r) => ({ ...r, nome: nomeMes(r.mes), PF: Math.round(r.PF), PJ: Math.round(r.PJ) }));
  }, [gastos, periodo, mesDe]);

  const catNome = useMemo(() => new Map(categorias.map((c) => [c.id, c.nome])), [categorias]);
  const porCategoria = (dono: "PF" | "PJ") => {
    const m = new Map<string, number>();
    for (const l of gastos) {
      if (l.pertence_a !== dono || !mesNoPeriodo(mesDe(l), periodo)) continue;
      const k = l.categoria_id ? catNome.get(l.categoria_id) ?? "Outros" : "Sem categoria";
      m.set(k, (m.get(k) ?? 0) + valor(l));
    }
    const todas = [...m.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const top = todas.slice(0, 7), resto = todas.slice(7).reduce((s, [, v]) => s + v, 0);
    if (resto > 0) top.push(["Outras", resto]);
    return { itens: top.map(([nome, v]) => ({ nome, valor: Math.round(v) })), total: [...m.values()].reduce((s, v) => s + v, 0) };
  };
  const pf = useMemo(() => porCategoria("PF"), [gastos, catNome, periodo, mesDe]);
  const pj = useMemo(() => porCategoria("PJ"), [gastos, catNome, periodo, mesDe]);
  const total = pf.total + pj.total;

  if (!gastos.length) return null;
  const Horizontal = ({ titulo, d, cor }: { titulo: string; d: { itens: { nome: string; valor: number }[]; total: number }; cor: string }) => (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{titulo} <span className="font-normal text-muted-foreground">· {brl(d.total)}{total > 0 ? ` (${Math.round((d.total / total) * 100)}%)` : ""}</span></CardTitle></CardHeader>
      <CardContent>
        {d.itens.length === 0 ? <div className="py-6 text-sm text-muted-foreground">Sem gastos neste período.</div> : (
          <ResponsiveContainer width="100%" height={Math.max(120, d.itens.length * 34)}>
            <BarChart data={d.itens} layout="vertical" margin={{ left: 0, right: 56, top: 0, bottom: 0 }} barCategoryGap={6}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nome" width={120} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={<Tip />} />
              <Bar dataKey="valor" name="Gasto" fill={cor} radius={[0, 4, 4, 0]} barSize={16}>
                <LabelList dataKey="valor" position="right" formatter={(v: number) => brl(v)} style={{ fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Gastos por mês: pessoal x empresa</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porMes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={<Tip />} />
              <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
              <Bar dataKey="PF" name="Pessoal (PF)" stackId="a" fill={COR.PF} stroke="#fcfcfb" strokeWidth={2} />
              <Bar dataKey="PJ" name="Empresa (PJ)" stackId="a" fill={COR.PJ} stroke="#fcfcfb" strokeWidth={2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Horizontal titulo="Pessoal (PF)" d={pf} cor={COR.PF} />
        <Horizontal titulo="Empresa (PJ)" d={pj} cor={COR.PJ} />
      </div>
    </div>
  );
}
