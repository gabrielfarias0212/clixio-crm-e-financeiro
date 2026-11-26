import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  carregarClixio, confirmarTransferencia, desfazerTransferencia, desfazerVinculo, listarFontes, marcarNaoEhCliente,
  marcarTransferenciaPropria, registrarPagamentoCliente, vincularPagamentoFatura, vincularTransacao, type Fonte, type Lanc,
} from "@/lib/financas/api";
import {
  dias, semAcento, sugerirPagamentosFatura, sugerirPix, sugerirTransferencias, type ClienteClixio, type FaturaLista, type TxClixio,
} from "@/lib/financas/conciliacao";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dBR = (d: string) => d.split("-").reverse().join("/");
const TITULAR = ["GABRIEL", "FARIAS"];
const NOME_TITULAR = "GABRIEL LUIS DE FARIAS";

function Cabecalho({ titulo, n, dica }: { titulo: string; n: number; dica?: string }) {
  return <CardHeader className="pb-2"><CardTitle className="text-base">{titulo} <Badge variant="secondary" className="ml-1">{n}</Badge></CardTitle>{dica && <p className="text-xs text-muted-foreground">{dica}</p>}</CardHeader>;
}
const Vazio = ({ t }: { t: string }) => <div className="py-2 text-sm text-muted-foreground">{t}</div>;

