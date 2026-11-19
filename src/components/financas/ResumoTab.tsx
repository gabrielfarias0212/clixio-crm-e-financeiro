import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { marcarFatura, type Categoria, type Fonte, type Lanc } from "@/lib/financas/api";
import { LinhasLancamentos } from "./LinhasLancamentos";
import { GraficosResumo } from "./GraficosResumo";
import { CategoriasComparativo, type Origem } from "./CategoriasComparativo";
import { SeletorPeriodo } from "./SeletorPeriodo";
import { mesAtual, mesNoPeriodo, nomeMes, type Periodo } from "@/lib/financas/periodo";

function Segmentado<T extends string>({ valor, onChange, opcoes, ajuda, titulo }: { valor: T; onChange: (v: T) => void; opcoes: readonly (readonly [T, string])[]; ajuda?: string; titulo?: string }) {
  return (
    <div className="flex items-center rounded-md border p-0.5 text-xs" title={ajuda} aria-label={titulo}>
      {opcoes.map(([o, t]) => (
        <button key={o} type="button" onClick={() => onChange(o)} className={"rounded px-3 py-1 " + (valor === o ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{t}</button>
      ))}
    </div>
  );
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ResumoTab({ fontes, lancs, faturas, categorias, onMudou, onImportar, onTriagem, pendConc, onConciliar }: { fontes: Fonte[]; lancs: Lanc[]; faturas: any[]; categorias: Categoria[]; onMudou: () => void; onImportar: () => void; onTriagem: () => void; pendConc: number; onConciliar: () => void }) {
  const [periodo, setPeriodo] = useState<Periodo | null>(() => { const a = mesAtual(); return { de: a, ate: a }; });
  const [origem, setOrigem] = useState<Origem>("cartoes");
  // Cartão: o mês pode ser o da fatura (vencimento) ou o da compra. Conta sempre usa a data do lançamento.
  const [criterio, setCriterio] = useState<"fatura" | "compra">("fatura");
  const compFatura = useMemo(() => new Map<string, string>(faturas.map((f) => [f.id, String(f.competencia).slice(0, 7)])), [faturas]);
  const mesDe = useCallback((l: { data: string; fatura_id: string | null }) => (criterio === "fatura" && l.fatura_id && compFatura.get(l.fatura_id)) || l.data.slice(0, 7), [criterio, compFatura]);
  const tipoFonte = useMemo(() => new Map(fontes.map((f) => [f.id, f.tipo])), [fontes]);
  const lancsO = useMemo(() => lancs.filter((l) => origem === "tudo" || tipoFonte.get(l.fonte_id) === (origem === "cartoes" ? "cartao" : "conta")), [lancs, origem, tipoFonte]);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const alternar = (id: string) => setAbertas((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const porFatura = useMemo(() => { const m = new Map<string, Lanc[]>(); for (const l of lancs) if (l.fatura_id) (m.get(l.fatura_id) ?? m.set(l.fatura_id, []).get(l.fatura_id)!).push(l); return m; }, [lancs]);

  const semCategoria = useMemo(() => lancs.filter((l) => l.status === "realizado" && (l.tipo === "saida" || l.tipo === "estorno") && !l.categoria_id).length, [lancs]);

  // Quem pagou x de quem é o gasto, no período e na origem escolhidos.
  const q = useMemo(() => {
    const r = { PF_PF: 0, PJ_PJ: 0, PJ_PF: 0, PF_PJ: 0 };
    for (const l of lancsO) {
      if (l.status !== "realizado" || (l.tipo !== "saida" && l.tipo !== "estorno") || !mesNoPeriodo(mesDe(l), periodo)) continue;
      (r as any)[`${l.pagador}_${l.pertence_a}`] += l.tipo === "estorno" ? -l.valor : l.valor;
    }
    return r;
  }, [lancsO, periodo, mesDe]);
  const totalPF = q.PF_PF + q.PJ_PF, totalPJ = q.PJ_PJ + q.PF_PJ;
  // devoluções (estornos) do período, por de quem é o gasto: aparecem como aviso para o líquido negativo não parecer erro
  const dev = useMemo(() => {
    const r = { PF: 0, PJ: 0 };
    for (const l of lancsO) if (l.status === "realizado" && l.tipo === "estorno" && mesNoPeriodo(mesDe(l), periodo) && !/ESTORNO TARIFA/.test(l.descricao)) (r as any)[l.pertence_a] += l.valor;
    return r;
  }, [lancsO, periodo, mesDe]);
  // Acerto: reposição entre você e a empresa. Considera cartão e conta juntos (independe do filtro de origem).
  const qa = useMemo(() => {
    const r = { PJ_PF: 0, PF_PJ: 0 };
    for (const l of lancs) {
      if (l.status !== "realizado" || (l.tipo !== "saida" && l.tipo !== "estorno") || !mesNoPeriodo(mesDe(l), periodo)) continue;
      const k = `${l.pagador}_${l.pertence_a}`;
      if (k === "PJ_PF" || k === "PF_PJ") (r as any)[k] += l.tipo === "estorno" ? -l.valor : l.valor;
    }
    return r;
  }, [lancs, periodo, mesDe]);
  // Pix da conta da empresa para você: só abatem o acerto se você disser que são reposição (pode ser retirada/pró-labore).
  const [contarRepasses, setContarRepasses] = useState(false);
  const repasses = useMemo(() => lancs.filter((l) => l.status === "realizado" && l.tipo === "transferencia" && tipoFonte.get(l.fonte_id) === "conta" && l.pagador === "PJ" && /GABRIEL LUIS DE FARIAS/i.test(l.descricao) && mesNoPeriodo(l.data.slice(0, 7), periodo)).reduce((a, l) => a + l.valor, 0), [lancs, tipoFonte, periodo]);
  const acerto = qa.PJ_PF - qa.PF_PJ + (contarRepasses ? repasses : 0); // >0: você deve à empresa; <0: a empresa deve a você

  // Parcelas já assumidas para os próximos meses (não entram nos números de gasto).
  const proximos = useMemo(() => {
    const m = new Map<string, number>(); const agora = mesAtual();
    for (const l of lancsO) { const k = mesDe(l); if (l.status === "projetado" && l.tipo === "saida" && k > agora) m.set(k, (m.get(k) ?? 0) + l.valor); }
    return [...m.entries()].sort().slice(0, 6);
  }, [lancsO, mesDe]);

  // Faturas dos meses do período, como no app do banco: um bloco por cartão com valor, vencimento e situação.
  const cartoes = useMemo(() => fontes.filter((f) => f.tipo === "cartao"), [fontes]);
  const faturasPeriodo = useMemo(() => faturas
    .filter((f) => mesNoPeriodo(String(f.competencia).slice(0, 7), periodo))
    .sort((a, b) => String(b.competencia).localeCompare(String(a.competencia)) || String(a.fin_fontes?.nome).localeCompare(String(b.fin_fontes?.nome))), [faturas, periodo]);
  const mesUnico = periodo && periodo.de === periodo.ate ? periodo.de : null;

  async function pagar(f: any) {
    const hoje = new Date().toISOString().slice(0, 10);
    try { await marcarFatura(f.id, "paga", hoje, f.valor_total); toast.success("Fatura marcada como paga."); onMudou(); }
    catch (e: any) { toast.error(e.message); }
  }
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SeletorPeriodo valor={periodo} onChange={setPeriodo} />
        <Segmentado<Origem> valor={origem} onChange={setOrigem} opcoes={[["cartoes", "Cartões"], ["contas", "Contas"], ["tudo", "Tudo"]]} />
        {origem !== "contas" && (
          <Segmentado<"fatura" | "compra"> valor={criterio} onChange={setCriterio} titulo="Mês do cartão pela"
            opcoes={[["fatura", "Mês da fatura"], ["compra", "Data da compra"]]}
            ajuda={criterio === "fatura" ? "Mês da fatura: o que você paga em cada mês, como no app do banco" : "Data da compra: quando a compra foi feita"} />
        )}
        <Button className="ml-auto" onClick={onImportar}>Importar extrato ou fatura</Button>
      </div>
      {pendConc > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <span>{pendConc} lançamentos do extrato aguardando conciliação com o Financeiro (para não duplicar entradas de clientes).</span>
          <Button size="sm" variant="outline" onClick={onConciliar}>Ir para a Conciliação</Button>
        </div>
      )}
      {semCategoria > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>{semCategoria} lançamentos ainda sem categoria. Classifique para os números e gráficos ficarem corretos.</span>
          <Button size="sm" variant="outline" onClick={onTriagem}>Ir para a Triagem</Button>
        </div>
      )}
      {origem !== "contas" && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Faturas {mesUnico ? `de ${nomeMes(mesUnico)}` : "do período"}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {faturasPeriodo.map((f) => {
              const vencida = f.status !== "paga" && f.vencimento && f.vencimento < hoje && f.status !== "aberta";
              const fonte = fontes.find((x) => x.id === f.fonte_id);
              return (
                <Card key={f.id} style={{ borderTop: `3px solid ${fonte?.pagador === "PJ" ? "#eb6834" : "#2a78d6"}` }}><CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{f.fin_fontes?.nome}{mesUnico ? "" : ` · ${nomeMes(String(f.competencia).slice(0, 7))}`}</div>
                    <Badge variant={vencida ? "destructive" : f.status === "paga" ? "secondary" : "outline"}>{vencida ? "vencida" : f.status}</Badge>
                  </div>
                  <div className="text-2xl font-semibold tabular-nums">{brl(Number(f.valor_total))}</div>
                  {(() => {
                    let pf = 0, pj = 0;
                    for (const l of porFatura.get(f.id) ?? []) {
                      if (l.status !== "realizado" || (l.tipo !== "saida" && l.tipo !== "estorno")) continue;
                      const v = l.tipo === "estorno" ? -l.valor : l.valor;
                      if (l.pertence_a === "PJ") pj += v; else pf += v;
                    }
                    const resto = Math.round((Number(f.valor_total) - pf - pj) * 100) / 100;
                    return (
                      <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                        <div>{brl(pf)} pessoal · {brl(pj)} da empresa</div>
                        {Math.abs(resto) >= 0.01 && <div className="text-xs">{brl(resto)} de {resto > 0 ? "fatura anterior ou ajustes" : "ajustes"}</div>}
                      </div>
                    );
                  })()}
                  <div className="mt-1 text-xs text-muted-foreground">
                    vence {f.vencimento?.split("-").reverse().join("/")}
                    {f.status === "paga" && f.pago_em ? ` · paga em ${String(f.pago_em).slice(0, 10).split("-").reverse().join("/")}` : ""}
                  </div>
                </CardContent></Card>
              );
            })}
            {mesUnico && cartoes.filter((c) => !faturasPeriodo.some((f) => f.fonte_id === c.id)).map((c) => (
              <Card key={c.id} style={{ borderTop: "3px solid #cbd5e1" }}><CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{c.nome}</div>
                <div className="text-sm text-muted-foreground">Sem fatura importada neste mês.</div>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}

      {origem !== "cartoes" && (
      <div className="grid gap-3 sm:grid-cols-2">
        <Card style={{ borderTop: "3px solid #2a78d6" }}><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Gasto pessoal (PF)</div>
          <div className="text-2xl font-semibold tabular-nums">{brl(totalPF)}</div>
          <div className="mt-1 text-xs text-muted-foreground">pago pela PF {brl(q.PF_PF)} · pago pela empresa {brl(q.PJ_PF)}</div>
          {dev.PF > 0 && <div className="text-xs text-muted-foreground">já descontando {brl(dev.PF)} de devoluções</div>}
        </CardContent></Card>
        <Card style={{ borderTop: "3px solid #eb6834" }}><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Gasto da empresa (PJ)</div>
          <div className="text-2xl font-semibold tabular-nums">{brl(totalPJ)}</div>
          <div className="mt-1 text-xs text-muted-foreground">pago pela empresa {brl(q.PJ_PJ)} · pago por você (PF) {brl(q.PF_PJ)}</div>
          {dev.PJ > 0 && <div className="text-xs text-muted-foreground">já descontando {brl(dev.PJ)} de devoluções{totalPJ < 0 ? " (por isso o total ficou negativo)" : ""}</div>}
        </CardContent></Card>
      </div>
      )}
      <div className="rounded-md border px-3 py-2 text-sm">
        <span className="font-medium">Acerto PF × PJ: </span>
        {Math.abs(acerto) < 0.005 ? "equilibrado."
          : acerto > 0 ? <>você deve <b>{brl(acerto)}</b> à empresa para repor os gastos pessoais pagos por ela.</>
          : <>a empresa deve <b>{brl(-acerto)}</b> a você para repor os gastos dela pagos por você.</>}
        <div className="mt-1 text-xs text-muted-foreground">
          Gastos da empresa pagos por você (cartão ou conta PF): {brl(qa.PF_PJ)} · gastos pessoais pagos pela empresa (cartão ou conta PJ): {brl(qa.PJ_PF)}.
        </div>
        {repasses > 0 && (
          <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={contarRepasses} onChange={(e) => setContarRepasses(e.target.checked)} />
            Contar {brl(repasses)} em Pix da empresa para você como reposição (desmarque se forem retirada ou pró-labore)
          </label>
        )}
      </div>
      {proximos.length > 0 && (
        <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Já assumido para os próximos meses (parcelas): </span>
          {proximos.map(([m, v]) => `${nomeMes(m)} ${brl(v)}`).join(" · ")}. Não entra nos números acima.
        </div>
      )}

      <GraficosResumo lancs={lancsO} categorias={categorias} periodo={periodo} mesDe={mesDe} />

      <CategoriasComparativo lancs={lancs} fontes={fontes} categorias={categorias} onMudou={onMudou} origemInicial={origem} mesDe={mesDe} />

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
