import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { atualizarLancamento, type Categoria, type Fonte, type Lanc } from "@/lib/financas/api";

// Aqui a cor diz entrada x saída (PF/PJ vai em rótulos). Par validado: verde #1a8f6a e roxo #8a5cc2.
const COR = { ent: "#1a8f6a", sai: "#8a5cc2", acum: "#4b5563" };
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const nomeMes = (m: string) => `${MESES[+m.slice(5, 7) - 1]}/${m.slice(2, 4)}`;
const dataBR = (d: string) => d.split("-").reverse().slice(0, 2).join("/");
const COLS = "grid grid-cols-[44px_52px_minmax(0,1fr)_132px_40px_92px_92px] items-center gap-x-2";

const ehEntrada = (l: Lanc) => l.tipo === "entrada" || l.tipo === "reembolso" || l.tipo === "estorno";
const ehSaida = (l: Lanc) => l.tipo === "saida" || l.tipo === "pagamento_fatura";
/** Efeito no caixa da conta: + entra, − sai, 0 transferência (neutra). */
const efeito = (l: Lanc) => (ehEntrada(l) ? l.valor : ehSaida(l) ? -l.valor : 0);

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p: any) => <div key={p.dataKey} className="flex justify-between gap-4"><span>{p.name}</span><span className="tabular-nums">{brl0(p.value)}</span></div>)}
    </div>
  );
}

function Linha({ l, fonte, categorias, acum, onMudou }: { l: Lanc; fonte?: Fonte; categorias: Categoria[]; acum: number; onMudou: () => void }) {
  async function salvar(patch: Parameters<typeof atualizarLancamento>[1]) {
    try { await atualizarLancamento(l.id, patch); onMudou(); } catch (e: any) { toast.error("Erro: " + (e.message ?? e)); }
  }
  const e = efeito(l);
  const rotulo = l.tipo === "transferencia" ? "transferência" : l.tipo === "pagamento_fatura" ? "pagamento de fatura" : l.tipo === "reembolso" ? "reembolso" : l.tipo === "estorno" ? "estorno" : l.conciliado ? "cliente" : "";
  return (
    <div className={COLS + " border-t py-1.5 text-sm"}>
      <div className="text-xs text-muted-foreground">{dataBR(l.data)}</div>
      <div className="text-[11px] font-medium text-muted-foreground">{fonte ? (fonte.banco === "inter" ? "Inter" : fonte.banco.toUpperCase()) : ""}</div>
      <div className="min-w-0"><div className="truncate">{l.apelido || l.descricao}</div>{rotulo && <div className="text-xs text-muted-foreground">{rotulo}</div>}</div>
      {l.tipo === "saida" || l.tipo === "entrada" ? (
        <select className="h-7 w-full rounded border bg-background px-1 text-xs" value={l.categoria_id ?? ""} onChange={(ev) => salvar({ categoria_id: ev.target.value || null })}>
          <option value="">sem categoria</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      ) : <div />}
      <button type="button" className={"rounded px-1 py-0.5 text-xs font-medium " + (l.pertence_a !== l.pagador ? "bg-amber-100 text-amber-900" : "bg-muted")} onClick={() => salvar({ pertence_a: l.pertence_a === "PF" ? "PJ" : "PF" })} title="É de PF ou PJ (clique para alternar)">{l.pertence_a}</button>
      <div className={"text-right tabular-nums " + (e > 0 ? "text-emerald-700" : e < 0 ? "" : "text-muted-foreground")}>{e > 0 ? "+" : e < 0 ? "−" : ""}{brl(l.valor)}</div>
      <div className="text-right text-xs tabular-nums text-muted-foreground">{brl(acum)}</div>
    </div>
  );
}