export function ConciliacaoTab({ lancs, faturas, onMudou }: { lancs: Lanc[]; faturas: FaturaLista[]; onMudou: () => void }) {
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [clixio, setClixio] = useState<{ txs: TxClixio[]; clientes: ClienteClixio[] } | null>(null);
  const [recPix, setRecPix] = useState<Set<string>>(new Set());
  const [recTr, setRecTr] = useState<Set<string>>(new Set());
  const [recFat, setRecFat] = useState<Set<string>>(new Set());
  const [aberto, setAberto] = useState<{ id: string; modo: "tx" | "cliente" } | null>(null);
  const [busca, setBusca] = useState(""); const [clienteId, setClienteId] = useState(""); const [nota, setNota] = useState(""); const [txId, setTxId] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => { listarFontes().then(setFontes).catch((e) => toast.error(e.message)); carregarClixio().then(setClixio).catch((e) => toast.error("Erro ao ler o Financeiro: " + e.message)); }, []);

  const contas = useMemo(() => new Set(fontes.filter((f) => f.tipo === "conta").map((f) => f.id)), [fontes]);
  const banco = useMemo(() => new Map(fontes.map((f) => [f.id, f.banco])), [fontes]);
  const nomeFonte = useMemo(() => new Map(fontes.map((f) => [f.id, f.nome])), [fontes]);
  const doExtrato = useMemo(() => lancs.filter((l) => contas.has(l.fonte_id) && l.status === "realizado"), [lancs, contas]);

  const transf = useMemo(() => sugerirTransferencias(doExtrato, TITULAR, recTr), [doExtrato, recTr]);
  const emTransf = useMemo(() => new Set(transf.flatMap((p) => [p.saida.id, p.entrada.id])), [transf]);

  const pixPend = useMemo(() => doExtrato.filter((l) => l.tipo === "entrada" && !l.conciliado && l.clixio_match_status !== "rejeitado" && !emTransf.has(l.id)), [doExtrato, emTransf]);
  const vinculados = useMemo(() => new Set(lancs.map((l) => l.clixio_transaction_id).filter(Boolean) as string[]), [lancs]);
  const txLivres = useMemo(() => (clixio?.txs ?? []).filter((t) => !vinculados.has(t.id)), [clixio, vinculados]);
  const pix = useMemo(() => (clixio ? sugerirPix(pixPend, txLivres, clixio.clientes, recPix) : []), [pixPend, txLivres, clixio, recPix]);
  const alta = pix.filter((p) => p.nivel === "alta"), duvida = pix.filter((p) => p.nivel === "duvida");
  const semParTodos = pix.filter((p) => p.nivel === "sem_par");
  const proprios = semParTodos.filter((p) => semAcento(p.lanc.descricao).includes(NOME_TITULAR));
  const semPar = semParTodos.filter((p) => !proprios.includes(p));
  // Prováveis: um único candidato, até 1 dia de diferença, e nenhum outro Pix disputando a mesma entrada do Clixio.
  const provaveis = useMemo(() => {
    const unicos = duvida.filter((p) => p.candidatos.length === 1 && p.candidatos[0].dias <= 1);
    const cont = new Map<string, number>(); unicos.forEach((p) => cont.set(p.candidatos[0].tx.id, (cont.get(p.candidatos[0].tx.id) ?? 0) + 1));
    const disputados = new Set(duvida.filter((p) => !unicos.includes(p)).flatMap((p) => p.candidatos.map((c) => c.tx.id)));
    return unicos.filter((p) => cont.get(p.candidatos[0].tx.id) === 1 && !disputados.has(p.candidatos[0].tx.id));
  }, [duvida]);

  const pagFat = useMemo(() => sugerirPagamentosFatura(doExtrato.filter((l) => l.tipo === "pagamento_fatura" && !l.conciliado), faturas, banco, recFat), [doExtrato, faturas, banco, recFat]);

  const conciliados = useMemo(() => doExtrato.filter((l) => l.conciliado && l.clixio_transaction_id).sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 12), [doExtrato]);
  const paresFeitos = useMemo(() => doExtrato.filter((l) => l.par_id && l.tipo === "transferencia"), [doExtrato]);
  const proprias = useMemo(() => doExtrato.filter((l) => l.tipo === "transferencia" && !l.par_id && l.obs?.startsWith("transferência de conta própria")), [doExtrato]);
  const txPorId = useMemo(() => new Map((clixio?.txs ?? []).map((t) => [t.id, t])), [clixio]);
  const clientePorId = useMemo(() => new Map((clixio?.clientes ?? []).map((c) => [c.id, c])), [clixio]);

  const periodo = useMemo(() => { const d = doExtrato.map((l) => l.data).sort(); return d.length ? [d[0], d[d.length - 1]] : null; }, [doExtrato]);
  const soNoClixio = useMemo(() => (periodo ? txLivres.filter((t) => t.date >= periodo[0] && t.date <= periodo[1]).sort((a, b) => (a.date < b.date ? 1 : -1)) : []), [txLivres, periodo]);

  async function executar(fn: () => Promise<void>, ok: string) {
    setOcupado(true);
    try { await fn(); toast.success(ok); setAberto(null); setClienteId(""); setNota(""); setTxId(""); setBusca(""); onMudou(); carregarClixio().then(setClixio); }
    catch (e: any) { toast.error("Erro: " + (e.message ?? e)); } finally { setOcupado(false); }
  }
  const recusar = (set: Set<string>, setter: (s: Set<string>) => void, k: string) => setter(new Set(set).add(k));

  const Pix = ({ l }: { l: Lanc }) => (
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium">{brl(l.valor)} <span className="font-normal text-muted-foreground">· {dBR(l.data)} · {nomeFonte.get(l.fonte_id)}</span></div>
      <div className="truncate text-xs text-muted-foreground">{l.descricao}</div>
    </div>
  );
  const Tx = ({ t, cliente }: { t: TxClixio; cliente?: string }) => (
    <div className="min-w-0 flex-1 text-xs">
      <div className="truncate"><b>No Clixio:</b> {t.description}</div>
      <div className="text-muted-foreground">{dBR(t.date)} · {brl(t.amount)}{cliente ? ` · ${cliente}` : ""}</div>
    </div>
  );

  if (!clixio) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Lendo os Recebimentos do Clixio…</CardContent></Card>;
  const total = alta.length + duvida.length + semPar.length + proprios.length + transf.length + pagFat.length;

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {total === 0 ? "Nada pendente de conciliação." : "Nada é ignorado sem a sua confirmação. O que for conciliado deixa de contar como entrada nova em Finanças, porque o Financeiro continua sendo a fonte das entradas de clientes."}
      </div>

      <Card>
        <Cabecalho titulo="Entradas que parecem já estar no Clixio" n={alta.length} dica="Valor, data (até 3 dias) e nome batem com uma entrada do Financeiro." />
        <CardContent>
          {alta.length === 0 ? <Vazio t="Nenhuma sugestão forte." /> : (<>
            <Button size="sm" disabled={ocupado} className="mb-2" onClick={() => executar(async () => { for (const p of alta) await vincularTransacao(p.lanc.id, p.candidatos[0].tx.id, 0.95); }, `${alta.length} vínculos confirmados`)}>Confirmar todos ({alta.length})</Button>
            {alta.map((p) => (
              <div key={p.lanc.id} className="flex flex-wrap items-center gap-3 border-t py-2">
                <Pix l={p.lanc} /><Tx t={p.candidatos[0].tx} cliente={p.candidatos[0].cliente} />
                <Button size="sm" variant="outline" disabled={ocupado} onClick={() => executar(() => vincularTransacao(p.lanc.id, p.candidatos[0].tx.id, 0.95), "Vinculado")}>Confirmar</Button>
                <Button size="sm" variant="ghost" onClick={() => recusar(recPix, setRecPix, `${p.lanc.id}|${p.candidatos[0].tx.id}`)}>Não é este</Button>
              </div>
            ))}
          </>)}
        </CardContent>
      </Card>

      <Card>
        <Cabecalho titulo="Em dúvida" n={duvida.length} dica="O valor bate, mas nome ou data não. Escolha qual é, ou diga que nenhum é." />
        <CardContent>
          {provaveis.length > 0 && (
            <div className="mb-2 rounded-md bg-muted/50 p-2 text-xs">
              {provaveis.length} deles têm um único candidato, com até 1 dia de diferença, e nenhum outro Pix disputando a mesma entrada. Confira abaixo e confirme de uma vez.
              <Button size="sm" className="ml-2" disabled={ocupado} onClick={() => executar(async () => { for (const p of provaveis) await vincularTransacao(p.lanc.id, p.candidatos[0].tx.id, 0.6); }, `${provaveis.length} vínculos confirmados`)}>Confirmar os {provaveis.length} prováveis</Button>
            </div>
          )}
          {duvida.length === 0 ? <Vazio t="Nenhuma dúvida." /> : duvida.map((p) => (
            <div key={p.lanc.id} className="space-y-2 border-t py-2">
              <div className="flex flex-wrap items-center gap-3"><Pix l={p.lanc} />
                <Button size="sm" variant="ghost" onClick={() => setAberto({ id: p.lanc.id, modo: "cliente" })}>Nenhum desses</Button></div>
              {p.candidatos.map((c) => (
                <div key={c.tx.id} className="ml-4 flex flex-wrap items-center gap-3 rounded-md bg-muted/50 px-2 py-1">
                  <Tx t={c.tx} cliente={c.cliente} />
                  <span className="text-xs text-muted-foreground">{c.dias === 0 ? "mesmo dia" : `${c.dias} dia(s) de diferença`} · {c.nome ? "nome parecido" : "nome diferente"}</span>
                  <Button size="sm" variant="outline" disabled={ocupado} onClick={() => executar(() => vincularTransacao(p.lanc.id, c.tx.id, c.nome ? 0.7 : 0.5), "Vinculado")}>É este</Button>
                </div>
              ))}
              {aberto?.id === p.lanc.id && escolhas(p.lanc)}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <Cabecalho titulo="Vindo de você mesmo, sem a outra conta importada" n={proprios.length} dica="Pix do seu próprio nome sem par no outro extrato. Marcar como transferência deixa neutro: não conta como receita." />
        <CardContent>
          {proprios.length === 0 ? <Vazio t="Nenhum." /> : (<>
            <Button size="sm" className="mb-2" disabled={ocupado} onClick={() => executar(() => marcarTransferenciaPropria(proprios.map((p) => p.lanc.id)), `${proprios.length} marcadas como transferência`)}>Marcar as {proprios.length} como transferência</Button>
            {proprios.map((p) => <div key={p.lanc.id} className="flex items-center gap-3 border-t py-2"><Pix l={p.lanc} /></div>)}
          </>)}
        </CardContent>
      </Card>

      <Card>
        <Cabecalho titulo="Sem correspondência" n={semPar.length} dica="Não achei nada no Clixio. Decida o que fazer com cada um." />
        <CardContent>
          {semPar.length === 0 ? <Vazio t="Nada sem par." /> : semPar.map((p) => (
            <div key={p.lanc.id} className="space-y-2 border-t py-2">
              <div className="flex flex-wrap items-center gap-2"><Pix l={p.lanc} />
                <Button size="sm" variant="outline" onClick={() => setAberto({ id: p.lanc.id, modo: "tx" })}>Vincular a uma entrada do Clixio</Button>
                <Button size="sm" variant="outline" onClick={() => setAberto({ id: p.lanc.id, modo: "cliente" })}>Registrar pagamento de cliente</Button>
                <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => executar(() => marcarNaoEhCliente(p.lanc.id), "Mantido como entrada normal em Finanças")}>Não é de cliente</Button>
              </div>
              {aberto?.id === p.lanc.id && escolhas(p.lanc)}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <Cabecalho titulo="Transferências entre as suas contas" n={transf.length} dica="Mesmo valor, sentidos opostos, contas diferentes, até 1 dia. Ficam neutras (não contam como gasto nem como ganho)." />
        <CardContent>
          {transf.length === 0 ? <Vazio t="Nenhum par encontrado." /> : (<>
            {transf.some((p) => p.nivel === "alta") && <Button size="sm" className="mb-2" disabled={ocupado} onClick={() => executar(async () => { for (const p of transf.filter((x) => x.nivel === "alta")) await confirmarTransferencia(p.saida.id, p.entrada.id); }, "Transferências confirmadas")}>Confirmar as {transf.filter((p) => p.nivel === "alta").length} com o seu nome</Button>}
            {transf.map((p) => (
              <div key={p.saida.id} className="flex flex-wrap items-center gap-3 border-t py-2 text-sm">
                <div className="min-w-0 flex-1"><div>{brl(p.saida.valor)} · {dBR(p.saida.data)}</div>
                  <div className="truncate text-xs text-muted-foreground">sai de {nomeFonte.get(p.saida.fonte_id)} → entra em {nomeFonte.get(p.entrada.fonte_id)} · {p.nivel === "alta" ? "seu nome aparece" : "seu nome não aparece, confirme"}</div></div>
                <Button size="sm" variant="outline" disabled={ocupado} onClick={() => executar(() => confirmarTransferencia(p.saida.id, p.entrada.id), "Transferência confirmada")}>É transferência</Button>
                <Button size="sm" variant="ghost" onClick={() => recusar(recTr, setRecTr, `${p.saida.id}|${p.entrada.id}`)}>Não é</Button>
              </div>
            ))}
          </>)}
        </CardContent>
      </Card>

      <Card>
        <Cabecalho titulo="Pagamentos de fatura no extrato" n={pagFat.length} dica="Liga o pagamento à fatura do cartão e marca a fatura como paga." />
        <CardContent>
          {pagFat.length === 0 ? <Vazio t="Nenhum pagamento de fatura pendente." /> : pagFat.map((p) => (
            <div key={p.lanc.id} className="flex flex-wrap items-center gap-3 border-t py-2 text-sm">
              <Pix l={p.lanc} />
              {p.fatura ? (<>
                <div className="min-w-0 flex-1 text-xs"><b>Fatura:</b> {p.fatura.fin_fontes?.nome} · {p.fatura.competencia.slice(0, 7)} · {brl(Number(p.fatura.valor_total))}{p.fatura.status === "paga" ? " (já marcada como paga)" : ""}
                  {p.nivel === "duvida" && <div className="text-amber-700">Valor diferente em {brl(Math.abs(p.diferenca))} ({p.diferenca > 0 ? "pagou a mais: juros ou multa?" : "pagou a menos: pagamento parcial?"})</div>}</div>
                <Button size="sm" variant="outline" disabled={ocupado} onClick={() => executar(() => vincularPagamentoFatura(p.lanc, p.fatura!), "Fatura vinculada")}>{p.nivel === "alta" ? "Confirmar" : "Vincular mesmo assim"}</Button>
                <Button size="sm" variant="ghost" onClick={() => recusar(recFat, setRecFat, `${p.lanc.id}|${p.fatura!.id}`)}>Não é esta</Button>
              </>) : <div className="flex-1 text-xs text-muted-foreground">Nenhuma fatura com esse valor perto da data. Importe a fatura correspondente primeiro.</div>}
            </div>
          ))}
        </CardContent>
      </Card>

      {periodo && (
        <details className="rounded-md border px-3 py-2 text-sm">
          <summary className="cursor-pointer">No Clixio e sem Pix no extrato, de {dBR(periodo[0])} a {dBR(periodo[1])} ({soNoClixio.length})</summary>
          <div className="mt-2 text-xs text-muted-foreground">Entradas registradas no Financeiro neste período que não foram ligadas a nenhum Pix do extrato. Pode ser pagamento em dinheiro, em outra conta ou ainda não importada.</div>
          {soNoClixio.map((t) => <div key={t.id} className="border-t py-1 text-xs">{dBR(t.date)} · {brl(t.amount)} · {t.description}</div>)}
        </details>
      )}

      {(conciliados.length > 0 || paresFeitos.length > 0 || proprias.length > 0) && (
        <Card>
          <Cabecalho titulo="Conciliados" n={conciliados.length + paresFeitos.length / 2 + proprias.length} dica="Dá para desfazer. Se o pagamento foi criado por aqui, desfazer remove também o que foi criado no Financeiro." />
          <CardContent>
            {conciliados.map((l) => { const t = txPorId.get(l.clixio_transaction_id!); return (
              <div key={l.id} className="flex flex-wrap items-center gap-3 border-t py-2 text-sm">
                <Pix l={l} /><div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{t ? t.description : "entrada do Clixio"}{l.obs === "pagamento criado no Clixio pela conciliação" ? " · criado por aqui" : ""}</div>
                <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => executar(() => desfazerVinculo(l), "Desfeito")}>Desfazer</Button>
              </div>); })}
            {proprias.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-3 border-t py-2 text-sm">
                <Pix l={l} /><div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">transferência de conta própria</div>
                <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => executar(() => desfazerTransferencia([l]), "Desfeito")}>Desfazer</Button>
              </div>))}
            {[...new Set(paresFeitos.map((l) => l.par_id!))].map((par) => { const dois = paresFeitos.filter((l) => l.par_id === par); return (
              <div key={par} className="flex flex-wrap items-center gap-3 border-t py-2 text-sm">
                <div className="min-w-0 flex-1">{brl(dois[0].valor)} · {dBR(dois[0].data)} <span className="text-xs text-muted-foreground">transferência entre contas</span></div>
                <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => executar(() => desfazerTransferencia(dois), "Desfeito")}>Desfazer</Button>
              </div>); })}
          </CardContent>
        </Card>
      )}
    </div>
  );

  function escolhas(l: Lanc) {
    const modo = aberto?.modo;
    const candTx = txLivres.map((t) => ({ t, d: dias(l.data, t.date) })).filter((x) => x.d <= 45).sort((a, b) => a.d - b.d || Math.abs(a.t.amount - l.valor) - Math.abs(b.t.amount - l.valor)).slice(0, 30);
    const lista = (clixio?.clientes ?? []).filter((c) => (c.name + " " + (c.couple_name ?? "")).toUpperCase().includes(busca.toUpperCase())).slice(0, 40);
    const cliente = clienteId ? clientePorId.get(clienteId) : undefined;
    return (
      <div className="ml-4 space-y-2 rounded-md border p-3 text-sm">
        <div className="flex gap-2">
          <Button size="sm" variant={modo === "tx" ? "default" : "outline"} onClick={() => setAberto({ id: l.id, modo: "tx" })}>Vincular a uma entrada do Clixio</Button>
          <Button size="sm" variant={modo === "cliente" ? "default" : "outline"} onClick={() => setAberto({ id: l.id, modo: "cliente" })}>Registrar pagamento de cliente</Button>
          <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => executar(() => marcarNaoEhCliente(l.id), "Mantido como entrada normal em Finanças")}>Não é de cliente</Button>
        </div>
        {modo === "tx" && (<div className="space-y-2">
          <select className="w-full rounded-md border bg-background px-2 py-1" value={txId} onChange={(e) => setTxId(e.target.value)}>
            <option value="">Escolha a entrada do Clixio…</option>
            {candTx.map(({ t }) => <option key={t.id} value={t.id}>{dBR(t.date)} · {brl(t.amount)} · {t.description}</option>)}
          </select>
          <Button size="sm" disabled={!txId || ocupado} onClick={() => executar(() => vincularTransacao(l.id, txId, 0.5), "Vinculado")}>Vincular</Button>
        </div>)}
        {modo === "cliente" && (<div className="space-y-2">
          <Input placeholder="Buscar cliente (nome ou casal)" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="max-h-48 overflow-y-auto rounded-md border">
            {lista.length === 0 && <div className="p-2 text-xs text-muted-foreground">Nenhum cliente encontrado.</div>}
            {lista.map((c) => (
              <button key={c.id} type="button" onClick={() => setClienteId(c.id)}
                className={`block w-full px-2 py-1.5 text-left text-sm hover:bg-muted ${clienteId === c.id ? "bg-primary text-primary-foreground hover:bg-primary" : ""}`}>
                {c.name}{c.couple_name ? ` (${c.couple_name})` : ""}
              </button>
            ))}
          </div>
          <Input placeholder="Observação (ex.: parcela 2 de 5)" value={nota} onChange={(e) => setNota(e.target.value)} />
          {cliente && (
            <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">
              Vai ser criado em Recebimentos: um <b>pagamento pago</b> de {brl(l.valor)} em {dBR(l.data)} para <b>{cliente.name}</b>, mais a <b>transação de entrada</b> (categoria casamento). Dá para desfazer depois.
            </div>
          )}
          <Button size="sm" disabled={!cliente || ocupado} onClick={() => executar(() => registrarPagamentoCliente(l, cliente!, nota.trim()), "Pagamento registrado no Clixio")}>Confirmar e registrar</Button>
        </div>)}
      </div>
    );
  }
}