export function ContasTab({ lancs, fontes, categorias, onMudou, onImportar }: { lancs: Lanc[]; fontes: Fonte[]; categorias: Categoria[]; onMudou: () => void; onImportar: () => void }) {
  const contas = useMemo(() => fontes.filter((f) => f.tipo === "conta"), [fontes]);
  const porId = useMemo(() => new Map(contas.map((c) => [c.id, c])), [contas]);
  const base = useMemo(() => lancs.filter((l) => l.status === "realizado" && porId.has(l.fonte_id)), [lancs, porId]);
  const mesesDisp = useMemo(() => [...new Set(base.map((l) => l.data.slice(0, 7)))].sort().reverse(), [base]);

  const [conta, setConta] = useState("todas");
  const [sel, setSel] = useState<Set<string> | null>(null); // null = último mês com movimento
  const [dono, setDono] = useState<"todos" | "PF" | "PJ">("todos");
  const [tipoF, setTipoF] = useState<"todos" | "entradas" | "saidas" | "transf">("todos");
  const [busca, setBusca] = useState("");
  const [limite, setLimite] = useState(100);

  const meses = sel ?? new Set(mesesDisp.slice(0, 1));
  const alternarMes = (m: string) => setSel((s) => { const n = new Set(s ?? meses); n.has(m) ? n.delete(m) : n.add(m); return n.size ? n : new Set([m]); });

  // Período + conta + dono (sem filtro de tipo/busca): alimenta indicadores e gráfico.
  const periodo = useMemo(() => base.filter((l) => (conta === "todas" || l.fonte_id === conta) && meses.has(l.data.slice(0, 7)) && (dono === "todos" || l.pertence_a === dono)), [base, conta, meses, dono]);

  const ind = useMemo(() => {
    const r = { ent: { PF: 0, PJ: 0 }, sai: { PF: 0, PJ: 0 }, fat: 0, transf: 0 };
    for (const l of periodo) {
      if (ehEntrada(l)) r.ent[l.pertence_a] += l.valor;
      else if (l.tipo === "saida") r.sai[l.pertence_a] += l.valor;
      else if (l.tipo === "pagamento_fatura") r.fat += l.valor;
      else if (l.tipo === "transferencia") r.transf += l.valor;
    }
    return r;
  }, [periodo]);
  const totEnt = ind.ent.PF + ind.ent.PJ, totSai = ind.sai.PF + ind.sai.PJ, liquido = totEnt - totSai - ind.fat;

  // Gráfico: por dia quando o período é curto; por mês quando abrange vários meses.
  const serie = useMemo(() => {
    const porDia = meses.size <= 2;
    const m = new Map<string, { k: string; ent: number; sai: number }>();
    for (const l of periodo) {
      const e = efeito(l); if (e === 0) continue;
      const k = porDia ? l.data : l.data.slice(0, 7);
      const r = m.get(k) ?? { k, ent: 0, sai: 0 }; if (e > 0) r.ent += e; else r.sai += -e; m.set(k, r);
    }
    let acc = 0;
    return [...m.values()].sort((a, b) => (a.k < b.k ? -1 : 1)).map((r) => { acc += r.ent - r.sai; return { nome: porDia ? dataBR(r.k) : nomeMes(r.k), Entradas: Math.round(r.ent), Saídas: Math.round(r.sai), Acumulado: Math.round(acc) }; });
  }, [periodo, meses]);

  // Lista (fluxo de caixa): aplica tipo e busca; acumulado calculado do mais antigo para o mais novo.
  const lista = useMemo(() => {
    const q = busca.trim().toUpperCase();
    const f = periodo.filter((l) => (tipoF === "todos" || (tipoF === "entradas" ? ehEntrada(l) : tipoF === "saidas" ? ehSaida(l) : l.tipo === "transferencia")) && (!q || (l.descricao + " " + (l.apelido ?? "")).toUpperCase().includes(q)));
    const asc = [...f].sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : a.id < b.id ? -1 : 1));
    let acc = 0;
    return asc.map((l) => { acc += efeito(l); return { l, acum: acc }; }).reverse();
  }, [periodo, tipoF, busca]);

  const Chip = ({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={"rounded-full border px-3 py-1 text-xs " + (ativo ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>{children}</button>
  );
  const Ind = ({ t, v, pf, pj, cor }: { t: string; v: number; pf?: number; pj?: number; cor?: string }) => (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{t}</div>
      <div className="text-xl font-semibold tabular-nums" style={cor ? { color: cor } : undefined}>{brl(v)}</div>
      {pf !== undefined && pj !== undefined && <div className="mt-1 flex gap-3 text-xs text-muted-foreground"><span>PF {brl0(pf)}</span><span>PJ {brl0(pj)}</span></div>}
    </CardContent></Card>
  );

  if (contas.length === 0 || base.length === 0) {
    return <Card><CardContent className="space-y-3 p-6 text-sm text-muted-foreground">Nenhum extrato de conta importado ainda.<div><Button onClick={onImportar}>Importar extrato</Button></div></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Chip ativo={conta === "todas"} onClick={() => setConta("todas")}>Todas as contas</Chip>
            {contas.map((c) => <Chip key={c.id} ativo={conta === c.id} onClick={() => setConta(c.id)}>{c.nome}</Chip>)}
          </div>
          <Button onClick={onImportar}>Importar extrato</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Meses:</span>
          {mesesDisp.map((m) => <Chip key={m} ativo={meses.has(m)} onClick={() => alternarMes(m)}>{nomeMes(m)}</Chip>)}
          <button type="button" className="text-xs underline" onClick={() => setSel(new Set(mesesDisp))}>todos</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">É de:</span>
          {(["todos", "PF", "PJ"] as const).map((d) => <Chip key={d} ativo={dono === d} onClick={() => setDono(d)}>{d === "todos" ? "PF + PJ" : d}</Chip>)}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Ind t="Entradas" v={totEnt} pf={ind.ent.PF} pj={ind.ent.PJ} cor={COR.ent} />
        <Ind t="Saídas" v={totSai} pf={ind.sai.PF} pj={ind.sai.PJ} cor={COR.sai} />
        <Ind t="Pagamento de fatura" v={ind.fat} />
        <Ind t="Movimento líquido" v={liquido} cor={liquido < 0 ? "#dc2626" : undefined} />
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">Transferências entre suas contas ({brl(ind.transf)}) ficam fora. Fatura é caixa que saiu, mas as compras já estão nos cartões. Movimento = o que foi importado, não é saldo.</p>

      {serie.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Fluxo de caixa{meses.size <= 2 ? " por dia" : " por mês"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11 }} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : String(v))} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={<Tip />} />
                <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                <Bar dataKey="Entradas" fill={COR.ent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill={COR.sai} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Acumulado" name="Acumulado no período" stroke={COR.acum} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Lançamentos <span className="font-normal text-muted-foreground">· {lista.length}</span></CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {(["todos", "entradas", "saidas", "transf"] as const).map((t) => <Chip key={t} ativo={tipoF === t} onClick={() => { setTipoF(t); setLimite(100); }}>{t === "todos" ? "Tudo" : t === "entradas" ? "Entradas" : t === "saidas" ? "Saídas" : "Transferências"}</Chip>)}
              <Input className="h-8 w-44" placeholder="Buscar descrição" value={busca} onChange={(e) => { setBusca(e.target.value); setLimite(100); }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={COLS + " pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"}>
            <div>Data</div><div>Conta</div><div>Descrição</div><div>Categoria</div><div>É de</div><div className="text-right">Valor</div><div className="text-right">Acumulado</div>
          </div>
          {lista.length === 0 && <div className="py-4 text-sm text-muted-foreground">Nada neste filtro.</div>}
          {lista.slice(0, limite).map(({ l, acum }) => <Linha key={l.id} l={l} fonte={porId.get(l.fonte_id)} categorias={categorias} acum={acum} onMudou={onMudou} />)}
          {lista.length > limite && <div className="pt-3 text-center"><Button variant="outline" size="sm" onClick={() => setLimite(limite + 100)}>Mostrar mais ({lista.length - limite})</Button></div>}
        </CardContent>
      </Card>
    </div>
  );
}
